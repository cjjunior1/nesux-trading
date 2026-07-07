"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Star,
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  Play,
  Award,
  Shield,
  Zap,
} from "lucide-react";

const courses = [
  {
    id: "basico",
    title: "Curso Básico",
    subtitle: "Fundamentos del Trading",
    description:
      "Ideal para principiantes. Todo tipo de trading con énfasis en trading binario y diferentes plataformas. Aquí no tenemos límites, lleguemos más allá de la meta porque no hay fronteras que nos detenga.",
    price: 99.99,
    originalPrice: 197,
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop",
    duration: "Sin límite de tiempo",
    lessons: 24,
    students: "850+",
    rating: 4.8,
    modules: [
      "Análisis técnico básico",
      "Gestión de riesgo",
      "Acceso a Una Plataforma de trading Binario",
    ],
    bonuses: ["Sin límite de tiempo", "Acceso a comunidad básica", "Certificado de finalización"],
  },
  {
    id: "intermedio",
    title: "Curso Intermedio",
    subtitle: "Estrategias Avanzadas",
    description:
      "Lleva tu trading al siguiente nivel con estrategias probadas. Todo tipo de trading con énfasis en trading binario en diferentes plataformas.",
    price: 199.99,
    originalPrice: 397,
    image: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&h=450&fit=crop",
    duration: "Sin límite de tiempo",
    lessons: 42,
    students: "520+",
    rating: 4.9,
    popular: true,
    modules: [
      "Análisis técnico básico",
      "Gestión de riesgo",
      "Patrones de velas",
      "Indicadores técnicos",
      "Psicología del trader",
      "Acceso a Tres Plataformas de trading Binario",
    ],
    bonuses: [
      "Sin límite de tiempo",
      "Sesiones Q&A en vivo",
      "Comunidad premium",
      "Plantillas de estrategias",
    ],
  },
  {
    id: "profesional",
    title: "Curso Profesional",
    subtitle: "Trading Institucional",
    description:
      "Todo lo del Curso Básico y del Intermedio más Trading Institucional. Incluye mentoría personalizada, automatización y acceso a bot de trading automático para Forex.",
    price: 499.99,
    originalPrice: 997,
    image: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=800&h=450&fit=crop",
    duration: "Sin límite de tiempo",
    lessons: 78,
    students: "230+",
    rating: 5.0,
    modules: [
      "Todo lo del Curso Básico y del Intermedio",
      "Análisis institucional",
      "Automatización, Acceso a uno de nuestros Bot de trading en automático para Forex",
      "Mentoría avanzada",
    ],
    bonuses: [
      "Sin límite de tiempo",
      "Acceso a bot básico incluido para Forex",
      "Mentoría mensual 1:1",
      "Certificación profesional",
      "Acceso de por vida",
    ],
  },
];

const membership = {
  title: "Membresía VIP",
  subtitle: "Todo Incluido",
  price: 999.99,
  period: "año",
  features: [
    "Acceso a TODOS los cursos actuales",
    "Trading en vivo programado",
    "Comunidad VIP exclusiva",
    "Mentoría grupal semanal",
    "Bot Pro incluido",
    "Soporte prioritario 24/7",
  ],
};

export default function CursosPage() {
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
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2 mb-6">
              <BookOpen className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-emerald-400">Educación de Calidad</span>
            </div>

            <h1 className="title-anim text-4xl md:text-5xl font-bold text-white mb-6">
              Cursos de <span className="gradient-text">Trading</span>
            </h1>

            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
              Programas estructurados para llevarte de principiante a un trader RENTABLE con nuestro método probado.
            </p>

            <div className="max-w-4xl mx-auto mb-8">
              <div className="bg-gradient-to-br from-emerald-900/30 via-slate-800/50 to-blue-900/30 border-2 border-emerald-500/50 rounded-2xl p-8 mb-6 shadow-2xl">
                <h3 className="text-2xl font-bold text-emerald-300 mb-4 text-center">Nuestra Estrategia: Trading Binario Como Base</h3>
                
                <p className="text-base text-slate-200 leading-relaxed mb-4">
                  El trading en Forex es poderoso, pero requiere tiempo, capital y experiencia para dominarlo. <strong className="text-white">Por eso revolucionamos la forma de enseñar trading</strong>: comenzamos con <strong className="text-emerald-300">Trading Binario</strong>, la puerta de entrada perfecta que te permite <strong className="text-yellow-300">generar resultados desde las primeras semanas</strong> mientras construyes las bases sólidas que necesitas.
                </p>

                <div className="grid md:grid-cols-2 gap-4 my-6">
                  <div className="bg-slate-900/60 rounded-xl p-4 border border-emerald-500/30">
                    <div className="text-emerald-400 text-3xl mb-2">⚡</div>
                    <h4 className="font-bold text-white mb-2">Resultados Inmediatos</h4>
                    <p className="text-sm text-slate-300">Opera hoy, ve resultados hoy. Las operaciones duran minutos u horas, no días. Tu aprendizaje se acelera porque ves la aplicación inmediata de cada concepto.</p>
                  </div>
                  
                  <div className="bg-slate-900/60 rounded-xl p-4 border border-emerald-500/30">
                    <div className="text-emerald-400 text-3xl mb-2">🎯</div>
                    <h4 className="font-bold text-white mb-2">Simplicidad que Funciona</h4>
                    <p className="text-sm text-slate-300">Sin complicaciones técnicas abrumadoras. Enfoque directo que te permite dominar los fundamentos del análisis técnico sin perderte en complejidades innecesarias.</p>
                  </div>
                  
                  <div className="bg-slate-900/60 rounded-xl p-4 border border-emerald-500/30">
                    <div className="text-emerald-400 text-3xl mb-2">💪</div>
                    <h4 className="font-bold text-white mb-2">Experiencia Práctica Real</h4>
                    <p className="text-sm text-slate-300">No solo teoría interminable. Desde la primera semana estarás operando en plataformas reales, desarrollando la intuición y disciplina del trader exitoso.</p>
                  </div>
                  
                  <div className="bg-slate-900/60 rounded-xl p-4 border border-emerald-500/30">
                    <div className="text-emerald-400 text-3xl mb-2">🚀</div>
                    <h4 className="font-bold text-white mb-2">Plataforma de Despegue</h4>
                    <p className="text-sm text-slate-300">El trading binario no es el destino, es tu rampa de lanzamiento. Una vez domines la disciplina y la estrategia, el salto a Forex será natural y con confianza.</p>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/40 rounded-xl p-5 mt-6">
                  <p className="text-base text-white leading-relaxed font-medium">
                    💡 <strong>La Diferencia Clave:</strong> Mientras otras academias te tienen estudiando meses sin tocar un mercado real, tú estarás <strong className="text-emerald-300">operando, aprendiendo y generando oportunidades de ingresos desde el inicio</strong>. No es solo educación, es transformación con resultados reales.
                  </p>
                </div>
              </div>

              <p className="text-base text-slate-300 leading-relaxed">
                Con un enfoque 100% práctico, aplicación real del conocimiento y acompañamiento continuo, desarrollarás las habilidades que te permitirán operar con confianza y consistencia. <strong className="text-emerald-300">No se trata solo de enseñarte a hacer trading</strong>, sino de acompañarte hasta que logres <strong className="text-yellow-300">resultados reales y sostenibles</strong>.
              </p>
            </div>

            {/* Bots Section */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="bg-gradient-to-br from-blue-900/30 via-slate-800/50 to-purple-900/30 border-2 border-blue-500/50 rounded-2xl p-8 shadow-2xl">
                <h3 className="text-2xl font-bold text-blue-300 mb-4 text-center flex items-center justify-center gap-3">
                  <span className="text-3xl">🤖</span>
                  Bots de Trading Automático
                </h3>
                
                <p className="text-base text-slate-200 leading-relaxed mb-6 text-center">
                  En la actualidad, contamos con <strong className="text-white">diversos bots de trading automático</strong> que operan en múltiples mercados para que puedas automatizar tus estrategias y generar oportunidades incluso mientras duermes.
                </p>

                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-900/60 rounded-xl p-5 border border-blue-500/40 text-center">
                    <div className="text-4xl mb-3">💱</div>
                    <h4 className="font-bold text-white mb-2">Forex</h4>
                    <p className="text-sm text-slate-300">Bots especializados para operar en el mercado de divisas con estrategias probadas y optimizadas.</p>
                  </div>
                  
                  <div className="bg-slate-900/60 rounded-xl p-5 border border-emerald-500/40 text-center">
                    <div className="text-4xl mb-3">₿</div>
                    <h4 className="font-bold text-white mb-2">Criptomonedas</h4>
                    <div className="inline-block bg-emerald-500/20 border border-emerald-500/50 rounded-full px-3 py-1 mb-2">
                      <span className="text-emerald-300 font-bold text-xs">⚡ 24/7</span>
                    </div>
                    <p className="text-sm text-slate-300">Operación continua en el mercado cripto, capturando oportunidades en todo momento.</p>
                  </div>
                  
                  <div className="bg-slate-900/60 rounded-xl p-5 border border-emerald-500/40 text-center">
                    <div className="text-4xl mb-3">📊</div>
                    <h4 className="font-bold text-white mb-2">Índices Sintéticos</h4>
                    <div className="inline-block bg-emerald-500/20 border border-emerald-500/50 rounded-full px-3 py-1 mb-2">
                      <span className="text-emerald-300 font-bold text-xs">⚡ 24/7</span>
                    </div>
                    <p className="text-sm text-slate-300">Bots que operan sin parar en índices sintéticos, mercados disponibles 24 horas al día.</p>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/40 rounded-xl p-5">
                  <p className="text-sm text-white leading-relaxed">
                    <strong className="text-yellow-300">⚠️ Importante:</strong> Hasta el momento <strong className="text-white">no contamos con bots para trading binario</strong>. Nuestros bots están enfocados exclusivamente en Forex, Criptomonedas e Índices Sintéticos, donde la automatización genera los mejores resultados. En trading binario, el enfoque es en tu aprendizaje y operación manual para desarrollar habilidades fundamentales.
                  </p>
                </div>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-8">
              <div className="flex items-center gap-2 text-slate-400">
                <Shield className="h-5 w-5 text-emerald-400" />
                <span>Garantía Total</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="h-5 w-5 text-emerald-400" />
                <span>Acceso de por vida</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Award className="h-5 w-5 text-emerald-400" />
                <span>Certificación incluida</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16 bg-slate-900" ref={ref}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {courses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: idx * 0.15 }}
                className={`card relative overflow-hidden ${
                  course.popular ? "border-emerald-500/50 ring-2 ring-emerald-500/20" : ""
                }`}
              >
                {course.popular && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg z-10">
                    MÁS POPULAR
                  </div>
                )}

                <div className="relative aspect-video rounded-xl overflow-hidden mb-6">
                  <Image 
                    src={course.image} 
                    alt={course.title} 
                    fill 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <div className="bg-emerald-500 p-2 rounded-full">
                      <Play className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-white text-sm font-medium">{course.lessons} lecciones</span>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-1">{course.title}</h3>
                <p className="text-emerald-400 font-medium mb-3">{course.subtitle}</p>
                <p className="text-slate-400 text-sm mb-4">{course.description}</p>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" /> {course.students}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" /> {course.duration}
                  </span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <Star className="h-4 w-4 fill-current" /> {course.rating}
                  </span>
                </div>

                {/* Modules */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-white mb-3">Contenido:</h4>
                  <ul className="space-y-2">
                    {course.modules.slice(0, 4).map((module) => (
                      <li key={module} className="text-sm text-slate-400 flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        {module}
                      </li>
                    ))}
                    {course.modules.length > 4 && (
                      <li className="text-sm text-emerald-400">+{course.modules.length - 4} más...</li>
                    )}
                  </ul>
                </div>

                {/* Price */}
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-3xl font-bold text-white">${course.price}</span>
                  <span className="text-lg text-slate-500 line-through">${course.originalPrice}</span>
                  <span className="text-sm text-emerald-400">USD</span>
                </div>

                <Link
                  href={`/checkout?product=${course.id}&amount=${course.price}&name=${encodeURIComponent(course.title)}`}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                    course.popular
                      ? "btn-primary"
                      : "bg-slate-700 hover:bg-slate-600 text-white"
                  }`}
                >
                  Inscribirse <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* VIP Membership */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-gradient-to-r from-purple-900/50 to-emerald-900/50 rounded-3xl p-8 md:p-12 border border-purple-500/30"
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-purple-500/20 rounded-full px-4 py-2 mb-4">
                  <Zap className="h-4 w-4 text-purple-400" />
                  <span className="text-sm text-purple-300">Mejor Valor</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{membership.title}</h3>
                <p className="text-purple-300 mb-4">{membership.subtitle}</p>
                <ul className="space-y-3">
                  {membership.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-slate-300">
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-center md:text-right">
                <div className="text-5xl font-bold text-white mb-2">
                  ${membership.price}
                  <span className="text-lg text-slate-400">/{membership.period}</span>
                </div>
                <p className="text-slate-400 mb-6">Ahorra $791 vs comprar por separado</p>
                <Link href={`/checkout?product=vip&amount=${membership.price}&name=${encodeURIComponent(membership.title)}`} className="btn-secondary inline-flex items-center gap-2">
                  Unirse a VIP <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}