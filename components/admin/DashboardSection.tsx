"use client";

import { useEffect, useState } from "react";
import {
  Users, UserCheck, UserX, AlertTriangle, DollarSign,
  TrendingUp, TrendingDown, Inbox,
} from "lucide-react";

type Metrics = {
  users: { total: number; active: number; suspended: number; deleted: number; new30d: number };
  payments: { alDia: number; morosos: number; morosidadPct: number };
  revenue: { total: number; last30d: number; prev30d: number; changePct: number };
  leads: number;
  trends: { signups: { date: string; value: number }[]; revenue: { date: string; value: number }[] };
};

const money = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Card({ icon: Icon, label, value, sub, tone = "slate" }: any) {
  const tones: Record<string, string> = {
    slate: "text-slate-300", emerald: "text-emerald-400", amber: "text-amber-400",
    red: "text-red-400", cyan: "text-cyan-400",
  };
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
        <Icon size={14} className={tones[tone]} /> {label}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

/** Mini gráfico de barras en SVG (sin librerías externas). */
function BarChart({ data, color = "#10b981" }: { data: { date: string; value: number }[]; color?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const w = 100 / Math.max(1, data.length);
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-24">
      {data.map((d, i) => {
        const h = (d.value / max) * 38;
        return <rect key={i} x={i * w + w * 0.15} y={40 - h} width={w * 0.7} height={h} fill={color} rx={0.5}>
          <title>{d.date}: {d.value}</title>
        </rect>;
      })}
    </svg>
  );
}

export function DashboardSection() {
  const [m, setM] = useState<Metrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setM(d)))
      .catch(() => setError("No se pudo cargar el dashboard"));
  }, []);

  if (error) return <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-4">{error}</div>;
  if (!m) return <div className="text-slate-400 p-6">Cargando métricas…</div>;

  const up = m.revenue.changePct >= 0;

  return (
    <div className="space-y-6">
      {/* Tarjetas principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card icon={Users} label="Usuarios totales" value={m.users.total} sub={`+${m.users.new30d} en 30 días`} tone="cyan" />
        <Card icon={UserCheck} label="Al día (pagos)" value={m.payments.alDia} tone="emerald" />
        <Card icon={AlertTriangle} label="Morosos" value={m.payments.morosos} sub={`${m.payments.morosidadPct}% de morosidad`} tone="amber" />
        <Card icon={UserX} label="Suspendidos" value={m.users.suspended} tone="red" />
        <Card icon={DollarSign} label="Ingresos totales" value={money(m.revenue.total)} tone="emerald" />
        <Card
          icon={up ? TrendingUp : TrendingDown}
          label="Ingresos 30 días"
          value={money(m.revenue.last30d)}
          sub={`${up ? "▲" : "▼"} ${Math.abs(m.revenue.changePct)}% vs mes anterior`}
          tone={up ? "emerald" : "red"}
        />
        <Card icon={Inbox} label="Leads" value={m.leads} tone="slate" />
        <Card icon={UserX} label="Eliminados" value={m.users.deleted} sub="soft delete (restaurables)" tone="slate" />
      </div>

      {/* Alertas */}
      {m.payments.morosos > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="text-amber-400" size={20} />
          <p className="text-sm text-amber-200">
            Hay <b>{m.payments.morosos}</b> usuario(s) con pago vencido. Revísalos en la sección <b>Usuarios → filtro "Morosos"</b>.
          </p>
        </div>
      )}

      {/* Tendencias */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Inscripciones (últimos 30 días)</h3>
          <BarChart data={m.trends.signups} color="#22d3ee" />
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Ingresos (últimos 30 días)</h3>
          <BarChart data={m.trends.revenue} color="#10b981" />
        </div>
      </div>
    </div>
  );
}
