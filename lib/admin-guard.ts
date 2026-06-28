import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";

/**
 * Guardián de las rutas /api/admin.
 * - En producción: exige sesión con rol "admin" o "super-admin".
 * - En desarrollo: permite el acceso (para construir/probar sin login) y
 *   devuelve un actor "dev" para la auditoría.
 *
 * Uso en un route handler:
 *   const guard = await guardAdmin();
 *   if (!guard.ok) return guard.response;
 *   const actor = guard.actor;
 */
export type AdminActor = { id: string; email: string | null; role: string };

export type AdminGuardResult =
  | { ok: true; actor: AdminActor }
  | { ok: false; response: NextResponse };

export async function guardAdmin(): Promise<AdminGuardResult> {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (process.env.NODE_ENV !== "production") {
    // En local permitimos trabajar sin login; si hay sesión, usamos sus datos.
    return {
      ok: true,
      actor: {
        id: user?.id ?? "dev",
        email: user?.email ?? "dev@local",
        role: user?.role ?? "admin",
      },
    };
  }

  if (!session) {
    return { ok: false, response: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };
  }
  if (user?.role !== "admin" && user?.role !== "super-admin") {
    return { ok: false, response: NextResponse.json({ error: "No autorizado" }, { status: 403 }) };
  }
  return { ok: true, actor: { id: user.id, email: user.email ?? null, role: user.role } };
}
