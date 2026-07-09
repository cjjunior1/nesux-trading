"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function CJBotSection() {
  const [open, setOpen] = useState(false);

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-3xl mx-auto text-center mb-8">
        <h2 className="section-title gradient-text">Landing / CJ Bot a Otro Nivel</h2>
        <p className="section-subtitle mb-6">Descubre el bot más avanzado, seguro y rentable de Trading Academy A Otro Nivel.</p>
      </div>
      <div className="max-w-2xl mx-auto">
        <button
          className="w-full flex items-center justify-center gap-3 bg-slate-900 border border-emerald-700 rounded-xl p-6 text-center shadow hover:bg-slate-800/70 transition-all duration-200 focus:outline-none"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="cj-bot-panel"
        >
          <span className="font-extrabold text-xl md:text-3xl bg-gradient-to-r from-emerald-400 via-sky-400 to-blue-500 bg-clip-text text-transparent">¿Por qué elegir CJ Bot a Otro Nivel?</span>
          <ChevronDown className={`h-7 w-7 text-sky-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div
            id="cj-bot-panel"
            className="transition-all duration-300 bg-slate-900 border border-emerald-800 mt-2 rounded-xl p-6"
          >
            <ul className="mb-4 space-y-3 text-left text-slate-200">
              <li><b>Automatización 24/7:</b> Opera en forex y criptos sin intervención manual.</li>
              <li><b>100% Seguro:</b> Tu dinero siempre bajo tu control. El bot nunca puede hacer retiros.</li>
              <li><b>Resultados auditables:</b> Win rate sostenible y reportes semanales de rendimiento.</li>
              <li><b>Fácil para todos:</b> Solo conecta tu cuenta y activa. Soporte y tutoriales en español.</li>
              <li><b>Demo gratuita:</b> Solicita acceso de prueba sin compromiso por WhatsApp o en la plataforma.</li>
            </ul>
            <a
              href="https://wa.me/" // Pon el número real aquí
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >Solicitar Demo por WhatsApp</a>
          </div>
        )}
      </div>
    </section>
  );
}
