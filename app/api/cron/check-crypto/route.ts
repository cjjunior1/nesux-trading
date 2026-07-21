import { NextResponse } from "next/server";
import { checkAllPendingCrypto } from "@/lib/crypto-direct";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/check-crypto
 *
 * Revisa las órdenes de cripto pendientes contra la blockchain. El checkout ya
 * consulta al sondear, pero esto cubre al alumno que cierra el navegador antes
 * de que su depósito confirme. Llamar cada minuto desde cron.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET no configurado" }, { status: 503 });

  const auth = req.headers.get("authorization") || "";
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const result = await checkAllPendingCrypto();
    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    console.error("[cron check-crypto]", e);
    return NextResponse.json({ error: e.message || "Error" }, { status: 500 });
  }
}
