// Envío de correos vía Resend (dominio verificado nesuxglobalbusinessrd.com).
// Usa la API HTTP de Resend directamente (sin dependencia extra).

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

// Remitente por defecto. Cada negocio puede usar su propia dirección del dominio.
const DEFAULT_FROM = "Nesux Global Business <no-reply@nesuxglobalbusinessrd.com>";

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  bcc?: string | string[];
  replyTo?: string;
  text?: string; // versión de texto plano (mejora entrega; evita "solo HTML")
  headers?: Record<string, string>; // cabeceras extra, p.ej. List-Unsubscribe
  attachments?: { filename: string; path: string }[]; // adjuntos por URL (Resend los descarga)
};

export type SendEmailResult = { ok: true; id: string } | { ok: false; error: string };

/** Envía un correo. Devuelve { ok, id } o { ok:false, error }. Nunca lanza. */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!RESEND_API_KEY) return { ok: false, error: "Falta RESEND_API_KEY" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: input.from || DEFAULT_FROM,
        to: Array.isArray(input.to) ? input.to : [input.to],
        subject: input.subject,
        html: input.html,
        ...(input.text ? { text: input.text } : {}),
        ...(input.bcc ? { bcc: Array.isArray(input.bcc) ? input.bcc : [input.bcc] } : {}),
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
        ...(input.headers ? { headers: input.headers } : {}),
        ...(input.attachments?.length ? { attachments: input.attachments } : {}),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data?.message || `Error ${res.status}` };
    return { ok: true, id: data.id };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Fallo de red al enviar correo" };
  }
}

/** Envuelve un mensaje de texto simple en una plantilla HTML sobria (buena para bandeja principal). */
export function simpleEmailHtml(opts: { title?: string; body: string; footer?: string }): string {
  const bodyHtml = opts.body
    .split("\n")
    .map((l) => (l.trim() ? `<p style="margin:0 0 12px">${linkify(escapeHtml(l))}</p>` : "<br/>"))
    .join("");
  return `<div style="font-family:Arial,Helvetica,sans-serif;color:#1e293b;max-width:560px;margin:0 auto;padding:8px">
    ${opts.title ? `<h2 style="color:#0f172a;margin:0 0 16px">${escapeHtml(opts.title)}</h2>` : ""}
    ${bodyHtml}
    ${opts.footer ? `<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/><p style="font-size:12px;color:#94a3b8;margin:0">${escapeHtml(opts.footer)}</p>` : ""}
  </div>`;
}

/** Versión de texto plano de un mensaje (para el multipart text/plain). */
export function plainTextEmail(opts: { body: string; footer?: string }): string {
  const body = opts.body.trim();
  return opts.footer ? `${body}\n\n—\n${opts.footer}` : body;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}

/**
 * Convierte las URLs de un texto YA escapado en enlaces clicleables.
 * Se aplica después de escapeHtml, por eso los `&` de las URLs vienen como `&amp;`.
 */
function linkify(escaped: string): string {
  // Captura http(s)://... hasta el primer espacio o fin de línea.
  return escaped.replace(/(https?:\/\/[^\s<]+)/g, (url) => {
    // Quita signos de puntuación finales que no forman parte del enlace.
    const m = url.match(/[.,;:!?)]+$/);
    const trail = m ? m[0] : "";
    const clean = trail ? url.slice(0, -trail.length) : url;
    return `<a href="${clean}" style="color:#2563eb;text-decoration:underline" target="_blank" rel="noopener">${clean}</a>${trail}`;
  });
}
