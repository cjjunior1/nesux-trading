import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const clampInteractionMs = (value: unknown) => {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(num, 7_200_000));
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, interactionMs, userAgent } = body;

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "sessionId requerido" }, { status: 400 });
    }

    const safeInteractionMs = clampInteractionMs(interactionMs);
    const authSession = await getServerSession(authOptions);
    const userId = (authSession?.user as { id?: string } | undefined)?.id;

    await prisma.chatSession.upsert({
      where: { id: sessionId },
      create: {
        id: sessionId,
        userId,
        totalInteractionMs: safeInteractionMs,
        userAgent,
        attendanceDate: new Date(),
        lastActiveAt: new Date(),
      },
      update: {
        lastActiveAt: new Date(),
        ...(safeInteractionMs > 0
          ? { totalInteractionMs: { increment: safeInteractionMs } }
          : {}),
        ...(userId ? { userId } : {}),
        ...(userAgent ? { userAgent } : {}),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Tutor tracking error:", error);
    return NextResponse.json(
      { error: "No se pudo registrar la sesión" },
      { status: 500 }
    );
  }
}
