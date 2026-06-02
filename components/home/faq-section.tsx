"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "¿Necesito experiencia previa en trading?",
    answer: "No, nuestros cursos están diseñados desde cero. Te guiamos paso a paso desde los conceptos más básicos hasta estrategias avanzadas. El 70% de nuestros estudiantes comienzan sin ningún conocimiento previo.",
  },
  {
    question: "¿Cuánto capital necesito para empezar?",
    answer: "Recomendamos comenzar con un mínimo de $100-$200 USD para practicar con cuenta real. Sin embargo, puedes usar cuentas demo gratuitas durante tu aprendizaje para practicar sin riesgo.",
  },
  {
    question: "¿Garantizan ganancias?",
    answer: "No garantizamos ganancias. El trading conlleva riesgos y los resultados dependen de la disciplina y aplicación del método. Lo que sí garantizamos es educación de calidad y un método probado por miles de estudiantes.",
  },
  {
    question: "¿Cómo funciona el soporte?",
    answer: "Ofrecemos soporte por WhatsApp, comunidad privada de Discord y sesiones en vivo semanales. Siempre habrá alguien disponible para resolver tus dudas.",
  },
  {
    question: "¿Los cursos tienen límite de tiempo?",
    answer: "No, una vez que compras un curso tienes acceso de por vida. Además, todas las actualizaciones futuras están incluidas sin costo adicional.",
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer: "Aceptamos tarjetas de crédito/débito, PayPal, transferencia bancaria y criptomonedas (USDT, BTC). También ofrecemos planes de pago en cuotas.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-20 bg-slate-900" ref={ref}>
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 mb-4"
          >
            <HelpCircle className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-purple-400">Preguntas Frecuentes</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="section-title"
          >
            ¿Tienes <span className="gradient-text">Dudas</span>?
          </motion.h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: idx * 0.1 }}
              className="card cursor-pointer"
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white pr-4">{faq.question}</h3>
                <ChevronDown
                  className={`h-5 w-5 text-emerald-400 transition-transform flex-shrink-0 ${
                    openIndex === idx ? "rotate-180" : ""
                  }`}
                />
              </div>
              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="text-slate-400 mt-4 pt-4 border-t border-slate-700">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
