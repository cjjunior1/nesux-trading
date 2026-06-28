import { NextResponse } from "next/server";
import { guardAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { classifySubscription } from "@/lib/metrics";

export const dynamic = "force-dynamic";

// GET /api/admin/users?q=&status=&standing=&page=1&pageSize=20
export async function GET(request: Request) {
  const guard = await guardAdmin();
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  const status = searchParams.get("status") || ""; // active | suspended | deleted
  const standing = searchParams.get("standing") || ""; // al_dia | moroso | sin_suscripcion
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(100, Math.max(5, parseInt(searchParams.get("pageSize") || "20", 10)));

  const where: any = { role: "user" };
  if (status === "deleted") where.deletedAt = { not: null };
  else { where.deletedAt = null; if (status) where.status = status; }
  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { whatsappNumber: { contains: q } },
    ];
  }

  try {
    const [total, rows] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true, email: true, firstName: true, lastName: true, whatsappNumber: true,
          role: true, status: true, createdAt: true, lastLoginAt: true, deletedAt: true,
          clientId: true, tempPassword: true,
          subscriptions: {
            orderBy: { currentPeriodEnd: "desc" },
            take: 1,
            select: { plan: true, status: true, currentPeriodEnd: true, amount: true },
          },
        },
      }),
    ]);

    const now = new Date();
    let users = rows.map((u) => {
      const sub = u.subscriptions[0] || null;
      return {
        id: u.id,
        clientId: u.clientId,
        tempPassword: u.tempPassword,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        whatsappNumber: u.whatsappNumber,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt,
        deletedAt: u.deletedAt,
        plan: sub?.plan || null,
        planAmount: sub?.amount || null,
        currentPeriodEnd: sub?.currentPeriodEnd || null,
        standing: classifySubscription(sub?.currentPeriodEnd, sub?.status, now),
      };
    });

    // Filtro por estado de pago (no se puede en SQL directo sin lógica de fecha+estado)
    if (standing) users = users.filter((u) => u.standing === standing);

    return NextResponse.json({ users, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (e: any) {
    console.error("[admin/users]", e);
    return NextResponse.json({ error: "No se pudieron cargar los usuarios" }, { status: 500 });
  }
}
