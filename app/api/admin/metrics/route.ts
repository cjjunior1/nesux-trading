import { NextResponse } from "next/server";
import { guardAdmin } from "@/lib/admin-guard";
import { getDashboardMetrics } from "@/lib/metrics";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await guardAdmin();
  if (!guard.ok) return guard.response;

  try {
    const metrics = await getDashboardMetrics();
    return NextResponse.json(metrics);
  } catch (e: any) {
    console.error("[admin/metrics]", e);
    return NextResponse.json({ error: "No se pudieron calcular las métricas" }, { status: 500 });
  }
}
