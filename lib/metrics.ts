import { prisma } from "@/lib/db";
import { revenueChangePct, bucketByDay } from "@/lib/metrics-pure";

// Reexporta las funciones puras para no romper imports existentes.
export {
  classifySubscription,
  revenueChangePct,
  proratePlanChange,
  bucketByDay,
} from "@/lib/metrics-pure";
export type { PaymentStanding } from "@/lib/metrics-pure";

// ========================================================================
//  CONSULTAS A LA BD
// ========================================================================

export async function getDashboardMetrics(businessId?: string) {
  const now = new Date();
  const d30 = new Date(now.getTime() - 30 * 86400000);
  const d60 = new Date(now.getTime() - 60 * 86400000);

  // Filtro por negocio (si se indica).
  // Para USUARIOS va por pertenencia: alguien que entró por otro negocio y luego
  // se inscribió aquí también cuenta como alumno nuestro (tabla UserBusiness).
  // Para lo demás (leads, pagos, suscripciones) el negocio es un campo directo.
  const biz = businessId ? { businessId } : {};
  const bizUser = businessId ? { businesses: { some: { businessId } } } : {};

  const [
    totalUsers,
    activeUsers,
    suspendedUsers,
    deletedUsers,
    newUsers30,
    leadCount,
    subsAlDia,
    subsMorosos,
    revAll,
    rev30,
    revPrev30,
    recentSignups,
    recentPayments,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "user", deletedAt: null, ...bizUser } }),
    prisma.user.count({ where: { role: "user", deletedAt: null, status: "active", ...bizUser } }),
    prisma.user.count({ where: { role: "user", deletedAt: null, status: "suspended", ...bizUser } }),
    prisma.user.count({ where: { role: "user", deletedAt: { not: null }, ...bizUser } }),
    prisma.user.count({ where: { role: "user", deletedAt: null, createdAt: { gte: d30 }, ...bizUser } }),
    prisma.lead.count({ where: { ...biz } }),
    prisma.subscription.count({ where: { status: { notIn: ["canceled", "expired"] }, currentPeriodEnd: { gte: now }, ...biz } }),
    prisma.subscription.count({ where: { status: { notIn: ["canceled", "expired"] }, OR: [{ currentPeriodEnd: { lt: now } }, { status: "past_due" }], ...biz } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "paid", ...biz } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "paid", paidAt: { gte: d30 }, ...biz } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "paid", paidAt: { gte: d60, lt: d30 }, ...biz } }),
    prisma.user.findMany({ where: { role: "user", createdAt: { gte: d30 }, ...bizUser }, select: { createdAt: true } }),
    prisma.payment.findMany({ where: { status: "paid", paidAt: { gte: d30 }, ...biz }, select: { paidAt: true, amount: true } }),
  ]);

  const revenue30 = rev30._sum.amount || 0;
  const revenuePrev30 = revPrev30._sum.amount || 0;

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      suspended: suspendedUsers,
      deleted: deletedUsers,
      new30d: newUsers30,
    },
    payments: {
      alDia: subsAlDia,
      morosos: subsMorosos,
      morosidadPct: subsAlDia + subsMorosos > 0
        ? Math.round((subsMorosos / (subsAlDia + subsMorosos)) * 1000) / 10
        : 0,
    },
    revenue: {
      total: Math.round((revAll._sum.amount || 0) * 100) / 100,
      last30d: Math.round(revenue30 * 100) / 100,
      prev30d: Math.round(revenuePrev30 * 100) / 100,
      changePct: revenueChangePct(revenue30, revenuePrev30),
    },
    leads: leadCount,
    trends: {
      signups: bucketByDay(recentSignups.map((u) => ({ date: u.createdAt, value: 1 })), 30, now),
      // paidAt está garantizado no-nulo por el filtro `paidAt: { gte: d30 }` de la consulta.
      revenue: bucketByDay(recentPayments.map((p) => ({ date: p.paidAt!, value: p.amount })), 30, now),
    },
  };
}

export type DashboardMetrics = Awaited<ReturnType<typeof getDashboardMetrics>>;
