import { NextResponse } from "next/server";
import { guardAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { bizWhere } from "@/lib/business";

export const dynamic = "force-dynamic";

// GET /api/admin/payments?status=&method=
export async function GET(req: Request) {
  const guard = await guardAdmin();
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "";
  const method = searchParams.get("method") || "";
  // Solo los pagos de este negocio: la base es compartida.
  const where: any = { ...(await bizWhere()) };
  if (status) where.status = status;
  if (method) where.method = method;

  const [rows, totals] = await Promise.all([
    prisma.payment.findMany({
      where, orderBy: { createdAt: "desc" }, take: 100,
      include: { user: { select: { firstName: true, lastName: true, email: true, clientId: true } } },
    }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "paid", ...(await bizWhere()) } }),
  ]);

  return NextResponse.json({
    payments: rows.map((p) => ({
      id: p.id, method: p.method, amount: p.amount, currency: p.currency, status: p.status,
      reference: p.reference, createdAt: p.createdAt, paidAt: p.paidAt,
      user: p.user ? `${p.user.firstName} ${p.user.lastName}` : "—",
      email: p.user?.email, clientId: p.user?.clientId,
    })),
    totalPaid: Math.round((totals._sum.amount || 0) * 100) / 100,
  });
}
