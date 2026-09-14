import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * El navegador cuenta por qué se le cayó la conversación.
 *
 * ── Por qué hace falta ────────────────────────────────────────────────────
 * Los fallos de micrófono y de WebRTC solo se ven en el aparato de quien los
 * sufre. Desde el servidor todo parece correcto —la sesión se crea, los
 * endpoints responden— y sin este aviso la única forma de averiguar la causa
 * es pedirle a la persona que lea un mensaje en pantalla y lo copie.
 *
 * Aquí el propio navegador manda la etapa exacta en la que murió y el motivo
 * que dio el sistema. Queda en el registro del servidor y se puede leer sin
 * molestar a nadie.
 *
 * No guarda nada personal: etapa, mensaje de error y qué navegador es.
 */
export async function POST(req: NextRequest) {
  try {
    const b = await req.json().catch(() => ({}));
    const etapa = String(b?.etapa || "?").slice(0, 40);
    const mensaje = String(b?.mensaje || "").slice(0, 300);
    const navegador = (req.headers.get("user-agent") || "").slice(0, 120);

    console.error(
      `[VOZ][${etapa}] ${mensaje} | ${navegador}`,
    );

    return NextResponse.json({ ok: true });
  } catch {
    // Nunca debe romper nada: es solo un aviso.
    return NextResponse.json({ ok: false });
  }
}
