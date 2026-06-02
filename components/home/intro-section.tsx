"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import { Laptop, Globe, Clock, Zap } from "lucide-react";

export function IntroSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section className="py-20 bg-slate-900" ref={ref}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative aspect-video rounded-2xl overflow-hidden"
          >
            <Image
              src="https://cdn.abacus.ai/images/10684efa-88d9-4dd7-b020-df00b554f9f1.png"
              alt="Libertad financiera con trading"
              fill
              className="object-cover"
            />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="section-title">
              Bienvenido a la <span className="gradient-text">Era Digital</span>
            </h2>

            <div className="space-y-4 text-slate-300 mb-8">
              <p>
                Este módulo está dirigido a aquellas personas interesadas en <strong className="text-white">cambiar de rumbo</strong> con relación a su situación económica y la manera en que generan ingresos para su subsistencia.
              </p>
              <p>
                Las personas en su gran mayoría viven en la <strong className="text-amber-400">esclavitud moderna</strong>: aquella donde venden su tiempo, capacidad, conocimiento y su salud por un salario.
              </p>
              <p>
                No tiene nada de malo ser empleado, pero estamos en el tiempo de <strong className="text-emerald-400">LA ERA DIGITAL</strong> donde a través del internet y un celular tienes el mundo en tus manos. Solo tienes que aprender a manejarte y luego lo manejarás a él.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-slate-800/50 p-4 rounded-xl">
                <Laptop className="h-6 w-6 text-emerald-400" />
                <span className="text-sm text-slate-300">Solo necesitas internet</span>
              </div>
              <div className="flex items-center gap-3 bg-slate-800/50 p-4 rounded-xl">
                <Globe className="h-6 w-6 text-purple-400" />
                <span className="text-sm text-slate-300">Desde cualquier lugar</span>
              </div>
              <div className="flex items-center gap-3 bg-slate-800/50 p-4 rounded-xl">
                <Clock className="h-6 w-6 text-emerald-400" />
                <span className="text-sm text-slate-300">Tú decides tu horario</span>
              </div>
              <div className="flex items-center gap-3 bg-slate-800/50 p-4 rounded-xl">
                <Zap className="h-6 w-6 text-amber-400" />
                <span className="text-sm text-slate-300">Resultados rápidos</span>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-6 p-4 bg-slate-800/30 border-l-4 border-purple-500 rounded-r-xl">
              <p className="text-xs text-slate-400">
                <strong className="text-purple-400">Nota:</strong> Con este módulo en nada ofrecemos hacerte un Trader profesional o garantizarle que no hay riesgos de pérdida de su capital, sino de darle las herramientas y el conocimiento básico para que usted se desarrolle y emprenda en camino del conocimiento del MUNDO DEL TRADING. No olvides que la universidad no hace al profesional, solo es una base de introducción al conocimiento.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
