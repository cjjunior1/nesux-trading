"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  TrendingUp,
  Shield,
  BookOpen,
  Users,
  Clock,
  HeadphonesIcon,
  Target,
  Award,
} from "lucide-react";

const benefits = [
  {
    icon: TrendingUp,
    title: "Método Probado",
    description: "Sistema validado por miles de estudiantes que han logrado resultados consistentes",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Shield,
    title: "Gestión de Riesgo",
    description: "Aprende a proteger tu capital con estrategias de riesgo controlado",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: BookOpen,
    title: "Desde Cero",
    description: "No necesitas conocimientos previos. Te guiamos paso a paso",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    icon: Users,
    title: "Comunidad Activa",
    description: "Únete a una comunidad de traders que comparten estrategias y se apoyan",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: Clock,
    title: "Acceso de Por Vida",
    description: "Puedes Comprar una vez y acceder de por vida. Incluye todas las actualizaciones",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: HeadphonesIcon,
    title: "Soporte Dedicado",
    description: "Resolvemos todas tus dudas con atención personalizada por WhatsApp",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Target,
    title: "Estrategias Reales",
    description: "Operaciones de respaldo y contra tendencia para cualquier mercado",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    icon: Award,
    title: "Certificación",
    description: "Puedes Obtener un certificado al completar cada módulo del programa",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
];

export function BenefitsSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950" ref={ref}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="section-title"
          >
            ¿Por qué elegir <span className="gradient-text">Trading Academy A Otro Nivel</span>?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="section-subtitle"
          >
            Todo lo que necesitas para convertirte en un trader consistente y rentable
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, idx) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: idx * 0.1 }}
              className="card text-center"
            >
              <div className={`${benefit.bg} w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4`}>
                <benefit.icon className={`h-7 w-7 ${benefit.color}`} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
              <p className="text-sm text-slate-400">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
