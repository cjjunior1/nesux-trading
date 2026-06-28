import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyNowPaymentsSignature, markPaidAndActivate } from "@/lib/payments";

export const dynamic = "force-dynamic";

// POST /api/webhooks/nowpayments
export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("x-nowpayments-sig");

  if (!verifyNowPaymentsSignature(raw, sig, process.env.NOWPAYMENTS_IPN_SECRET)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  let body: any;
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }

  // order_id = nuestro payment.id ; busca por ahí o por el id del proveedor
  const payment = await prisma.payment.findFirst({
    where: { OR: [{ id: body.order_id }, { providerPaymentId: String(body.payment_id) }] },
  });
  if (!payment) return NextResponse.json({ received: true }); // 200 para no reintentar

  // Validar que el monto coincide (tolerancia mínima)
  if (Math.abs((body.price_amount ?? payment.amount) - payment.amount) > 0.01) {
    console.warn("[nowpayments] monto no coincide", body.order_id);
  }

  const paid = ["finished", "confirmed"].includes(body.payment_status);
  try {
    if (paid) {
      if (process.env.AUTO_ACTIVATE === "false") {
        await prisma.payment.update({ where: { id: payment.id }, data: { status: "paid", paidAt: new Date(), providerMetadata: body } });
      } else {
        await markPaidAndActivate(payment.id, body);
      }
    } else if (["failed", "expired", "refunded"].includes(body.payment_status)) {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: body.payment_status === "refunded" ? "refunded" : "failed", providerMetadata: body } });
    }
  } catch (e) {
    console.error("[nowpayments webhook]", e);
  }
  return NextResponse.json({ received: true });
}
