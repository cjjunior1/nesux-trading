"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { ArrowRight, Zap, Shield, Gift } from "lucide-react";

export function CTASection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950" ref={ref}>
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="relative overflow-hidden rounded-3xl p-8 md:p-12 text-center"
          style={{ backgroundColor: '#367C3D' }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/4 translate-y-1/4" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6" style={{ backgroundColor: '#B64183' }}>
              <Zap className="h-4 w-4 text-white" />
              <span className="text-sm text-white font-medium">
                Oferta por tiempo limitado
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Comienza Tu Camino Hacia la<br />
              <span className="text-yellow-300">Libertad Financiera</span> Hoy
            </h2>

            <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
              Únete a más de 2,500 estudiantes que ya están transformando su vida financiera con nuestro método probado.
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-white">
                <Shield className="h-5 w-5 text-yellow-300" />
                <span>Garantía Total</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Gift className="h-5 w-5 text-yellow-300" />
                <span>Bonos exclusivos</span>
              </div>
            </div>

            <Link
              href="/registro"
              className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold py-4 px-10 rounded-xl hover:bg-emerald-50 transition-all text-lg shadow-lg hover:shadow-xl hover:scale-105"
            >
              Regístrate Gratis
              <ArrowRight className="h-5 w-5" />
            </Link>

            <p className="text-sm text-emerald-200 mt-4">
              Sin compromiso • Cancela cuando quieras
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
