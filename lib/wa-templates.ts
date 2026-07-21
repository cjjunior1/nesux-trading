// Plantillas de WhatsApp que Nesux necesita registradas en Meta.
// Alta con POST /api/admin/whatsapp/templates. Ver docs/PLANTILLAS-WHATSAPP.md.
//
// IMPORTANTE — límite de Meta descubierto al registrarlas (21 jul 2026):
// una plantilla que menciona el ID de cliente o los datos de ingreso es
// clasificada como AUTHENTICATION y RECHAZADA con INCORRECT_CATEGORY, tanto en
// UTILITY como en MARKETING. Por eso estos textos NO llevan el ID: solo avisan
// y nombran el correo. El ID viaja por email, y por WhatsApp solo si hay
// ventana de 24h abierta (texto libre).

import type { WaTemplateSpec } from "@/lib/whatsapp";

const LANG = process.env.WHATSAPP_TEMPLATE_LANG || "es";

export const WA_TEMPLATES: WaTemplateSpec[] = [
  {
    name: process.env.WHATSAPP_TEMPLATE_CREDENCIALES || "nesux_inscripcion_ok",
    category: "UTILITY",
    language: LANG,
    body:
      "Hola {{1}}, tu inscripción en {{2}} quedó registrada. " +
      "Te enviamos toda la información al correo {{3}}. " +
      "Por favor confírmanos si ese es tu correo.",
    example: ["Juan", "Trading a Otro Nivel", "juan@gmail.com"],
  },
  {
    name: process.env.WHATSAPP_TEMPLATE_PAGO_CONFIRMADO || "nesux_acceso_activado",
    category: "UTILITY",
    language: LANG,
    body:
      "Listo {{1}}, tu acceso a {{2}} ya está activo. " +
      "Entra a tu cuenta en nesuxglobalbusinessrd.com/login y comienza cuando quieras.",
    example: ["Juan", "Trading a Otro Nivel"],
  },
];
