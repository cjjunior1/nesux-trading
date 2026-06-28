"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, Pencil, Ban, CheckCircle, Trash2, RotateCcw, CalendarPlus, X } from "lucide-react";

type Row = {
  id: string; clientId: string | null; tempPassword: string | null;
  email: string; firstName: string; lastName: string; whatsappNumber: string;
  status: string; plan: string | null; planAmount: number | null; currentPeriodEnd: string | null;
  standing: string; createdAt: string; lastLoginAt: string | null;
};

const STANDING: Record<string, { label: string; cls: string }> = {
  al_dia: { label: "Al día", cls: "bg-emerald-500/15 text-emerald-300" },
  moroso: { label: "Moroso", cls: "bg-amber-500/15 text-amber-300" },
  cancelado: { label: "Cancelado", cls: "bg-slate-600/30 text-slate-300" },
  sin_suscripcion: { label: "Sin plan", cls: "bg-slate-600/30 text-slate-400" },
};
const STATUS: Record<string, { label: string; cls: string }> = {
  active: { label: "Activo", cls: "bg-emerald-500/15 text-emerald-300" },
  suspended: { label: "Suspendido", cls: "bg-red-500/15 text-red-300" },
  deleted: { label: "Eliminado", cls: "bg-slate-600/30 text-slate-400" },
};
const fmtDate = (s: string | null) => (s ? new Date(s).toLocaleDateString("es-ES") : "—");

export function UsersSection() {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [standing, setStanding] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (status) p.set("status", status);
    if (standing) p.set("standing", standing);
    const r = await fetch(`/api/admin/users?${p.toString()}`).then((x) => x.json());
    setRows(r.users || []);
    setTotal(r.total || 0);
    setLoading(false);
  }, [q, status, standing]);

  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, email o WhatsApp…"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm">
          <option value="">Estado: todos</option>
          <option value="active">Activos</option>
          <option value="suspended">Suspendidos</option>
          <option value="deleted">Eliminados</option>
        </select>
        <select value={standing} onChange={(e) => setStanding(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm">
          <option value="">Pago: todos</option>
          <option value="al_dia">Al día</option>
          <option value="moroso">Morosos</option>
          <option value="sin_suscripcion">Sin plan</option>
        </select>
      </div>

      <div className="text-xs text-slate-500">{loading ? "Cargando…" : `${total} usuario(s)`}</div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-slate-400 text-xs">
            <tr>
              <th className="text-left px-3 py-2">ID</th>
              <th className="text-left px-3 py-2">Alumno</th>
              <th className="text-left px-3 py-2">Plan</th>
              <th className="text-left px-3 py-2">Vence</th>
              <th className="text-left px-3 py-2">Pago</th>
              <th className="text-left px-3 py-2">Estado</th>
              <th className="text-right px-3 py-2">Acción</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-t border-slate-800 hover:bg-slate-900/50">
                <td className="px-3 py-2 font-mono text-xs text-cyan-300">{u.clientId || "—"}</td>
                <td className="px-3 py-2">
                  <div className="font-medium text-white">{u.firstName} {u.lastName}</div>
                  <div className="text-xs text-slate-500">{u.email}</div>
                </td>
                <td className="px-3 py-2 capitalize">{u.plan || "—"}</td>
                <td className="px-3 py-2">{fmtDate(u.currentPeriodEnd)}</td>
                <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-xs ${STANDING[u.standing]?.cls}`}>{STANDING[u.standing]?.label}</span></td>
                <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-xs ${STATUS[u.status]?.cls}`}>{STATUS[u.status]?.label}</span></td>
                <td className="px-3 py-2 text-right">
                  <button onClick={() => setSelected(u)} className="text-emerald-400 hover:text-emerald-300 text-xs font-medium">Gestionar</button>
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={7} className="text-center text-slate-500 py-8">Sin resultados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && <UserModal user={selected} onClose={() => setSelected(null)} onChanged={() => { setSelected(null); load(); }} />}
    </div>
  );
}

function UserModal({ user, onClose, onChanged }: { user: Row; onClose: () => void; onChanged: () => void }) {
  const [form, setForm] = useState({ firstName: user.firstName, lastName: user.lastName, email: user.email, whatsappNumber: user.whatsappNumber, password: "" });
  const [days, setDays] = useState(30);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const run = async (fn: () => Promise<Response>, okMsg: string) => {
    setBusy(true); setMsg("");
    try { const r = await fn(); const d = await r.json(); setMsg(r.ok ? okMsg : (d.error || "Error")); if (r.ok) setTimeout(onChanged, 600); }
    catch { setMsg("Error de red"); } finally { setBusy(false); }
  };
  const action = (action: string, extra: any = {}) =>
    run(() => fetch(`/api/admin/users/${user.id}/action`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...extra }) }), "Hecho ✓");

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white">{user.firstName} {user.lastName}</h3>
          <button onClick={onClose}><X size={18} className="text-slate-400 hover:text-white" /></button>
        </div>

        {msg && <div className="mb-3 text-sm text-emerald-300 bg-emerald-500/10 rounded-lg px-3 py-2">{msg}</div>}

        {/* Credenciales generadas */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 mb-4 text-sm">
          <div className="flex justify-between"><span className="text-slate-400">ID de usuario</span><span className="font-mono text-cyan-300">{user.clientId || "—"}</span></div>
          <div className="flex justify-between mt-1">
            <span className="text-slate-400">Contraseña temporal</span>
            <span className="font-mono text-amber-300">{user.tempPassword || "— (ya la cambió)"}</span>
          </div>
        </div>

        {/* Editar datos */}
        <div className="space-y-2 mb-4">
          <div className="grid grid-cols-2 gap-2">
            <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="Nombre" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
            <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Apellido" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
          </div>
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
          <input value={form.whatsappNumber} onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })} placeholder="WhatsApp" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
          <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Nueva contraseña (opcional)" type="password" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
          <button disabled={busy} onClick={() => run(() => fetch(`/api/admin/users/${user.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }), "Datos guardados ✓")}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-3 py-2 rounded-lg disabled:opacity-50">
            <Pencil size={14} /> Guardar datos
          </button>
        </div>

        {/* Suscripción / bonos */}
        <div className="border-t border-slate-800 pt-3 mb-4">
          <p className="text-xs text-slate-400 mb-2">Suscripción y bonos</p>
          <div className="flex items-center gap-2">
            <input type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-sm" />
            <button disabled={busy} onClick={() => action("extend", { days })} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm px-3 py-2 rounded-lg disabled:opacity-50">
              <CalendarPlus size={14} /> Sumar/restar días
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Días positivos amplían el vencimiento; negativos lo acortan.</p>
        </div>

        {/* Estado de cuenta */}
        <div className="border-t border-slate-800 pt-3 mb-4">
          <p className="text-xs text-slate-400 mb-2">Estado de la cuenta</p>
          {user.status !== "suspended" ? (
            <div className="flex gap-2">
              <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motivo de suspensión" className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
              <button disabled={busy} onClick={() => action("suspend", { reason, untilDays: 30 })} className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm px-3 py-2 rounded-lg disabled:opacity-50">
                <Ban size={14} /> Suspender
              </button>
            </div>
          ) : (
            <button disabled={busy} onClick={() => action("activate")} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-3 py-2 rounded-lg disabled:opacity-50">
              <CheckCircle size={14} /> Reactivar cuenta
            </button>
          )}
        </div>

        {/* Nota */}
        <div className="border-t border-slate-800 pt-3 mb-4">
          <p className="text-xs text-slate-400 mb-2">Nota interna</p>
          <div className="flex gap-2">
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Agregar nota…" className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
            <button disabled={busy || !note} onClick={() => { action("addNote", { body: note }); setNote(""); }} className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-3 py-2 rounded-lg disabled:opacity-50">Guardar</button>
          </div>
        </div>

        {/* Eliminar / restaurar */}
        <div className="border-t border-slate-800 pt-3">
          {user.status !== "deleted" ? (
            <button disabled={busy} onClick={() => { if (confirm("¿Eliminar (soft delete) este usuario?")) run(() => fetch(`/api/admin/users/${user.id}`, { method: "DELETE" }), "Usuario eliminado ✓"); }}
              className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm">
              <Trash2 size={14} /> Eliminar usuario
            </button>
          ) : (
            <button disabled={busy} onClick={() => action("restore")} className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm">
              <RotateCcw size={14} /> Restaurar usuario
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
