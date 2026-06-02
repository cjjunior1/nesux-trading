"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BookOpen,
  Lock,
  CheckCircle,
  ArrowRight,
  Loader2,
  GraduationCap,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string | null;
  price: number;
  moduleCount: number;
  hasAccess: boolean;
  progress?: {
    completed: number;
    total: number;
    percentage: number;
  };
}

export default function MisCursosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && status === "unauthenticated") {
      router.replace("/login?redirect=/dashboard/mis-cursos");
    }
  }, [status, router, mounted]);

  useEffect(() => {
    if (status === "authenticated") {
      loadCourses();
    }
  }, [status]);

  const loadCourses = async () => {
    try {
      const response = await fetch("/api/courses");
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || status === "loading" || loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const myCourses = courses.filter((c) => c.hasAccess);
  const availableCourses = courses.filter((c) => !c.hasAccess);

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="h-8 w-8 text-emerald-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Mis Cursos
            </h1>
          </div>
          <p className="text-slate-400">
            Accede a todos tus cursos y continúa tu formación en trading
          </p>
        </motion.div>

        {/* My Courses Section */}
        {myCourses.length > 0 ? (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">
              Cursos Activos ({myCourses.length})
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCourses.map((course, idx) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-emerald-500/50 transition-all group"
                >
                  {/* Course Image */}
                  <div className="relative h-48 bg-gradient-to-br from-emerald-900/30 to-blue-900/30 flex items-center justify-center">
                    {course.imageUrl ? (
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="h-16 w-16 text-emerald-400/50" />
                    )}
                    <div className="absolute top-3 right-3">
                      <div className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Activo
                      </div>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{course.moduleCount} módulos</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Ilimitado</span>
                      </div>
                    </div>

                    {/* Progress Bar (placeholder) */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-400">Progreso</span>
                        <span className="text-emerald-400 font-semibold">
                          {course.progress?.percentage || 0}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                          style={{ width: `${course.progress?.percentage || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button asChild className="w-full">
                      <Link href={`/dashboard/curso/${course.id}`}>
                        Continuar Curso
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center mb-16"
          >
            <BookOpen className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Aún no tienes cursos
            </h2>
            <p className="text-slate-400 mb-6">
              Explora nuestros cursos disponibles y comienza tu formación en trading
            </p>
            <Button asChild>
              <Link href="/cursos">
                Ver Cursos Disponibles
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        )}

        {/* Available Courses Section */}
        {availableCourses.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              Cursos Disponibles
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCourses.map((course, idx) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-blue-500/50 transition-all group"
                >
                  {/* Course Image */}
                  <div className="relative h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    {course.imageUrl ? (
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-full h-full object-cover opacity-50"
                      />
                    ) : (
                      <Lock className="h-16 w-16 text-slate-600" />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Lock className="h-12 w-12 text-slate-400" />
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {course.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{course.moduleCount} módulos</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-emerald-400">
                          ${course.price}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/cursos">
                        Ver Detalles
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
