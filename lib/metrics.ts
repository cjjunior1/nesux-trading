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

export async function getDashboardMetrics() {
  const now = new Date();
  const d30 = new Date(now.getTime() - 30 * 86400000);
  const d60 = new Date(now.getTime() - 60 * 86400000);

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
    prisma.user.count({ where: { role: "user", deletedAt: null } }),
    prisma.user.count({ where: { role: "user", deletedAt: null, status: "active" } }),
    prisma.user.count({ where: { role: "user", deletedAt: null, status: "suspended" } }),
    prisma.user.count({ where: { role: "user", deletedAt: { not: null } } }),
    prisma.user.count({ where: { role: "user", deletedAt: null, createdAt: { gte: d30 } } }),
    prisma.lead.count(),
    prisma.subscription.count({ where: { status: { notIn: ["canceled", "expired"] }, currentPeriodEnd: { gte: now } } }),
    prisma.subscription.count({ where: { status: { notIn: ["canceled", "expired"] }, OR: [{ currentPeriodEnd: { lt: now } }, { status: "past_due" }] } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "paid" } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "paid", paidAt: { gte: d30 } } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "paid", paidAt: { gte: d60, lt: d30 } } }),
    prisma.user.findMany({ where: { role: "user", createdAt: { gte: d30 } }, select: { createdAt: true } }),
    prisma.payment.findMany({ where: { status: "paid", paidAt: { gte: d30 } }, select: { paidAt: true, amount: true } }),
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
      revenue: bucketByDay(
        recentPayments
          .filter((p): p is { paidAt: Date; amount: number } => p.paidAt !== null)
          .map((p) => ({ date: p.paidAt, value: p.amount })),
        30,
        now,
      ),
    },
  };
}

export type DashboardMetrics = Awaited<ReturnType<typeof getDashboardMetrics>>;
