"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import Link from "next/link";
import {
  Bot,
  Zap,
  Shield,
  Clock,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Lock,
  Headphones,
} from "lucide-react";

// Estilos para animaciones de degradados dinámicos (ya no se usa)

const bots = [
  {
    name: " CJ Bot Lite",
    description: "Perfecto para comenzar con trading automatizado. Operaciones simples y seguras.",
    accounts: "Para Dos cuentas Real y cuatro cuentas demos",
    price: 99.99,
    period: "mes",
    features: [
      "Pares ilimitados",
      "Estrategia conservadora",
      "Operaciones 24/7",
      "Panel de control básico",
      "Soporte 24/7 por WhatsApp",
    ],
    color: "emerald",
    colorHex: "#03A7A5",
    buttonText: "claro que si",
  },
  {
    name: "CJ Bot Standard",
    description: "Múltiples estrategias y pares para traders intermedios que buscan diversificar.",
    accounts: "Para Tres cuentas Real y seis cuentas demos",
    price: 169.99,
    period: "mes",
    popular: true,
    features: [
      "Pares ilimitados",
      "3 estrategias diferentes",
      "Análisis en tiempo real",  
      "Panel avanzado con métricas",
      "Soporte 24/7 por WhatsApp"
    ],
    color: "blue",
    colorHex: "#3B82F6",
    buttonText: "My Standard",
  },
  {
    name: "CJ Bot Premium",
    description: "Solución institucional con las mejores herramientas y soporte dedicado.",
    accounts: "Para Seis cuentas Real y ocho cuentas demos",
    price: 209.99,
    period: "mes",
    features: [
      "Pares ilimitados",
      "Todas las estrategias",
      "API personalizada",
      "Configuración personalizada",
      "Soporte 24/7 por WhatsApp",
    ],
    color: "amber",
    colorHex: "#CE6674",
    buttonText: "Soy Premium",
  },
];

const features = [
  {
    icon: Clock,
    title: "Opera 24/7",
    description: "El bot opera las 24 horas, los 7 días. Nunca pierde una oportunidad.",
  },
  {
    icon: Shield,
    title: "Gestión de Riesgo",
    description: "Stop loss automáticos y gestión de capital integrada para proteger tu inversión.",
  },
  {
    icon: Zap,
    title: "Ejecución Instantánea",
    description: "Ejecuta operaciones en milisegundos, mucho más rápido que cualquier humano.",
  },
  {
    icon: TrendingUp,
    title: "Estrategias Probadas",
    description: "Algoritmos basados en nuestro método con años de backtesting y resultados reales.",
  },
];

export default function BotsPage() {
  const [ref1, inView1] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [ref2, inView2] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 mb-6">
                <Bot className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-purple-400">Trading Automatizado</span>
              </div>

              <h1 className="title-anim text-4xl md:text-5xl font-bold text-white mb-6">
                Bots de Trading <span className="gradient-text">Inteligentes</span>
              </h1>

              <p className="text-lg text-slate-300 mb-8">
                Deja que la tecnología trabaje por ti. Nuestros bots operan 24/7 con las mismas estrategias de nuestro método probado.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-xl">
                  <p className="text-3xl font-bold text-emerald-400">+85%</p>
                  <p className="text-sm text-slate-400">Precisión promedio</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl">
                  <p className="text-3xl font-bold text-purple-400">24/7</p>
                  <p className="text-sm text-slate-400">Operación continua</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative aspect-video rounded-2xl overflow-hidden"
            >
              <Image
                src="/robot-trading.png"
                alt="Bot de trading automatizado"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                priority
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-slate-900" ref={ref1}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView1 ? { opacity: 1, y: 0 } : {}}
              className="section-title"
            >
              ¿Por Qué Usar <span className="gradient-text">Nuestros Bots</span>?
            </motion.h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView1 ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: idx * 0.1 }}
                className="card text-center"
              >
                <div className="bg-gradient-to-br from-emerald-500/20 to-purple-500/20 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-7 w-7 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-950" ref={ref2}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView2 ? { opacity: 1, y: 0 } : {}}
              className="section-title"
            >
              Elige Tu <span className="gradient-text">Plan</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView2 ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="section-subtitle"
            >
              Planes flexibles para cada nivel de trader
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {bots.map((bot, idx) => (
              <motion.div
                key={bot.name}
                initial={{ opacity: 0, y: 30 }}
                animate={inView2 ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: idx * 0.15 }}
                className="card relative"
              >
                <div className="text-center mb-6">
                  <div 
                    className="inline-flex p-3 rounded-xl mb-4"
                    style={{ backgroundColor: `${bot.colorHex}20` }}
                  >
                    <Bot className="h-8 w-8" style={{ color: bot.colorHex }} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{bot.name}</h3>
                  <p className="text-slate-400 text-sm mt-2">{bot.description}</p>
                </div>

                <div className="text-center mb-6">
                  <span className="text-4xl font-bold text-white">${bot.price}</span>
                  <span className="text-slate-400">/{bot.period}</span>
                </div>

                <div 
                  className="text-center mb-6 p-3 rounded-full border"
                  style={{ 
                    backgroundColor: `${bot.colorHex}15`,
                    borderColor: `${bot.colorHex}50`,
                    color: bot.colorHex
                  }}
                >
                  <p className="text-sm font-semibold">{bot.accounts}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {bot.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-slate-300 text-sm">
                      <CheckCircle className="h-5 w-5 flex-shrink-0" style={{ color: bot.colorHex }} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/registro"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all text-white"
                  style={{ 
                    backgroundColor: bot.colorHex,
                    opacity: 1
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  {bot.buttonText} <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="section-title text-center mb-12">
            Cómo <span className="gradient-text">Funciona</span>
          </h2>

          <div className="space-y-8">
            {[
              { emoji: "📋", title: "Elige tu plan", desc: "Selecciona el bot que mejor se adapte a tus necesidades y nivel de experiencia." },
              { emoji: "🔗", title: "Conecta tu broker", desc: "Vincula tu cuenta de trading mediante API segura. Tus fondos siempre están en tu broker." },
              { emoji: "⚙️", title: "Configura el bot", desc: "Personaliza los parámetros según tu tolerancia al riesgo y objetivos financieros." },
              { emoji: "🤖", title: "Opera automáticamente", desc: "El bot ejecuta operaciones 24/7 mientras tú te enfocas en otras actividades." },
            ].map((item, idx) => (
              <motion.div
                key={item.emoji}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.15 }}
                className="flex gap-6 items-start"
              >
                <div className="flex-shrink-0 text-4xl mt-1">
                  {item.emoji}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            ¿Listo para automatizar tu <span className="gradient-text">trading</span>?
          </h2>
          <p className="text-lg text-slate-400 mb-8">
            Comienza hoy y deja que la tecnología trabaje por ti.
          </p>
          <Link
            href="/registro"
            className="text-slate-900 font-bold px-8 py-4 rounded-full inline-flex items-center gap-3 text-lg transition-all hover:opacity-90"
            style={{
              backgroundColor: "#02A5EB"
            }}
          >
            🚀 Comenzar Ahora ⚡
          </Link>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4">
          <div className="p-8 bg-red-500/15 rounded-2xl border-2 border-red-500/50">
            <div className="flex items-start gap-4">
              <span className="text-4xl flex-shrink-0">⚠️</span>
              <p className="text-lg md:text-xl text-white font-semibold leading-tight">
                <strong className="text-red-500 text-xl">AVISO IMPORTANTE:</strong> Los bots de trading conllevan riesgos y podrías perder tu capital. Opera solo con dinero que puedas permitirte perder.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}