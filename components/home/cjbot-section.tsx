"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function CJBotSection() {
  const [open, setOpen] = useState(false);

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-3xl mx-auto text-center mb-8">
        <h2 className="section-title bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, #C4728F, #C88A5A, #C9A961)' }}>Landing / CJ Bot a Otro Nivel</h2>
        <p className="section-subtitle mb-6">Descubre el bot más avanzado, seguro y rentable de Trading Academy A Otro Nivel.</p>
      </div>
      <div className="max-w-2xl mx-auto">
        <button
          className="w-full flex items-center justify-center gap-3 bg-slate-900 border border-emerald-700 rounded-xl p-6 text-center shadow hover:bg-slate-800/70 transition-all duration-200 focus:outline-none"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="cj-bot-panel"
        >
          <span className="font-extrabold text-xl md:text-3xl bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, #5E9EA0, #6BA3C4, #8B7EC8)' }}>¿Por qué elegir CJ Bot a Otro Nivel?</span>
          <ChevronDown className={`h-7 w-7 text-sky-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div
            id="cj-bot-panel"
            className="transition-all duration-300 bg-slate-900 border border-emerald-800 mt-2 rounded-xl p-6"
          >
            <ol className="space-y-3 text-left list-decimal list-inside marker:text-slate-400 marker:font-bold">
              <li><b style={{ color: '#4B7BA7' }}>Automatización 24/7:</b> <span style={{ color: '#B8C4D9' }}>Opera en forex y criptos sin intervención manual.</span></li>
              <li><b style={{ color: '#C9A961' }}>100% Seguro:</b> <span style={{ color: '#D9CFB8' }}>Tu dinero siempre bajo tu control. El bot nunca puede hacer retiros.</span></li>
              <li><b style={{ color: '#A78BFA' }}>Resultados auditables:</b> <span style={{ color: '#CFC4E8' }}>Win rate sostenible y reportes semanales de rendimiento.</span></li>
              <li><b style={{ color: '#C86432' }}>Fácil para todos:</b> <span style={{ color: '#E0C0AC' }}>Solo conecta tu cuenta y activa. Soporte y tutoriales en español.</span></li>
              <li><b style={{ color: '#B64183' }}>Demo gratuita:</b> <span style={{ color: '#E0B8D0' }}>Solicita acceso de prueba sin compromiso en la plataforma.</span></li>
              <li><b style={{ color: '#5E9EA0' }}>Multi-estrategia:</b> <span style={{ color: '#B8D4D5' }}>EMA+RSI, cruce de EMA, por tiempo y modo seguidor en un solo bot.</span></li>
              <li><b style={{ color: '#8B7EC8' }}>Gestión de riesgo:</b> <span style={{ color: '#CAC3E5' }}>Stop Loss y Take Profit dinámicos con trailing inteligente.</span></li>
              <li><b style={{ color: '#D4915D' }}>Martingala inteligente:</b> <span style={{ color: '#E8CBB0' }}>Recuperación progresiva con límite de respaldos configurable.</span></li>
              <li><b style={{ color: '#6BA3C4' }}>Protección de capital:</b> <span style={{ color: '#BDD4E2' }}>Límites de pérdida y ganancia en USD con cierre automático.</span></li>
              <li><b style={{ color: '#C4728F' }}>Soporte permanente:</b> <span style={{ color: '#E2C0CD' }}>Actualizaciones de por vida y comunidad privada de traders.</span></li>
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
