"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, Users, Clock } from "lucide-react";

const courses = [
  {
    title: "Curso Básico",
    subtitle: "Fundamentos del Trading",
    price: "$99.99",
    image: "https://cdn.abacus.ai/images/9077f6c6-7652-4e22-a797-efccad168a7c.png",
    features: ["Análisis técnico básico", "Gestión de riesgo", "Acceso a Una Plataforma de trading Binario"],
    students: "850+",
    duration: "Sin límite de tiempo",
    rating: 4.8,
  },
  {
    title: "Curso Intermedio",
    subtitle: "Estrategias Avanzadas",
    price: "$199.99",
    image: "https://cdn.abacus.ai/images/2a4bf941-3927-4c8e-91eb-b6158caac34a.png",
    features: ["Patrones de velas", "Indicadores técnicos", "Psicología del trader", "Acceso a Tres Plataformas de trading Binario"],
    students: "520+",
    duration: "Sin límite de tiempo",
    rating: 4.9,
    popular: true,
  },
  {
    title: "Curso Profesional",
    subtitle: "Trading Institucional",
    price: "$499.99",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=450&fit=crop",
    features: ["Análisis institucional", "Automatización, Bot para Forex", "Mentoría avanzada"],
    students: "230+",
    duration: "Sin límite de tiempo",
    rating: 5.0,
  },
];

export function CoursesPreview() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-20 bg-slate-950" ref={ref}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="section-title"
          >
            Nuestros <span className="gradient-text">Cursos</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="section-subtitle"
          >
            Programas diseñados para llevarte de principiante a trader profesional
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {courses.map((course, idx) => (
            <motion.div
              key={course.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: idx * 0.15 }}
              className={`card relative overflow-hidden h-full flex flex-col ${
                course.popular ? "border-emerald-500/50" : ""
              }`}
            >
              {course.popular && (
                <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                  Más Popular
                </div>
              )}

              <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>

              <h3 className="text-xl font-bold text-white mb-1">{course.title}</h3>
              <p className="text-emerald-400 text-sm mb-4">{course.subtitle}</p>

              <ul className="space-y-2 mb-6 flex-grow">
                {course.features.map((feature) => (
                  <li key={feature} className="text-sm text-slate-400 flex items-center gap-2">
                    <span className="text-emerald-400">✓</span> {feature}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-4 mb-4 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" /> {course.students}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {course.duration}
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <Star className="h-4 w-4 fill-current" /> {course.rating}
                </span>
              </div>

              <Link
                href="/cursos"
                className="btn-primary w-full text-sm py-2.5 flex items-center justify-center gap-2 mt-auto"
              >
                Ver Más <ArrowRight className="h-4 w-4" />
              </Link>
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
            href="/cursos"
            className="inline-flex items-center gap-2 font-medium text-white"
          >
            Ver todos los cursos <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}