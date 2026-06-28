import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyStripeSignature, markPaidAndActivate } from "@/lib/payments";

export const dynamic = "force-dynamic";

// POST /api/webhooks/stripe
export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!verifyStripeSignature(raw, sig, process.env.STRIPE_WEBHOOK_SECRET)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  let event: any;
  try { event = JSON.parse(raw); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }

  try {
    if (event.type === "checkout.session.completed" || event.type === "payment_intent.succeeded") {
      const obj = event.data?.object || {};
      const paymentId = obj.metadata?.payment_id;
      const providerId = obj.id;
      const payment = await prisma.payment.findFirst({
        where: { OR: [{ id: paymentId || "" }, { providerPaymentId: providerId }] },
      });
      if (payment && payment.status !== "paid") {
        if (process.env.AUTO_ACTIVATE === "false") {
          await prisma.payment.update({ where: { id: payment.id }, data: { status: "paid", paidAt: new Date(), providerMetadata: obj } });
        } else {
          await markPaidAndActivate(payment.id, obj);
        }
      }
    }
  } catch (e) {
    console.error("[stripe webhook]", e);
  }
  return NextResponse.json({ received: true });
}
