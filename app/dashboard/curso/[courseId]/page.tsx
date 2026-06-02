"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Lock, 
  CheckCircle, 
  PlayCircle, 
  FileText, 
  Image as ImageIcon,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CourseData {
  id: string;
  title: string;
  description: string;
  modules: {
    id: string;
    title: string;
    description: string;
    order: number;
    lessons: {
      id: string;
      title: string;
      description: string;
      order: number;
      completed: boolean;
      resources: {
        id: string;
        type: string;
        title: string;
        url: string;
      }[];
    }[];
  }[];
}

export default function CoursePage({ params }: { params: { courseId: string } }) {
  const router = useRouter();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  useEffect(() => {
    checkAccessAndLoadCourse();
  }, [params.courseId]);

  const checkAccessAndLoadCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${params.courseId}/access`);
      
      if (response.status === 401) {
        router.push("/login?redirect=/dashboard/curso/" + params.courseId);
        return;
      }

      const data = await response.json();
      
      if (data.hasAccess) {
        setHasAccess(true);
        setCourse(data.course);
      } else {
        setHasAccess(false);
      }
    } catch (error) {
      console.error("Error loading course:", error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    try {
      await fetch(`/api/courses/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, completed: true }),
      });

      // Update local state
      if (course) {
        const updatedCourse = { ...course };
        updatedCourse.modules.forEach(module => {
          module.lessons.forEach(lesson => {
            if (lesson.id === lessonId) {
              lesson.completed = true;
            }
          });
        });
        setCourse(updatedCourse);
      }
    } catch (error) {
      console.error("Error marking lesson complete:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (hasAccess === false) {
    return (
      <div className="min-h-screen bg-slate-950 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Lock className="h-16 w-16 text-slate-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">
              Acceso Restringido
            </h1>
            <p className="text-slate-400 mb-8">
              No tienes acceso a este curso. Por favor, realiza la compra para acceder al contenido completo.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild variant="outline">
                <Link href="/cursos">Ver Cursos Disponibles</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard">Volver al Dashboard</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-950 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-slate-400">Curso no encontrado</p>
        </div>
      </div>
    );
  }

  const selectedLessonData = course.modules
    .flatMap(m => m.lessons)
    .find(l => l.id === selectedLesson);

  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
          <p className="text-slate-400">{course.description}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar - Course Structure */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-400" />
                Contenido del Curso
              </h2>

              <div className="space-y-4">
                {course.modules.map((module) => (
                  <div key={module.id} className="space-y-2">
                    <h3 className="font-semibold text-white text-sm">
                      {module.title}
                    </h3>
                    <div className="space-y-1">
                      {module.lessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => setSelectedLesson(lesson.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedLesson === lesson.id
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                              : "text-slate-400 hover:bg-slate-800 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {lesson.completed ? (
                              <CheckCircle className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-slate-600" />
                            )}
                            <span className="flex-1">{lesson.title}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {selectedLessonData ? (
              <motion.div
                key={selectedLessonData.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 rounded-lg border border-slate-800 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {selectedLessonData.title}
                    </h2>
                    {selectedLessonData.description && (
                      <p className="text-slate-400">{selectedLessonData.description}</p>
                    )}
                  </div>
                  {!selectedLessonData.completed && (
                    <Button
                      onClick={() => markLessonComplete(selectedLessonData.id)}
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar Completada
                    </Button>
                  )}
                </div>

                {/* Resources */}
                <div className="space-y-4 mt-6">
                  <h3 className="font-semibold text-white">Recursos de la Lección</h3>
                  
                  {selectedLessonData.resources.length === 0 ? (
                    <p className="text-slate-400 text-sm">
                      No hay recursos disponibles para esta lección aún.
                    </p>
                  ) : (
                    <div className="grid gap-4">
                      {selectedLessonData.resources.map((resource) => (
                        <div
                          key={resource.id}
                          className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
                        >
                          <div className="flex items-start gap-3">
                            {resource.type === "video" && (
                              <PlayCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-1" />
                            )}
                            {resource.type === "image" && (
                              <ImageIcon className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-1" />
                            )}
                            {resource.type === "pdf" && (
                              <FileText className="h-5 w-5 text-red-400 flex-shrink-0 mt-1" />
                            )}
                            
                            <div className="flex-1">
                              <h4 className="font-medium text-white mb-1">{resource.title}</h4>
                              
                              {resource.type === "image" && (
                                <img
                                  src={resource.url}
                                  alt={resource.title}
                                  className="rounded-lg mt-2 max-w-full"
                                />
                              )}
                              
                              {resource.type === "video" && (
                                <div className="mt-2">
                                  {resource.url.includes("youtube") || resource.url.includes("youtu.be") ? (
                                    <iframe
                                      src={resource.url.replace("watch?v=", "embed/")}
                                      className="w-full aspect-video rounded-lg"
                                      allowFullScreen
                                    />
                                  ) : (
                                    <video
                                      src={resource.url}
                                      controls
                                      className="w-full rounded-lg"
                                    />
                                  )}
                                </div>
                              )}
                              
                              {(resource.type === "pdf" || resource.type === "link") && (
                                <a
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-400 hover:text-emerald-300 text-sm mt-2 inline-block"
                                >
                                  Abrir recurso →
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Chatbot hint */}
                <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-200">
                    💬 <strong>Tip:</strong> Usa el chatbot en la esquina inferior derecha para hacer preguntas sobre esta lección. 
                    El bot es tu maestro y te ayudará con cualquier duda.
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="bg-slate-900 rounded-lg border border-slate-800 p-12 text-center">
                <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">
                  Selecciona una lección del menú lateral para comenzar
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
