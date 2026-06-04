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

const bots = [
  {
    name: "Bot Starter",
    description: "Perfecto para comenzar con trading automatizado. Operaciones simples y seguras.",
    price: 49,
    period: "mes",
    features: [
      "1 par de trading",
      "Estrategia conservadora",
      "Operaciones 24/7",
      "Panel de control básico",
      "Soporte por email",
    ],
    color: "emerald",
  },
  {
    name: "Bot Pro",
    description: "Múltiples estrategias y pares para traders intermedios que buscan diversificar.",
    price: 149,
    period: "mes",
    popular: true,
    features: [
      "Hasta 5 pares de trading",
      "3 estrategias diferentes",
      "Análisis en tiempo real",
      "Alertas por WhatsApp",
      "Panel avanzado con métricas",
      "Soporte prioritario",
    ],
    color: "purple",
  },
  {
    name: "Bot Enterprise",
    description: "Solución institucional con las mejores herramientas y soporte dedicado.",
    price: 399,
    period: "mes",
    features: [
      "Pares ilimitados",
      "Todas las estrategias",
      "API personalizada",
      "Servidor dedicado",
      "Configuración personalizada",
      "Soporte 24/7 por WhatsApp",
      "Sesiones de optimización mensuales",
    ],
    color: "amber",
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

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
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
                src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop"
                alt="Bot de trading automatizado"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
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
                className={`card relative ${
                  bot.popular ? "border-purple-500/50 ring-2 ring-purple-500/20" : ""
                }`}
              >
                {bot.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    RECOMENDADO
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`inline-flex p-3 rounded-xl mb-4 ${
                    bot.color === "emerald" ? "bg-emerald-500/20" :
                    bot.color === "purple" ? "bg-purple-500/20" : "bg-amber-500/20"
                  }`}>
                    <Bot className={`h-8 w-8 ${
                      bot.color === "emerald" ? "text-emerald-400" :
                      bot.color === "purple" ? "text-purple-400" : "text-amber-400"
                    }`} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{bot.name}</h3>
                  <p className="text-slate-400 text-sm mt-2">{bot.description}</p>
                </div>

                <div className="text-center mb-6">
                  <span className="text-4xl font-bold text-white">${bot.price}</span>
                  <span className="text-slate-400">/{bot.period}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {bot.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-slate-300 text-sm">
                      <CheckCircle className={`h-5 w-5 flex-shrink-0 ${
                        bot.color === "emerald" ? "text-emerald-400" :
                        bot.color === "purple" ? "text-purple-400" : "text-amber-400"
                      }`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/registro"
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                    bot.popular ? "btn-secondary" : "bg-slate-700 hover:bg-slate-600 text-white"
                  }`}
                >
                  Comenzar <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="mt-12 p-6 bg-slate-800/30 rounded-xl border border-slate-700">
            <p className="text-xs text-slate-500 text-center">
              <strong>Aviso:</strong> Los bots de trading operan basados en algoritmos y estrategias predefinidas. Los resultados pasados no garantizan resultados futuros. El trading conlleva riesgos y podrías perder parte o la totalidad de tu capital. Opera solo con dinero que puedas permitirte perder.
            </p>
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
              { step: "1", title: "Elige tu plan", desc: "Selecciona el bot que mejor se adapte a tus necesidades y nivel de experiencia." },
              { step: "2", title: "Conecta tu broker", desc: "Vincula tu cuenta de trading mediante API segura. Tus fondos siempre están en tu broker." },
              { step: "3", title: "Configura el bot", desc: "Personaliza los parámetros según tu tolerancia al riesgo y objetivos financieros." },
              { step: "4", title: "Opera automáticamente", desc: "El bot ejecuta operaciones 24/7 mientras tú te enfocas en otras actividades." },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.15 }}
                className="flex gap-6 items-start"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{item.step}</span>
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
            className="btn-primary inline-flex items-center gap-2 text-lg"
          >
            Comenzar Ahora <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}