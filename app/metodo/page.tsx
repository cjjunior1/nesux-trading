"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import Link from "next/link";
import {
  Target,
  Brain,
  Shield,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Users,
  Zap,
  BarChart3,
} from "lucide-react";

const methodSteps = [
  {
    number: "01",
    title: "Fundamentos Sólidos",
    description:
      "Construimos tu base de conocimiento desde cero. Entenderás cómo funcionan los mercados, qué mueve los precios y cómo leer gráficos como un profesional.",
    icon: BookOpen,
  },
  {
    number: "02",
    title: "Gestión de Riesgo",
    description:
      "La clave del éxito no es ganar más, es perder menos. Aprenderás a proteger tu capital con estrategias de riesgo que usan los traders institucionales.",
    icon: Shield,
  },
  {
    number: "03",
    title: "Estrategias Probadas",
    description:
      "Implementarás estrategias que han demostrado resultados consistentes. Operaciones de respaldo y contra tendencia para cualquier escenario de mercado.",
    icon: Target,
  },
  {
    number: "04",
    title: "Psicología del Trader",
    description:
      "El 80% del trading es mental. Desarrollarás la disciplina y el control emocional necesarios para ejecutar tu plan sin desviarte.",
    icon: Brain,
  },
];

const principles = [
  "El trading es lógica y matemáticas, no magia ni suerte",
  "Siempre operar con un plan definido y reglas claras",
  "Nunca arriesgar más del 1-2% del capital por operación",
  "La disciplina es más importante que la estrategia",
  "Aprender de cada operación, ganadora o perdedora",
  "El mercado siempre tiene la razón",
];

export default function MetodoPage() {
  const [ref1, inView1] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [ref2, inView2] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [ref3, inView3] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2 mb-6">
                <Target className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-emerald-400">El Método Trading Academy A Otro Nivel</span>
              </div>

              <h1 className="title-anim text-4xl md:text-5xl font-bold text-white mb-6">
                Un Sistema <span className="gradient-text">Probado</span> Para Traders Exitosos
              </h1>

              <p className="text-lg text-slate-300 mb-8">
                Nuestro método ha sido desarrollado y perfeccionado durante años para ayudar a personas comunes a convertirse en traders consistentes y rentables.
              </p>

              <div className="flex items-center gap-6 text-slate-400">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-400" />
                  <span>+2,500 estudiantes</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-400" />
                  <span>7 años de resultados</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative aspect-video rounded-2xl overflow-hidden"
            >
              <Image
                src="/metodo-1.png"
                alt="Método de trading"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Method Steps */}
      <section className="py-20 bg-slate-900" ref={ref1}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView1 ? { opacity: 1, y: 0 } : {}}
              className="section-title"
            >
              Los 4 Pilares del <span className="gradient-text">Método</span>
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {methodSteps.map((step, idx) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                animate={inView1 ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: idx * 0.15 }}
                className="card flex gap-6"
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <span className="text-emerald-400 text-sm font-bold">{step.number}</span>
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-slate-400">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950" ref={ref2}>
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView2 ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-12"
          >
            <h2 className="section-title">
              Principios <span className="gradient-text">Fundamentales</span>
            </h2>
            <p className="section-subtitle">
              Estos son los principios que guían cada estrategia y decisión en nuestro método
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {principles.map((principle, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                animate={inView2 ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3 bg-slate-800/50 p-4 rounded-xl"
              >
                <CheckCircle className="h-6 w-6 text-emerald-400 flex-shrink-0" />
                <p className="text-slate-300">{principle}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why It Works */}
      <section className="py-20 bg-slate-950" ref={ref3}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={inView3 ? { opacity: 1, x: 0 } : {}}
              className="relative aspect-video rounded-2xl overflow-hidden"
            >
              <Image
                src="/metodo-2.png"
                alt="Resultados del método"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={inView3 ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2 }}
            >
              <h2 className="section-title">
                ¿Por Qué <span className="gradient-text">Funciona</span>?
              </h2>

              <div className="space-y-6 text-slate-300">
                <p>
                  Nuestro método funciona porque se basa en <strong className="text-white">probabilidades y matemáticas</strong>, no en emociones ni predicciones.
                </p>
                <p>
                  Mientras el 95% de traders operan por impulso, miedo o codicia, nuestros estudiantes siguen un sistema con reglas claras que elimina la subjetividad.
                </p>
                <p>
                  La clave está en la <strong className="text-emerald-400">consistencia</strong>: no buscamos home runs, buscamos ganancias pequeñas y constantes que se acumulan con el tiempo.
                </p>
              </div>

              <div className="mt-8 flex gap-4">
                <Link
                  href="/cursos"
                  className="flex items-center gap-2 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: '#2563EB' }}
                >
                  Ver Cursos <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/registro"
                  className="flex items-center gap-2 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: '#B64183' }}
                >
                  <Zap className="h-4 w-4" /> Comenzar Ahora
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}