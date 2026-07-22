import { NextResponse } from "next/server";
import { guardAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/audit";
import { bizUsersWhere } from "@/lib/business";

export const dynamic = "force-dynamic";

// POST /api/admin/users/force-password-change
// Obliga a los alumnos DE ESTE NEGOCIO a cambiar la contraseña en su próximo ingreso.
// El filtro por negocio es imprescindible: la base es compartida, y sin él esta
// operación masiva alcanzaría también a los clientes de los demás negocios.
export async function POST() {
  const guard = await guardAdmin();
  if (!guard.ok) return guard.response;

  // updateMany no admite filtrar por una relación, así que primero se resuelven
  // los alumnos de este negocio y luego se actualizan por id.
  const alumnos = await prisma.user.findMany({
    where: { role: "user", deletedAt: null, ...(await bizUsersWhere()) },
    select: { id: true },
  });

  const result = await prisma.user.updateMany({
    where: { id: { in: alumnos.map((a) => a.id) } },
    data: { mustChangePassword: true },
  });

  await logAdminAction({
    actor: guard.actor,
    action: "users.force_password_change",
    metadata: { count: result.count },
  });

  return NextResponse.json({ ok: true, count: result.count });
}
