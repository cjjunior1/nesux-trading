// Envío de mensajes de WhatsApp vía Meta Cloud API.
// Token permanente de usuario del sistema (no expira). Ver plan-bot-maestro (memoria).

const WA_TOKEN = process.env.WHATSAPP_TOKEN || "";
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
const GRAPH = "https://graph.facebook.com/v21.0";

const WA_WABA_ID = process.env.WHATSAPP_WABA_ID || "";

export type WaResult = { ok: true; id: string } | { ok: false; error: string };

// ============================================================
//  GESTIÓN DE PLANTILLAS (alta y consulta vía Graph API)
//  Requiere un token con permiso whatsapp_business_management.
// ============================================================

export type WaTemplateSpec = {
  name: string;
  category: "UTILITY" | "MARKETING" | "AUTHENTICATION";
  language: string;
  body: string;              // texto con {{1}}, {{2}}...
  example: string[];         // un valor de ejemplo por variable (Meta los exige)
};

/** Crea una plantilla en la WABA. Devuelve su id, o el motivo del rechazo. */
export async function createWhatsAppTemplate(tpl: WaTemplateSpec): Promise<WaResult> {
  if (!WA_TOKEN || !WA_WABA_ID) return { ok: false, error: "Falta WHATSAPP_TOKEN o WHATSAPP_WABA_ID" };
  try {
    const res = await fetch(`${GRAPH}/${WA_WABA_ID}/message_templates`, {
      method: "POST",
      headers: { Authorization: `Bearer ${WA_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: tpl.name,
        category: tpl.category,
        language: tpl.language,
        components: [
          { type: "BODY", text: tpl.body, example: { body_text: [tpl.example] } },
        ],
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data?.error?.error_user_msg || data?.error?.message || `Error ${res.status}` };
    return { ok: true, id: data?.id || "" };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Fallo de red creando la plantilla" };
  }
}

/** Lista las plantillas de la WABA con su estado (APPROVED / PENDING / REJECTED). */
export async function listWhatsAppTemplates(): Promise<
  { ok: true; templates: { name: string; status: string; language: string; category: string }[] } | { ok: false; error: string }
> {
  if (!WA_TOKEN || !WA_WABA_ID) return { ok: false, error: "Falta WHATSAPP_TOKEN o WHATSAPP_WABA_ID" };
  try {
    const res = await fetch(`${GRAPH}/${WA_WABA_ID}/message_templates?fields=name,status,language,category&limit=100`, {
      headers: { Authorization: `Bearer ${WA_TOKEN}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data?.error?.message || `Error ${res.status}` };
    return { ok: true, templates: data?.data || [] };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Fallo de red listando plantillas" };
  }
}

function normalize(to: string): string {
  // Deja solo dígitos (Meta espera el número con código de país, sin + ni espacios).
  return to.replace(/[^\d]/g, "");
}

async function post(body: any): Promise<WaResult> {
  if (!WA_TOKEN || !WA_PHONE_ID) return { ok: false, error: "Falta WHATSAPP_TOKEN o WHATSAPP_PHONE_NUMBER_ID" };
  try {
    const res = await fetch(`${GRAPH}/${WA_PHONE_ID}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${WA_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", ...body }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data?.error?.message || `Error ${res.status}` };
    return { ok: true, id: data?.messages?.[0]?.id || "" };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Fallo de red al enviar WhatsApp" };
  }
}

/**
 * Envía un mensaje de PLANTILLA (obligatorio para mensajes iniciados por el negocio).
 * @param bodyParams valores para los {{1}}, {{2}}... del cuerpo de la plantilla.
 */
export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  languageCode = "es",
  bodyParams: string[] = []
): Promise<WaResult> {
  const components = bodyParams.length
    ? [{ type: "body", parameters: bodyParams.map((t) => ({ type: "text", text: t })) }]
    : undefined;
  return post({
    to: normalize(to),
    type: "template",
    template: { name: templateName, language: { code: languageCode }, ...(components ? { components } : {}) },
  });
}

/**
 * Envía un mensaje de TEXTO libre. OJO: solo funciona dentro de la ventana de 24h
 * después de que el cliente escribió al negocio. Para el primer contacto, usar plantilla.
 */
export async function sendWhatsAppText(to: string, text: string): Promise<WaResult> {
  return post({ to: normalize(to), type: "text", text: { body: text, preview_url: false } });
}

/**
 * Envío iniciado por el negocio: intenta la PLANTILLA y, si falla (no aprobada aún,
 * nombre mal escrito), cae a texto libre — que solo llega si hay ventana de 24h abierta.
 * Devuelve el resultado del intento que haya funcionado.
 */
export async function sendWhatsAppTemplateOrText(
  to: string,
  templateName: string | undefined,
  bodyParams: string[],
  fallbackText: string,
  languageCode = "es"
): Promise<WaResult> {
  if (templateName) {
    const r = await sendWhatsAppTemplate(to, templateName, languageCode, bodyParams);
    if (r.ok) return r;
    console.warn(`[whatsapp] plantilla "${templateName}" falló, usando texto libre:`, r.error);
  }
  return sendWhatsAppText(to, fallbackText);
}

/** Sube un binario como MEDIA de WhatsApp y devuelve su media id (para reenviarlo). */
export async function uploadWhatsAppMedia(buffer: Buffer, mime: string, filename: string): Promise<WaResult> {
  if (!WA_TOKEN || !WA_PHONE_ID) return { ok: false, error: "Falta WHATSAPP_TOKEN o WHATSAPP_PHONE_NUMBER_ID" };
  try {
    const form = new FormData();
    form.append("messaging_product", "whatsapp");
    form.append("type", mime);
    form.append("file", new Blob([new Uint8Array(buffer)], { type: mime }), filename);
    const res = await fetch(`${GRAPH}/${WA_PHONE_ID}/media`, {
      method: "POST",
      headers: { Authorization: `Bearer ${WA_TOKEN}` },
      body: form as any,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data?.error?.message || `Error ${res.status}` };
    return { ok: true, id: data?.id || "" };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Fallo al subir media" };
  }
}

/** Envía un audio (nota de voz) por su media id. Con ogg/opus se ve como nota de voz. */
export async function sendWhatsAppAudio(to: string, mediaId: string): Promise<WaResult> {
  return post({ to: normalize(to), type: "audio", audio: { id: mediaId } });
}
