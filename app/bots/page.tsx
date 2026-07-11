"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import Link from "next/link";
import {
  Bot,
  Zap,
  Shield,
  Clock,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Lock,
  Headphones,
  Users,
  Star,
} from "lucide-react";

// Estilos para animaciones de degradados dinámicos (ya no se usa)
// v1.2 - Imágenes finales de cursos: 2, 3 y 5+ usuarios

const bots = [
  {
    name: " CJ Bot Lite",
    description: "Perfecto para comenzar con trading automatizado. Operaciones simples y seguras.",
    accounts: "Para dos cuentas Real y cuatro cuentas demos",
    price: 99.99,
    period: "mes",
    features: [
      "Pares ilimitados",
      "Estrategia conservadora",
      "Operaciones 24/7",
      "Panel de control básico",
      "Soporte 24/7 por WhatsApp",
    ],
    color: "emerald",
    colorHex: "#03A7A5",
    buttonText: "claro que si",
  },
  {
    name: "CJ Bot Standard",
    description: "Múltiples estrategias y pares para traders intermedios que buscan diversificar.",
    accounts: "Para tres cuentas Real y seis cuentas demos",
    price: 169.99,
    period: "mes",
    popular: true,
    features: [
      "Pares ilimitados",
      "3 estrategias diferentes",
      "Análisis en tiempo real",  
      "Panel avanzado con métricas",
      "Soporte 24/7 por WhatsApp"
    ],
    color: "blue",
    colorHex: "#3B82F6",
    buttonText: "My Standard",
  },
  {
    name: "CJ Bot Premium",
    description: "Solución institucional con las mejores herramientas y soporte dedicado.",
    accounts: "Para seis cuentas Real y ocho cuentas demos",
    price: 209.99,
    period: "mes",
    features: [
      "Pares ilimitados",
      "Todas las estrategias",
      "API personalizada",
      "Configuración personalizada",
      "Soporte 24/7 por WhatsApp",
    ],
    color: "amber",
    colorHex: "#CE6674",
    buttonText: "Soy Premium",
  },
];

const features = [
  {
    icon: Clock,
    title: "Opera 24/7",
    description: "El bot opera las 24 horas, los 7 días. Nunca pierde una oportunidad.",
  },
  {
    icon: Shield,
    title: "Gestión de Riesgo",
    description: "Stop loss automáticos y gestión de capital integrada para proteger tu inversión.",
  },
  {
    icon: Zap,
    title: "Ejecución Instantánea",
    description: "Ejecuta operaciones en milisegundos, mucho más rápido que cualquier humano.",
  },
  {
    icon: TrendingUp,
    title: "Estrategias Probadas",
    description: "Algoritmos basados en nuestro método con años de backtesting y resultados reales.",
  },
];

const courses = [
  {
    id: "basico",
    title: "Academia Plus/Bots 2 Users",
    subtitle: "Beneficios del Plan",
    description:
      "Ideal para principiantes. Todo tipo de trading con énfasis en trading binario y diferentes plataformas. Construye las bases sólidas que necesitas.",
    price: 999.99,
    originalPrice: 1755,
    image: "/curso-basico.png",
    duration: "Compromiso por un año",
    lessons: 24,
    students: "850+",
    rating: 4.2,
    modules: [
      "Acceso a 1 Bots y 2 Usuarios en la Academia",
      "Formación para crear tu propio bot",
      "Si no puedes crear tu Bot, haremos un acuerdo",
      "Recibirás un 20% de la venta de este módulo",
    ],
  },
  {
    id: "intermedio",
    title: "Academia Plus/Bots 3 Users",
    subtitle: "Estrategias Avanzadas",
    description:
      "Lleva tu trading al siguiente nivel con estrategias probadas. Todo tipo de trading con énfasis en trading binario en diferentes plataformas.",
    price: 2999.99,
    originalPrice: 4525,
    image: "/curso-intermedio.png",
    duration: "Compromiso por un año",
    lessons: 42,
    students: "520+",
    rating: 4.5,
    popular: true,
    modules: [
      "Acceso a 2 Bots y 3 Usuarios en la Academia",
      "Formación para crear tu propio bot",
      "Junto a ti crearemos tu propio Bot",
      "Recibirás un 30% de la venta de este módulo",
    ],
  },
  {
    id: "profesional",
    title: "Academia Plus/Bots 5 Users",
    subtitle: "Trading Institucional",
    description:
      "Todo lo del Curso Básico y del Intermedio más Trading Institucional. Incluye mentoría personalizada y acceso a bots automáticos.",
    price: 4999.99,
    originalPrice: 8245,
    image: "/curso-profesional.png",
    duration: "Compromiso por un año",
    lessons: 78,
    students: "230+",
    rating: 5.0,
    modules: [
      "Acceso a 3 Bots y 5 Usuarios en la Academia",
      "Formación para crear tu propio bot",
      "Junto a ti crearemos tu propio Bot",
      "Recibirás un 40% de la venta de este módulo",
    ],
  },
];

export default function BotsPage() {
  const [ref1, inView1] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [ref2, inView2] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 mb-6">
                <Bot className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-purple-400">Trading Automatizado</span>
              </div>

              <h1 className="title-anim text-4xl md:text-5xl font-bold text-white mb-6">
                Bots de Trading <span className="gradient-text">Inteligentes</span>
              </h1>

              <p className="text-lg text-slate-300 mb-8">
                Deja que la tecnología trabaje por ti. Nuestros bots operan 24/7 con las mismas estrategias de nuestro método probado.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-xl">
                  <p className="text-3xl font-bold text-emerald-400">+85%</p>
                  <p className="text-sm text-slate-400">Precisión promedio</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl">
                  <p className="text-3xl font-bold text-purple-400">24/7</p>
                  <p className="text-sm text-slate-400">Operación continua</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative aspect-video rounded-2xl overflow-hidden"
            >
              <Image
                src="/robot-trading.png"
                alt="Bot de trading automatizado"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                priority
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-slate-900" ref={ref1}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView1 ? { opacity: 1, y: 0 } : {}}
              className="section-title"
            >
              ¿Por Qué Usar <span className="gradient-text">Nuestros Bots</span>?
            </motion.h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView1 ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: idx * 0.1 }}
                className="card text-center"
              >
                <div className="bg-gradient-to-br from-emerald-500/20 to-purple-500/20 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-7 w-7 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-950" ref={ref2}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView2 ? { opacity: 1, y: 0 } : {}}
              className="section-title"
            >
              Elige Tu <span className="gradient-text">Plan</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView2 ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="section-subtitle"
            >
              Planes flexibles para cada nivel de trader
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {bots.map((bot, idx) => (
              <motion.div
                key={bot.name}
                initial={{ opacity: 0, y: 30 }}
                animate={inView2 ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: idx * 0.15 }}
                className="card relative"
              >
                <div className="text-center mb-6">
                  <div 
                    className="inline-flex p-3 rounded-xl mb-4"
                    style={{ backgroundColor: `${bot.colorHex}20` }}
                  >
                    <Bot className="h-8 w-8" style={{ color: bot.colorHex }} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{bot.name}</h3>
                  <p className="text-slate-400 text-sm mt-2">{bot.description}</p>
                </div>

                <div className="text-center mb-6">
                  <span className="text-4xl font-bold text-white">${bot.price}</span>
                  <span className="text-slate-400">/{bot.period}</span>
                </div>

                <div 
                  className="text-center mb-6 p-3 rounded-full border"
                  style={{ 
                    backgroundColor: `${bot.colorHex}15`,
                    borderColor: `${bot.colorHex}50`,
                    color: bot.colorHex
                  }}
                >
                  <p className="text-sm font-semibold">{bot.accounts}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {bot.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-slate-300 text-sm">
                      <CheckCircle className="h-5 w-5 flex-shrink-0" style={{ color: bot.colorHex }} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/registro"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all text-white"
                  style={{ 
                    backgroundColor: bot.colorHex,
                    opacity: 1
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  {bot.buttonText} <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="section-title text-center mb-12">
            Cómo <span className="gradient-text">Funciona</span>
          </h2>

          <div className="space-y-8">
            {[
              { emoji: "📋", title: "Elige tu plan", desc: "Selecciona el bot que mejor se adapte a tus necesidades y nivel de experiencia." },
              { emoji: "🔗", title: "Conecta tu broker", desc: "Vincula tu cuenta de trading mediante API segura. Tus fondos siempre están en tu broker." },
              { emoji: "⚙️", title: "Configura el bot", desc: "Personaliza los parámetros según tu tolerancia al riesgo y objetivos financieros." },
              { emoji: "🤖", title: "Opera automáticamente", desc: "El bot ejecuta operaciones 24/7 mientras tú te enfocas en otras actividades." },
            ].map((item, idx) => (
              <motion.div
                key={item.emoji}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.15 }}
                className="flex gap-6 items-start"
              >
                <div className="flex-shrink-0 text-4xl mt-1">
                  {item.emoji}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* VIP Plans Section */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-gradient-to-r from-purple-900/50 to-blue-900/40 rounded-3xl p-8 md:p-12 border border-purple-500/40 shadow-2xl"
          >
            {/* VIP Title Inside */}
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">
                🎁 <span className="gradient-text">¡GRANDES SORPRESAS TE ESPERAN EN NUESTROS PLANES VIP!</span> 💎
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-stretch">
              {/* Left Column - Membresía VIP */}
              <div className="flex flex-col">
                <h3 className="text-2xl font-bold text-white mb-6 text-left">Membresía VIP</h3>
                <ul className="space-y-3 flex-grow">
                  <li className="flex items-start gap-2 text-slate-300 text-sm">
                    <CheckCircle className="h-4 w-4 text-[#0194F6] flex-shrink-0 mt-0.5" />
                    <span>Acceso a TODOS los cursos actuales</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-300 text-sm">
                    <CheckCircle className="h-4 w-4 text-[#0194F6] flex-shrink-0 mt-0.5" />
                    <span>Trading en vivo programado</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-300 text-sm">
                    <CheckCircle className="h-4 w-4 text-[#0194F6] flex-shrink-0 mt-0.5" />
                    <span>Comunidad VIP exclusiva</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-300 text-sm">
                    <CheckCircle className="h-4 w-4 text-[#0194F6] flex-shrink-0 mt-0.5" />
                    <span>Mentoría grupal semanal</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-300 text-sm">
                    <CheckCircle className="h-4 w-4 text-[#0194F6] flex-shrink-0 mt-0.5" />
                    <span>Bot Pro incluido</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-300 text-sm">
                    <CheckCircle className="h-4 w-4 text-[#0194F6] flex-shrink-0 mt-0.5" />
                    <span>Soporte prioritario 24/7</span>
                  </li>
                </ul>
              </div>

              {/* Center Column - Planes VIP */}
              <div className="flex flex-col">
                <h3 className="text-2xl font-bold text-white mb-6 text-left">Planes VIP</h3>
                <ul className="space-y-3 flex-grow">
                  <li className="flex items-start gap-2 text-slate-300 text-sm">
                    <CheckCircle className="h-4 w-4 text-[#0194F6] flex-shrink-0 mt-0.5" />
                    <span>Garantía de recuperación de inversión</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-300 text-sm">
                    <CheckCircle className="h-4 w-4 text-[#0194F6] flex-shrink-0 mt-0.5" />
                    <span>Acceso a nuestros Bots</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-300 text-sm">
                    <CheckCircle className="h-4 w-4 text-[#0194F6] flex-shrink-0 mt-0.5" />
                    <span>Crear tu Bot con tus estrategias</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-300 text-sm">
                    <CheckCircle className="h-4 w-4 text-[#0194F6] flex-shrink-0 mt-0.5" />
                    <span>Te creamos un bot para ti</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-300 text-sm">
                    <CheckCircle className="h-4 w-4 text-[#0194F6] flex-shrink-0 mt-0.5" />
                    <span>Contenido premium y cursos ilimitados</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-300 text-sm">
                    <CheckCircle className="h-4 w-4 text-[#0194F6] flex-shrink-0 mt-0.5" />
                    <span>Soporte prioritario y dedicado</span>
                  </li>
                </ul>
              </div>

              {/* Right Column - Pricing & CTA */}
              <div className="flex flex-col items-center justify-between bg-gradient-to-b from-blue-500/20 to-purple-500/20 rounded-2xl p-6 border border-blue-400/40">
                <div className="text-center w-full">
                  <p className="text-sm text-slate-300 mb-2">Planes desde</p>
                  <div className="text-4xl font-bold text-white mb-1">$999.99</div>
                  <p className="text-2xl text-[#0194F6] font-semibold mb-4">a 4,999.99</p>
                  <p className="text-xs text-slate-400 mb-6">Ahorra desde $491 a $2437<br />vs comprar por separado</p>
                </div>
                <Link href="#planes-vip-libertad" className="inline-flex items-center justify-center gap-2 py-3 px-8 mt-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold rounded-full transition-all text-base">
                  💎 Quiero verlos ✨
                </Link>

                {/* Preview Images */}
                <div className="grid grid-cols-3 gap-3 w-full mt-6">
                  {courses.map((course) => (
                    <div key={course.id} className="relative aspect-video rounded-lg overflow-hidden border border-slate-600">
                      <Image
                        src={course.image}
                        alt={course.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Planes VIP - Libertad Financiera */}
      <section id="planes-vip-libertad" className="py-16 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Planes VIP para la <span className="gradient-text">Libertad Financiera</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="section-subtitle"
            >
              Elige el módulo que se adapte a tu necesidad y comienza tu transformación económica HOY
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {courses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                className={`card relative overflow-hidden border-2 ${
                  course.id === "intermedio" ? "border-[#008874] ring-2 ring-emerald-500/20" : course.id === "basico" ? "border-[#0194F6]" : "border-[#B54181]"
                }`}
              >

                <div className="relative aspect-video rounded-xl overflow-hidden mb-6">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-1">{course.title}</h3>
                <p className={`font-medium mb-3 ${course.id === "intermedio" ? "text-[#008874]" : course.id === "basico" ? "text-[#0194F6]" : "text-[#B54181]"}`}>{course.subtitle}</p>
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
                        <CheckCircle className={`h-4 w-4 flex-shrink-0 mt-0.5 ${course.id === "intermedio" ? "text-[#008874]" : course.id === "basico" ? "text-[#0194F6]" : "text-[#B54181]"}`} />
                        {module}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price */}
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-3xl font-bold text-white">${course.price}</span>
                  <span className="text-lg text-slate-500 line-through">${course.originalPrice}</span>
                  <span className={`text-sm ${course.id === "intermedio" ? "text-[#008874]" : course.id === "basico" ? "text-[#0194F6]" : "text-[#B54181]"}`}>USD</span>
                </div>

                <Link
                  href={`/checkout?product=${course.id}&amount=${course.price}&name=${encodeURIComponent(course.title)}`}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all text-white ${
                    course.id === "basico"
                      ? "bg-[#0194F6] hover:bg-[#0178d4]"
                      : course.id === "intermedio"
                      ? "bg-[#008874] hover:bg-[#006b57]"
                      : "bg-[#B54181] hover:bg-[#963366]"
                  }`}
                >
                  {course.id === "basico"
                    ? "Inicia Ya"
                    : course.id === "intermedio"
                    ? "Avanza Ya"
                    : "Activa Todo Ya"} <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            ¿Listo para automatizar tu <span className="gradient-text">trading</span>?
          </h2>
          <p className="text-lg text-slate-400 mb-8">
            Comienza hoy y deja que la tecnología trabaje por ti, y para ti.
          </p>
          <Link
            href="/registro"
            className="text-slate-900 font-bold px-8 py-4 rounded-full inline-flex items-center gap-3 text-lg transition-all hover:opacity-90"
            style={{
              backgroundColor: "#02A5EB"
            }}
          >
            🚀 Comenzar Ahora ⚡
          </Link>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4">
          <div className="p-8 bg-red-500/15 rounded-2xl border-2 border-red-500/50">
            <div className="flex items-start gap-4">
              <span className="text-4xl flex-shrink-0">⚠️</span>
              <p className="text-lg md:text-xl text-white font-semibold leading-tight">
                <strong className="text-red-500 text-xl">AVISO IMPORTANTE:</strong> Los bots de trading conllevan riesgos y podrías perder tu capital. Opera solo con dinero que puedas permitirte perder.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}