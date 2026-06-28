import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { markPaidAndActivate } from "@/lib/payments";

export const dynamic = "force-dynamic";

const BASE = () => process.env.PAYPAL_API_BASE || "https://api-m.paypal.com";

/** Verifica la firma del webhook con la API de PayPal. */
async function verifyPaypal(headers: Headers, rawBody: string): Promise<boolean> {
  const id = process.env.PAYPAL_CLIENT_ID, secret = process.env.PAYPAL_CLIENT_SECRET, webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!id || !secret || !webhookId) return false;
  try {
    const tokRes = await fetch(`${BASE()}/v1/oauth2/token`, {
      method: "POST",
      headers: { Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: "grant_type=client_credentials",
    });
    const tok = await tokRes.json();
    const res = await fetch(`${BASE()}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tok.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_algo: headers.get("paypal-auth-algo"),
        cert_url: headers.get("paypal-cert-url"),
        transmission_id: headers.get("paypal-transmission-id"),
        transmission_sig: headers.get("paypal-transmission-sig"),
        transmission_time: headers.get("paypal-transmission-time"),
        webhook_id: webhookId,
        webhook_event: JSON.parse(rawBody),
      }),
    });
    const data = await res.json();
    return data.verification_status === "SUCCESS";
  } catch {
    return false;
  }
}

// POST /api/webhooks/paypal
export async function POST(req: Request) {
  const raw = await req.text();

  if (!(await verifyPaypal(req.headers, raw))) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  let event: any;
  try { event = JSON.parse(raw); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }

  try {
    if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const customId = event.resource?.custom_id; // = nuestro payment.id
      const payment = customId ? await prisma.payment.findUnique({ where: { id: customId } }) : null;
      if (payment && payment.status !== "paid") {
        if (process.env.AUTO_ACTIVATE === "false") {
          await prisma.payment.update({ where: { id: payment.id }, data: { status: "paid", paidAt: new Date(), providerMetadata: event } });
        } else {
          await markPaidAndActivate(payment.id, event);
        }
      }
    }
  } catch (e) {
    console.error("[paypal webhook]", e);
  }
  return NextResponse.json({ received: true });
}
