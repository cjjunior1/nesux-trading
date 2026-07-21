import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { checkDirectCryptoPayment } from "@/lib/crypto-direct";

export const dynamic = "force-dynamic";

// GET /api/payments/[id]/status
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;

  let payment = await prisma.payment.findUnique({ where: { id: params.id } });
  if (!payment) return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });

  // Solo el dueño o un admin pueden consultar
  if (payment.userId !== userId && role !== "admin" && role !== "super-admin" && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  // Cripto directo: aprovechamos el sondeo del checkout para mirar la blockchain.
  if (payment.method === "crypto" && payment.status === "pending") {
    try {
      if (await checkDirectCryptoPayment(payment.id)) {
        payment = (await prisma.payment.findUnique({ where: { id: params.id } }))!;
      }
    } catch (e) {
      console.warn("[payment status] chequeo de cripto falló", e);
    }
  }

  return NextResponse.json({
    payment_id: payment.id,
    status: payment.status,
    method: payment.method,
    amount: payment.amount,
    currency: payment.currency,
    paid_at: payment.paidAt,
  });
}
