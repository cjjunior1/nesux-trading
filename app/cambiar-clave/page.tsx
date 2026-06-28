"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, CheckCircle } from "lucide-react";

export default function CambiarClavePage() {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (next !== confirm) return setErr("Las contraseñas nuevas no coinciden");
    if (next.length < 8) return setErr("La nueva contraseña debe tener al menos 8 caracteres");
    setLoading(true);
    try {
      const r = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Error");
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 flex items-center justify-center px-4">
      <div className="max-w-md w-full card">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-emerald-500/20 p-2 rounded-lg"><KeyRound className="h-6 w-6 text-emerald-400" /></div>
          <div>
            <h1 className="text-xl font-bold text-white">Cambiar contraseña</h1>
            <p className="text-xs text-slate-400">Crea tu contraseña personal para asegurar tu cuenta.</p>
          </div>
        </div>

        {done ? (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-slate-300">¡Contraseña actualizada! Redirigiendo…</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {err && <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg p-3">{err}</div>}
            <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Contraseña temporal actual" className="input-field" />
            <input type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="Nueva contraseña (mín. 8)" className="input-field" />
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repite la nueva contraseña" className="input-field" />
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Guardando…</> : "Guardar contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
