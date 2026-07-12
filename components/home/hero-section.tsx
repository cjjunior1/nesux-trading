"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, TrendingUp, Shield, Zap, Headphones } from "lucide-react";

// Mensajes variados: CJ se presenta como aliado, guía y amigo en el trading.
const ALIADO_MSGS = [
  "¡Hey! Soy CJ, tu aliado y amigo en el trading. No estás solo en esto — cuéntame por dónde quieres empezar y te acompaño paso a paso. 🚀",
  "Bienvenido 👋 Soy CJ, tu guía en el mundo del trading. Aquí no vendemos humo: te acompaño con la verdad y con método. ¿Qué te gustaría saber?",
  "Soy CJ. Piénsame como ese amigo que ya recorrió el camino del trading y quiere verte ganar. ¿Te muestro cómo empezar del lado correcto?",
  "¡Qué bueno verte! Soy CJ, tu compañero de ruta. Mi misión es que pases del 95% que pierde al 5% que aprende a ganar. ¿Arrancamos juntos?",
  "Soy CJ, tu mentor y aliado. El trading se ve difícil solo cuando lo enfrentas sin guía — para eso estoy yo. Pregúntame lo que quieras. 💪",
];

export function HeroSection() {
  const openAliado = () => {
    const m = ALIADO_MSGS[Math.floor(Math.random() * ALIADO_MSGS.length)];
    window.dispatchEvent(new CustomEvent("nx-open-chat", { detail: { greeting: "Tu aliado en el trading 🤝", message: m } }));
  };
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://cdn.abacus.ai/images/31f74caf-5d2c-4805-be8e-accbeb7f450f.png"
          alt="Trading profesional"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/90 to-slate-950" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6" style={{ backgroundColor: 'rgba(0, 217, 255, 0.1)', border: '1px solid rgba(0, 217, 255, 0.3)' }}>
            <TrendingUp style={{ color: '#00D9FF' }} className="h-4 w-4" />
            <span className="text-sm" style={{ color: '#00D9FF' }}>Método Probado para Traders Exitosos</span>
          </div>

          <h1 className="title-anim text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-relaxed">
            Transforma tu Vida con el
            <span className="block gradient-text mt-1">Trading Inteligente</span>
          </h1>

          {/* Botón publicitario: activa a CJ como tu aliado / guía / amigo */}
          <div className="mb-32 mt-20 flex justify-center">
            <button
              type="button"
              onClick={openAliado}
              className="relative inline-flex items-center gap-2 rounded-full px-8 py-4 text-base md:text-lg font-extrabold text-white bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 shadow-xl shadow-fuchsia-500/50 hover:shadow-fuchsia-500/70 hover:scale-[1.04] transition-all"
            >
              <span className="absolute inset-0 rounded-full ring-2 ring-fuchsia-300/60 animate-ping opacity-50" />
              🚀 Activa tu Aliado de Trading 📈
            </button>
          </div>

          {/* Las 3 Verdades del Trading */}
          <div className="max-w-3xl mx-auto mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-5" style={{ color: '#B64183' }}>
              Las 3 Verdades del Trading que Debes Saber
            </h2>
            <div className="grid gap-4 text-left">
              <div className="bg-slate-900/50 border rounded-2xl p-5 flex gap-4 items-start" style={{ borderColor: '#4040BF4D' }}>
                <span className="flex-shrink-0 w-11 h-11 rounded-full text-white text-lg font-extrabold flex items-center justify-center ring-2" style={{ backgroundColor: '#4040BF', boxShadow: '0 0 16px rgba(64, 64, 191, 0.4)', borderColor: '#4040BF' }}>1</span>
                <p className="text-base md:text-lg text-slate-200 leading-relaxed">
                  En los mercados financieros, <strong className="text-white">la mayoría pierde</strong>. No es mala suerte — es no tener el método correcto.
                </p>
              </div>
              <div className="bg-slate-900/50 border rounded-2xl p-5 flex gap-4 items-start" style={{ borderColor: '#0052884D' }}>
                <span className="flex-shrink-0 w-11 h-11 rounded-full text-white text-lg font-extrabold flex items-center justify-center ring-2" style={{ backgroundColor: '#005288', boxShadow: '0 0 16px rgba(0, 82, 136, 0.4)', borderColor: '#005288' }}>2</span>
                <p className="text-base md:text-lg text-slate-200 leading-relaxed">
                  Hay una verdad incómoda en el trading: <strong className="text-white">los mercados no perdonan la improvisación</strong>. La mayoría paga un precio muy caro por aprenderlo tarde.
                </p>
              </div>
              <div className="bg-slate-900/50 border rounded-2xl p-5 flex gap-4 items-start" style={{ borderColor: '#8080FF4D' }}>
                <span className="flex-shrink-0 w-11 h-11 rounded-full text-white text-lg font-extrabold flex items-center justify-center ring-2" style={{ backgroundColor: '#8080FF', boxShadow: '0 0 16px rgba(128, 128, 255, 0.4)', borderColor: '#8080FF' }}>3</span>
                <p className="text-base md:text-lg text-slate-200 leading-relaxed">
                  El dinero que pierde la mayoría de los traders no desaparece — <strong className="text-white">alguien más se lo lleva</strong>. La pregunta es: ¿de qué lado quieres estar?
                </p>
              </div>
            </div>
          </div>

          <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-3xl mx-auto text-justify leading-relaxed">
            El <strong className="text-red-500">95%</strong> de los traders pierde dinero por falta de conocimiento, disciplina y estrategia. Nuestro método está diseñado para ayudarte a formar parte del <strong style={{ color: '#00D9FF' }}>5%</strong> que opera con criterio, controla el riesgo y busca resultados consistentes.
          </p>

          <p className="text-lg text-slate-200 mb-6 max-w-3xl mx-auto leading-relaxed text-justify">
            El trading es una habilidad real que puede generar ingresos consistentes cuando se aprende correctamente. Nuestra formación está diseñada para que avances paso a paso, con acompañamiento práctico en cada etapa y un enfoque claro en resultados tangibles. No se trata solo de teoría, sino de desarrollar las habilidades necesarias para operar con confianza y consistencia en los mercados.
          </p>

          <h3 className="text-2xl md:text-3xl font-bold mb-4 max-w-3xl mx-auto">
            <span style={{ color: '#FFD700' }}>Trading Binario</span>
            <span className="text-slate-500"> vs </span>
            <span className="text-blue-400">Trading de Forex</span>
          </h3>
          <div className="border rounded-2xl p-6 mb-6 max-w-3xl mx-auto" style={{ background: 'linear-gradient(to right, rgba(255, 215, 0, 0.1), rgba(0, 82, 136, 0.1))', borderColor: 'rgba(255, 215, 0, 0.3)' }}>
            <p className="text-base text-white leading-relaxed mb-3 text-justify">
              <strong className="text-lg" style={{ color: '#FFD700' }}>Comenzamos con Trading Binario</strong> porque es la forma más efectiva de que empieces a generar resultados reales <strong style={{ color: '#FFD700' }}>mientras aprendes</strong>. Imagina poder aplicar lo que estudias hoy y ver los resultados en horas, no en meses. El trading binario te permite exactamente eso: operaciones rápidas, claras y simples que aceleran tu curva de aprendizaje sin las complejidades del Forex tradicional.
            </p>
            <p className="text-base text-slate-200 leading-relaxed text-justify">
              Una vez domines los fundamentos y desarrolles la disciplina necesaria, darás el salto natural al trading en Forex con una base sólida. <strong style={{ color: '#FFD700' }}>No invertirás años estudiando teoría</strong> — estarás operando desde el inicio, generando experiencia real y viendo oportunidades de ingresos mientras construyes tu camino hacia la <strong style={{ color: '#00FF88' }}>libertad financiera</strong>.
            </p>
          </div>

          <h3 className="text-2xl md:text-3xl font-bold mb-4 max-w-3xl mx-auto">
            <span className="text-sky-400">CJ Bot</span> <span style={{ color: '#00FF88' }}>100% eficiente y rentable</span>
          </h3>
          <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/40 rounded-2xl p-6 mb-6 max-w-3xl mx-auto">
            <p className="text-base text-white leading-relaxed mb-3">
              <strong className="text-lg" style={{ color: '#00D9FF' }}>🤖 Nuestros Bots de Trading Automático</strong> — En la actualidad, contamos con <strong style={{ color: '#FF5733' }}>diversos bots de trading automático</strong> que operan en:
            </p>
            <div className="grid md:grid-cols-3 gap-3 mb-3">
              <div className="bg-slate-900/60 rounded-lg p-3 border border-blue-500/30 text-center">
                <div className="text-2xl mb-1">💱</div>
                <div className="text-white font-semibold text-sm">Forex</div>
              </div>
              <div className="bg-slate-900/60 rounded-lg p-3 border border-blue-500/30 text-center">
                <div className="text-2xl mb-1">₿</div>
                <div className="text-white font-semibold text-sm">Criptomonedas</div>
                <div className="text-xs font-bold" style={{ color: '#FFD700' }}>24/7</div>
              </div>
              <div className="bg-slate-900/60 rounded-lg p-3 border border-blue-500/30 text-center">
                <div className="text-2xl mb-1">📊</div>
                <div className="text-white font-semibold text-sm">Índices Sintéticos</div>
                <div className="text-xs font-bold" style={{ color: '#FFD700' }}>24/7</div>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Los bots en <strong style={{ color: '#FF5733' }}>criptomonedas e índices sintéticos operan 24/7</strong>, aprovechando oportunidades en todo momento. <strong className="text-slate-200">Nota importante:</strong> Hasta el momento no contamos con bots para trading binario, ya que nuestro enfoque en automatización está en los mercados de Forex, cripto e índices.
            </p>
          </div>

          <p className="text-xl md:text-2xl font-extrabold mb-8 max-w-3xl mx-auto bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, #FFD700, #00D9FF, #FF5733)' }}>
            Aquí no tenemos límites, lleguemos más allá de la meta porque no hay fronteras que nos detenga
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-10">
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: '#00FF88' }}>+2,500</div>
              <div className="text-sm text-slate-400">Estudiantes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: '#FFD700' }}>95%</div>
              <div className="text-sm text-slate-400">Satisfacción</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: '#00D9FF' }}>7 Años</div>
              <div className="text-sm text-slate-400">Experiencia</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/registro"
              className="w-full sm:w-[300px] rounded-full py-4 text-base md:text-lg font-bold text-white transition-all flex items-center justify-center gap-2"
              style={{ backgroundColor: '#00D9FF', boxShadow: '0 0 20px rgba(0, 217, 255, 0.4)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#00BFFF'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#00D9FF'}
            >
              Sí a mi libertad Financiera
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/metodo"
              className="w-full sm:w-[300px] rounded-full py-4 text-base md:text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
            >
              Quiero conocer el método
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-10">
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <Shield style={{ color: '#00FF88' }} className="h-5 w-5" />
              Comprometidos contigo
            </div>
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <Zap style={{ color: '#FFD700' }} className="h-5 w-5" />
              Acceso inmediato
            </div>
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <Headphones style={{ color: '#00D9FF' }} className="h-5 w-5" />
              Soporte real
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}