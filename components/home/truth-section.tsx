"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { AlertTriangle, CheckCircle, Target, Brain } from "lucide-react";

export function TruthSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section className="py-20 bg-gradient-to-b from-slate-950 to-slate-900" ref={ref}>
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="card bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-rose-500/30"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-rose-500/20 p-3 rounded-xl">
              <AlertTriangle className="h-8 w-8 text-rose-400" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                La Verdad que Nadie Te Dice
              </h2>
              <p className="font-semibold" style={{ color: '#8B285E' }}>No tengas miedo, ni te asustes con lo que vas a leer ahora mismo...</p>
            </div>
          </div>

          <div className="space-y-6 text-lg text-slate-300 leading-relaxed text-justify">
            <p>
              <strong className="text-white">El <span className="text-red-400">95%</span> de las personas que se dedican al trading pierden su dinero.</strong>
            </p>

            <p>
              ¿Recuerdas que te pedí que no te asustaras? Ya que <strong style={{ color: '#A78BFA' }}>he desarrollado un método</strong> para que personas que no saben trading o con conocimientos, pero que no tienen la disciplina y el dominio, <strong style={{ color: '#A78BFA' }}>siempre estén del lado del 5% que aprenderán a ser ganadores</strong> en este mundo del TRADING.
            </p>

            <div className="grid md:grid-cols-3 gap-4 my-8">
              <div className="bg-slate-800/50 p-4 rounded-xl text-center">
                <Target className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-semibold"><span style={{ color: '#394FA1' }}>E</span><span className="text-white">l trading no es MAGIA</span></p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl text-center">
                <Brain className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <p className="text-sm font-semibold"><span style={{ color: '#394FA1' }}>T</span><span className="text-white">ampoco es SUERTE</span></p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl text-center">
                <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-semibold"><span style={{ color: '#394FA1' }}>E</span><span className="text-white">s LÓGICA y MATEMÁTICAS</span></p>
              </div>
            </div>

            <p>
              Aquí tendrás las herramientas para saber abrir operaciones y aunque la tendencia sea contraria, <strong className="text-white">aprenderás a abrir operaciones de respaldo de contra tendencia.</strong>
            </p>

            <div className="rounded-xl p-6 mt-6" style={{ backgroundColor: '#8D5D8B20', borderColor: '#8D5D8B80', borderWidth: '1px' }}>
              <p>
                <strong style={{ color: '#8D5D8B' }}>💡 Recuerda:</strong> <span style={{ color: '#5E7CBA' }}>Sabiendo que la perfección no existe, debes tener muy bien claro que esto es una relación de dos: <strong>1)</strong> el manual de instrucciones y <strong>2)</strong> que tú hagas tu parte, aplicándolo de la manera correcta.</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
