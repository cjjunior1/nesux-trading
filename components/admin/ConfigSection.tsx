"use client";

import { useEffect, useState } from "react";
import { Save, KeyRound, ShieldAlert, Loader2 } from "lucide-react";

export function ConfigSection() {
  const [days, setDays] = useState("15");
  const [loading, setLoading] = useState(true);
  const [savingDays, setSavingDays] = useState(false);
  const [forcing, setForcing] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setDays(String(d.password_change_days ?? "15")))
      .finally(() => setLoading(false));
  }, []);

  const saveDays = async () => {
    setSavingDays(true); setMsg("");
    try {
      const r = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password_change_days: Number(days) }),
      });
      const d = await r.json();
      setMsg(r.ok ? `Guardado: ahora la contraseña se cambia cada ${d.password_change_days} días.` : (d.error || "Error"));
    } catch { setMsg("Error de red"); } finally { setSavingDays(false); }
  };

  const forceAll = async () => {
    if (!confirm("¿Forzar a TODOS los alumnos a cambiar su contraseña en el próximo inicio de sesión?")) return;
    setForcing(true); setMsg("");
    try {
      const r = await fetch("/api/admin/users/force-password-change", { method: "POST" });
      const d = await r.json();
      setMsg(r.ok ? `Listo: ${d.count} alumno(s) deberán cambiar su contraseña al ingresar.` : (d.error || "Error"));
    } catch { setMsg("Error de red"); } finally { setForcing(false); }
  };

  if (loading) return <div className="text-slate-400 p-6">Cargando configuración…</div>;

  return (
    <div className="space-y-4 max-w-xl">
      {msg && <div className="text-sm text-emerald-300 bg-emerald-500/10 rounded-lg px-3 py-2">{msg}</div>}

      {/* Tiempo de cambio de contraseña */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <KeyRound size={18} className="text-emerald-400" />
          <h3 className="font-semibold text-white">Cambio obligatorio de contraseña</h3>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          Cada cuántos días los alumnos deben cambiar su contraseña. Aplica a <b>todos</b> de forma global.
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number" min={1} max={365} value={days}
            onChange={(e) => setDays(e.target.value)}
            className="w-28 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm"
          />
          <span className="text-slate-400 text-sm">días</span>
          <button onClick={saveDays} disabled={savingDays}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50">
            {savingDays ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Guardar
          </button>
        </div>
      </div>

      {/* Forzar cambio a todos */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert size={18} className="text-amber-400" />
          <h3 className="font-semibold text-white">Forzar cambio a todos los alumnos</h3>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          Marca a <b>todos</b> los alumnos para que cambien su contraseña la próxima vez que inicien sesión.
          Útil tras un incidente de seguridad o un cambio de política.
        </p>
        <button onClick={forceAll} disabled={forcing}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50">
          {forcing ? <Loader2 size={14} className="animate-spin" /> : <ShieldAlert size={14} />} Forzar cambio a todos
        </button>
      </div>
    </div>
  );
}
