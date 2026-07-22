import { NextResponse } from "next/server";
import { guardAdmin } from "@/lib/admin-guard";
import { getDashboardMetrics } from "@/lib/metrics";
import { getBusinessId } from "@/lib/business";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await guardAdmin();
  if (!guard.ok) return guard.response;

  try {
    // Métricas solo de este negocio: la base es compartida.
    const metrics = await getDashboardMetrics(await getBusinessId());
    return NextResponse.json(metrics);
  } catch (e: any) {
    console.error("[admin/metrics]", e);
    return NextResponse.json({ error: "No se pudieron calcular las métricas" }, { status: 500 });
  }
}
