"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import Link from "next/link";
import { Star, Quote, ArrowRight } from "lucide-react";

const testimonials = [
  {
    name: "Emmanuel Ortega",
    role: "Empresario - México",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces&q=80",
    content: "Después de perder dinero con otras plataformas, Trading Academy A Otro Nivel me enseñó a operar con disciplina. En 6 meses recuperé mi inversión y ahora genero ingresos consistentes.",
    profit: "+$8,500",
    period: "6 meses",
  },
  {
    name: "Janet Sánchez",
    role: "Mercadóloga - República Dominicana",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces&q=80",
    content: "El método es increíblemente claro. Nunca pensé que alguien sin experiencia como yo pudiera aprender trading. Ahora tengo una fuente de ingresos adicional.",
    profit: "+$3,200",
    period: "4 meses",
  },
  {
    name: "Andrés Rivera",
    role: "Ingeniero - Perú",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces&q=80",
    content: "Lo mejor es la comunidad y el soporte. Siempre hay alguien dispuesto a ayudar. El bot de trading me ahorra horas de análisis cada día.",
    profit: "+$12,800",
    period: "8 meses",
  },
];

export function TestimonialsPreview() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-20 bg-gradient-to-b from-slate-950 to-slate-900" ref={ref}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="section-title"
          >
            Historias de <span className="gradient-text">Éxito</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="section-subtitle"
          >
            Conoce a quienes ya transformaron su vida financiera con nuestro método
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: idx * 0.15 }}
              className="card relative"
            >
              <Quote className="absolute top-6 right-6 h-8 w-8 text-emerald-500/20" />

              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-14 h-14 rounded-full overflow-hidden">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-white">{testimonial.name}</h4>
                  <p className="text-sm text-slate-400">{testimonial.role}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />
                ))}
              </div>

              <p className="text-slate-300 mb-6 text-sm leading-relaxed">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4 pt-4 border-t border-slate-700">
                <div>
                  <p className="text-emerald-400 font-bold text-lg">{testimonial.profit}</p>
                  <p className="text-xs text-slate-500">Ganancias</p>
                </div>
                <div>
                  <p className="text-white font-bold">{testimonial.period}</p>
                  <p className="text-xs text-slate-500">Período</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          <Link
            href="/testimonios"
            className="inline-flex items-center gap-2 font-medium text-white"
          >
            Ver más testimonios <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}