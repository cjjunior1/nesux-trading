import crypto from "crypto";
import { prisma } from "@/lib/db";

const APP_URL = () => process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

// ============================================================
//  PURAS (testeables)
// ============================================================

/** Ordena recursivamente las claves de un objeto (NOWPayments firma el JSON ordenado). */
function sortObject(obj: any): any {
  if (Array.isArray(obj)) return obj.map(sortObject);
  if (obj && typeof obj === "object") {
    return Object.keys(obj).sort().reduce((acc: any, k) => { acc[k] = sortObject(obj[k]); return acc; }, {});
  }
  return obj;
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a), bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

/** Verifica la firma IPN de NOWPayments (HMAC-SHA512 del JSON ordenado). */
export function verifyNowPaymentsSignature(rawBody: string, signature: string | null, secret?: string): boolean {
  if (!signature || !secret) return false;
  let payload: any;
  try { payload = JSON.parse(rawBody); } catch { return false; }
  const hmac = crypto.createHmac("sha512", secret).update(JSON.stringify(sortObject(payload))).digest("hex");
  return safeEqual(hmac, signature);
}

/** Verifica la firma de un webhook de Stripe (esquema t=...,v1=...). */
export function verifyStripeSignature(rawBody: string, sigHeader: string | null, secret?: string): boolean {
  if (!sigHeader || !secret) return false;
  const parts = Object.fromEntries(sigHeader.split(",").map((p) => p.split("=")) as [string, string][]);
  if (!parts.t || !parts.v1) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${parts.t}.${rawBody}`).digest("hex");
  return safeEqual(expected, parts.v1);
}

// ============================================================
//  DATOS BANCARIOS (transferencia manual)
// ============================================================
export type BankAccount = { bank_name: string; account_number: string; account_holder: string; type?: string; currency?: string };

/**
 * Tasa USD -> DOP con la que se le cobra al alumno por transferencia.
 * Se configura a mano (BANK_USD_TO_DOP) para que el monto no cambie solo entre
 * que el alumno abre el checkout y transfiere. Devuelve null si no está puesta.
 */
export function getUsdToDop(): number | null {
  const rate = Number(process.env.BANK_USD_TO_DOP);
  return Number.isFinite(rate) && rate > 0 ? rate : null;
}

/** Convierte el precio en USD al monto en pesos que debe transferir el alumno. */
export function toDop(amountUsd: number, rate: number): number {
  return Math.round(amountUsd * rate * 100) / 100;
}

/**
 * Devuelve la lista de cuentas bancarias para mostrar en el checkout.
 * Configurable con BANK_ACCOUNTS (JSON array) en .env; si no, usa la cuenta única
 * BANK_NAME / BANK_ACCOUNT_NUMBER / BANK_ACCOUNT_HOLDER.
 *
 * Devuelve [] si no hay nada configurado: es preferible desactivar el método a
 * mostrarle al alumno una cuenta de ejemplo a la que podría transferir de verdad.
 */
export function getBankAccounts(): BankAccount[] {
  const raw = process.env.BANK_ACCOUNTS;
  if (raw) {
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length) return arr;
    } catch { /* JSON inválido -> sin cuentas */ }
  }
  if (process.env.BANK_ACCOUNT_NUMBER && process.env.BANK_ACCOUNT_HOLDER) {
    return [{
      bank_name: process.env.BANK_NAME || "Banco",
      account_number: process.env.BANK_ACCOUNT_NUMBER,
      account_holder: process.env.BANK_ACCOUNT_HOLDER,
    }];
  }
  return [];
}

// ============================================================
//  PROVEEDORES (vía fetch — se activan cuando hay credenciales)
// ============================================================

export async function createNowPayment(opts: { paymentId: string; userId: string; amount: number; currency: string; payCurrency?: string; description?: string; }) {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) throw new Error("NOWPayments no está configurado (falta NOWPAYMENTS_API_KEY)");
  const res = await fetch("https://api.nowpayments.io/v1/payment", {
    method: "POST",
    headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      price_amount: opts.amount,
      price_currency: opts.currency.toLowerCase(),
      pay_currency: (opts.payCurrency || "usdttrc20").toLowerCase(),
      order_id: opts.paymentId,
      order_description: opts.description || "Trading a Otro Nivel",
      purchase_id: opts.userId,
      ipn_callback_url: `${APP_URL()}/api/webhooks/nowpayments`,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error creando pago en NOWPayments");
  return data; // { payment_id, pay_address, pay_amount, pay_currency, payment_status, ... }
}

export async function createStripeSession(opts: { paymentId: string; userId: string; courseId?: string; amount: number; currency: string; productName?: string; }) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe no está configurado (falta STRIPE_SECRET_KEY)");
  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("success_url", process.env.STRIPE_SUCCESS_URL || `${APP_URL()}/payment/success`);
  form.set("cancel_url", process.env.STRIPE_CANCEL_URL || `${APP_URL()}/payment/cancel`);
  form.set("line_items[0][quantity]", "1");
  form.set("line_items[0][price_data][currency]", opts.currency.toLowerCase());
  form.set("line_items[0][price_data][unit_amount]", String(Math.round(opts.amount * 100)));
  form.set("line_items[0][price_data][product_data][name]", opts.productName || "Trading a Otro Nivel");
  form.set("metadata[payment_id]", opts.paymentId);
  form.set("metadata[user_id]", opts.userId);
  if (opts.courseId) form.set("metadata[course_id]", opts.courseId);
  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "Error creando sesión de Stripe");
  return data; // { id, url, ... }
}

/**
 * Crea una orden en PayPal.
 *
 * Con `cardFirst` se abre directamente el formulario de tarjeta (pago como
 * invitado, sin cuenta PayPal): es como ofrecemos "Tarjeta de crédito/débito"
 * sin contratar una pasarela aparte.
 */
export async function createPaypalOrder(opts: { paymentId: string; amount: number; currency: string; productName?: string; cardFirst?: boolean; }) {
  const id = process.env.PAYPAL_CLIENT_ID, secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error("PayPal no está configurado");
  const base = process.env.PAYPAL_API_BASE || "https://api-m.paypal.com";
  const tokRes = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const tok = await tokRes.json();
  if (!tokRes.ok) throw new Error("Error autenticando con PayPal");
  const res = await fetch(`${base}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tok.access_token}`,
      "Content-Type": "application/json",
      // Idempotencia: si reintentamos, PayPal devuelve la misma orden.
      "PayPal-Request-Id": opts.paymentId,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        custom_id: opts.paymentId,
        description: opts.productName?.slice(0, 127),
        amount: { currency_code: opts.currency, value: opts.amount.toFixed(2) },
      }],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: process.env.PAYPAL_BRAND_NAME || "Trading a Otro Nivel",
            locale: "es-DO",
            user_action: "PAY_NOW",
            // BILLING abre el formulario de tarjeta; LOGIN, la cuenta de PayPal.
            landing_page: opts.cardFirst ? "BILLING" : "LOGIN",
            return_url: `${APP_URL()}/api/payments/paypal/return?payment_id=${opts.paymentId}`,
            cancel_url: `${APP_URL()}/checkout?canceled=1`,
          },
        },
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Error creando orden de PayPal");
  return data; // { id, links: [{ rel: 'approve', href }] }
}

/** Token OAuth de PayPal (client credentials). */
async function paypalToken(): Promise<string> {
  const id = process.env.PAYPAL_CLIENT_ID, secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error("PayPal no está configurado");
  const base = process.env.PAYPAL_API_BASE || "https://api-m.paypal.com";
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const tok = await res.json();
  if (!res.ok) throw new Error("Error autenticando con PayPal");
  return tok.access_token;
}

/** Cobra una orden ya aprobada por el comprador. Aprobar no mueve dinero; capturar sí. */
export async function capturePaypalOrder(orderId: string) {
  const base = process.env.PAYPAL_API_BASE || "https://api-m.paypal.com";
  const res = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await paypalToken()}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `capture-${orderId}`,
    },
  });
  const data = await res.json();
  // 422 ORDER_ALREADY_CAPTURED: el webhook se nos adelantó, no es un error.
  if (!res.ok && data?.details?.[0]?.issue !== "ORDER_ALREADY_CAPTURED") {
    throw new Error(data?.message || "Error capturando la orden de PayPal");
  }
  return data;
}

// ============================================================
//  ACTIVACIÓN DE ACCESO  (núcleo del flujo)
// ============================================================

/** Marca un pago como pagado y otorga el acceso al curso + notifica. Idempotente. */
export async function markPaidAndActivate(paymentId: string, providerMetadata?: any) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new Error("Pago no encontrado");
  if (payment.status !== "paid") {
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "paid", paidAt: new Date(), providerMetadata: providerMetadata ?? payment.providerMetadata ?? undefined },
    });
  }
  await activateUserAccess(paymentId);
}

/** Otorga acceso al curso, activa la cuenta y dispara notificaciones. */
export async function activateUserAccess(paymentId: string) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId }, include: { user: true } });
  if (!payment) throw new Error("Pago no encontrado");
  if (payment.status !== "paid") throw new Error("El pago no está confirmado");

  if (payment.courseId) {
    await prisma.userCourseAccess.upsert({
      where: { userId_courseId: { userId: payment.userId, courseId: payment.courseId } },
      create: { userId: payment.userId, courseId: payment.courseId, paymentId: payment.id, paymentInfo: payment.method },
      update: { paymentId: payment.id, grantedAt: new Date() },
    });
  }
  await prisma.user.update({ where: { id: payment.userId }, data: { status: "active" } });

  await notifyActivation(payment).catch((e) => console.warn("[notifyActivation]", e));
}

/** Notifica al alumno y al admin (CJ Bot) sobre la activación. Best-effort. */
async function notifyActivation(payment: any) {
  const user = payment.user || (await prisma.user.findUnique({ where: { id: payment.userId } }));
  if (!user) return;
  const link = `${APP_URL()}/login`;

  // 1) Email al alumno (usa el notificador existente de Abacus si está configurado)
  await sendEmail(
    user.email,
    "✅ Pago confirmado - Trading a Otro Nivel",
    `<p>¡Pago confirmado! Tu acceso fue activado.</p>
     <p>Ingresa en <a href="${link}">${link}</a> con tu ID <b>${user.clientId || user.email}</b>.</p>`
  ).catch(() => {});

  // 2) Email al CJ Bot / admin
  const cjEmail = process.env.CJ_BOT_EMAIL;
  if (cjEmail) {
    await sendEmail(
      cjEmail,
      `Nueva Activación: ${user.email}`,
      `<p>El usuario <b>${user.email}</b> (ID ${user.clientId || "-"}) activó acceso. Método: ${payment.method}. Monto: ${payment.amount} ${payment.currency}. Fecha: ${new Date().toISOString()}</p>`
    ).catch(() => {});
  }

  // 3) Mensaje vía Bot API (cuando esté configurado)
  if (process.env.BOT_API_URL && process.env.BOT_API_KEY) {
    await fetch(`${process.env.BOT_API_URL}/notify`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.BOT_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ admin_chat_id: process.env.ADMIN_CHAT_ID, user_email: user.email, event: "payment_activated" }),
    }).catch(() => {});
  }
}

/** Envío de email best-effort vía el notificador de Abacus (mismo que usa signup). */
async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.ABACUSAI_API_KEY) return; // sin proveedor, no-op en dev
  const appUrl = APP_URL();
  await fetch("https://apps.abacus.ai/api/sendNotificationEmail", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      deployment_token: process.env.ABACUSAI_API_KEY,
      app_id: process.env.WEB_APP_ID,
      notification_id: process.env.NOTIF_ID_VERIFICACIN_DE_EMAIL,
      subject, body: html, is_html: true,
      recipient_email: to,
      sender_email: `noreply@${new URL(appUrl).hostname}`,
      sender_alias: "Trading a Otro Nivel",
    }),
  });
}
