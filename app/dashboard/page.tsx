"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  TrendingUp,
  BookOpen,
  Bot,
  Users,
  Play,
  Award,
  Clock,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router, mounted]);

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const userName = session?.user?.name?.split(" ")[0] || "Usuario";

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="title-anim text-3xl md:text-4xl font-bold text-white mb-2">
            ¡Hola, <span className="gradient-text">{userName}</span>!
          </h1>
          <p className="text-slate-400">
            Bienvenido a tu panel de control. Aquí encontrarás todos tus recursos.
          </p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Cursos Activos", value: "0", icon: BookOpen, color: "emerald" },
            { label: "Lecciones Completadas", value: "0", icon: Play, color: "purple" },
            { label: "Horas de Estudio", value: "0h", icon: Clock, color: "amber" },
            { label: "Certificados", value: "0", icon: Award, color: "blue" },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="card"
            >
              <stat.icon className={`h-8 w-8 mb-3 ${
                stat.color === "emerald" ? "text-emerald-400" :
                stat.color === "purple" ? "text-purple-400" :
                stat.color === "amber" ? "text-amber-400" : "text-blue-400"
              }`} />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Recommended Course */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card lg:col-span-2"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              Recomendado Para Ti
            </h2>
            <div className="bg-gradient-to-r from-emerald-900/50 to-purple-900/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-2">Curso Básico de Trading</h3>
              <p className="text-slate-300 text-sm mb-4">
                Comienza tu viaje en el trading con los fundamentos esenciales.
              </p>
              <Link
                href="/cursos"
                className="btn-primary inline-flex items-center gap-2 text-sm py-2"
              >
                Ver Cursos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <h2 className="text-xl font-bold text-white mb-4">Accesos Rápidos</h2>
            <div className="space-y-3">
              <Link
                href="/dashboard/mis-cursos"
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-800/30 to-emerald-900/30 border border-emerald-500/30 rounded-lg hover:bg-emerald-700/30 transition-colors"
              >
                <BookOpen className="h-5 w-5 text-emerald-400" />
                <div className="flex-1">
                  <span className="text-white font-semibold block">Mis Cursos</span>
                  <span className="text-emerald-300 text-xs">Continúa tu formación</span>
                </div>
              </Link>
              <Link
                href="/dashboard/perfil"
                className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <Users className="h-5 w-5 text-emerald-400" />
                <span className="text-slate-300">Mi Perfil</span>
              </Link>
              <Link
                href="/cursos"
                className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <BookOpen className="h-5 w-5 text-blue-400" />
                <span className="text-slate-300">Ver Todos los Cursos</span>
              </Link>
              <Link
                href="/bots"
                className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <Bot className="h-5 w-5 text-purple-400" />
                <span className="text-slate-300">Bots de Trading</span>
              </Link>
              <Link
                href="/testimonios"
                className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <Users className="h-5 w-5 text-amber-400" />
                <span className="text-slate-300">Comunidad</span>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-gradient-to-r from-slate-800/50 to-slate-800/30 rounded-2xl p-8 border border-slate-700/50"
        >
          <h2 className="text-xl font-bold text-white mb-4">
            🚀 Bienvenido a Trading Academy
          </h2>
          <p className="text-slate-300 mb-4">
            Estás a punto de comenzar un viaje que puede transformar tu vida financiera. 
            Recuerda que el trading es lógica y matemáticas bien aplicadas, no magia ni suerte.
          </p>
          <p className="text-slate-400 text-sm">
            Explora nuestros cursos, únete a la comunidad y comienza a aplicar el método que te llevará 
            del 95% que pierde al 5% que gana consistentemente.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
