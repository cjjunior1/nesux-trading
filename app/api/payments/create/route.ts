import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { getBusinessId } from "@/lib/business";
import {
  getBankAccounts, getUsdToDop, toDop,
  createNowPayment, createStripeSession, createPaypalOrder,
} from "@/lib/payments";
import { useDirectCrypto, getCryptoWallet, reserveUniqueAmount, CRYPTO_WINDOW_MIN } from "@/lib/crypto-direct";

export const dynamic = "force-dynamic";

const METHODS = ["crypto", "card", "stripe", "paypal", "bank_transfer"];

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id || body.user_id;
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const method = body.method;
  const productId = body.product_id || null;
  if (!METHODS.includes(method)) {
    return NextResponse.json({ error: "Método de pago inválido" }, { status: 400 });
  }

  // Precio AUTORITATIVO desde la base (nunca se confía en el monto del cliente).
  let amount = Number(body.amount) || 0;
  let currency = (body.currency || "USD").toUpperCase();
  let productName = "Trading a Otro Nivel";
  let resolvedProductId: string | null = null;
  let grantsCourseId: string | null = null;

  if (productId) {
    // 1) Catálogo unificado (course | bot | plan), por id o por slug.
    const product = await prisma.product.findFirst({
      where: { OR: [{ id: productId }, { slug: productId }], isPublished: true },
    });
    if (product) {
      amount = product.price;
      currency = (product.currency || currency).toUpperCase();
      productName = product.name;
      resolvedProductId = product.id;
      grantsCourseId = product.grantsCourseId || null;
    } else {
      // 2) Compatibilidad: curso antiguo por id.
      const course = await prisma.course.findUnique({ where: { id: productId } });
      if (course) { amount = course.price; productName = course.title; grantsCourseId = course.id; }
    }
  }
  if (amount <= 0) return NextResponse.json({ error: "Monto inválido" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  // Crear el registro de pago (pending)
  const payment = await prisma.payment.create({
    data: { userId, businessId: await getBusinessId(), productId: resolvedProductId, courseId: grantsCourseId, method, amount, currency, status: "pending" },
  });

  try {
    switch (method) {
      case "bank_transfer": {
        const accounts = getBankAccounts();
        if (!accounts.length) throw new Error("La transferencia bancaria no está disponible por ahora. Elige otro método.");
        const reference = user.clientId || payment.id;

        // Las cuentas son en pesos: le mostramos al alumno el monto en DOP,
        // pero el pago se sigue registrando en USD (moneda del catálogo).
        const needsDop = accounts.some((a) => (a.currency || "").toUpperCase() === "DOP");
        const rate = getUsdToDop();
        if (needsDop && !rate) {
          throw new Error("La transferencia bancaria no está disponible por ahora. Elige otro método.");
        }

        await prisma.payment.update({
          where: { id: payment.id },
          data: { reference, providerMetadata: needsDop ? { display_currency: "DOP", rate } : undefined },
        });
        return NextResponse.json({
          payment_id: payment.id,
          bank_accounts: accounts,
          reference,
          amount,
          ...(needsDop ? { amount_dop: toDop(amount, rate!), rate } : {}),
        });
      }
      case "crypto": {
        // Modo directo: el alumno paga a nuestra wallet, sin procesador de por medio.
        if (useDirectCrypto()) {
          const address = getCryptoWallet()!;
          const payAmount = await reserveUniqueAmount(amount);
          const expiresAt = new Date(Date.now() + CRYPTO_WINDOW_MIN * 60_000);
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              amount: payAmount, // monto único: así identificamos el depósito
              providerMetadata: { mode: "direct_trc20", address, network: "TRC20", expiresAt: expiresAt.toISOString() },
            },
          });
          return NextResponse.json({
            payment_id: payment.id,
            pay_address: address,
            pay_amount: payAmount,
            pay_currency: "usdttrc20",
            network: "TRON (TRC20)",
            exact_amount: true,
            expires_at: expiresAt.toISOString(),
          });
        }

        const np = await createNowPayment({ paymentId: payment.id, userId, amount, currency, payCurrency: body.pay_currency, description: productName });
        await prisma.payment.update({ where: { id: payment.id }, data: { providerPaymentId: String(np.payment_id), providerMetadata: np } });
        return NextResponse.json({
          payment_id: payment.id,
          pay_url: np.invoice_url || np.pay_url || null,
          pay_address: np.pay_address,
          pay_amount: np.pay_amount,
          pay_currency: np.pay_currency,
          expires_at: np.expiration_estimate_date || null,
        });
      }
      case "stripe": {
        const s = await createStripeSession({ paymentId: payment.id, userId, courseId: productId, amount, currency, productName });
        await prisma.payment.update({ where: { id: payment.id }, data: { providerPaymentId: s.id, providerMetadata: s } });
        return NextResponse.json({ payment_id: payment.id, checkout_url: s.url });
      }
      // "card" también va por PayPal, pero abriendo el formulario de tarjeta
      // (pago como invitado, sin cuenta PayPal).
      case "card":
      case "paypal": {
        const o = await createPaypalOrder({
          paymentId: payment.id, amount, currency, productName,
          cardFirst: method === "card",
        });
        // Con payment_source el enlace viene como "payer-action" en vez de "approve".
        const approve = (o.links || []).find((l: any) => l.rel === "payer-action" || l.rel === "approve")?.href || null;
        if (!approve) throw new Error("PayPal no devolvió el enlace de pago");
        await prisma.payment.update({ where: { id: payment.id }, data: { providerPaymentId: o.id, providerMetadata: o } });
        return NextResponse.json({ payment_id: payment.id, checkout_url: approve });
      }
    }
  } catch (e: any) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "failed" } }).catch(() => {});
    return NextResponse.json({ error: e.message || "Error creando el pago" }, { status: 502 });
  }
}
