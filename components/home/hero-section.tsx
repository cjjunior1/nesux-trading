"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, TrendingUp, Shield, Award } from "lucide-react";

export function HeroSection() {
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
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2 mb-6">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-emerald-400">Método Probado para Traders Exitosos</span>
          </div>

          <h1 className="title-anim text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Transforma tu Vida con el{" "}
            <span className="gradient-text">Trading Inteligente</span>
          </h1>

          {/* Las 3 Verdades del Trading */}
          <div className="max-w-3xl mx-auto mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-5">
              Las 3 Verdades del Trading que Debes Saber
            </h2>
            <div className="grid gap-4 text-left">
              <div className="bg-slate-900/50 border border-emerald-500/30 rounded-2xl p-5 flex gap-4 items-start">
                <span className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center">1</span>
                <p className="text-base md:text-lg text-slate-200 leading-relaxed">
                  En los mercados financieros, <strong className="text-white">la mayoría pierde</strong>. No es mala suerte — es no tener el método correcto.
                </p>
              </div>
              <div className="bg-slate-900/50 border border-amber-500/30 rounded-2xl p-5 flex gap-4 items-start">
                <span className="flex-shrink-0 w-9 h-9 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center">2</span>
                <p className="text-base md:text-lg text-slate-200 leading-relaxed">
                  Hay una verdad incómoda en el trading: <strong className="text-white">los mercados no perdonan la improvisación</strong>. La mayoría paga un precio muy caro por aprenderlo tarde.
                </p>
              </div>
              <div className="bg-slate-900/50 border border-blue-500/30 rounded-2xl p-5 flex gap-4 items-start">
                <span className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-500/20 text-blue-300 font-bold flex items-center justify-center">3</span>
                <p className="text-base md:text-lg text-slate-200 leading-relaxed">
                  El dinero que pierde la mayoría de los traders no desaparece — <strong className="text-white">alguien más se lo lleva</strong>. La pregunta es: ¿de qué lado quieres estar?
                </p>
              </div>
            </div>
          </div>

          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Aprende el método que te llevará del <strong className="text-red-500">95%</strong> que pierde al{" "}
            <strong className="text-sky-400">5%</strong> <strong className="text-emerald-400">que GANA</strong> consistentemente en los mercados financieros.
          </p>

          <p className="text-lg text-slate-200 mb-6 max-w-3xl mx-auto leading-relaxed">
            El trading es una habilidad real que puede generar ingresos consistentes cuando se aprende correctamente. Nuestra formación está diseñada para que avances paso a paso, con acompañamiento práctico en cada etapa y un enfoque claro en resultados tangibles. No se trata solo de teoría, sino de desarrollar las habilidades necesarias para operar con confianza y consistencia en los mercados.
          </p>

          <div className="bg-gradient-to-r from-emerald-900/40 to-blue-900/40 border border-emerald-500/40 rounded-2xl p-6 mb-6 max-w-3xl mx-auto">
            <p className="text-base text-white leading-relaxed mb-3">
              <strong className="text-emerald-300 text-lg">Comenzamos con Trading Binario</strong> porque es la forma más efectiva de que empieces a generar resultados reales <strong className="text-yellow-300">mientras aprendes</strong>. Imagina poder aplicar lo que estudias hoy y ver los resultados en horas, no en meses. El trading binario te permite exactamente eso: operaciones rápidas, claras y simples que aceleran tu curva de aprendizaje sin las complejidades del Forex tradicional.
            </p>
            <p className="text-base text-slate-200 leading-relaxed">
              Una vez domines los fundamentos y desarrolles la disciplina necesaria, darás el salto natural al trading en Forex con una base sólida. <strong className="text-emerald-300">No invertirás años estudiando teoría</strong> — estarás operando desde el inicio, generando experiencia real y viendo oportunidades de ingresos mientras construyes tu camino hacia la libertad financiera.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/40 rounded-2xl p-6 mb-6 max-w-3xl mx-auto">
            <p className="text-base text-white leading-relaxed mb-3">
              <strong className="text-blue-300 text-lg">🤖 Nuestros Bots de Trading Automático</strong> — En la actualidad, contamos con <strong className="text-yellow-300">diversos bots de trading automático</strong> que operan en:
            </p>
            <div className="grid md:grid-cols-3 gap-3 mb-3">
              <div className="bg-slate-900/60 rounded-lg p-3 border border-blue-500/30 text-center">
                <div className="text-2xl mb-1">💱</div>
                <div className="text-white font-semibold text-sm">Forex</div>
              </div>
              <div className="bg-slate-900/60 rounded-lg p-3 border border-blue-500/30 text-center">
                <div className="text-2xl mb-1">₿</div>
                <div className="text-white font-semibold text-sm">Criptomonedas</div>
                <div className="text-emerald-400 text-xs font-bold">24/7</div>
              </div>
              <div className="bg-slate-900/60 rounded-lg p-3 border border-blue-500/30 text-center">
                <div className="text-2xl mb-1">📊</div>
                <div className="text-white font-semibold text-sm">Índices Sintéticos</div>
                <div className="text-emerald-400 text-xs font-bold">24/7</div>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Los bots en <strong className="text-blue-300">criptomonedas e índices sintéticos operan 24/7</strong>, aprovechando oportunidades en todo momento. <strong className="text-slate-200">Nota importante:</strong> Hasta el momento no contamos con bots para trading binario, ya que nuestro enfoque en automatización está en los mercados de Forex, cripto e índices.
            </p>
          </div>

          <p className="text-lg text-yellow-300 mb-8 max-w-2xl mx-auto italic">
            Aquí no tenemos límites, lleguemos más allá de la meta porque no hay fronteras que nos detenga
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-10">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400">+2,500</div>
              <div className="text-sm text-slate-400">Estudiantes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400">95%</div>
              <div className="text-sm text-slate-400">Satisfacción</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400">7 Años</div>
              <div className="text-sm text-slate-400">Experiencia</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/registro"
              className="btn-primary text-lg flex items-center justify-center gap-2"
            >
              Comienza Tu Transformación
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/metodo"
              className="bg-slate-800/50 border border-slate-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-slate-700/50 transition-all flex items-center justify-center gap-2"
            >
              Conoce el Método
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-10">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Shield className="h-5 w-5 text-emerald-500" />
              Garantía Total
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Award className="h-5 w-5 text-emerald-500" />
              Certificación Incluida
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}