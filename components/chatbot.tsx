"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { 
  MessageCircle, X, Send, Bot, User, Volume2, Mic, MicOff, 
  Maximize2, Minimize2, Square, Play, PhoneOff, Paperclip, FileText
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  greeting?: string;
  color?: string;
  emoji?: string;
  fileUrl?: string;
  fileType?: string;
  greetingColor?: string;
  textColor?: string;
}

// Rango amplio de emojis/símbolos para que el lector de voz no los pronuncie (evita "sonido raro")
const EMOJI_RE = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{2122}\u{2139}\u{20E3}]/gu;

// Color uniforme para el cuerpo del mensaje (las letras deben verse iguales; se adapta al tema)
const BODY_TEXT_COLOR = "var(--chat-text, #E2E8F0)";

// Quita marcas de markdown que el modelo a veces deja (###, **, ***, viñetas, etc.)
function cleanMarkdown(text: string): string {
  if (!text) return text;
  return text
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, "").trim()) // bloques de código
    .replace(/`([^`]+)`/g, "$1")              // código en línea
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")     // imágenes markdown
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")  // enlaces -> solo el texto
    .replace(/^#{1,6}\s*/gm, "")               // encabezados ###
    .replace(/\*\*\*([^*]+)\*\*\*/g, "$1")     // ***negrita-cursiva***
    .replace(/\*\*([^*]+)\*\*/g, "$1")         // **negrita**
    .replace(/\*([^*]+)\*/g, "$1")             // *cursiva*
    .replace(/__([^_]+)__/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/^\s*>\s?/gm, "")                  // citas >
    .replace(/^\s*[-*+]\s+/gm, "• ")            // viñetas -> punto
    .replace(/[*#`~]{1,}/g, "")                 // símbolos sueltos (***), ###, etc.
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");
  
  // Control de lectura por mensaje
  const [readingMessageId, setReadingMessageId] = useState<string | null>(null);
  const [readingWordIndex, setReadingWordIndex] = useState<number>(0);
  
  // Control de micrófono
  const [isRecording, setIsRecording] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  
  // Posición y tamaño
  const [size, setSize] = useState({ width: 380, height: 600 });
  const [isMaximized, setIsMaximized] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const dragControls = useDragControls();

  // Modo conversación continuo por voz (manos libres)
  const conversationModeRef = useRef(false);   // true mientras la conversación por voz esté activa
  const isSpeakingRef = useRef(false);          // true mientras el bot está hablando (TTS)
  const processingRef = useRef(false);          // true mientras se procesa una respuesta
  const sendMessageRef = useRef<(text?: string) => void>(() => {});
  const wakeLockRef = useRef<any>(null);        // evita que la pantalla se apague durante la conversación

  // Inicializar micrófono
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "es-ES";
      recognition.interimResults = true;
      recognition.continuous = true; // conversación fluida: no se corta tras la primera frase

      recognition.onresult = (event: any) => {
        // Solo procesamos los resultados nuevos (desde resultIndex)
        let interim = "";
        let finalText = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const r = event.results[i];
          if (r.isFinal) finalText += r[0].transcript;
          else interim += r[0].transcript;
        }

        // Mostrar lo que se va dictando en tiempo real
        if (interim) setInput(interim);

        // Cuando el usuario termina una frase, la enviamos y seguimos escuchando
        if (finalText.trim()) {
          processingRef.current = true; // pausa el auto-reinicio mientras respondemos
          try { recognition.stop(); } catch {}
          setInput("");
          sendMessageRef.current(finalText.trim());
        }
      };

      recognition.onerror = (e: any) => {
        // "no-speech"/"aborted" son normales: dejamos que onend reanude la escucha
        if (e.error === "no-speech" || e.error === "aborted") return;
        setMicError(e.error === "not-allowed" ? "Permisos denegados" : "Error de audio");
        if (e.error === "not-allowed") {
          conversationModeRef.current = false;
          setIsRecording(false);
        }
      };

      recognition.onend = () => {
        // En modo conversación, si no estamos hablando ni procesando, reanudamos la escucha
        if (conversationModeRef.current && !isSpeakingRef.current && !processingRef.current) {
          try { recognition.start(); } catch {}
        } else if (!conversationModeRef.current) {
          setIsRecording(false);
        }
      };

      recognitionRef.current = recognition;
      setMicSupported(true);
    }
  }, []);

  // Generar saludo dinámico
  const generateDynamicGreeting = () => {
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const period = hour < 6 ? "madrugada" : hour < 12 ? "mañana" : hour < 18 ? "tarde" : "noche";
    const timeGreeting = hour < 6 ? "Buenas noches" : hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";

    const colors = [
      "#F97316", // amber-500
      "#06B6D4", // cyan-500
      "#8B5CF6", // violet-500
      "#10B981", // emerald-500
      "#EF4444", // red-500
      "#3B82F6", // blue-500
      "#F59E0B", // yellow-500
      "#EC4899", // pink-500
      "#14B8A6", // teal-500
      "#6366F1"  // indigo-500
    ];

    const emojis = ["🤖","🧠","📈","📊","🚀","🪄","📚","🎯","💡","🧭","👨‍🏫","🧑‍🏫","🤝","🔔","✨"];

    const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

    const marketContexts = [
      "El mercado de Forex acaba de abrir con fuerza. El EUR/USD muestra movimientos interesantes. ¿Te gustaría analizar las oportunidades de hoy?",
      "Hoy hay alta volatilidad en los pares principales. Las noticias económicas están moviendo el mercado. ¿Quieres que revisemos las mejores entradas?",
      "Los mercados están en pleno movimiento. He detectado varias configuraciones técnicas prometedoras. ¿Por dónde quieres empezar?",
      "El día está perfecto para operar. Los spreads están bajos y la liquidez es alta. ¿Qué par te gustaría analizar hoy?",
      "Acabo de detectar movimientos significativos en el GBP/USD y USD/JPY. La volatilidad está en su punto óptimo. ¿Quieres que lo revisemos?",
      "Hoy es un día excelente para el trading. Los indicadores técnicos están mostrando señales claras. ¿En qué activo quieres enfocarte?",
      "El mercado asiático cerró con movimientos interesantes y Europa está abriendo con fuerza. ¿Listo para encontrar buenas oportunidades?",
      "Las sesiones se están solapando y hay mucha liquidez. Perfecto para operar. ¿Qué estrategia quieres aplicar hoy?",
      "Los niveles de soporte y resistencia están muy definidos hoy. Ideal para entrar con precisión. ¿Quieres que analicemos el gráfico?",
      "Hoy hay noticias económicas importantes que están moviendo el mercado. Oportunidades claras para quien sepa leerlas. ¿Te ayudo a identificarlas?"
    ];
    
    const weekendMessages = [
      "Es fin de semana y los mercados están cerrados, pero es el momento perfecto para estudiar y prepararse. ¿Quieres repasar alguna estrategia o concepto?",
      "Aunque no hay trading hoy, podemos aprovechar para analizar operaciones pasadas o planificar la próxima semana. ¿Qué te gustaría hacer?",
      "Día de descanso del mercado. Perfecto para fortalecer tu conocimiento. ¿En qué tema quieres profundizar hoy?"
    ];
    
    const motivationalMessages = [
      "Recuerda: el 95% pierde, pero tú estás aquí para estar en el 5% que gana consistentemente. ¿Cómo puedo ayudarte hoy?",
      "Cada día es una nueva oportunidad para mejorar tu trading. Estoy aquí para guiarte. ¿Por dónde empezamos?",
      "Tu transformación como trader comienza con cada pregunta que haces. ¿Qué quieres aprender hoy?",
      "El trading inteligente se construye con conocimiento y disciplina. Yo te ayudo con el conocimiento. ¿Qué necesitas?"
    ];
    
    let selectedMessage = "";
    
    if (isWeekend) {
      selectedMessage = weekendMessages[Math.floor(Math.random() * weekendMessages.length)];
    } else {
      const marketMsg = marketContexts[Math.floor(Math.random() * marketContexts.length)];
      const motivationalMsg = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      selectedMessage = Math.random() > 0.3 ? marketMsg : motivationalMsg;
    }
    // Variantes creativas para la primera línea (muchas combinaciones)
    const greetingTemplates = [
      `${timeGreeting}! Soy tu maestro tutor de Trading Academy, listo para acompañarte esta ${period}.`,
      `${timeGreeting}, soy tu asistente de Trading Academy — tu compañero de trading esta ${period}.`,
      `${timeGreeting}. Tu mentor en Trading Academy te da la bienvenida esta ${period}.`,
      `${timeGreeting}! Aquí tu tutor de Trading Academy: preparado para ayudarte en esta ${period}.`,
      `${timeGreeting}, bienvenido — soy tu asistente personal de Trading Academy para esta ${period}.`,
      `${timeGreeting}! Tu coach de trading está online esta ${period}. ¿Listo para mejorar?`,
      `${timeGreeting}. Soy el asistente de Trading Academy: vamos a aprovechar esta ${period} para aprender.`,
      `${timeGreeting}! Tu guía de trading te saluda esta ${period}, ¿por dónde empezamos?`,
      `${timeGreeting}. ¡Hola! Tu tutor de Trading Academy está aquí para ayudarte esta ${period}.`
    ];

    const greetingLine = pick(greetingTemplates);
    // Elegir dos colores distintos para saludo y texto
    let greetingColor = pick(colors);
    let textColor = pick(colors);
    let attempts = 0;
    while (textColor === greetingColor && attempts < 8) {
      textColor = pick(colors);
      attempts++;
    }
    const emoji = pick(emojis);

    return {
      greeting: greetingLine,
      message: selectedMessage,
      greetingColor,
      textColor,
      emoji
    };
  };

  // Cargar saludo inicial
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const dynamicGreeting = generateDynamicGreeting();
      setMessages([{ 
        id: "init", 
        role: "assistant", 
        content: dynamicGreeting.message,
        greeting: dynamicGreeting.greeting,
        greetingColor: dynamicGreeting.greetingColor,
        textColor: dynamicGreeting.textColor,
        emoji: dynamicGreeting.emoji
      }]);
    }
  }, [isOpen, messages.length]);

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mantener sendMessage siempre actualizado para usarlo dentro del reconocimiento de voz
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  });

  // Al cerrar el chat, detener la conversación por voz
  useEffect(() => {
    if (!isOpen && conversationModeRef.current) {
      conversationModeRef.current = false;
      isSpeakingRef.current = false;
      processingRef.current = false;
      try { recognitionRef.current?.stop(); } catch {}
      if (typeof window !== "undefined") window.speechSynthesis.cancel();
      releaseWakeLock();
      setIsRecording(false);
    }
  }, [isOpen]);

  // --- FUNCIONES DE VOZ ---
  const getCombinedText = (msg: Message) => {
    const greeting = (msg.greeting || "").trim();
    let content = (msg.content || "").trim();

    if (greeting) {
      // Si el contenido empieza por el saludo (posible duplicado), lo eliminamos
      const normalizedGreeting = greeting.replace(/[\s\.",!¡¿?–—:-]/g, "").toLowerCase();
      const normalizedContentStart = content.slice(0, Math.min(content.length, greeting.length + 10)).replace(/[\s\.",!¡¿?–—:-]/g, "").toLowerCase();
      if (normalizedContentStart.startsWith(normalizedGreeting)) {
        // quitar la primera aparición del saludo en el contenido
        content = content.replace(new RegExp('^' + greeting.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '[\s\.:,-–—]*', 'i'), '').trim();
      }
    }
    return `${greeting ? greeting + "." : ""} ${content}`.trim();
  };

  const copyMessage = async (msg: Message) => {
    const textToCopy = msg.role === 'assistant' ? getCombinedText(msg) : (msg.content || '');
    await copyToClipboard(textToCopy);
  };
  const startReading = (messageId: string, content: string, fromIndex: number = 0) => {
    if (typeof window === "undefined" || !content) return;
    window.speechSynthesis.cancel();
    
    const words = content.split(/\s+/);
    const textToRead = words.slice(fromIndex).join(" ").replace(EMOJI_RE, "").replace(/[•▪◦●]/g, " ").replace(/\s+/g, " ").trim();
    
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = "es-ES";
    utterance.rate = 1;
    
    setReadingMessageId(messageId);
    setReadingWordIndex(fromIndex);
    
    let charIndex = 0;
    const wordLengths = words.map(w => w.length);
    
    utterance.onboundary = (event: any) => {
      if (event.name === "word") {
        let wordCount = 0;
        let currentChar = 0;
        for (let i = 0; i < words.length; i++) {
          const word = words[i].replace(EMOJI_RE, "");
          if (word.length > 0) {
            if (currentChar >= event.charIndex) {
              wordCount = i;
              break;
            }
            currentChar += word.length + 1;
          }
        }
        setReadingWordIndex(fromIndex + wordCount);
      }
    };  
    
    utterance.onend = () => {
      setReadingMessageId(null);
      setReadingWordIndex(0);
    };
    
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopReading = () => {
    window.speechSynthesis.cancel();
    setReadingMessageId(null);
    setReadingWordIndex(0);
  };

  const toggleReadMessage = (msg: Message) => {
    const combined = getCombinedText(msg);
    if (readingMessageId === msg.id) {
      stopReading();
    } else {
      startReading(msg.id, combined);
    }
  };

  const handleWordClick = (msg: Message, wordIdx: number) => {
    const combined = getCombinedText(msg);
    startReading(msg.id, combined, wordIdx);
  };

  const handleWordDoubleClick = (msg: Message, wordIdx: number) => {
    const combined = getCombinedText(msg);
    startReading(msg.id, combined, wordIdx);
  };

  // --- WAKE LOCK: mantener la pantalla activa durante la conversación ---
  const requestWakeLock = async () => {
    try {
      if (typeof navigator !== "undefined" && "wakeLock" in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
      }
    } catch (e) {
      // Si falla (p. ej. sin permiso o no soportado), la conversación sigue igual
    }
  };

  const releaseWakeLock = () => {
    try {
      wakeLockRef.current?.release?.();
    } catch (e) {}
    wakeLockRef.current = null;
  };

  // Readquirir el wake lock si el usuario vuelve a la pestaña con la conversación activa
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible" && conversationModeRef.current && !wakeLockRef.current) {
        requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // --- VOZ DEL BOT (respuesta hablada en modo conversación) ---
  const speakReply = (text: string) => {
    if (typeof window === "undefined") return;
    const clean = (text || "")
      .replace(EMOJI_RE, "")
      .replace(/[•▪◦●]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const resumeListening = () => {
      isSpeakingRef.current = false;
      if (conversationModeRef.current) {
        try { recognitionRef.current?.start(); } catch {}
      }
    };

    if (!clean) {
      resumeListening();
      return;
    }

    isSpeakingRef.current = true;
    // Silenciar el micrófono mientras el bot habla (evita que se escuche a sí mismo)
    try { recognitionRef.current?.stop(); } catch {}
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "es-ES";
    utterance.rate = 1;
    utterance.onend = resumeListening;
    utterance.onerror = resumeListening;
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // --- FUNCIONES DE MICRÓFONO (conversación continua manos libres) ---
  const toggleMic = () => {
    if (!micSupported) return;
    if (conversationModeRef.current) {
      // Desactivar conversación
      conversationModeRef.current = false;
      isSpeakingRef.current = false;
      processingRef.current = false;
      try { recognitionRef.current?.stop(); } catch {}
      window.speechSynthesis.cancel();
      releaseWakeLock();
      setIsRecording(false);
      setMicError(null);
    } else {
      // Activar conversación
      try {
        conversationModeRef.current = true;
        recognitionRef.current?.start();
        requestWakeLock();
        setIsRecording(true);
        setMicError(null);
      } catch (e) {
        conversationModeRef.current = false;
        setMicError("Inicia con un clic primero");
      }
    }
  };

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) {
      // Evita quedarse bloqueado si se llamó desde la voz mientras se procesaba
      processingRef.current = false;
      if (conversationModeRef.current && !isSpeakingRef.current) {
        try { recognitionRef.current?.start(); } catch {}
      }
      return;
    }
    setInput("");
    const userMessage: Message = { id: Date.now().toString(), role: "user", content: msg };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    let replyText = "";
    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, conversationHistory: messages.slice(-10).map(m => ({ role: m.role, content: m.content })) }),
      });
      if (!response.ok) throw new Error("Error");
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      replyText = cleanMarkdown(data.content);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: replyText }]);
    } catch (error) {
      console.error("Error:", error);
      replyText = "Lo siento, tuve un problema al procesar. ¿Puedes repetirlo?";
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: replyText }]);
    } finally {
      setIsLoading(false);
      processingRef.current = false;
      // En modo conversación, el bot responde con voz y luego vuelve a escuchar
      if (conversationModeRef.current) {
        speakReply(replyText);
      }
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al subir archivo');
      const fileMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: `📎 Archivo adjunto: ${file.name}\n\nPor favor, analiza este archivo.`,
        fileUrl: data.url,
        fileType: data.fileType,
      };
      // Añadir mensaje con preview inmediatamente
      setMessages(prev => [...prev, fileMessage]);
      setInput('');
      // Dejar de mostrar 'Subiendo...' y lanzar el análisis en background
      setIsUploading(false);
      analyzeFile(data.url, file.name).catch(err => console.error('analyzeFile error:', err));
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error al subir el archivo: ' + (error as Error).message);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
      setIsUploading(false);
    }
  };

  const analyzeFile = async (fileUrl: string, fileName: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Analiza este archivo: ${fileName} (${fileUrl})`,
          conversationHistory: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
          fileUrl: fileUrl,
          fileName: fileName
        }),
      });
      if (!response.ok) throw new Error("Error en la respuesta");
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: cleanMarkdown(data.content) }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: "Lo siento, tuve un problema analizando el archivo. Por favor intenta nuevamente." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- CONTROLES DE VENTANA ---
  const toggleMaximize = () => {
    if (isMaximized) {
      setIsMaximized(false);
      setSize({ width: 380, height: 600 });
    } else {
      setIsMaximized(true);
      setSize({ width: window.innerWidth - 40, height: window.innerHeight - 80 });
    }
  };

  // --- RENDER ---
  return (
    <>
      {/* Botón flotante para abrir/cerrar */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            drag dragListener={false} dragControls={dragControls}
            style={{
              position: "fixed",
              left: isMaximized ? 20 : (typeof window !== "undefined" ? window.innerWidth - 390 : "auto"), 
              top: isMaximized ? 20 : (typeof window !== "undefined" ? window.innerHeight - 610 : "auto"),
              width: size.width,
              height: size.height,
              zIndex: 50,
            }}
            className="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-700"
          >
            {/* HEADER CON CONTROLES - Zona de arrastre */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 p-4 select-none cursor-grab active:cursor-grabbing" onPointerDown={(e) => dragControls.start(e)}>
              {/* Primera fila: Título */}
              <div className="flex items-center gap-3 mb-3">
                <Bot className="text-white flex-shrink-0" size={28} />
                <div>
                  <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-100 via-cyan-200 to-white font-extrabold text-xl leading-tight">
                    Asistente Trading Academy
                  </h3>
                  <p className="text-emerald-100 text-xs font-medium">En línea</p>
                </div>
              </div>
              
              {/* Segunda fila: Controles */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                {/* Micrófono */}
                <button 
                  onClick={toggleMic}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isRecording ? "bg-red-500 text-white animate-pulse" : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                  title={isRecording ? "Detener conversación por voz" : "Iniciar conversación por voz (manos libres)"}
                >
                  {isRecording ? <PhoneOff size={14} /> : <Mic size={14} />}
                  {isRecording ? "Detener" : "Conversar"}
                </button>
                
                {/* Zoom + Maximizar + Cerrar */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-black/20 rounded-full px-1 py-1 border border-white/10 cursor-default">
                    <button onClick={(e) => { e.stopPropagation(); setFontSize(p => Math.max(60, p - 10)); }} className="text-white hover:text-emerald-200 px-2 py-1 text-xs font-bold cursor-pointer select-none">A-</button>
                    <span className="text-white/90 text-[10px] w-8 text-center font-medium">{fontSize}%</span>
                    <button onClick={(e) => { e.stopPropagation(); setFontSize(p => Math.min(200, p + 10)); }} className="text-white hover:text-emerald-200 px-2 py-1 text-xs font-bold cursor-pointer select-none">A+</button>
                  </div>
                  <button onClick={toggleMaximize} className="text-white/70 hover:text-white p-1.5 bg-white/10 rounded-lg transition-colors">
                    {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                  <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-red-300 p-1.5 bg-white/10 rounded-lg transition-colors">
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Error de Micrófono */}
            {micError && (
              <div className="bg-red-500/20 text-red-300 text-xs p-2 text-center border-b border-red-500/30 animate-pulse">
                ⚠️ {micError}
              </div>
            )}

            {/* MENSAJES */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/95 scrollbar-thin scrollbar-thumb-slate-700 select-text">
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div
                      className="p-1.5 rounded-full h-fit mt-1 flex-shrink-0 shadow-lg flex items-center justify-center"
                      style={{ backgroundColor: msg.greetingColor || msg.color || "#10B981" }}
                    >
                      <span style={{ fontSize: 16 }}>{msg.emoji || "🤖"}</span>
                    </div>
                  )}
                  
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm transition-all ${
                    msg.role === "user" 
                      ? "bg-emerald-600 text-white rounded-br-md shadow-lg shadow-emerald-900/30" 
                      : "bg-slate-800 rounded-bl-md border border-slate-700 shadow-lg"
                  }`} style={{ fontSize: `${(fontSize / 100) * 14}px`, userSelect: "text !important" as any, cursor: "text !important" as any }}>
                    {msg.role === "assistant" ? (
                      <div className="space-y-3">
                        {/* Saludo en color distintivo - también resaltable al leer */}
                        {msg.greeting && (() => {
                          const greetingWords = msg.greeting.trim().split(/\s+/).filter(Boolean);
                          return (
                            <div style={{ fontWeight: 600, marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${msg.greetingColor ? msg.greetingColor + "30" : "rgba(16,185,129,0.2)"}` }}>
                              {greetingWords.map((word, idx) => {
                                const isActive = readingMessageId === msg.id && readingWordIndex === idx;
                                return (
                                  <span
                                    key={"g" + idx}
                                    className={`inline-block cursor-pointer rounded px-0.5 transition-all duration-150 ${
                                      isActive ? "bg-emerald-400 text-slate-950 font-bold scale-105 shadow-sm" : "hover:bg-white/10"
                                    }`}
                                    onClick={() => handleWordClick(msg, idx)}
                                    onDoubleClick={() => handleWordDoubleClick(msg, idx)}
                                    style={{ color: isActive ? undefined : (msg.greetingColor || undefined) }}
                                  >
                                    {word}{" "}
                                  </span>
                                );
                              })}
                            </div>
                          );
                        })()}
                        
                        {/* Contenido del mensaje */}
                        {/* Vista previa de archivo si existe */}
                        {msg.fileUrl && (
                          <div className="mb-2">
                            {msg.fileType?.startsWith('image') ? (
                              <img src={msg.fileUrl} alt={msg.content} className="max-w-full rounded-lg border border-slate-700" />
                            ) : (
                              <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="text-cyan-300 underline">Ver archivo</a>
                            )}
                          </div>
                        )}

                        <div className="leading-relaxed chat-text-selectable" onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
                          {(() => {
                            const greeting = (msg.greeting || "").trim();
                            let content = (msg.content || "").trim();
                            // Evitar duplicación: si content arranca con greeting, lo eliminamos
                            if (greeting) {
                              const re = new RegExp('^' + greeting.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '[\\s\\.:,-–—]*', 'i');
                              content = content.replace(re, '').trim();
                            }
                            const greetingWords = greeting ? greeting.split(/\s+/).filter(Boolean) : [];
                            const contentWords = content ? content.split(/\s+/).filter(Boolean) : [];
                            // Renderizamos solo el cuerpo (contentWords) para evitar duplicar el saludo
                            return contentWords.map((word, idx) => {
                              const combinedIdx = greetingWords.length + idx; // índice relativo al texto combinado
                              const isActive = readingMessageId === msg.id && readingWordIndex === combinedIdx;
                              return (
                                <span
                                  key={combinedIdx}
                                  className={`inline-block cursor-pointer rounded px-0.5 transition-all duration-150 ${
                                    isActive ? "bg-emerald-400 text-slate-950 font-bold scale-105 shadow-sm" : "hover:bg-white/10"
                                  }`}
                                  onClick={() => handleWordClick(msg, combinedIdx)}
                                  onDoubleClick={() => handleWordDoubleClick(msg, combinedIdx)}
                                  style={{ color: isActive ? undefined : BODY_TEXT_COLOR }}
                                >
                                  {word}{" "}
                                </span>
                              );
                            });
                          })()}
                        </div>
                        
                        {/* Botones: Escuchar + Copiar */}
                        <div className="relative flex gap-2 mt-2 pt-2 border-t border-slate-700">
                          <button
                            onClick={() => toggleReadMessage(msg)}
                            className="flex-1 flex items-center justify-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            {readingMessageId === msg.id ? <Square size={14} /> : <Play size={14} />}
                            {readingMessageId === msg.id ? "Detener" : "Escuchar"}
                          </button>
                          <button
                            onClick={() => copyMessage(msg)}
                            className="flex-1 flex items-center justify-center gap-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            📋 Copiar
                          </button>
                          {showCopied && (
                            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg animate-fade-in">
                              ✓ COPIADO
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        {msg.fileUrl && (
                          <div className="mb-2">
                            {msg.fileType?.startsWith('image') ? (
                              <img src={msg.fileUrl} alt={msg.content} className="max-w-full rounded-lg border border-slate-700" />
                            ) : (
                              <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="text-cyan-300 underline">Ver archivo</a>
                            )}
                          </div>
                        )}
                        {editingMessageId === msg.id ? (
                          <div className="mt-2">
                            <textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                              rows={4}
                            />
                            <div className="flex gap-2 mt-2">
                              <button onClick={() => {
                                // Guardar edición
                                setMessages(prev => prev.map(m => m.id === editingMessageId ? { ...m, content: editingText } : m));
                                setEditingMessageId(null);
                                setEditingText("");
                              }} className="bg-emerald-600 text-white px-3 py-1 rounded">Guardar</button>
                              <button onClick={() => { setEditingMessageId(null); setEditingText(""); }} className="bg-slate-700 text-white px-3 py-1 rounded">Cancelar</button>
                            </div>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap" style={{ userSelect: "text", cursor: "text" }}>{msg.content}</div>
                        )}
                        <div className="relative flex gap-2 mt-2 pt-2 border-t border-slate-700">
                          {/* Copiar para mensaje de usuario */}
                          <div className="flex-1" />
                          <button
                            onClick={() => copyMessage(msg)}
                            className="flex items-center gap-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            📋 Copiar
                          </button>
                          {/* Editar solo para mensajes user */}
                          <button
                            onClick={() => { setEditingMessageId(msg.id); setEditingText(msg.content || ""); }}
                            className="flex items-center gap-2 text-xs text-amber-300 hover:text-amber-200 transition-colors"
                          >
                            ✏️ Editar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {msg.role === "user" && (
                    <div className="bg-slate-700 p-1.5 rounded-full h-fit mt-1 flex-shrink-0">
                      <User className="text-white" size={16} />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="p-3 border-t border-slate-700 bg-slate-900">
              {/* Input de archivo oculto */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                className="hidden"
              />
              
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-cyan-400 hover:text-cyan-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Paperclip size={16} />
                  {isUploading ? 'Subiendo...' : 'Adjuntar archivo'}
                </button>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder="Escribe tu pregunta..."
                  className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  disabled={isLoading || isUploading}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={isLoading || !input.trim() || isUploading}
                  className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-500 disabled:opacity-50 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}