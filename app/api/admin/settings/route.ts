import { NextResponse } from "next/server";
import { guardAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

const DEFAULTS: Record<string, string> = { password_change_days: "15" };

// GET /api/admin/settings -> ajustes globales
export async function GET() {
  const guard = await guardAdmin();
  if (!guard.ok) return guard.response;

  // AppSetting es global por diseño y se comparte con los demás negocios:
  // "client_seq" TIENE que ser un contador único para que no se repitan los ID.
  // Contrapartida asumida: cambiar aquí "password_change_days" afecta a todos.
  const rows = await prisma.appSetting.findMany();
  const map: Record<string, string> = { ...DEFAULTS };
  for (const r of rows) map[r.key] = r.value;
  delete map["client_seq"]; // contador interno, no se expone
  return NextResponse.json(map);
}

// PUT /api/admin/settings -> actualiza ajustes (por ahora: password_change_days)
export async function PUT(req: Request) {
  const guard = await guardAdmin();
  if (!guard.ok) return guard.response;

  const body = await req.json().catch(() => ({}));
  const days = parseInt(body.password_change_days, 10);
  if (!Number.isFinite(days) || days < 1 || days > 365) {
    return NextResponse.json({ error: "Los días deben ser un número entre 1 y 365" }, { status: 400 });
  }

  await prisma.appSetting.upsert({
    where: { key: "password_change_days" },
    create: { key: "password_change_days", value: String(days) },
    update: { value: String(days) },
  });
  await logAdminAction({ actor: guard.actor, action: "settings.update", metadata: { password_change_days: days } });
  return NextResponse.json({ ok: true, password_change_days: days });
}
