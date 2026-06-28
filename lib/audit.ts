import { prisma } from "@/lib/db";
import type { AdminActor } from "@/lib/admin-guard";

/**
 * Registra una acción administrativa en AdminAuditLog.
 * Nunca lanza: si falla el log, no debe romper la operación principal.
 */
export async function logAdminAction(params: {
  actor: AdminActor;
  action: string;            // p.ej. "user.suspend", "user.update", "payment.create"
  targetType?: string;       // "user" | "payment" | ...
  targetId?: string;
  metadata?: Record<string, unknown>;
  ip?: string | null;
}) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        actorId: params.actor.id,
        actorEmail: params.actor.email,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        metadata: params.metadata as any,
        ip: params.ip ?? undefined,
      },
    });
  } catch (e) {
    console.warn("[audit] no se pudo registrar la acción:", params.action, e);
  }
}
