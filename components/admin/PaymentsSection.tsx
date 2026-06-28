"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, X, DollarSign } from "lucide-react";

type Pay = {
  id: string; method: string; amount: number; currency: string; status: string;
  reference: string | null; createdAt: string; paidAt: string | null;
  user: string; email?: string; clientId?: string;
};

const STATUS: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300", paid: "bg-emerald-500/15 text-emerald-300",
  failed: "bg-red-500/15 text-red-300", refunded: "bg-slate-600/30 text-slate-300",
};
const METHOD: Record<string, string> = {
  crypto: "Cripto", stripe: "Tarjeta", paypal: "PayPal", bank_transfer: "Transferencia", manual: "Manual",
};
const fmtDate = (s: string | null) => (s ? new Date(s).toLocaleString("es-ES") : "—");

export function PaymentsSection() {
  const [rows, setRows] = useState<Pay[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [status, setStatus] = useState("");
  const [method, setMethod] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    if (method) p.set("method", method);
    const r = await fetch(`/api/admin/payments?${p}`).then((x) => x.json());
    setRows(r.payments || []);
    setTotalPaid(r.totalPaid || 0);
    setLoading(false);
  }, [status, method]);

  useEffect(() => { load(); }, [load]);

  const act = async (id: string, action: string) => {
    if (action !== "approve" && !confirm("¿Confirmar esta acción?")) return;
    setBusy(id);
    await fetch(`/api/admin/payments/${id}/action`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }),
    });
    setBusy(null);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-2">
          <DollarSign size={18} className="text-emerald-400" />
          <div><div className="text-xs text-slate-400">Ingresos confirmados</div>
            <div className="text-xl font-bold text-white">${totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div></div>
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm">
          <option value="">Estado: todos</option>
          <option value="pending">Pendientes</option>
          <option value="paid">Pagados</option>
          <option value="failed">Fallidos</option>
          <option value="refunded">Reembolsados</option>
        </select>
        <select value={method} onChange={(e) => setMethod(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm">
          <option value="">Método: todos</option>
          <option value="bank_transfer">Transferencia</option>
          <option value="crypto">Cripto</option>
          <option value="stripe">Tarjeta</option>
          <option value="paypal">PayPal</option>
        </select>
      </div>

      <div className="text-xs text-slate-500">{loading ? "Cargando…" : `${rows.length} pago(s)`}</div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-slate-400 text-xs">
            <tr>
              <th className="text-left px-3 py-2">Alumno</th>
              <th className="text-left px-3 py-2">Método</th>
              <th className="text-left px-3 py-2">Monto</th>
              <th className="text-left px-3 py-2">Ref.</th>
              <th className="text-left px-3 py-2">Estado</th>
              <th className="text-left px-3 py-2">Fecha</th>
              <th className="text-right px-3 py-2">Acción</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t border-slate-800 hover:bg-slate-900/50">
                <td className="px-3 py-2">
                  <div className="text-white">{p.user}</div>
                  <div className="text-xs text-cyan-300 font-mono">{p.clientId || p.email}</div>
                </td>
                <td className="px-3 py-2">{METHOD[p.method] || p.method}</td>
                <td className="px-3 py-2">${p.amount.toFixed(2)} {p.currency}</td>
                <td className="px-3 py-2 font-mono text-xs text-slate-400">{p.reference || "—"}</td>
                <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-xs ${STATUS[p.status]}`}>{p.status}</span></td>
                <td className="px-3 py-2 text-xs text-slate-400">{fmtDate(p.createdAt)}</td>
                <td className="px-3 py-2 text-right">
                  {p.status === "pending" ? (
                    <div className="flex justify-end gap-2">
                      <button disabled={busy === p.id} onClick={() => act(p.id, "approve")} className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs"><Check size={14} /> Aprobar</button>
                      <button disabled={busy === p.id} onClick={() => act(p.id, "reject")} className="flex items-center gap-1 text-red-400 hover:text-red-300 text-xs"><X size={14} /> Rechazar</button>
                    </div>
                  ) : <span className="text-slate-600 text-xs">—</span>}
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && <tr><td colSpan={7} className="text-center text-slate-500 py-8">Sin pagos.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
