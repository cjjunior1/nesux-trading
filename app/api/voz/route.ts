import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Voz del asistente (TTS).
 *
 * Devuelve un MP3 con el texto leído por una voz neuronal, mucho más natural
 * que la del navegador. El asistente pide el texto por trozos cortos para que
 * la lectura empiece enseguida, así que este endpoint se llama varias veces
 * seguidas: se mantiene ligero y sin estado.
 *
 * Es el mismo contrato que usa el asistente de Nesux VS Code, para que ambos
 * compartan comportamiento.
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Sin clave" }, { status: 500 });
  }

  let texto = "";
  try {
    const body = await req.json();
    texto = String(body?.texto || "").slice(0, 4000);
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  if (!texto.trim()) {
    return NextResponse.json({ error: "Texto vacío" }, { status: 400 });
  }

  try {
    const r = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice: "nova",
        input: texto,
        instructions:
          "Habla en español latino, con tono de profesor cercano y claro. Ritmo natural, ni robótico ni acelerado.",
        response_format: "mp3",
      }),
    });

    if (!r.ok) {
      const detalle = await r.text().catch(() => "");
      console.error("[voz] TTS", r.status, detalle.slice(0, 200));
      return NextResponse.json({ error: "TTS no disponible" }, { status: 502 });
    }

    const audio = Buffer.from(await r.arrayBuffer());
    return new NextResponse(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audio.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    console.error("[voz] error TTS:", e?.message);
    return NextResponse.json({ error: "TTS falló" }, { status: 500 });
  }
}
