"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  MessageCircle,
  User,
  Calendar,
  Clock,
  ChevronRight,
  Bot,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface ChatSession {
  id: string;
  userId: string | null;
  user: {
    email: string;
    firstName: string;
    lastName: string;
  } | null;
  startedAt: string;
  lastActiveAt: string;
  totalInteractionMs: number;
  messages: ChatMessage[];
  topics: Array<{ topic: string }>;
  _count: {
    messages: number;
  };
}

export default function AdminChatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (session?.user && (session.user as any).role !== "admin") {
      router.push("/dashboard");
      return;
    }
    if (status === "authenticated") {
      fetchSessions();
    }
  }, [status, session, router]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/chats");
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      !searchTerm ||
      session.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.user?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.user?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.id.toLowerCase().includes(searchTerm.toLowerCase());

    const sessionDate = new Date(session.startedAt);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

    let matchesDate = true;
    if (dateFilter === "today") matchesDate = daysDiff === 0;
    else if (dateFilter === "week") matchesDate = daysDiff <= 7;
    else if (dateFilter === "month") matchesDate = daysDiff <= 30;

    return matchesSearch && matchesDate;
  });

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando conversaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <MessageCircle className="h-8 w-8 text-emerald-600" />
          Conversaciones del Chatbot
        </h1>
        <p className="text-slate-600 mt-2">
          Monitorea y analiza las conversaciones de los usuarios
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por usuario, email o ID de sesión..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger>
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar por fecha" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las fechas</SelectItem>
            <SelectItem value="today">Hoy</SelectItem>
            <SelectItem value="week">Última semana</SelectItem>
            <SelectItem value="month">Último mes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Sesiones</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">{filteredSessions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Mensajes Totales</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {filteredSessions.reduce((sum, s) => sum + s._count.messages, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Con Usuario</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600">
              {filteredSessions.filter((s) => s.userId).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Anónimos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">
              {filteredSessions.filter((s) => !s.userId).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessions List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Sesiones de Chat</CardTitle>
            <CardDescription>
              {filteredSessions.length} conversación(es) encontrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {filteredSessions.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No se encontraron conversaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {filteredSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className={`w-full p-4 text-left hover:bg-slate-50 transition-colors ${
                        selectedSession?.id === session.id ? "bg-emerald-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {session.userId ? (
                              <User className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <User className="h-4 w-4 text-slate-400" />
                            )}
                            <p className="font-semibold text-slate-900">
                              {session.user
                                ? `${session.user.firstName} ${session.user.lastName}`
                                : "Usuario Anónimo"}
                            </p>
                          </div>
                          {session.user && (
                            <p className="text-sm text-slate-600 mb-2">{session.user.email}</p>
                          )}
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              <MessageCircle className="h-3 w-3 mr-1" />
                              {session._count.messages} mensajes
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDuration(session.totalInteractionMs)}
                            </Badge>
                          </div>
                          {session.topics.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {session.topics.slice(0, 3).map((t, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {t.topic}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 ml-2">
                          <p className="text-xs text-slate-500">
                            {formatDate(session.startedAt)}
                          </p>
                          <ChevronRight className="h-5 w-5 text-slate-400" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Conversación</CardTitle>
            <CardDescription>
              {selectedSession
                ? `${selectedSession._count.messages} mensaje(s) en esta sesión`
                : "Selecciona una sesión para ver los mensajes"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              {!selectedSession ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <MessageCircle className="h-16 w-16 mb-4 opacity-30" />
                  <p>Selecciona una sesión de chat para ver la conversación</p>
                </div>
              ) : selectedSession.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <MessageCircle className="h-16 w-16 mb-4 opacity-30" />
                  <p>Esta sesión no tiene mensajes registrados</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedSession.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === "user" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          message.role === "user"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-emerald-100 text-emerald-600"
                        }`}
                      >
                        {message.role === "user" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div
                        className={`flex-1 max-w-[85%] ${
                          message.role === "user" ? "text-right" : "text-left"
                        }`}
                      >
                        <div
                          className={`inline-block p-3 rounded-2xl text-sm ${
                            message.role === "user"
                              ? "bg-blue-600 text-white rounded-br-sm"
                              : "bg-slate-100 text-slate-900 rounded-bl-sm"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 px-2">
                          {formatDate(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
