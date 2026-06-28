import { NextResponse } from "next/server";
import { guardAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

// POST /api/admin/users/force-password-change
// Obliga a TODOS los alumnos a cambiar la contraseña en su próximo inicio de sesión.
export async function POST() {
  const guard = await guardAdmin();
  if (!guard.ok) return guard.response;

  const result = await prisma.user.updateMany({
    where: { role: "user", deletedAt: null },
    data: { mustChangePassword: true },
  });

  await logAdminAction({
    actor: guard.actor,
    action: "users.force_password_change",
    metadata: { count: result.count },
  });

  return NextResponse.json({ ok: true, count: result.count });
}
