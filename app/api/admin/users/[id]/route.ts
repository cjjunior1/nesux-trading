import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { guardAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/audit";
import { classifySubscription } from "@/lib/metrics";

export const dynamic = "force-dynamic";

// GET /api/admin/users/[id] -> detalle + historial
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const guard = await guardAdmin();
  if (!guard.ok) return guard.response;

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        subscriptions: { orderBy: { startedAt: "desc" } },
        payments: { orderBy: { paidAt: "desc" }, take: 50 },
        notes: { orderBy: { createdAt: "desc" } },
        courseAccess: { include: { course: { select: { title: true, slug: true } } } },
        pageVisits: { orderBy: { enteredAt: "desc" }, take: 30 },
      },
    });
    if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    const { password, ...safe } = user as any;
    const sub = user.subscriptions[0];
    return NextResponse.json({
      ...safe,
      standing: classifySubscription(sub?.currentPeriodEnd, sub?.status),
      totalPaid: user.payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0),
    });
  } catch (e: any) {
    console.error("[admin/users/:id GET]", e);
    return NextResponse.json({ error: "Error al cargar el usuario" }, { status: 500 });
  }
}

// PATCH /api/admin/users/[id] -> editar datos básicos
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await guardAdmin();
  if (!guard.ok) return guard.response;

  try {
    const body = await req.json();
    const data: any = {};
    for (const f of ["firstName", "lastName", "email", "whatsappNumber", "role"]) {
      if (typeof body[f] === "string" && body[f].length) data[f] = body[f];
    }
    if (typeof body.password === "string" && body.password.length >= 6) {
      data.password = await bcrypt.hash(body.password, 12);
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
    }

    const updated = await prisma.user.update({ where: { id: params.id }, data });
    await logAdminAction({
      actor: guard.actor,
      action: "user.update",
      targetType: "user",
      targetId: params.id,
      metadata: { fields: Object.keys(data) },
    });
    const { password, ...safe } = updated as any;
    return NextResponse.json(safe);
  } catch (e: any) {
    console.error("[admin/users/:id PATCH]", e);
    return NextResponse.json({ error: "No se pudo actualizar" }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] -> soft delete (restaurable)
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const guard = await guardAdmin();
  if (!guard.ok) return guard.response;

  try {
    await prisma.user.update({
      where: { id: params.id },
      data: { deletedAt: new Date(), status: "deleted" },
    });
    await logAdminAction({ actor: guard.actor, action: "user.soft_delete", targetType: "user", targetId: params.id });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[admin/users/:id DELETE]", e);
    return NextResponse.json({ error: "No se pudo eliminar" }, { status: 500 });
  }
}
