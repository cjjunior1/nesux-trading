import { prisma } from "@/lib/db";
import { markPaidAndActivate } from "@/lib/payments";

/**
 * Cobro de cripto DIRECTO a nuestra propia wallet (sin procesador).
 *
 * El alumno envía USDT-TRC20 a la dirección de la casa por un monto ÚNICO
 * (se le restan centavos al precio) y un chequeo contra la API pública de
 * TronScan detecta el depósito y activa el acceso. Cero comisiones de
 * plataforma; a cambio, la identificación del pago depende del monto exacto.
 */

/** Contrato oficial de USDT en la red TRON. */
const USDT_TRC20_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

/** Ventana de vida de una orden de cripto. Pasada, el monto vuelve a estar libre. */
export const CRYPTO_WINDOW_MIN = 60;

/** Margen de tolerancia al comparar montos (menor que el paso de 1 centavo). */
const AMOUNT_TOLERANCE = 0.004;

export function getCryptoWallet(): string | null {
  const addr = (process.env.CRYPTO_WALLET_TRC20 || "").trim();
  return addr.startsWith("T") && addr.length === 34 ? addr : null;
}

/** True si debemos cobrar cripto directo (hay wallet y no se forzó NOWPayments). */
export function useDirectCrypto(): boolean {
  if (process.env.CRYPTO_MODE === "nowpayments") return false;
  return !!getCryptoWallet();
}

/**
 * Busca un monto en USDT que ninguna otra orden viva esté esperando.
 * Va restando centavos al precio (239.99 → 239.98 → 239.97…) para que cada
 * depósito sea identificable por su cantidad.
 */
export async function reserveUniqueAmount(baseAmount: number): Promise<number> {
  const since = new Date(Date.now() - CRYPTO_WINDOW_MIN * 60_000);
  // A PROPOSITO sin filtrar por negocio, aunque la base sea compartida: la wallet
  // USDT es UNA sola para todos. Si cada negocio reservara montos por separado, dos
  // podrian reservar el mismo importe y un deposito activaria el pago equivocado.
  const live = await prisma.payment.findMany({
    where: { method: "crypto", status: "pending", createdAt: { gte: since } },
    select: { amount: true },
  });
  const taken = new Set(live.map((p) => p.amount.toFixed(2)));

  for (let cents = 0; cents < 100; cents++) {
    const candidate = Math.round((baseAmount - cents * 0.01) * 100) / 100;
    if (candidate <= 0) break;
    if (!taken.has(candidate.toFixed(2))) return candidate;
  }
  throw new Error("Demasiadas órdenes de cripto abiertas. Intenta en unos minutos.");
}

type Trc20Transfer = {
  transaction_id: string;
  to_address: string;
  from_address: string;
  quant: string;
  block_ts: number;
  finalResult?: string;
  confirmed?: boolean;
  contract_address?: string;
  tokenInfo?: { tokenDecimal?: number };
};

/** Host de la API pública de TronScan (apis.tronscan.org quedó fuera de servicio). */
const TRONSCAN_BASE = () => process.env.TRONSCAN_API_BASE || "https://apilist.tronscanapi.com";

/** Últimas transferencias USDT-TRC20 recibidas en nuestra wallet. */
async function fetchIncomingTransfers(address: string): Promise<Trc20Transfer[]> {
  const url =
    `${TRONSCAN_BASE()}/api/token_trc20/transfers` +
    `?limit=50&start=0&sort=-timestamp&count=true&filterTokenValue=0` +
    `&relatedAddress=${address}&contract_address=${USDT_TRC20_CONTRACT}`;

  const res = await fetch(url, {
    headers: process.env.TRONSCAN_API_KEY ? { "TRON-PRO-API-KEY": process.env.TRONSCAN_API_KEY } : {},
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`TronScan respondió ${res.status}`);
  const data = await res.json();
  const list: Trc20Transfer[] = data?.token_transfers || [];
  // Solo entradas confirmadas hacia nuestra dirección.
  return list.filter(
    (t) => t.to_address === address && (t.finalResult ?? "SUCCESS") === "SUCCESS" && t.confirmed !== false
  );
}

/** `quant` viene en unidades base; USDT usa 6 decimales. */
function toUsdt(t: Trc20Transfer): number {
  const decimals = t.tokenInfo?.tokenDecimal ?? 6;
  return Number(t.quant) / 10 ** decimals;
}

/**
 * Revisa si el depósito de un pago pendiente ya llegó a la wallet.
 * Idempotente: si el pago ya está pagado, no hace nada. Devuelve true si activó.
 */
export async function checkDirectCryptoPayment(paymentId: string): Promise<boolean> {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment || payment.method !== "crypto" || payment.status !== "pending") return false;

  const meta = (payment.providerMetadata as any) || {};
  if (meta.mode !== "direct_trc20") return false; // orden de NOWPayments, la maneja su webhook

  const address = getCryptoWallet();
  if (!address) return false;

  const transfers = await fetchIncomingTransfers(address);
  // Damos 5 min de gracia hacia atrás por desfases de reloj.
  const notBefore = payment.createdAt.getTime() - 5 * 60_000;

  for (const t of transfers) {
    if (t.block_ts < notBefore) continue;
    if (Math.abs(toUsdt(t) - payment.amount) > AMOUNT_TOLERANCE) continue;

    // Una transacción no puede pagar dos órdenes distintas.
    const alreadyUsed = await prisma.payment.findFirst({
      where: { providerPaymentId: t.transaction_id, NOT: { id: payment.id } },
      select: { id: true },
    });
    if (alreadyUsed) continue;

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerPaymentId: t.transaction_id,
        providerMetadata: { ...meta, tx: t, detectedAt: new Date().toISOString() },
      },
    });
    await markPaidAndActivate(payment.id, { ...meta, tx: t });
    return true;
  }
  return false;
}

/** Revisa todas las órdenes de cripto directo aún vivas (para el cron). */
export async function checkAllPendingCrypto(): Promise<{ checked: number; activated: number }> {
  const since = new Date(Date.now() - CRYPTO_WINDOW_MIN * 60_000);
  const pending = await prisma.payment.findMany({
    where: { method: "crypto", status: "pending", createdAt: { gte: since } },
    select: { id: true },
  });

  let activated = 0;
  for (const p of pending) {
    try {
      if (await checkDirectCryptoPayment(p.id)) activated++;
    } catch (e) {
      console.warn("[crypto-direct] fallo revisando", p.id, e);
    }
  }
  return { checked: pending.length, activated };
}
