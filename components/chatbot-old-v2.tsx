"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Square } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import styles from "./chatbot-styles.module.css";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  isEdited: boolean;
}

interface ChatState {
  sessionId: string;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

const MarkdownRenderer = ({ content }: { content: string }) => {
  return (
    <div className={styles.markdownContent}>
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 style={{ color: "#fbbf24" }}>{children}</h1>,
          h2: ({ children }) => <h2 style={{ color: "#60a5fa" }}>{children}</h2>,
          h3: ({ children }) => <h3 style={{ color: "#a78bfa" }}>{children}</h3>,
          strong: ({ children }) => <strong style={{ color: "#fbbf24" }}>{children}</strong>,
          code: ({ inline, children }) =>
            inline ? (
              <code style={{ background: "rgba(0,0,0,0.3)", color: "#60a5fa" }}>
                {children}
              </code>
            ) : (
              <pre>
                <code style={{ color: "#a3e635" }}>{children}</code>
              </pre>
            ),
          table: ({ children }) => (
            <table className={styles.markdownTable}>{children}</table>
          ),
          blockquote: ({ children }) => (
            <blockquote className={styles.warningBox}>{children}</blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [chat, setChat] = useState<ChatState>({
    sessionId: "",
    messages: [],
    isLoading: false,
    error: null,
  });
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Inicializar sesión
  useEffect(() => {
    if (isOpen && !chat.sessionId) {
      const sessionId = `session-${Date.now()}`;
      setChat((prev) => ({ ...prev, sessionId }));
      loadInitialMessage();
    }
  }, [isOpen]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages]);

  // Cargar saludo inicial
  const loadInitialMessage = () => {
    const greeting = {
      id: `msg-${Date.now()}`,
      role: "assistant" as const,
      content: `# ¡Bienvenido a Trading Academy! 🚀

Soy tu asistente tutor especializado en análisis técnico y trading. Aquí puedo ayudarte con:

✅ **Conceptos de Trading** — estrategias, indicadores, patrones  
✅ **Gestión de Riesgo** — stop loss, tamaño de posición, ratio R/R  
✅ **Psicología Trader** — control emocional, disciplina  
✅ **CJ Bot** — parámetros, configuración, funcionalidades  
✅ **Análisis Técnico** — soportes, resistencias, tendencias  

**Recuerda:** Solo educación y análisis. Nunca doy señales de compra/venta ni garantizo ganancias.

¿Qué tema te gustaría explorar hoy?`,
      createdAt: new Date(),
      isEdited: false,
    };

    setChat((prev) => ({
      ...prev,
      messages: [greeting],
    }));
  };

  // Enviar mensaje
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input,
      createdAt: new Date(),
      isEdited: false,
    };

    setChat((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    setInput("");

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: chat.sessionId,
          messages: chat.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userMessage: input,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error("Error en la respuesta");

      const data = await response.json();
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-response`,
        role: "assistant",
        content: data.content || "No se pudo procesar la respuesta.",
        createdAt: new Date(),
        isEdited: false,
      };

      setChat((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (error: any) {
      if (error.name === "AbortError") {
        setChat((prev) => ({
          ...prev,
          isLoading: false,
          error: "Generación detenida",
        }));
      } else {
        setChat((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message || "Error al enviar mensaje",
        }));
      }
    }
  };

  // Detener generación
  const stopGeneration = () => {
    abortControllerRef.current?.abort();
    setChat((prev) => ({ ...prev, isLoading: false }));
  };

  // Editar mensaje
  const startEdit = (msg: Message) => {
    setEditingId(msg.id);
    setEditText(msg.content);
  };

  const saveEdit = () => {
    if (!editingId || !editText.trim()) return;

    const editIndex = chat.messages.findIndex((m) => m.id === editingId);
    if (editIndex === -1) return;

    // Eliminar todos los mensajes después del editado
    const newMessages = chat.messages.slice(0, editIndex + 1).map((m) =>
      m.id === editingId ? { ...m, content: editText, isEdited: true } : m
    );

    setChat((prev) => ({
      ...prev,
      messages: newMessages,
    }));

    setEditingId(null);
    setEditText("");
  };

  // Copiar mensaje
  const copyMessage = async (content: string) => {
    await navigator.clipboard.writeText(content);
  };

  // Manejo de teclas
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Shift+Enter = nueva línea
    if (e.shiftKey && e.key === "Enter") {
      e.preventDefault();
      setInput((prev) => prev + "\n");
      return;
    }

    // Enter = enviar
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(
        textareaRef.current.scrollHeight,
        100
      ) + "px";
    }
  }, [input]);

  return (
    <>
      {/* Botón flotante */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-green-500 rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X size={24} className="text-white" /> : <MessageCircle size={24} className="text-white" />}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-6 w-96 h-[600px] bg-slate-900 rounded-lg shadow-2xl flex flex-col z-50 border border-slate-700"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 rounded-t-lg text-white font-bold">
              Trading Academy Tutor 🤖
            </div>

            {/* Messages */}
            <div className={styles.messagesContainer}>
              {chat.messages.map((msg) => (
                <div key={msg.id} className={styles.messageWrapper}>
                  {msg.role === "user" ? (
                    <div className={styles.userMessage}>
                      {editingId === msg.id ? (
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-2 bg-slate-800 text-white rounded border border-green-400"
                          autoFocus
                        />
                      ) : (
                        <>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <div className={styles.timestamp}>
                            {msg.createdAt.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {msg.isEdited && <span className={styles.editedLabel}>(editado)</span>}
                          </div>
                        </>
                      )}

                      {editingId === msg.id && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={saveEdit}
                            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 bg-slate-600 text-white rounded text-sm"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}

                      {editingId !== msg.id && (
                        <div className="flex gap-2 mt-2 text-xs">
                          <button
                            onClick={() => startEdit(msg)}
                            className="text-blue-400 hover:underline"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => copyMessage(msg.content)}
                            className="text-blue-400 hover:underline"
                          >
                            Copiar
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={styles.assistantMessage}>
                      <MarkdownRenderer content={msg.content} />
                      <div className={styles.timestamp}>
                        {msg.createdAt.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <button
                        onClick={() => copyMessage(msg.content)}
                        className="text-xs text-blue-400 hover:underline mt-2"
                      >
                        Copiar
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {chat.isLoading && (
                <div className={`${styles.assistantMessage} ${styles.loadingDots}`}>
                  <div className={styles.dot} />
                  <div className={styles.dot} />
                  <div className={styles.dot} />
                </div>
              )}

              {chat.error && (
                <div className="text-red-400 text-sm p-2 bg-red-900/20 rounded">
                  {chat.error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={styles.inputContainer}>
              <div className={styles.inputWrapper}>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu pregunta... (Shift+Enter = nueva línea)"
                  className={styles.textarea}
                  disabled={chat.isLoading}
                />

                {chat.isLoading ? (
                  <button
                    onClick={stopGeneration}
                    className={`${styles.button} ${styles.stopButton}`}
                    title="Detener generación"
                  >
                    <Square size={18} />
                  </button>
                ) : (
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className={styles.button}
                    title="Enviar mensaje"
                  >
                    <Send size={18} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
