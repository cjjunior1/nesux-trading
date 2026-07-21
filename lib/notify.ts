// Notificaciones de Trading Academy: email vía Resend, WhatsApp vía Meta Cloud API.
// Portado desde Nesux (2026-07-21). Sustituye al viejo envío por Abacus AI, ya sin uso.

import { sendEmail as resendSend, simpleEmailHtml } from "@/lib/mail";
import { sendWhatsAppText, sendWhatsAppTemplateOrText } from "@/lib/whatsapp";

const APP_URL = () =>
  process.env.APP_URL || process.env.NEXTAUTH_URL || "https://trading.nesuxglobalbusinessrd.com";

// Remitente propio del negocio (dominio verificado en Resend).
const FROM = "Trading Academy <trading@nesuxglobalbusinessrd.com>";

// Plantillas aprobadas en Meta. Si falta la variable, se usa texto libre
// (que solo llega dentro de la ventana de 24h). Ver docs/PLANTILLAS-WHATSAPP.md en Nesux.
const TPL_CREDENCIALES = process.env.WHATSAPP_TEMPLATE_CREDENCIALES;
const TPL_PAGO = process.env.WHATSAPP_TEMPLATE_PAGO_CONFIRMADO;
const TPL_LANG = process.env.WHATSAPP_TEMPLATE_LANG || "es";

const NEGOCIO = "Trading Academy";

/** Email vía Resend. Devuelve si se entregó. Nunca lanza. */
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const r = await resendSend({ to, subject, html, from: FROM });
  if (!r.ok) console.warn("[notify:email]", r.error);
  return r.ok;
}

/** WhatsApp de texto libre. Solo llega dentro de la ventana de 24h. */
export async function sendWhatsApp(phone: string, message: string) {
  const r = await sendWhatsAppText(phone, message);
  if (!r.ok) console.warn("[notify:whatsapp]", r.error);
}

/**
 * Entrega de credenciales de una cuenta nueva, por canales SEPARADOS:
 * - Contraseña + ID -> email.
 * - WhatsApp -> avisa y nombra el correo destino, para que el alumno detecte
 *   de inmediato si lo escribió mal.
 *
 * El ID no puede ir en la plantilla de WhatsApp: Meta rechaza como AUTHENTICATION
 * toda plantilla que mencione ID o contraseña. Por eso el ID viaja por correo, y
 * por WhatsApp solo si hay ventana de 24h abierta (texto libre).
 */
export async function sendNewAccountCredentials(opts: {
  email: string;
  whatsapp: string;
  firstName: string;
  clientId: string;
  tempPassword: string;
}) {
  const link = `${APP_URL()}/login`;

  const emailOk = await sendEmail(
    opts.email,
    `Tu contraseña de ${NEGOCIO}`,
    simpleEmailHtml({
      title: `¡Bienvenido, ${opts.firstName}!`,
      body:
        `Esta es tu contraseña de ${NEGOCIO}:\n\n` +
        `${opts.tempPassword}\n\n` +
        `Tu ID de usuario es ${opts.clientId}. Para iniciar sesión puedes usar ` +
        `ese ID o tu correo, junto con esta contraseña.\n\n` +
        `Ingresa en ${link} y cámbiala en el primer acceso.`,
      footer: "Trading Academy · Si no solicitaste esta cuenta, ignora este correo.",
    })
  );

  const wa = await sendWhatsAppTemplateOrText(
    opts.whatsapp,
    TPL_CREDENCIALES,
    [opts.firstName, NEGOCIO, opts.email],
    `Hola ${opts.firstName} 👋 Este es tu ID de usuario: ${opts.clientId}\n\n` +
      `Tu contraseña fue enviada al correo: ${opts.email}\n` +
      `Por favor confírmanos si ese es tu correo.\n\n` +
      `Ingresa en ${link}`,
    TPL_LANG
  );
  if (!wa.ok) console.warn("[notify:credenciales] WhatsApp no entregado:", wa.error);

  // Si el correo rebotó, el alumno se quedaría sin contraseña: avisarle por WhatsApp.
  if (!emailOk) {
    await sendWhatsApp(
      opts.whatsapp,
      `⚠️ No pudimos entregar tu contraseña al correo ${opts.email}.\n` +
        `Respóndenos con tu correo correcto y te la reenviamos.`
    );
  }

  return { emailOk, whatsappOk: wa.ok };
}

/** Aviso de pago confirmado / acceso liberado. Plantilla con fallback a texto. */
export async function sendAccessActivated(opts: {
  whatsapp: string;
  firstName: string;
  clientId: string;
  productName: string;
}) {
  const link = `${APP_URL()}/login`;
  return sendWhatsAppTemplateOrText(
    opts.whatsapp,
    TPL_PAGO,
    [opts.firstName, opts.productName],
    `✅ ¡Listo ${opts.firstName}! Tu acceso a ${opts.productName} ya está activo.\n` +
      `Ingresa en ${link} con tu ID ${opts.clientId}.`,
    TPL_LANG
  );
}
