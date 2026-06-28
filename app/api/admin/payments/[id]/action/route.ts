import { NextResponse } from "next/server";
import { guardAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/audit";
import { markPaidAndActivate } from "@/lib/payments";

export const dynamic = "force-dynamic";

// POST /api/admin/payments/[id]/action  body: { action: 'approve' | 'reject' | 'refund' }
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const guard = await guardAdmin();
  if (!guard.ok) return guard.response;

  const { action } = await req.json().catch(() => ({}));
  const payment = await prisma.payment.findUnique({ where: { id: params.id } });
  if (!payment) return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });

  try {
    if (action === "approve") {
      // Confirma el pago (p. ej. transferencia verificada) y activa el acceso.
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "paid", paidAt: new Date() } });
      await markPaidAndActivate(payment.id);
    } else if (action === "reject") {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "failed" } });
    } else if (action === "refund") {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "refunded" } });
    } else {
      return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Error" }, { status: 500 });
  }

  await logAdminAction({ actor: guard.actor, action: `payment.${action}`, targetType: "payment", targetId: payment.id });
  return NextResponse.json({ ok: true });
}
