import { NextResponse } from "next/server";
import { guardAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/audit";
import { proratePlanChange } from "@/lib/metrics";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/users/[id]/action
 * body: { action, ...args }
 *   - suspend   { reason, untilDays? }
 *   - activate
 *   - restore                        (deshace el soft delete)
 *   - extend    { days }             (amplía/acorta el vencimiento; días negativos acortan)
 *   - changePlan{ plan, amount, prorate? }
 *   - addNote   { body }
 *   - grantBonusDays { days }        (alias de extend, registrado como bono)
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const guard = await guardAdmin();
  if (!guard.ok) return guard.response;
  const userId = params.id;

  let body: any;
  try { body = await req.json(); } catch { body = {}; }
  const action = body.action as string;

  try {
    switch (action) {
      case "suspend": {
        const until = body.untilDays ? new Date(Date.now() + Number(body.untilDays) * 86400000) : null;
        await prisma.user.update({
          where: { id: userId },
          data: { status: "suspended", suspendedReason: body.reason || "Sin motivo", suspendedUntil: until },
        });
        break;
      }
      case "activate": {
        await prisma.user.update({
          where: { id: userId },
          data: { status: "active", suspendedReason: null, suspendedUntil: null },
        });
        break;
      }
      case "restore": {
        await prisma.user.update({ where: { id: userId }, data: { deletedAt: null, status: "active" } });
        break;
      }
      case "extend":
      case "grantBonusDays": {
        const days = Number(body.days || 0);
        const sub = await prisma.subscription.findFirst({
          where: { userId }, orderBy: { currentPeriodEnd: "desc" },
        });
        if (!sub) return NextResponse.json({ error: "El usuario no tiene suscripción" }, { status: 400 });
        const base = sub.currentPeriodEnd > new Date() ? sub.currentPeriodEnd : new Date();
        const newEnd = new Date(base.getTime() + days * 86400000);
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { currentPeriodEnd: newEnd, status: newEnd > new Date() ? "active" : sub.status },
        });
        break;
      }
      case "changePlan": {
        const sub = await prisma.subscription.findFirst({ where: { userId }, orderBy: { currentPeriodEnd: "desc" } });
        if (!sub) return NextResponse.json({ error: "El usuario no tiene suscripción" }, { status: 400 });
        let charge = 0;
        if (body.prorate) {
          const daysRemaining = Math.max(0, Math.ceil((sub.currentPeriodEnd.getTime() - Date.now()) / 86400000));
          charge = proratePlanChange(sub.amount, Number(body.amount), daysRemaining, 30);
        }
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { plan: body.plan, amount: Number(body.amount) },
        });
        await logAdminAction({ actor: guard.actor, action: "subscription.change_plan", targetType: "user", targetId: userId, metadata: { plan: body.plan, amount: body.amount, prorateCharge: charge } });
        return NextResponse.json({ ok: true, prorateCharge: charge });
      }
      case "addNote": {
        if (!body.body) return NextResponse.json({ error: "Nota vacía" }, { status: 400 });
        await prisma.userNote.create({ data: { userId, authorId: guard.actor.id, body: body.body } });
        break;
      }
      default:
        return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
    }

    await logAdminAction({
      actor: guard.actor,
      action: `user.${action}`,
      targetType: "user",
      targetId: userId,
      metadata: body,
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[admin/users/:id action]", action, e);
    return NextResponse.json({ error: "No se pudo ejecutar la acción" }, { status: 500 });
  }
}
