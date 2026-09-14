import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Llave temporal para la conversación por voz en tiempo real.
 *
 * ── Por qué existe esta ruta ──────────────────────────────────────────────
 * La conversación en tiempo real la lleva el navegador hablando DIRECTAMENTE
 * con OpenAI por WebRTC: es la única forma de que el audio vaya y venga sin
 * pasar por nuestro servidor, que es lo que hoy añade casi todo el retraso.
 *
 * Pero para eso el navegador necesita una credencial, y la clave de OpenAI no
 * puede salir de aquí: quien la viera podría gastar la cuenta entera. La
 * solución que da OpenAI es esta: el servidor pide una llave de un solo uso
 * que caduca en un minuto y solo sirve para esa conversación. Si alguien la
 * captura, no tiene nada que hacer con ella.
 *
 * ── Qué se decide aquí y qué no ───────────────────────────────────────────
 * La VOZ y las reglas de conversación se fijan aquí, en el servidor, para que
 * no se puedan cambiar desde el navegador. La PERSONALIDAD de cada asistente
 * llega como parámetro: así este mismo endpoint sirve para el tutor de
 * Trading, para el de Nutrilife o para cualquier otro, sin duplicar código.
 */

/** Modelo de voz en tiempo real. */
const MODELO = process.env.OPENAI_REALTIME_MODEL || "gpt-realtime";

/** Voz del asistente. "verse" y "alloy" son las más neutras en español. */
const VOZ = process.env.OPENAI_REALTIME_VOICE || "verse";

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Sin clave de OpenAI" }, { status: 500 });
  }

  let instrucciones = "";
  try {
    const body = await req.json().catch(() => ({}));
    // Se recorta: unas instrucciones enormes retrasan el arranque de la sesión
    // y no aportan — lo que no quepa aquí ya lo cubre el chat escrito.
    instrucciones = String(body?.instrucciones || "").slice(0, 4000);
  } catch {
    instrucciones = "";
  }

  try {
    // Endpoint y formato comprobados contra la API: el antiguo
    // /v1/realtime/sessions ya no existe y responde "Invalid URL".
    const r = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model: MODELO,
          instructions: instrucciones || undefined,
          audio: {
            input: {
              // Transcripción de lo que dice el usuario: es lo que después se
              // escribe en el chat, sin que tengamos que transcribir nada.
              transcription: { model: "whisper-1" },

              /**
               * Detección de voz en el servidor.
               *
               * Decide cuándo empiezas y cuándo terminas de hablar. Hacerlo
               * aquí —y no con un temporizador en el navegador, como hasta
               * ahora— es lo que permite cortarle a media frase sin que se
               * confunda con una pausa para pensar.
               *
               * `interrupt_response` es la pieza clave contra los
               * solapamientos: si hablas mientras responde, OpenAI cancela su
               * respuesta en el acto. Antes eso se intentaba adivinar
               * comparando texto, y fallaba de las dos maneras posibles.
               */
              turn_detection: {
                type: "server_vad",
                // Umbral medio: más bajo se dispara con el ruido de fondo,
                // más alto se pierde a quien habla flojo.
                threshold: 0.55,
                // Audio previo, para no comerse la primera sílaba.
                prefix_padding_ms: 400,
                // Silencio que da el turno por terminado. Con menos corta a
                // quien piensa; con más, la conversación se siente lenta.
                silence_duration_ms: 700,
                create_response: true,
                interrupt_response: true,
              },
            },
            output: { voice: VOZ },
          },
        },
      }),
    });

    const datos = await r.json();

    if (!r.ok) {
      const motivo = datos?.error?.message || `HTTP ${r.status}`;
      console.error("[voz/realtime] no se pudo crear la sesión:", motivo);
      return NextResponse.json({ error: motivo }, { status: r.status });
    }

    // Solo viaja la llave temporal y el modelo. La clave real se queda aquí.
    return NextResponse.json({
      clientSecret: datos?.value,
      expiraEn: datos?.expires_at,
      modelo: MODELO,
    });
  } catch (e) {
    console.error("[voz/realtime] error:", e);
    return NextResponse.json({ error: "No se pudo iniciar la sesión de voz" }, { status: 500 });
  }
}
