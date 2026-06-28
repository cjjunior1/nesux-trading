import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * POST /api/track  — registra una visita de página (tracking de actividad).
 * body: { path, sessionId?, durationMs?, referrer? }
 * Llamado por el beacon del cliente. Si hay sesión, asocia el userId.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const path = typeof body.path === "string" ? body.path.slice(0, 300) : null;
    if (!path) return NextResponse.json({ ok: false }, { status: 200 });

    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id || null;

    const durationMs = Math.max(0, Math.min(86400000, Number(body.durationMs) || 0));

    await prisma.pageVisit.create({
      data: {
        userId,
        sessionId: typeof body.sessionId === "string" ? body.sessionId.slice(0, 100) : null,
        path,
        durationMs,
        leftAt: durationMs > 0 ? new Date() : null,
        referrer: typeof body.referrer === "string" ? body.referrer.slice(0, 300) : null,
        userAgent: req.headers.get("user-agent")?.slice(0, 300) || null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    // El tracking nunca debe romper la navegación del usuario
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
