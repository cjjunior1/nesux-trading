"use client";

import { useState } from "react";
import {
  LayoutDashboard, Users, Megaphone, CreditCard, Bell,
  ShieldCheck, Settings, BookOpen, type LucideIcon,
} from "lucide-react";
import { DashboardSection } from "./DashboardSection";
import { UsersSection } from "./UsersSection";
import { PaymentsSection } from "./PaymentsSection";
import { ConfigSection } from "./ConfigSection";

type SectionId =
  | "dashboard" | "usuarios" | "comunicaciones" | "pagos"
  | "publicidad" | "auditoria" | "recursos" | "configuracion";

const SECTIONS: { id: SectionId; label: string; icon: LucideIcon; ready?: boolean }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, ready: true },
  { id: "usuarios", label: "Usuarios", icon: Users, ready: true },
  { id: "pagos", label: "Pagos y reportes", icon: CreditCard, ready: true },
  { id: "comunicaciones", label: "Comunicaciones", icon: Bell },
  { id: "publicidad", label: "Publicidad", icon: Megaphone },
  { id: "recursos", label: "Recursos", icon: BookOpen },
  { id: "auditoria", label: "Auditoría", icon: ShieldCheck },
  { id: "configuracion", label: "Configuración", icon: Settings, ready: true },
];

export function AdminPanel() {
  const [active, setActive] = useState<SectionId>("dashboard");

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-8">
        {/* Encabezado */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Panel de Administración</h1>
          <p className="text-slate-400 text-sm">Trading Academy A Otro Nivel</p>
        </div>

        {/* Selector por DESPLEGABLE (móvil) */}
        <div className="md:hidden mb-4">
          <select
            value={active}
            onChange={(e) => setActive(e.target.value as SectionId)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm"
          >
            {SECTIONS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}{s.ready ? "" : " (próximamente)"}</option>
            ))}
          </select>
        </div>

        <div className="grid md:grid-cols-[220px_1fr] gap-6">
          {/* Navegación por BOTONES (escritorio) */}
          <nav className="hidden md:flex flex-col gap-1">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const isActive = active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                    isActive ? "bg-emerald-600 text-white" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <span className="flex-1">{s.label}</span>
                  {!s.ready && <span className="text-[9px] uppercase text-slate-500">pronto</span>}
                </button>
              );
            })}
          </nav>

          {/* Contenido de la sección activa */}
          <section className="min-w-0">
            {active === "dashboard" && <DashboardSection />}
            {active === "usuarios" && <UsersSection />}
            {active === "pagos" && <PaymentsSection />}
            {active === "configuracion" && <ConfigSection />}
            {!["dashboard", "usuarios", "pagos", "configuracion"].includes(active) && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center">
                <p className="text-slate-400">
                  La sección <b className="text-white">{SECTIONS.find((s) => s.id === active)?.label}</b> está
                  planificada para una próxima fase.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
