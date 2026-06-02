"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import Link from "next/link";
import { Star, Quote, TrendingUp, ArrowRight, Play, Users } from "lucide-react";

const testimonials = [
  {
    name: "Emmanuel Ortega",
    role: "Empresario",
    country: "México",
    image: "https://cdn.abacus.ai/images/ebb839ff-92be-4262-abb0-6f84790e20d2.png",
    content: "Después de perder más de $15,000 dólares probando diferentes estrategias por mi cuenta, encontré Trading Academy A Otro Nivel. El método es completamente diferente a todo lo que había visto. En 6 meses no solo recuperé mi inversión, sino que ahora genero un ingreso constante que me permite trabajar menos horas en mi negocio.",
    profit: "+$8,500",
    period: "6 meses",
    course: "Curso Profesional",
  },
  {
    name: "Janet Sánchez",
    role: "Mercadóloga",
    country: "República Dominicana",
    image: "https://cdn.abacus.ai/images/af4bb859-3b2c-4712-8273-b6179878f311.png",
    content: "Como contadora, siempre fui escéptica sobre el trading. Pero el enfoque matemático y lógico del método me convenció. Lo mejor es que no necesité conocimientos previos. Ahora tengo una fuente de ingresos adicional que complementa mi salario y me da tranquilidad financiera.",
    profit: "+$3,200",
    period: "4 meses",
    course: "Curso Intermedio",
  },
  {
    name: "Mario Guzmán",
    role: "Ingeniero",
    country: "Honduras",
    image: "https://cdn.abacus.ai/images/fa1703ff-801f-4333-9c24-9c142466ad56.png",
    content: "El bot de trading fue un cambio total para mí. Como ingeniero, no tenía tiempo para estar frente a las pantallas todo el día. Ahora el bot opera mientras trabajo y duermo. La comunidad es increíble - siempre hay alguien dispuesto a ayudar con cualquier duda.",
    profit: "+$12,800",
    period: "8 meses",
    course: "Membresía VIP + Bot Pro",
  },
  {
    name: "Robinson Rosario",
    role: "Ingeniero",
    country: "Argentina",
    image: "https://cdn.abacus.ai/images/7b84ff46-2b35-4b18-afc1-a3eeab693673.png",
    content: "Tenía mucho miedo de entrar al mundo del trading después de escuchar tantas historias negativas. Pero la garantía de 7 días me dio confianza para probar. Fue la mejor decisión. El soporte por WhatsApp es excepcional - responden todas mis dudas en minutos.",
    profit: "+$4,100",
    period: "5 meses",
    course: "Curso Intermedio",
  },
  {
    name: "Joel Paredes",
    role: "Médico",
    country: "Chile",
    image: "https://cdn.abacus.ai/images/7b84ff46-2b35-4b18-afc1-a3eeab693673.png",
    content: "Con mi horario de hospital, necesitaba algo que no requiriera estar pegado a la pantalla. El método me enseñó a identificar oportunidades en timeframes altos y el bot hace el resto. Es ingreso pasivo real mientras salvo vidas.",
    profit: "+$6,700",
    period: "7 meses",
    course: "Curso Profesional + Bot Starter",
  },
  {
    name: "Ana Martínez",
    role: "Ama de Casa",
    country: "Ecuador",
    image: "https://cdn.abacus.ai/images/62a1c1c2-2e18-49b7-9f2d-b7044fa75e82.png",
    content: "Nunca pensé que alguien como yo, sin estudios en finanzas, pudiera aprender trading. El curso básico explica todo de manera tan simple que cualquiera puede entenderlo. Ahora contribuyo a los gastos del hogar y me siento realizada.",
    profit: "+$1,800",
    period: "3 meses",
    course: "Curso Básico",
  },
];

const stats = [
  { value: "2,500+", label: "Estudiantes activos" },
  { value: "95%", label: "Tasa de satisfacción" },
  { value: "$2.1M+", label: "Ganancias generadas" },
  { value: "15", label: "Países" },
];

export default function TestimoniosPage() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2 mb-6">
              <Users className="h-4 w-4 text-amber-400" />
              <span className="text-sm text-amber-400">Historias Reales</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Testimonios de <span className="gradient-text">Éxito</span>
            </h1>

            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-12">
              Conoce a las personas que transformaron su vida financiera con nuestro método. Sus historias podrían ser la tuya.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-slate-800/50 rounded-xl p-6"
                >
                  <p className="text-3xl md:text-4xl font-bold text-emerald-400 mb-2">{stat.value}</p>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-16 bg-slate-900" ref={ref}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: idx * 0.1 }}
                className="card relative"
              >
                <Quote className="absolute top-6 right-6 h-10 w-10 text-emerald-500/10" />

                {/* Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-emerald-500/30">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{testimonial.name}</h3>
                    <p className="text-sm text-slate-400">
                      {testimonial.role} - {testimonial.country}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  "{testimonial.content}"
                </p>

                {/* Results */}
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-xs text-slate-500">Ganancias reportadas</p>
                      <p className="text-2xl font-bold text-emerald-400">{testimonial.profit}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Período</p>
                      <p className="text-lg font-bold text-white">{testimonial.period}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-700">
                    <p className="text-xs text-slate-500">Programa:</p>
                    <p className="text-sm text-emerald-400">{testimonial.course}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="mt-12 p-6 bg-slate-800/30 rounded-xl border border-slate-700">
            <p className="text-xs text-slate-500 text-center">
              <strong>Nota:</strong> Los resultados mostrados son reportados por nuestros estudiantes y no garantizan resultados similares. El trading conlleva riesgos significativos. Los resultados dependen de múltiples factores incluyendo capital invertido, dedicación, condiciones del mercado y aplicación correcta del método.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            ¿Listo para escribir tu <span className="gradient-text">historia de éxito</span>?
          </h2>
          <p className="text-lg text-slate-400 mb-8">
            Únete a miles de estudiantes que ya están transformando su vida financiera.
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
