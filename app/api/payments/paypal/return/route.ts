import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { capturePaypalOrder, markPaidAndActivate } from "@/lib/payments";

export const dynamic = "force-dynamic";

const APP_URL = () => process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

/**
 * GET /api/payments/paypal/return?token=<orderId>&payment_id=<id>
 *
 * PayPal manda aquí al alumno cuando aprueba el pago. Aprobar no cobra: hay que
 * capturar la orden. Lo hacemos en cuanto vuelve para que el acceso se active al
 * instante; el webhook queda como respaldo si el alumno cierra el navegador.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("token");
  const paymentId = url.searchParams.get("payment_id");

  if (!orderId || !paymentId) {
    return NextResponse.redirect(`${APP_URL()}/payment/cancel`);
  }

  try {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) return NextResponse.redirect(`${APP_URL()}/payment/cancel`);

    if (payment.status !== "paid") {
      const capture = await capturePaypalOrder(orderId);
      if (capture.status !== "COMPLETED") {
        console.warn("[paypal return] captura no completada", capture.status);
        return NextResponse.redirect(`${APP_URL()}/payment/cancel`);
      }
      await markPaidAndActivate(payment.id, capture);
    }
    return NextResponse.redirect(`${APP_URL()}/payment/success?payment_id=${payment.id}`);
  } catch (e) {
    console.error("[paypal return]", e);
    return NextResponse.redirect(`${APP_URL()}/payment/cancel`);
  }
}
