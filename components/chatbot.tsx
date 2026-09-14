"use client";

import { useState, useRef, useEffect, useCallback, ChangeEvent, ClipboardEvent, memo, MutableRefObject } from "react";
import { ConversacionVoz, type EstadoVoz } from "@/lib/voz/conversacion";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import {
  MessageCircle, X, Send, Bot, User, Volume2, Mic, MicOff,
  Maximize2, Minimize2, Square, Play, PhoneOff, Paperclip, FileText
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  greeting?: string;
  color?: string;
  emoji?: string;
  fileUrl?: string;
  fileType?: string;
  /** Todas las imágenes de ese mensaje, para poder recordarlas después. */
  archivos?: { url: string; fileName?: string; fileType?: string }[];
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
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, "").trim())
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    // Los ENLACES [texto](url) se CONSERVAN para que salgan clicables (ej. "Ir a WhatsApp").
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*\*([^*]+)\*\*\*/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .replace(/[*#`~]{1,}/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Respeta los saltos de línea sencillos.
 *
 * ── El fallo que arregla ──────────────────────────────────────────────────
 * En markdown, un salto de línea suelto NO es un salto: se convierte en un
 * espacio, y solo una línea en blanco separa párrafos. Así que cuando el
 * asistente devolvía una lista en vertical —cada cifra en su renglón— el chat
 * la pintaba toda seguida en horizontal.
 *
 * Durante un rato pareció que el modelo no obedecía "dámelo en vertical", y
 * lo estaba obedeciendo: lo aplastábamos nosotros al pintarlo.
 *
 * Es lo que hace el complemento `remark-breaks`; se escribe aquí en diez
 * líneas para no añadir otra dependencia por esto.
 */
function saltosDeLinea() {
  const recorrer = (nodo: any) => {
    if (!nodo || !Array.isArray(nodo.children)) return;

    const nuevos: any[] = [];
    for (const hijo of nodo.children) {
      // Dentro del código el salto ya se respeta: tocarlo lo estropearía.
      if (hijo.type === 'text' && typeof hijo.value === 'string' && hijo.value.includes('\n')) {
        const trozos = hijo.value.split('\n');
        trozos.forEach((t: string, i: number) => {
          if (i > 0) nuevos.push({ type: 'break' });
          if (t) nuevos.push({ type: 'text', value: t });
        });
      } else {
        recorrer(hijo);
        nuevos.push(hijo);
      }
    }
    nodo.children = nuevos;
  };

  return (arbol: any) => { recorrer(arbol); };
}

/**
 * Saca el texto de lo que va a pintarse, sea lo que sea.
 *
 * Cada palabra viene envuelta en su propio `<span>` para poder resaltarla al
 * leer en voz alta, así que el contenido está varios niveles adentro y no se
 * puede mirar directamente.
 */
function textoPlano(nodo: any): string {
  if (nodo == null || typeof nodo === 'boolean') return '';
  if (typeof nodo === 'string' || typeof nodo === 'number') return String(nodo);
  if (Array.isArray(nodo)) return nodo.map(textoPlano).join('');
  if (nodo?.props?.children) return textoPlano(nodo.props.children);
  return '';
}

/** Una cifra suelta: -10.28, 1.234,56, 24.33, 80% … */
const ES_CIFRA = /^[-+−]?\s?\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d+)?\s?%?$/;

// --- RENDERIZADO DE MARKDOWN ENRIQUECIDO ---
// Títulos grandes y con color, negritas, listas, tablas, citas y emojis. Cada línea
// va en un color distinto (cicla por una paleta). Las palabras se envuelven en
// <span class="cj-word wi-N"> para resaltar (cj-active) la que se está leyendo.
const LINE_COLORS = [
  "#7DD3FC", "#86EFAC", "#FCD34D", "#F0ABFC", "#FDA4AF",
  "#A5B4FC", "#5EEAD4", "#FDBA74", "#C4B5FD", "#6EE7B7",
  "#FCA5A5", "#93C5FD", "#F9A8D4", "#FDE68A", "#67E8F9",
];

// Semilla por mensaje: cada mensaje ARRANCA en un color distinto de la paleta,
// para que no todos empiecen por el mismo tono (más diversidad entre mensajes).
function colorSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % LINE_COLORS.length;
}

// Plugin (rehype): parte cada texto en palabras envueltas en <span class="cj-word wi-N">,
// en ORDEN del documento. A la palabra activa (activeIndex) le añade "cj-active".
function makeWordSplitter(words: string[], activeIndex: number) {
  return () => (tree: any) => {
    const SKIP = new Set(["code", "pre"]);
    const visit = (node: any) => {
      if (!node || !Array.isArray(node.children)) return;
      if (node.tagName && SKIP.has(node.tagName)) return;
      const out: any[] = [];
      for (const child of node.children) {
        if (child.type === "text") {
          const parts = child.value.split(/(\s+)/);
          for (const part of parts) {
            if (part === "") continue;
            if (/^\s+$/.test(part)) { out.push({ type: "text", value: part }); continue; }
            const i = words.length;
            words.push(part);
            const cls = ["cj-word", `wi-${i}`];
            if (i === activeIndex) cls.push("cj-active");
            out.push({ type: "element", tagName: "span", properties: { className: cls }, children: [{ type: "text", value: part }] });
          }
        } else {
          visit(child);
          out.push(child);
        }
      }
      node.children = out;
    };
    visit(tree);
  };
}

interface MarkdownProps {
  text: string;
  msgId: string;
  wordsRef: MutableRefObject<Record<string, string[]>>;
  activeIndex: number;
}

const Markdown = memo(function Markdown({ text, msgId, wordsRef, activeIndex }: MarkdownProps) {
  const words: string[] = [];
  wordsRef.current[msgId] = words;
  const wordSplitter = makeWordSplitter(words, activeIndex);
  // Arranca en un color distinto por mensaje; líneas consecutivas nunca repiten color.
  let lineIdx = colorSeed(msgId);
  const nextColor = () => LINE_COLORS[lineIdx++ % LINE_COLORS.length];

  const components: Record<string, any> = {
    h1: ({ children }: any) => (
      <h1 className="text-[2em] font-black text-emerald-300 mt-4 mb-2 pb-1.5 border-b-2 border-emerald-400/40 tracking-tight leading-tight" style={{ textShadow: "0 0 14px rgba(16,185,129,0.45)" }}>{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-[1.7em] font-extrabold text-cyan-300 mt-4 mb-2 tracking-tight leading-tight" style={{ textShadow: "0 0 12px rgba(34,211,238,0.4)" }}>{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-[1.4em] font-bold text-violet-300 mt-3 mb-1.5 leading-snug" style={{ textShadow: "0 0 10px rgba(167,139,250,0.4)" }}>{children}</h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-[1.2em] font-bold text-amber-300 mt-2 mb-1 leading-snug">{children}</h4>
    ),
    /**
     * Párrafo normal… salvo que sea una columna de cifras.
     *
     * ── Por qué ───────────────────────────────────────────────────────────
     * Puestas una debajo de otra, "-10.28", "-6.46" y "24.33" quedaban
     * descuadradas: el signo menos y los dígitos de más empujan cada línea a
     * un sitio distinto, y una columna de números que no cuadra por el punto
     * decimal no se puede leer de un vistazo — que es justo para lo que se
     * pide en vertical.
     *
     * Cuando TODAS las líneas del párrafo son cifras, cada una se mete en una
     * caja del mismo ancho alineada a la derecha, con dígitos de anchura fija
     * (`tabular-nums`). Así los puntos decimales caen en la misma vertical.
     * Si el párrafo mezcla texto y números, se deja tal cual: alinear a la
     * derecha una frase quedaría raro.
     */
    p: ({ children }: any) => {
      const color = nextColor();
      const hijos: any[] = Array.isArray(children) ? children : [children];

      // Las líneas vienen separadas por <br> (los pone el complemento de saltos).
      const lineas: any[][] = [[]];
      for (const h of hijos) {
        if (h && typeof h === 'object' && (h as any).type === 'br') lineas.push([]);
        else lineas[lineas.length - 1].push(h);
      }

      const conTexto = lineas.filter((l) => textoPlano(l).trim());
      const esColumna =
        conTexto.length > 1 && conTexto.every((l) => ES_CIFRA.test(textoPlano(l).trim()));

      if (!esColumna) {
        return <p className="leading-relaxed my-2" style={{ color }}>{children}</p>;
      }

      return (
        <p className="leading-relaxed my-2" style={{ color }}>
          {conTexto.map((linea, i) => (
            <span
              key={i}
              style={{
                display: 'block',
                width: '9ch',
                textAlign: 'right',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {linea}
            </span>
          ))}
        </p>
      );
    },
    strong: ({ children }: any) => <strong className="font-bold text-white">{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,
    del: ({ children }: any) => <del className="text-slate-500">{children}</del>,
    ul: ({ children }: any) => <ul className="list-disc pl-5 my-2 space-y-1 marker:text-emerald-400">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal pl-5 my-2 space-y-1 marker:text-emerald-400">{children}</ol>,
    li: ({ children }: any) => <li className="leading-relaxed pl-1" style={{ color: nextColor() }}>{children}</li>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-emerald-400 bg-emerald-500/10 pl-3 pr-2 py-1.5 my-2 rounded-r-lg italic text-emerald-100">{children}</blockquote>
    ),
    a: ({ children, href }: any) => (
      <a href={href} target="_blank" rel="noreferrer" className="inline-block font-bold text-green-400 underline decoration-green-500/60 hover:text-green-300 break-words">{children}</a>
    ),
    hr: () => <hr className="border-slate-700 my-3" />,
    code: ({ className, children }: any) => {
      const txt = String(children ?? "");
      const isBlock = /language-/.test(className || "") || txt.includes("\n");
      return isBlock
        ? <code className="block text-[0.85em] font-mono text-emerald-200 leading-relaxed whitespace-pre">{children}</code>
        : <code className="bg-slate-700 text-amber-200 px-1.5 py-0.5 rounded text-[0.9em] font-mono">{children}</code>;
    },
    pre: ({ children }: any) => <pre className="bg-slate-950 border border-slate-700 p-3 rounded-lg overflow-x-auto my-2">{children}</pre>,
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-3 rounded-lg border border-slate-700">
        <table className="w-full border-collapse text-[0.9em]">{children}</table>
      </div>
    ),
    thead: ({ children }: any) => <thead className="bg-slate-700">{children}</thead>,
    tr: ({ children }: any) => <tr className="even:bg-slate-800/40">{children}</tr>,
    th: ({ children }: any) => <th className="px-3 py-2 text-left font-semibold text-emerald-200 border border-slate-600 whitespace-nowrap">{children}</th>,
    td: ({ children }: any) => <td className="px-3 py-2 border border-slate-700 align-top" style={{ color: nextColor() }}>{children}</td>,
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm, saltosDeLinea]} rehypePlugins={[wordSplitter]} components={components}>
      {text}
    </ReactMarkdown>
  );
}, (a, b) =>
  a.text === b.text && a.msgId === b.msgId && a.wordsRef === b.wordsRef && a.activeIndex === b.activeIndex
);

// Prompt de VENTAS/ATRACCIÓN para desconocidos (botón "Activa tu Aliado").
// No es tutor: indaga, conecta y vende la plataforma con mensajes CORTOS.
/**
 * Interruptor del motor de voz.
 *
 * En `true` usa la conversación en tiempo real (WebRTC contra OpenAI). En
 * `false` vuelve al camino anterior —reconocimiento del navegador y MP3 por
 * frase—, que sigue intacto. Se deja así para poder volver atrás en un
 * segundo si el modelo en tiempo real diera problemas en algún navegador, sin
 * tener que revertir código.
 */
const VOZ_TIEMPO_REAL = true;

/**
 * Cómo debe COMPORTARSE al hablar, no quién es.
 *
 * La personalidad completa vive en el servidor y es la misma para el chat
 * escrito. Aquí solo van las reglas propias de una conversación hablada: al
 * oído cansan las listas, los títulos y los párrafos largos.
 */
const VOZ_SYSTEM_PROMPT = [
  'Eres CJ, tutor de Trading Academy, en una conversación HABLADA.',
  'Responde como se habla: frases cortas, sin listas, sin markdown, sin títulos.',
  'De dos a cuatro frases por turno. Si el tema es largo, da lo esencial y pregunta si quiere que profundices.',
  'No saludes ni te presentes en cada turno: la conversación ya está en marcha.',
  'Si te interrumpen, para y atiende lo nuevo; no retomes lo que estabas diciendo salvo que te lo pidan.',
  'Si no entiendes algo, pregunta en una frase en vez de suponer.',
  'Si te preguntan quién te creó: CJ Junior Cabrera, fundador de Nesux Global Business RD.',
].join(' ');

const ALIADO_SYSTEM_PROMPT = "Eres CJ en MODO ALIADO (ventas y atracción), hablando con un VISITANTE NUEVO que aún no te conoce. Objetivo: conocerlo e interesarlo para que se una a Trading Academy. REGLAS: 1. Mensajes MUY CORTOS (1-3 frases). 2. Haz SIEMPRE una pregunta para conocerlo (nivel, meta, capacidad, qué lo frena, interés). 3. Nunca repitas el mismo encabezado, palabra de apertura ni idea; varía el tono en cada respuesta. 4. Conecta como un amigo cercano, cálido y directo — nada de párrafos ni clases largas. 5. Ve sembrando el valor de la plataforma (método, guía, comunidad) sin sonar a spam. 6. Cuando muestre interés real, invítalo suavemente a dejar sus datos o dar el siguiente paso. NO des clases técnicas largas aquí; eso es del modo tutor.";

// Contexto de la página donde está el bot: se enfoca en ella sin perder lo global.
function getPageContext(): string {
  if (typeof window === "undefined") return "";
  const p = (window.location?.pathname || "/").toLowerCase();
  const title = (typeof document !== "undefined" ? document.title : "") || "";
  let area = "la página principal (inicio)";
  if (p.includes("curso")) area = "la sección de CURSOS";
  else if (p.includes("bot")) area = "la sección de BOTS de trading";
  else if (p.includes("metodo") || p.includes("método")) area = "la sección del MÉTODO";
  else if (p.includes("testimonio")) area = "la sección de TESTIMONIOS";
  else if (p.includes("precio") || p.includes("plan")) area = "la sección de PRECIOS/PLANES";
  else if (p.includes("contacto")) area = "la sección de CONTACTO";
  return `CONTEXTO DE PÁGINA: el visitante está viendo ${area} (ruta ${p}, título "${title}"). Enfócate en ESE tema; si te preguntan por otro asunto, atiéndelo sin problema, pero sin perder el conocimiento global de Trading Academy.`;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  // Archivo ya subido pero AÚN NO ENVIADO: se queda esperando a que escribas qué
  // quieres saber de él. Antes se enviaba solo al pegarlo y no daba tiempo a pedir nada.
  /**
   * Adjuntos en espera, en cola.
   *
   * Antes era UNO solo: pegar una segunda imagen borraba la primera sin avisar,
   * y no había forma de mandar dos capturas juntas —que es justo lo que se
   * necesita para comparar dos pantallas de operaciones—. Ahora se acumulan y
   * cada una se puede quitar por separado antes de enviar.
   */
  const [pending, setPending] = useState<{ url: string; fileName: string; fileType: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");
  
  // Control de lectura por mensaje
  const [readingMessageId, setReadingMessageId] = useState<string | null>(null);
  const [readingWordIndex, setReadingWordIndex] = useState<number>(0);
  // Palabras visibles por mensaje (las llena el renderizador Markdown) para alinear
  // la lectura con el resaltado, y temporizador de respaldo del resaltado.
  const wordsMapRef = useRef<Record<string, string[]>>({});
  const hlTimerRef = useRef<any>(null);
  const [readMenuId, setReadMenuId] = useState<string | null>(null); // menú "leer desde aquí / todo"
  const readQueueRef = useRef<string[]>([]); // cola para "leer todo" (mensaje tras mensaje)
  
  // Control de micrófono
  const [isRecording, setIsRecording] = useState(false);
  // Modo voz: en qué está el asistente y qué te ha entendido. Sustituye a la
  // caja de escribir mientras conversas, para que nada pase por el chat.
  const [voiceState, setVoiceState] = useState<"escuchando" | "pensando" | "hablando">("escuchando");
  /** Estado real de la máquina de voz. El de arriba es solo lo que se pinta. */
  const [voiceMachine, setVoiceMachine] = useState<EstadoVoz>("IDLE");
  const [voiceText, setVoiceText] = useState("");
  const [micSupported, setMicSupported] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  
  // Posición y tamaño
  const [size, setSize] = useState({ width: 380, height: 600 });
  const [isMaximized, setIsMaximized] = useState(false);
  const [fontSizePercentage, setFontSizePercentage] = useState(100);
  const [writingMessageId, setWritingMessageId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // --- Voz realista del servidor (TTS neuronal), igual que en Nesux VS Code ---
  // `genVozRef` es la clave de que no se dupliquen las lecturas: cada vez que
  // se empieza o se detiene una, sube en uno. Toda tarea que va por detrás (la
  // descarga del audio, los eventos del <audio>) guarda el número que había al
  // arrancar y se descarta sola si ya no es el vigente.
  const genVozRef = useRef(0);
  const audioVozRef = useRef<HTMLAudioElement | null>(null);
  // Reloj del subrayado. Va aparte del temporizador de la voz del navegador:
  // uno es requestAnimationFrame y el otro setTimeout, y mezclarlos en la misma
  // referencia hacía que cancelar uno no cancelara el otro.
  const rafVozRef = useRef<number | null>(null);

  // Conversación por voz: lo que llevas dicho y el silencio que se espera antes
  // de dar por terminada tu frase. 1,4 s deja pensar sin que se haga eterno.
  const fraseRef = useRef("");
  const pausaRef = useRef<any>(null);
  // Silencio que se espera para dar por terminada tu frase. Corto, para que
  // conteste enseguida: si te quedas pensando, sigue hablando y la cuenta se
  // reinicia sola con cada palabra nueva.
  const SILENCIO_MS = 800;

  // Lo que el asistente está diciendo AHORA, en palabras normalizadas.
  // Sirve para distinguir tu voz de la suya: con el micro abierto, el altavoz
  // le devuelve su propio audio y sin esto se interrumpía a sí mismo.
  const hablandoTextoRef = useRef<Set<string>>(new Set());

  /**
   * En modo voz la respuesta NO se escribe en el chat antes de decirla:
   * primero se conversa y el texto queda apuntado después, cuando termina de
   * hablar o cuando la interrumpes. Escribirla antes hacía que, al cortarla,
   * quedara en pantalla un bloque de texto que ella nunca llegó a decir.
   */
  const escribirPendienteRef = useRef<null | ((dicho: string) => void)>(null);

  // Lo que REALMENTE ha salido por el altavoz: los trozos ya reproducidos y la
  // parte del trozo en curso que se alcanzó a oír. Si la interrumpes, en el
  // chat queda esto y no el discurso entero que tenía preparado.
  const dichosRef = useRef<string[]>([]);
  const enCursoRef = useRef<{ texto: string; audio: HTMLAudioElement } | null>(null);

  const textoRealmenteDicho = () => {
    let dicho = dichosRef.current.join(" ");
    const c = enCursoRef.current;
    if (c && c.audio) {
      const d = c.audio.duration;
      const t = c.audio.currentTime;
      if (d && isFinite(d) && d > 0 && t > 0) {
        const palabras = c.texto.split(/\s+/).filter(Boolean);
        const hasta = Math.floor(palabras.length * Math.min(1, t / d));
        if (hasta > 0) dicho = (dicho + " " + palabras.slice(0, hasta).join(" ")).trim();
      }
    }
    return dicho.trim();
  };

  const volcarPendiente = () => {
    const f = escribirPendienteRef.current;
    escribirPendienteRef.current = null;
    const dicho = textoRealmenteDicho();
    dichosRef.current = [];
    enCursoRef.current = null;
    if (f) f(dicho);
  };
  // El altavoz sigue sonando unas décimas después de que el audio "termine".
  // Durante ese margen se mantiene el filtro de eco, o el asistente acaba
  // escribiendo la cola de su propia frase.
  const ecoHastaRef = useRef(0);
  const COLA_ECO_MS = 1500;

  const normalizar = (s: string) =>
    s.toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/).filter(Boolean);

  const filtrandoEco = () =>
    isSpeakingRef.current || Date.now() < ecoHastaRef.current;

  /**
   * ¿Lo que ha oído el micro es el eco del propio asistente?
   *
   * No basta con contar cuántas palabras son suyas: en una frase larga siempre
   * aparecen palabras distintas y se colaba como si hablaras tú. Lo que decide
   * es cuántas palabras NUEVAS traes: si no aportas al menos dos que él no
   * acabe de decir, es su voz rebotando por el altavoz.
   */
  const esEcoPropio = (texto: string) => {
    const dichas = hablandoTextoRef.current;
    if (!dichas.size) return false;
    const palabras = normalizar(texto);
    if (palabras.length < 2) return true;
    const nuevas = palabras.filter((p) => !dichas.has(p));
    // Palabras muy cortas (de, la, y, que…) no cuentan como aportación tuya.
    const nuevasReales = nuevas.filter((p) => p.length > 3);
    return nuevasReales.length < 2 || nuevas.length / palabras.length < 0.5;
  };
  const abortosVozRef = useRef<AbortController[]>([]);
  const pararVozRealRef = useRef<null | (() => void)>(null);
  const dragControls = useDragControls();

  // --- Persistencia de la conversación POR PERSONA (localStorage) ---
  // Evita que se reinicie: guarda y restaura la charla en cada dispositivo/persona.
  const sessionIdRef = useRef<string>("");
  const persistLoadedRef = useRef(false);
  // Modo "aliado" (ventas/atracción para desconocidos): lo activa el botón del Hero.
  const aliadoModeRef = useRef(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      let sid = localStorage.getItem("nx_chat_sid");
      if (!sid) {
        sid = "web-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        localStorage.setItem("nx_chat_sid", sid);
      }
      sessionIdRef.current = sid;
      const saved = localStorage.getItem("nx_chat_msgs_" + sid);
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr) && arr.length) setMessages(arr);
      }
    } catch {}
    persistLoadedRef.current = true;
  }, []);
  // Guarda la conversación cada vez que cambia (últimos 60 mensajes).
  useEffect(() => {
    if (typeof window === "undefined" || !persistLoadedRef.current || !sessionIdRef.current) return;
    try {
      localStorage.setItem("nx_chat_msgs_" + sessionIdRef.current, JSON.stringify(messages.slice(-60)));
    } catch {}
  }, [messages]);

  // Modo conversación continuo por voz (manos libres)
  const conversationModeRef = useRef(false);   // true mientras la conversación por voz esté activa
  const isSpeakingRef = useRef(false);          // true mientras el bot está hablando (TTS)
  const processingRef = useRef(false);          // true mientras se procesa una respuesta
  const sendMessageRef = useRef<(text?: string) => void>(() => {});
  const wakeLockRef = useRef<any>(null);        // evita que la pantalla se apague durante la conversación
  const resumedRef = useRef(false);             // evita reanudar la escucha dos veces por respuesta
  const speechWatchdogRef = useRef<any>(null);  // vigila que el TTS termine (bug de Chrome con onend)
  const keepAliveRef = useRef<any>(null);       // AudioContext silencioso para no "congelar" la pestaña

  // Inicializar micrófono
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "es-DO";
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

        // Mientras el asistente habla, el micro sigue abierto para poder
        // cortarle. Pero el altavoz le devuelve su propia voz, así que primero
        // hay que descartar el eco: si lo oído son sus palabras, se ignora.
        if (filtrandoEco()) {
          const oido = (interim + " " + finalText).trim();
          // Su propia voz: no se escribe, no se envía, no se muestra.
          if (!oido || esEcoPropio(oido)) return;
          // Eres tú: se calla EN EL ACTO y pasa a escucharte.
          pararVozReal();
          try { window.speechSynthesis.cancel(); } catch {}
          isSpeakingRef.current = false;
          ecoHastaRef.current = 0;
          hablandoTextoRef.current = new Set();
          fraseRef.current = "";
          setVoiceState("escuchando");
          // Se calla y queda escrito lo que iba a decir, para no perderlo.
          volcarPendiente();
        }

        // Se va acumulando lo dicho. En modo voz NO se escribe en el chat: se
        // muestra en el panel de voz, como hace cualquier asistente hablado.
        if (finalText) fraseRef.current = (fraseRef.current + " " + finalText).trim();
        const enVivo = (fraseRef.current + " " + interim).trim();
        if (conversationModeRef.current) { setVoiceState("escuchando"); setVoiceText(enVivo); }
        else setInput(enVivo);

        // NO se envía con la primera frase: eso te cortaba a media idea.
        // Se espera un silencio para dar por terminado lo que estabas diciendo,
        // igual que hace cualquier asistente de voz. Cada palabra nueva reinicia
        // la cuenta, así que puedes pensar y seguir hablando.
        if (pausaRef.current) clearTimeout(pausaRef.current);
        pausaRef.current = setTimeout(() => {
          const frase = fraseRef.current.trim();
          fraseRef.current = "";
          if (!frase || frase.split(/\s+/).length < 2) { setInput(""); setVoiceText(""); return; }
          processingRef.current = true;   // pausa el auto-reinicio mientras responde
          try { recognition.stop(); } catch {}
          setInput("");
          if (conversationModeRef.current) { setVoiceState("pensando"); setVoiceText(frase); }
          sendMessageRef.current(frase);
        }, SILENCIO_MS);
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
        // El micro sigue abierto TAMBIÉN mientras el asistente habla: es lo que
        // te deja cortarle a media frase. Su propia voz se descarta antes, en
        // onresult, comparándola con lo que está diciendo.
        if (conversationModeRef.current && !processingRef.current) {
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

    // Invitaciones EDUCATIVAS (sin inventar datos de mercado en tiempo real).
    const marketContexts = [
      "¿Quieres que repasemos cómo leer la estructura de un gráfico paso a paso?",
      "Podemos trabajar tu gestión de riesgo: stop loss, tamaño de posición y ratio riesgo/beneficio. ¿Te interesa?",
      "¿Te gustaría aprender a identificar soportes y resistencias con criterio?",
      "Puedo ayudarte a diferenciar el análisis técnico del fundamental. ¿Por dónde empezamos?",
      "¿Profundizamos en psicología y control emocional al operar?",
      "Podemos repasar los patrones de velas y qué significan realmente. ¿Te animas?",
      "¿Buscas construir un plan de trading sólido desde cero?",
      "Puedo explicarte cómo funcionan las sesiones del mercado y la liquidez. ¿Lo vemos?",
      "¿Quieres entender cómo definir tu ratio riesgo/beneficio antes de cada operación?",
      "Podemos analizar qué errores frenan a la mayoría de traders principiantes. ¿Te interesa?"
    ];
    
    const weekendMessages = [
      "Es fin de semana y los mercados están cerrados, pero es el momento perfecto para estudiar y prepararse. ¿Quieres repasar alguna estrategia o concepto?",
      "Aunque no hay trading hoy, podemos aprovechar para analizar operaciones pasadas o planificar la próxima semana. ¿Qué te gustaría hacer?",
      "Día de descanso del mercado. Perfecto para fortalecer tu conocimiento. ¿En qué tema quieres profundizar hoy?"
    ];
    
    const motivationalMessages = [
      "Recuerda: que el 95% de la gente que se dedican al trading pierden su dinero, pero tú estás aquí del lado del 5% que ganara consistentemente. ¿Cómo puedo ayudarte hoy?",
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
      `${timeGreeting}! Tu guía de trading te acompaña esta ${period}, ¿por dónde empezamos?`,
      `Soy CJ, tu tutor de Trading Academy. Cuéntame qué quieres dominar esta ${period}.`,
      `Aquí CJ, de Trading Academy. ¿Qué tema de trading exploramos esta ${period}?`,
      `Listo para ayudarte esta ${period}. Soy CJ, tu mentor de Trading Academy.`
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

  // Precargar la lista de voces para que getVoices() no esté vacío al leer.
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    const warm = () => synth.getVoices();
    warm();
    synth.addEventListener?.("voiceschanged", warm);
    return () => synth.removeEventListener?.("voiceschanged", warm);
  }, []);

  // App instalada (PWA): si la URL trae ?chat=1 (o #chat), abre el chat al entrar,
  // para que la app arranque directo en el asistente conversacional.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const u = new URL(window.location.href);
      if (u.searchParams.get("chat") === "1" || u.hash === "#chat") setIsOpen(true);
    } catch {}
  }, []);

  // Abrir el chat desde botones de las landings (evento global) con saludo propio opcional.
  const pendingGreetingRef = useRef<{ greeting?: string; message?: string } | null>(null);
  // Para saludar UNA vez por cada apertura del chat (aunque ya haya historial).
  const openGreetedRef = useRef(false);
  useEffect(() => {
    function onOpen(e: any) {
      const d = (e && e.detail) || {};
      if (d.mode === "aliado") {
        // Cada clic AÑADE un mensaje corto de atracción (distinto + color distinto),
        // SIN borrar la conversación existente: solo sube otro mensaje.
        aliadoModeRef.current = true;
        const color = d.color || "#8B5CF6";
        setMessages(prev => [...prev, {
          id: "aliado-" + Date.now(),
          role: "assistant",
          content: d.message || "¿Qué te trajo al trading hoy? 👀",
          greeting: d.greeting || "Tu aliado en el trading 🤝",
          greetingColor: color,
          textColor: color,
          emoji: "🤝",
        }]);
        setIsOpen(true);
        return;
      }
      aliadoModeRef.current = false;
      if (d.greeting || d.message) pendingGreetingRef.current = { greeting: d.greeting, message: d.message };
      setIsOpen(true);
    }
    window.addEventListener("nx-open-chat", onOpen as EventListener);
    return () => window.removeEventListener("nx-open-chat", onOpen as EventListener);
  }, []);

  // Saludo de BIENVENIDA cada vez que se ABRE el chat, haya o no historial.
  // (Antes solo saludaba con la conversación vacía; ahora también da la bienvenida
  //  al reabrir, como último mensaje.)
  useEffect(() => {
    if (!isOpen) { openGreetedRef.current = false; return; }
    if (isOpen && !openGreetedRef.current && persistLoadedRef.current) {
      openGreetedRef.current = true;
      const dynamicGreeting = generateDynamicGreeting();
      const custom = pendingGreetingRef.current;
      pendingGreetingRef.current = null;
      setMessages(prev => [...prev, {
        id: "greet-" + Date.now(),
        role: "assistant",
        content: (custom && custom.message) || dynamicGreeting.message,
        greeting: (custom && custom.greeting) || dynamicGreeting.greeting,
        greetingColor: dynamicGreeting.greetingColor,
        textColor: dynamicGreeting.textColor,
        emoji: dynamicGreeting.emoji
      }]);
    }
  }, [isOpen]);

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Al vaciarse el input (tras enviar), devolver el textarea a su altura de una línea
  useEffect(() => {
    if (input === "" && inputRef.current) inputRef.current.style.height = "auto";
  }, [input]);

  // Mantener sendMessage siempre actualizado para usarlo dentro del reconocimiento de voz
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  });

  // IMPORTANTE: la conversación por voz NO se detiene al cerrar la ventana del chat.
  // Sigue activa en segundo plano (manos libres) y solo se detiene cuando el usuario
  // pulsa "Detener" (toggleMic). Por eso aquí NO cortamos nada al cambiar isOpen.

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
  // === LECTURA POR VOZ (limpia): lee UNA vez y subraya lo que va leyendo ===
  // Usa EXACTAMENTE las palabras visibles que pintó el markdown (<span class="cj-word wi-N">).
  const readMessage = (msgId: string, fromIndex: number = 0) => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;

    if (hlTimerRef.current) { clearTimeout(hlTimerRef.current); hlTimerRef.current = null; }
    // En una lectura nueva no hay nada que cancelar; cancel()+speak() inmediato puede
    // duplicar el audio en algunos navegadores, así que solo cancelamos si ya había voz.
    const busy = synth.speaking || synth.pending;
    if (busy) synth.cancel();

    const words = wordsMapRef.current[msgId] || [];
    if (words.length === 0) return;
    const slice = words.slice(fromIndex);
    const cleanW = (w: string) => w.replace(EMOJI_RE, "").replace(/[•▪◦●]/g, "").trim();
    const spoken = slice.map(cleanW).filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
    if (!spoken) return;

    setReadingMessageId(msgId);
    setReadingWordIndex(fromIndex);

    // Primero se intenta la voz realista del servidor. Si no está disponible
    // (sin clave, sin red), sigue el camino de siempre con la del navegador.
    if (leerConVozReal(msgId, slice, fromIndex, cleanW)) return;

    const u = new SpeechSynthesisUtterance(spoken);
    u.lang = "es-DO";
    u.rate = 1;
    // Voz por defecto del navegador (la natural/"Online"): suena mejor. No forzamos
    // una voz local; si en Edge se duplica el audio, ya lo evita el control de `busy`.
    utteranceRef.current = u;
    const isCurrent = () => utteranceRef.current === u;

    // Resaltado preciso por onboundary (si la voz lo soporta).
    let boundaryWorks = false;
    u.onboundary = (e: any) => {
      if (!isCurrent() || e.name !== "word") return;
      boundaryWorks = true;
      let acc = 0, wi = 0;
      for (let i = 0; i < slice.length; i++) {
        const w = cleanW(slice[i]);
        if (!w) continue;
        if (acc >= e.charIndex) { wi = i; break; }
        acc += w.length + 1;
        wi = i;
      }
      setReadingWordIndex(fromIndex + wi);
    };

    // Resaltado de respaldo por temporizador (voces sin onboundary).
    let ti = 0;
    const advance = () => {
      if (!isCurrent() || boundaryWorks || ti >= slice.length) return;
      setReadingWordIndex(fromIndex + ti);
      const w = cleanW(slice[ti]) || slice[ti];
      const dur = Math.max(160, w.length * 70) / (u.rate || 1);
      ti++;
      hlTimerRef.current = setTimeout(advance, dur);
    };

    const done = () => {
      if (!isCurrent()) return;
      if (hlTimerRef.current) { clearTimeout(hlTimerRef.current); hlTimerRef.current = null; }
      utteranceRef.current = null;
      // ¿Modo "leer todo"? Encadenar el siguiente mensaje de la cola.
      if (readQueueRef.current.length > 0) {
        const nextId = readQueueRef.current.shift()!;
        setTimeout(() => readMessage(nextId, 0), 80);
        return;
      }
      setReadingMessageId(null);
      setReadingWordIndex(-1);
    };
    u.onend = done;
    u.onerror = (e: any) => {
      if (e?.error === "interrupted" || e?.error === "canceled") return;
      done();
    };

    hlTimerRef.current = setTimeout(advance, 300);

    if (busy) {
      // Veníamos de otra lectura: esperar a que cancel() surta efecto antes de hablar.
      setTimeout(() => { if (isCurrent()) { try { synth.speak(u); } catch {} } }, 130);
    } else {
      synth.speak(u);
    }
  };

  /**
   * Corta la voz realista: invalida la lectura en curso, aborta las descargas
   * que vengan en camino y para el audio. Sin esto, una petición lanzada antes
   * de pulsar "detener" llegaba después y se ponía a hablar sola.
   */
  const pararVozReal = useCallback(() => {
    genVozRef.current += 1;
    abortosVozRef.current.forEach((c) => { try { c.abort(); } catch {} });
    abortosVozRef.current = [];
    if (rafVozRef.current) { cancelAnimationFrame(rafVozRef.current); rafVozRef.current = null; }
    if (audioVozRef.current) {
      try { audioVozRef.current.pause(); audioVozRef.current.src = ""; } catch {}
      audioVozRef.current = null;
    }
  }, []);
  useEffect(() => { pararVozRealRef.current = pararVozReal; }, [pararVozReal]);

  // Cuánto texto se pide de una vez. Pedir el mensaje entero hacía que la
  // lectura tardase mucho en arrancar: había que esperar a que el servidor
  // generase TODO el audio. Con trozos cortos la primera frase suena enseguida
  // y las siguientes se descargan mientras tanto.
  const PALABRAS_1 = 22;   // el primer trozo, corto: manda la rapidez
  const PALABRAS_N = 55;   // los siguientes, más largos: manda la fluidez
  const RETARDO_VOZ = 0.22; // silencio inicial del audio, o el subrayado sale adelantado

  /**
   * Lee con la voz neuronal del servidor y subraya al ritmo real del audio.
   *
   * Devuelve false si no se puede intentar, para que el llamador siga con la
   * voz del navegador. El subrayado se calcula con el tiempo de reproducción
   * repartido entre las palabras según su longitud y las pausas de puntuación,
   * y se recalibra en cada trozo para que el desfase no se acumule.
   */
  const leerConVozReal = (
    msgId: string,
    slice: string[],
    fromIndex: number,
    cleanW: (w: string) => string
  ): boolean => {
    if (typeof window === "undefined" || !slice.length) return false;

    pararVozReal();
    const gen = ++genVozRef.current;
    isSpeakingRef.current = true;

    // Se agrupan las palabras en trozos, guardando su índice real para subrayar.
    const trozos: { desde: number; palabras: string[] }[] = [];
    let i = 0;
    while (i < slice.length) {
      const max = trozos.length === 0 ? PALABRAS_1 : PALABRAS_N;
      trozos.push({ desde: i, palabras: slice.slice(i, i + max) });
      i += max;
    }

    const pedir = (txt: string) => {
      const ctrl = new AbortController();
      abortosVozRef.current.push(ctrl);
      return fetch("/api/voz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: txt }),
        signal: ctrl.signal,
      }).then((r) => { if (!r.ok) throw new Error("tts"); return r.blob(); });
    };

    const vigente = () => gen === genVozRef.current;
    let siguiente: Promise<Blob> | null = null;

    const reproducir = (n: number) => {
      if (!vigente()) return;
      if (n >= trozos.length) {
        isSpeakingRef.current = false;
        setReadingMessageId(null);
        setReadingWordIndex(-1);
        avanzarCola();
        return;
      }

      const bloque = trozos[n];
      const limpias = bloque.palabras.map(cleanW);
      const texto = limpias.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
      if (!texto) { reproducir(n + 1); return; }

      const promesa = siguiente || pedir(texto);
      siguiente = null;

      promesa
        .then((blob) => {
          if (!vigente()) return;
          if (n + 1 < trozos.length) {
            const sig = trozos[n + 1].palabras.map(cleanW).filter(Boolean).join(" ").trim();
            if (sig) siguiente = pedir(sig).catch(() => null as any);
          }

          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audioVozRef.current = audio;

          // Peso de cada palabra: letras + pausas de puntuación. Sin contar las
          // pausas, el subrayado se adelanta al audio.
          const pesos = limpias.map((w, k) => {
            if (!w) return 0;
            const fin = w.charAt(w.length - 1);
            let pausa = 0;
            if (/[,;:]/.test(fin)) pausa = 5;
            else if (/[.!?…]/.test(fin)) pausa = 11;
            return w.length + 1 + pausa;
          });
          const total = pesos.reduce((a, b) => a + b, 0) || 1;
          const inicio: number[] = [];
          let suma = 0;
          pesos.forEach((p) => { inicio.push(suma / total); suma += p; });

          let ultima = -1;
          const seguir = () => {
            if (!vigente() || audioVozRef.current !== audio) return;
            const d = audio.duration;
            if (d && isFinite(d) && d > 0) {
              const avance = Math.max(0, audio.currentTime - RETARDO_VOZ) / Math.max(0.001, d - RETARDO_VOZ);
              let k = ultima < 0 ? 0 : ultima;
              while (k + 1 < inicio.length && inicio[k + 1] <= avance) k++;
              while (k > 0 && inicio[k] > avance) k--;
              if (k !== ultima) { ultima = k; setReadingWordIndex(fromIndex + bloque.desde + k); }
            }
            rafVozRef.current = requestAnimationFrame(seguir);
          };

          audio.onplay = () => {
            if (!vigente()) { try { audio.pause(); } catch {} return; }
            if (rafVozRef.current) cancelAnimationFrame(rafVozRef.current);
            rafVozRef.current = requestAnimationFrame(seguir);
          };
          audio.onended = () => {
            try { URL.revokeObjectURL(url); } catch {}
            if (!vigente()) return;
            if (rafVozRef.current) { cancelAnimationFrame(rafVozRef.current); rafVozRef.current = null; }
            reproducir(n + 1);
          };
          audio.onerror = () => { if (vigente()) { isSpeakingRef.current = false; } };
          audio.play().catch(() => { if (vigente()) isSpeakingRef.current = false; });
        })
        .catch((err: any) => {
          if (err && err.name === "AbortError") return;
          // Sin voz del servidor: se deja el testigo para la del navegador.
          if (vigente()) { isSpeakingRef.current = false; genVozRef.current += 1; }
        });
    };

    reproducir(0);
    return true;
  };

  // Encadena con el siguiente mensaje si se pidió "Leer todo".
  const avanzarCola = () => {
    const sig = readQueueRef.current.shift();
    if (sig) readMessage(sig, 0);
  };

  const stopReading = () => {
    readQueueRef.current = [];
    if (hlTimerRef.current) { clearTimeout(hlTimerRef.current); hlTimerRef.current = null; }
    if (typeof window !== "undefined") window.speechSynthesis.cancel();
    pararVozReal();
    utteranceRef.current = null;
    isSpeakingRef.current = false;
    setReadingMessageId(null);
    setReadingWordIndex(-1);
  };

  // "Leer desde aquí": lee SOLO este mensaje (sin cola).
  const readHere = (msgId: string) => {
    setReadMenuId(null);
    readQueueRef.current = [];
    readMessage(msgId, 0);
  };

  // "Leer todo": lee toda la conversación, desde este mensaje en adelante, encadenando.
  const readAll = (anchorId: string) => {
    const ids = messages.filter((m) => m.role === "assistant").map((m) => m.id);
    const startPos = Math.max(0, ids.indexOf(anchorId));
    const queue = ids.slice(startPos);
    const firstId = queue.shift();
    setReadMenuId(null);
    readQueueRef.current = queue;
    if (firstId) readMessage(firstId, 0);
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

  // Keep-alive: un AudioContext silencioso reduce que el navegador "congele" la
  // pestaña al cambiar de app (con la pantalla encendida), ayudando a que la voz siga.
  const startKeepAlive = () => {
    try {
      const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      if (!keepAliveRef.current) keepAliveRef.current = new Ctx();
      const ctx = keepAliveRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0; // 100% silencioso
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      ctx._osc = osc;
    } catch {}
  };

  const stopKeepAlive = () => {
    try {
      keepAliveRef.current?._osc?.stop?.();
      keepAliveRef.current?.close?.();
    } catch {}
    keepAliveRef.current = null;
  };

  // Inicia el reconocimiento de voz de forma segura (ignora "ya iniciado")
  const safeStartRecognition = () => {
    if (!conversationModeRef.current) return;
    try { recognitionRef.current?.start(); } catch (e) { /* ya estaba escuchando */ }
  };

  // --- VOZ DEL BOT (respuesta hablada en modo conversación CONTINUA) ---
  // El bot habla la respuesta y, al terminar, REANUDA automáticamente la escucha,
  // manteniendo una conversación fluida hasta que el usuario pulse "Detener".
  /**
   * Responde hablando y vuelve a escucharte, que es lo que hace de esto una
   * conversación y no un chat escrito. Estaba desactivado: por eso contestaba
   * solo con texto.
   *
   * Mientras habla, el micro queda cerrado (isSpeakingRef) para que no se oiga
   * a sí mismo por el altavoz. Al terminar, la escucha se reanuda sola.
   */
  const speakReply = (text: string) => {
    if (typeof window === "undefined") return;
    const limpio = String(text || "")
      .replace(EMOJI_RE, "")
      .replace(/[*_`#>-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!limpio) { safeStartRecognition(); return; }

    isSpeakingRef.current = true;
    pararVozReal();
    const gen = ++genVozRef.current;
    const vigente = () => gen === genVozRef.current;

    // Se apunta lo que va a decir para reconocer su eco y no confundirlo
    // contigo. Y el micro se queda escuchando, para que puedas cortarle.
    hablandoTextoRef.current = new Set(normalizar(limpio));
    ecoHastaRef.current = 0;
    setVoiceState("hablando");
    setVoiceText("");
    dichosRef.current = [];
    enCursoRef.current = null;
    // Se limpia lo que quedara a medias, para que no se mezcle con lo suyo.
    fraseRef.current = "";
    if (pausaRef.current) { clearTimeout(pausaRef.current); pausaRef.current = null; }
    setInput("");
    safeStartRecognition();

    const terminar = () => {
      isSpeakingRef.current = false;
      // El filtro sigue vivo un momento más: el altavoz aún está soltando el
      // final de la frase y si no, se transcribe a sí mismo.
      ecoHastaRef.current = Date.now() + COLA_ECO_MS;
      setTimeout(() => { hablandoTextoRef.current = new Set(); }, COLA_ECO_MS);
      setVoiceState("escuchando");
      volcarPendiente();          // ya lo dijo: ahora sí queda por escrito
      if (conversationModeRef.current) safeStartRecognition();
    };

    // Mismo troceado que la lectura: la primera frase suena enseguida y las
    // siguientes se descargan mientras tanto.
    const trozos: string[] = [];
    const palabras = limpio.split(/\s+/);
    let i = 0;
    while (i < palabras.length) {
      const max = trozos.length === 0 ? PALABRAS_1 : PALABRAS_N;
      trozos.push(palabras.slice(i, i + max).join(" "));
      i += max;
    }

    const pedir = (txt: string) => {
      const ctrl = new AbortController();
      abortosVozRef.current.push(ctrl);
      return fetch("/api/voz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: txt }),
        signal: ctrl.signal,
      }).then((r) => { if (!r.ok) throw new Error("tts"); return r.blob(); });
    };

    let siguiente: Promise<Blob> | null = null;
    const reproducir = (n: number) => {
      if (!vigente()) { isSpeakingRef.current = false; return; }
      if (n >= trozos.length) { terminar(); return; }

      const promesa = siguiente || pedir(trozos[n]);
      siguiente = null;

      promesa
        .then((blob) => {
          if (!vigente()) return;
          if (n + 1 < trozos.length) siguiente = pedir(trozos[n + 1]).catch(() => null as any);
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audioVozRef.current = audio;
          enCursoRef.current = { texto: trozos[n], audio };   // por si la cortas aquí
          audio.onended = () => {
            try { URL.revokeObjectURL(url); } catch {}
            if (!vigente()) return;
            dichosRef.current.push(trozos[n]);                // este ya se oyó entero
            enCursoRef.current = null;
            reproducir(n + 1);
          };
          audio.onerror = () => { if (vigente()) terminar(); };
          audio.play().catch(() => { if (vigente()) terminar(); });
        })
        .catch((err: any) => {
          if (err && err.name === "AbortError") { isSpeakingRef.current = false; return; }
          // Sin voz del servidor se usa la del navegador, para no quedarse mudo.
          if (!vigente()) return;
          try {
            const u = new SpeechSynthesisUtterance(trozos.slice(n).join(" "));
            u.lang = "es-DO";
            u.onend = terminar;
            u.onerror = terminar;
            window.speechSynthesis.speak(u);
          } catch { terminar(); }
        });
    };

    reproducir(0);
  };

  /**
   * Conversación de voz en tiempo real.
   *
   * ── Qué sustituye ─────────────────────────────────────────────────────────
   * El camino de antes era: transcribir en el navegador → esperar la respuesta
   * completa → trocearla → pedir un MP3 por trozo → reproducirlos en fila.
   * Tres esperas encadenadas antes de oír la primera palabra.
   *
   * Ahora el navegador habla directamente con OpenAI por WebRTC: tu voz sube
   * mientras hablas y la suya baja mientras se genera. Los turnos y las
   * interrupciones los decide su detección de voz, no un temporizador nuestro.
   *
   * ── Qué NO toca ───────────────────────────────────────────────────────────
   * El chat escrito, los adjuntos y el historial siguen igual. Esto solo
   * reemplaza el motor de la conversación hablada; los turnos que salen de
   * aquí se escriben en el mismo hilo de mensajes.
   */
  /** Espejo del hilo: leer el estado dentro de un callback daría uno viejo. */
  const messagesRef = useRef<Message[]>([]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const conversacionRef = useRef<ConversacionVoz | null>(null);

  /** Evita que dos toques seguidos abran dos conversaciones a la vez. */
  const arrancandoRef = useRef(false);

  const iniciarConversacion = async () => {
    if (conversacionRef.current || arrancandoRef.current) return;
    arrancandoRef.current = true;

    const conv = new ConversacionVoz({
      // La personalidad no vive en el motor de voz: se le pasa. Así el mismo
      // módulo sirve para cualquier otro asistente.
      instrucciones: aliadoModeRef.current ? ALIADO_SYSTEM_PROMPT : VOZ_SYSTEM_PROMPT,
      historial: messagesRef.current.slice(-8).map(m => ({ role: m.role, content: m.content })),

      onEstado: (e) => {
        setVoiceMachine(e);
        // El panel solo necesita tres estados; la máquina interna tiene más.
        if (e === 'ASISTENTE_HABLANDO') setVoiceState('hablando');
        else if (e === 'PROCESANDO') setVoiceState('pensando');
        else setVoiceState('escuchando');

        /**
         * Al fallar se apaga del todo y se suelta la referencia.
         *
         * Si no, el botón se quedaba "encendido" con una conversación muerta
         * detrás: el siguiente toque la daba por activa e intentaba pararla en
         * vez de volver a empezar. Parecía que se encendía y se apagaba sola.
         */
        if (e === 'ERROR') {
          conversacionRef.current?.detener();
          conversacionRef.current = null;
          setIsRecording(false);
          setVoiceText('');
          releaseWakeLock();
          // Se vuelve a marcar ERROR: detener() lo deja en IDLE y el aviso
          // desaparecería antes de que nadie pudiera leerlo.
          setVoiceMachine('ERROR');
        }
      },

      // Lo que se va oyendo va al panel de voz, NO al chat: el chat no se
      // reescribe palabra por palabra mientras habláis.
      onParcial: (texto) => setVoiceText(texto),

      /**
       * Turno terminado: ahora sí se escribe en el hilo.
       *
       * Llega con un identificador propio y el módulo garantiza que cada uno
       * se entrega una sola vez, así que no hay que comprobar duplicados aquí.
       */
      onTurno: ({ id, quien, texto }) => {
        setVoiceText('');
        setMessages(prev => {
          if (prev.some(m => m.id === id)) return prev;   // por si acaso
          return [...prev, { id, role: quien === 'usuario' ? 'user' : 'assistant', content: texto }];
        });
      },

      onError: (msg) => setMicError(msg),
    });

    conversacionRef.current = conv;
    setIsRecording(true);
    setMicError(null);
    requestWakeLock();
    try {
      await conv.iniciar();
    } finally {
      arrancandoRef.current = false;
    }
  };

  const detenerConversacion = () => {
    conversacionRef.current?.detener();
    conversacionRef.current = null;
    setIsRecording(false);
    setVoiceText('');
    setVoiceMachine('IDLE');
    releaseWakeLock();
  };

  // Al desmontar: sin esto el micrófono se queda abierto y la conexión viva.
  useEffect(() => () => { conversacionRef.current?.detener(); }, []);

  // --- FUNCIONES DE MICRÓFONO (conversación continua manos libres) ---
  const toggleMic = () => {
    if (!micSupported) return;

    // Camino nuevo: conversación en tiempo real.
    if (conversacionRef.current) { detenerConversacion(); return; }
    if (VOZ_TIEMPO_REAL) { iniciarConversacion(); return; }

    if (conversationModeRef.current) {
      // Desactivar conversación (única forma de detenerla)
      conversationModeRef.current = false;
      isSpeakingRef.current = false;
      processingRef.current = false;
      // Se descarta lo que estuvieras diciendo a medias y se corta la voz.
      if (pausaRef.current) { clearTimeout(pausaRef.current); pausaRef.current = null; }
      fraseRef.current = "";
      setInput("");
      pararVozReal();
      if (speechWatchdogRef.current) { clearInterval(speechWatchdogRef.current); speechWatchdogRef.current = null; }
      try { recognitionRef.current?.stop(); } catch {}
      window.speechSynthesis.cancel();
      releaseWakeLock();
      stopKeepAlive();
      setIsRecording(false);
      setMicError(null);
    } else {
      // Activar conversación
      try {
        conversationModeRef.current = true;
        recognitionRef.current?.start();
        requestWakeLock();
        startKeepAlive();
        setIsRecording(true);
        setMicError(null);
      } catch (e) {
        conversationModeRef.current = false;
        setMicError("Inicia con un clic primero");
      }
    }
  };

  const sendMessage = async (text?: string) => {
    const adjuntos = pending;
    const adjunto = adjuntos[0] || null;
    // Con adjuntos en espera sí se puede enviar sin escribir nada: se usa una
    // petición por defecto. Sin adjuntos, el mensaje vacío se sigue ignorando.
    const msg =
      (text || input).trim() ||
      (adjuntos.length
        ? adjuntos.length > 1
          ? `Analiza estas ${adjuntos.length} imágenes.`
          : 'Analiza esta imagen.'
        : '');
    if (!msg || isLoading) {
      // Evita quedarse bloqueado si se llamó desde la voz mientras se procesaba
      processingRef.current = false;
      if (conversationModeRef.current && !isSpeakingRef.current) {
        try { recognitionRef.current?.start(); } catch {}
      }
      return;
    }
    setInput("");
    setPending([]);
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: msg,
      ...(adjunto ? { fileUrl: adjunto.url, fileType: adjunto.fileType } : {}),
      // Se guardan TODAS: el historial necesita saber qué imágenes acompañaban
      // a cada mensaje para poder recordarlas después.
      ...(adjuntos.length ? { archivos: adjuntos } : {}),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    let replyText = "";
    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          userMessage: msg,
          /**
           * El historial viaja CON sus imágenes.
           *
           * Antes se mandaba solo `role` y `content`: las imágenes de mensajes
           * anteriores se quedaban por el camino. Por eso, al subir una captura
           * y preguntar algo después, el asistente decía no recordarla — y era
           * verdad, nunca le llegaba. Ahora se adjuntan las rutas y el servidor
           * las vuelve a poner delante del modelo.
           */
          messages: messages.slice(-30).map(m => ({
            role: m.role,
            content: m.content,
            archivos: (m as any).archivos || (m.fileUrl ? [{ url: m.fileUrl, fileType: m.fileType }] : undefined),
          })),
          pageContext: getPageContext(),
          ...(adjunto ? { fileUrl: adjunto.url, fileName: adjunto.fileName } : {}),
          // Todas las de este turno, no solo la primera.
          ...(adjuntos.length ? { archivos: adjuntos } : {}),
          ...(aliadoModeRef.current ? { systemPrompt: ALIADO_SYSTEM_PROMPT } : {}),
        }),
      });
      if (!response.ok) throw new Error("Error");
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      replyText = cleanMarkdown(data.content);
      escribirRespuesta(replyText);
    } catch (error) {
      console.error("Error:", error);
      replyText = "Lo siento, tuve un problema al procesar. ¿Puedes repetirlo?";
      escribirRespuesta(replyText);
    } finally {
      setIsLoading(false);
      processingRef.current = false;
      // En modo conversación responde HABLANDO y vuelve a escuchar. Escribiendo
      // no cambia nada: ahí sigue contestando solo con texto.
      if (conversationModeRef.current) speakReply(replyText);
    }
  };

  /**
   * Deja la respuesta en el chat. Conversando se aplaza hasta que termine de
   * hablarla (o hasta que la cortes): así el texto acompaña a la conversación
   * en vez de adelantarse a ella.
   */
  const escribirRespuesta = (texto: string) => {
    if (!conversationModeRef.current) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: texto }]);
      return;
    }
    // Conversando se apunta lo que de verdad dijo. Si la cortaste a media
    // frase, se guarda hasta ahí con puntos suspensivos: en el chat queda la
    // conversación tal como ocurrió, no la que tenía pensada.
    escribirPendienteRef.current = (dicho: string) => {
      const contenido = !dicho
        ? ""
        : dicho.length >= texto.replace(/\s+/g, " ").trim().length - 2
        ? texto
        : dicho + "…";
      if (!contenido) return;
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: contenido }]);
    };
  };

  // Reenviar un mensaje del usuario tras editarlo: actualiza su texto, descarta
  // la conversación posterior (respuestas viejas) y pide al bot una nueva respuesta.
  const resendEditedMessage = async (msgId: string, newText: string) => {
    const text = (newText || "").trim();
    if (!text || isLoading) return;
    const idx = messages.findIndex(m => m.id === msgId);
    if (idx === -1) return;

    // Conversación recortada hasta el mensaje editado (incluido), con el texto nuevo.
    const truncated = messages
      .slice(0, idx + 1)
      .map(m => (m.id === msgId ? { ...m, content: text } : m));

    setMessages(truncated);
    setEditingMessageId(null);
    setEditingText("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          userMessage: text,
          messages: truncated.slice(0, -1).slice(-30).map(m => ({ role: m.role, content: m.content })),
          pageContext: getPageContext(),
          ...(aliadoModeRef.current ? { systemPrompt: ALIADO_SYSTEM_PROMPT } : {}),
        }),
      });
      if (!response.ok) throw new Error("Error");
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: cleanMarkdown(data.content) }]);
    } catch (error) {
      console.error("Error al reenviar:", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: "Lo siento, tuve un problema al procesar. ¿Puedes repetirlo?" }]);
    } finally {
      setIsLoading(false);
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

  /**
   * Sube un archivo y lo manda a analizar. Lo usan tanto el botón de adjuntar
   * como el pegado de imágenes (Ctrl+V), para que ambos caminos hagan lo mismo.
   * `pregunta` es lo que el usuario tenía escrito al pegar: si lo hay, el
   * asistente responde a eso mirando la imagen, en vez de un análisis genérico.
   */
  const adjuntar = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al subir archivo');
      // No se envía nada todavía: se encola junto al campo de texto. Se AÑADE
      // a las que ya hubiera, en lugar de sustituirlas.
      setPending(prev => [...prev, { url: data.url, fileName: data.fileName || file.name, fileType: data.fileType }]);
      inputRef.current?.focus();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error al subir el archivo: ' + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await adjuntar(file);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  /**
   * Pegar una imagen con Ctrl+V (captura de pantalla, foto copiada, etc.).
   * Si en el portapapeles solo hay texto, no hacemos nada y el pegado normal sigue.
   */
  const handlePaste = async (event: ClipboardEvent<HTMLTextAreaElement>) => {
    if (isLoading || isUploading) return;
    const items = Array.from(event.clipboardData?.items || []);
    const imagenes = items.filter(i => i.kind === 'file' && i.type.startsWith('image/'));
    if (!imagenes.length) return;             // texto normal: pegado de siempre
    event.preventDefault();

    // Se suben una a una, en orden, para que un fallo en la segunda no tire
    // también la primera y para que la cola respete el orden en que se pegaron.
    for (const item of imagenes) {
      const file = item.getAsFile();
      if (!file) continue;
      // Las capturas llegan sin nombre útil: le ponemos uno con su extensión.
      const ext = (file.type.split('/')[1] || 'png').replace('jpeg', 'jpg');
      const marca = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const conNombre = new File([file], file.name || `captura-${marca}.${ext}`, { type: file.type });
      await adjuntar(conNombre);
    }

    // El cursor vuelve a la barra de escribir.
    //
    // Mientras sube la imagen el campo queda deshabilitado un instante, y el
    // navegador quita el foco de cualquier campo que se deshabilita. Quien
    // acaba de pegar una captura lo siguiente que hace es escribir la
    // pregunta, así que tener que volver a pinchar sobra.
    requestAnimationFrame(() => inputRef.current?.focus());
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
      {/* Botón flotante para abrir/cerrar.
          Si la conversación por voz está activa y el chat está cerrado, el botón se
          pone rojo y pulsa con un icono de micrófono para indicar que sigue escuchando. */}
      <motion.button
        className={`fixed bottom-6 right-6 z-50 text-white p-4 rounded-full shadow-lg transition-colors ${
          isRecording && !isOpen
            ? "bg-red-600 hover:bg-red-700 ring-4 ring-red-400/50 animate-pulse"
            : "bg-emerald-600 hover:bg-emerald-700"
        }`}
        onClick={() => {
          if (!isOpen) {
            // Botón redondo = MODO TUTOR. Vuelve al asistente normal SIN borrar la
            // conversación: solo desactiva el prompt de ventas del modo aliado.
            aliadoModeRef.current = false;
            setIsOpen(true);
          } else {
            setIsOpen(false);
          }
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title={isRecording && !isOpen ? "Conversación por voz activa — toca para abrir" : (isOpen ? "Cerrar" : "Abrir chat")}
      >
        {isOpen ? <X size={24} /> : (isRecording ? <Mic size={24} /> : <MessageCircle size={24} />)}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, ...(isMaximized ? { x: 0, y: 0 } : {}) }}
            exit={{ opacity: 0, scale: 0.8 }}
            drag={!isMaximized} dragListener={false} dragControls={dragControls} dragMomentum={false}
            style={{
              position: "fixed",
              left: isMaximized
                ? (typeof window !== "undefined" ? Math.max(0, (window.innerWidth - size.width) / 2) : 20)
                : (typeof window !== "undefined" ? window.innerWidth - 390 : "auto"),
              top: isMaximized
                ? (typeof window !== "undefined" ? Math.max(0, (window.innerHeight - size.height) / 2) : 20)
                : (typeof window !== "undefined" ? window.innerHeight - 610 : "auto"),
              width: size.width,
              height: size.height,
              zIndex: 50,
            }}
            className="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-700"
          >
            {/* HEADER CON CONTROLES - Zona de arrastre */}
            <div className={`bg-gradient-to-r from-emerald-600 to-emerald-800 p-4 select-none ${isMaximized ? "cursor-default" : "cursor-grab active:cursor-grabbing"}`} onPointerDown={(e) => { if (!isMaximized) dragControls.start(e); }}>
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
                    <button onClick={(e) => { e.stopPropagation(); setFontSizePercentage(p => Math.max(60, p - 10)); }} className="text-white hover:text-emerald-200 px-2 py-1 text-xs font-bold cursor-pointer select-none">A-</button>
                    <span className="text-white/90 text-[10px] w-8 text-center font-medium">{fontSizePercentage}%</span>
                    <button onClick={(e) => { e.stopPropagation(); setFontSizePercentage(p => Math.min(200, p + 10)); }} className="text-white hover:text-emerald-200 px-2 py-1 text-xs font-bold cursor-pointer select-none">A+</button>
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

            {/* Aviso: conversación por voz activa, con el estado a la vista.
                El estado se enseña a propósito: cuando algo falla, "se apagó"
                no dice nada, y saber si murió conectando, escuchando o al
                responder es la diferencia entre arreglarlo y adivinar. */}
            {isRecording && (
              <div className="bg-emerald-500/15 text-emerald-200 text-[11px] px-3 py-1.5 text-center border-b border-emerald-500/20 leading-snug">
                🎙️ Conversación por voz ·{' '}
                <b>
                  {voiceMachine === 'CONECTANDO' ? 'conectando…'
                    : voiceMachine === 'ESCUCHANDO' ? 'escuchando'
                    : voiceMachine === 'USUARIO_HABLANDO' ? 'te oigo'
                    : voiceMachine === 'PROCESANDO' ? 'pensando'
                    : voiceMachine === 'ASISTENTE_HABLANDO' ? 'hablando'
                    : voiceMachine === 'INTERRUMPIDO' ? 'interrumpido'
                    : voiceMachine === 'RECONECTANDO' ? 'reconectando…'
                    : voiceMachine}
                </b>
                <span className="block text-emerald-300/70">Solo “Detener” la apaga. Con la pantalla bloqueada, el móvil la pausa.</span>
              </div>
            )}

            {/* Si murió, se dice y se deja el motivo a la vista hasta que se
                vuelva a intentar: antes desaparecía sin explicación. */}
            {!isRecording && voiceMachine === 'ERROR' && (
              <div className="bg-red-500/20 text-red-200 text-[11px] px-3 py-2 text-center border-b border-red-500/30 leading-snug">
                La conversación por voz se detuvo. {micError || 'Sin motivo devuelto por el navegador.'}
              </div>
            )}

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
                  }`} style={{ fontSize: `${fontSizePercentage * 0.16}px`, userSelect: "text !important" as any, cursor: "text !important" as any }}>
                    {msg.role === "assistant" ? (
                      <div className="space-y-3">
                        {/* Vista previa de archivo si existe */}
                        {/* TODAS las imágenes del mensaje, numeradas igual que
                            al adjuntarlas. Antes se enseñaba solo la primera
                            aunque se hubieran mandado varias — y son justo las
                            que hay que tener delante para preguntar sobre ellas. */}
                        {(() => {
                          const adjuntas = msg.archivos?.length
                            ? msg.archivos
                            : msg.fileUrl
                              ? [{ url: msg.fileUrl, fileType: msg.fileType }]
                              : [];
                          if (!adjuntas.length) return null;

                          return (
                            <div className="mb-2 flex flex-wrap gap-2">
                              {adjuntas.map((a, i) => (
                                <div key={a.url} className="relative">
                                  {String(a.fileType || '').startsWith('image') ? (
                                    <img
                                      src={a.url}
                                      alt={`Imagen ${i + 1}`}
                                      className="max-w-full rounded-lg border border-slate-700"
                                    />
                                  ) : (
                                    <a href={a.url} target="_blank" rel="noreferrer" className="text-cyan-300 underline">
                                      Ver archivo
                                    </a>
                                  )}
                                  {adjuntas.length > 1 && (
                                    <span className="absolute top-1 left-1 bg-cyan-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                                      {i + 1}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          );
                        })()}

                        {/* Contenido enriquecido (markdown elegante: títulos, negritas, listas,
                            tablas, colores por línea y tamaños). Doble clic en una palabra = leer desde ahí. */}
                        <div
                          className="chat-text-selectable markdown-body"
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          onDoubleClick={(e) => {
                            const el = (e.target as HTMLElement)?.closest?.(".cj-word") as HTMLElement | null;
                            const m = el ? /wi-(\d+)/.exec(el.className) : null;
                            if (m) { e.stopPropagation(); readQueueRef.current = []; readMessage(msg.id, Number(m[1])); }
                          }}
                        >
                          {(() => {
                            const greeting = (msg.greeting || "").trim();
                            let content = (msg.content || "").trim();
                            if (greeting) {
                              const re = new RegExp('^' + greeting.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '[\\s\\.:,-–—]*', 'i');
                              content = content.replace(re, '').trim();
                            }
                            // El saludo va como primera línea del markdown (se lee desde el inicio).
                            let fullText = greeting ? `${greeting}\n\n${content}` : content;
                            // Evita que tablas con sangría se vean como bloque de código.
                            fullText = fullText.replace(/^[ \t]+(\|)/gm, '$1');
                            const activeIndex = readingMessageId === msg.id ? readingWordIndex : -1;
                            return (
                              <Markdown text={fullText} msgId={msg.id} wordsRef={wordsMapRef} activeIndex={activeIndex} />
                            );
                          })()}
                        </div>
                        
                        {/* Botones: Escuchar + Copiar */}
                        <div className="relative flex gap-2 mt-2 pt-2 border-t border-slate-700">
                          {readingMessageId === msg.id ? (
                            /* Mientras lee: botón ROJO para detener */
                            <button
                              onClick={stopReading}
                              className="flex-1 flex items-center justify-center gap-2 text-xs text-red-400 hover:text-red-300 font-semibold transition-colors"
                            >
                              <Square size={14} /> Detener
                            </button>
                          ) : (
                            /* En reposo: menú "leer desde aquí / todo" */
                            <div className="relative flex-1">
                              <button
                                onClick={() => readHere(msg.id)}
                                className="w-full flex items-center justify-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                              >
                                <Play size={14} /> Escuchar
                              </button>
                            </div>
                          )}
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
                        {/* TODAS las imágenes del mensaje, numeradas igual que
                            al adjuntarlas. Antes se enseñaba solo la primera
                            aunque se hubieran mandado varias — y son justo las
                            que hay que tener delante para preguntar sobre ellas. */}
                        {(() => {
                          const adjuntas = msg.archivos?.length
                            ? msg.archivos
                            : msg.fileUrl
                              ? [{ url: msg.fileUrl, fileType: msg.fileType }]
                              : [];
                          if (!adjuntas.length) return null;

                          return (
                            <div className="mb-2 flex flex-wrap gap-2">
                              {adjuntas.map((a, i) => (
                                <div key={a.url} className="relative">
                                  {String(a.fileType || '').startsWith('image') ? (
                                    <img
                                      src={a.url}
                                      alt={`Imagen ${i + 1}`}
                                      className="max-w-full rounded-lg border border-slate-700"
                                    />
                                  ) : (
                                    <a href={a.url} target="_blank" rel="noreferrer" className="text-cyan-300 underline">
                                      Ver archivo
                                    </a>
                                  )}
                                  {adjuntas.length > 1 && (
                                    <span className="absolute top-1 left-1 bg-cyan-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                                      {i + 1}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                        {editingMessageId === msg.id ? (
                          <div className="mt-2">
                            <textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                              rows={4}
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => resendEditedMessage(msg.id, editingText)}
                                disabled={isLoading || !editingText.trim()}
                                className="bg-emerald-600 text-white px-3 py-1 rounded disabled:opacity-50"
                              >
                                Reenviar
                              </button>
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
              
              {/* Indicador "Pensando..." */}
              {isLoading && (
                <div className="flex gap-2 justify-start">
                  <div className="bg-emerald-600/20 p-1.5 rounded-full h-fit flex-shrink-0 flex items-center justify-center">
                    <span style={{ fontSize: 16 }}>🤖</span>
                  </div>
                  <div className="bg-slate-800 rounded-bl-md border border-slate-700 shadow-lg p-3 max-w-[85%] flex items-center gap-2">
                    <span style={{ color: "#10B981" }} className="text-sm font-medium">Pensando</span>
                    <span className="flex gap-1">
                      <span className="animate-bounce" style={{animationDelay: "0ms"}}>•</span>
                      <span className="animate-bounce" style={{animationDelay: "150ms"}}>•</span>
                      <span className="animate-bounce" style={{animationDelay: "300ms"}}>•</span>
                    </span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* MODO VOZ: sustituye por completo a la caja de escribir.
                Mientras conversas no hay teclado ni botón de enviar: todo entra
                y sale por voz, como en cualquier asistente hablado. */}
            {isRecording ? (
              <div className="p-4 border-t border-slate-700 bg-slate-900 flex flex-col items-center gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={
                      "w-3 h-3 rounded-full " +
                      (voiceState === "hablando"
                        ? "bg-cyan-400 animate-pulse"
                        : voiceState === "pensando"
                        ? "bg-amber-400 animate-pulse"
                        : "bg-emerald-400 animate-pulse")
                    }
                  />
                  <span className="text-sm font-semibold text-white">
                    {voiceState === "hablando"
                      ? "Hablando… puedes interrumpirme"
                      : voiceState === "pensando"
                      ? "Pensando…"
                      : "Te escucho"}
                  </span>
                </div>

                {voiceText && (
                  <p className="text-xs text-slate-400 text-center italic line-clamp-2 max-w-full px-2">
                    “{voiceText}”
                  </p>
                )}

                <button
                  onClick={toggleMic}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors"
                >
                  <PhoneOff size={16} />
                  Terminar conversación
                </button>
              </div>
            ) : (
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

              {/* Adjunto en espera: se queda a la vista hasta que escribas qué
                  quieres saber y pulses enviar. La X lo descarta. */}
              {pending.length > 0 && (
                <div className="mb-2 p-2 bg-slate-800 border border-slate-600 rounded-lg">
                  <p className="text-[11px] text-slate-400 mb-2">
                    {pending.length === 1
                      ? 'Escribe qué quieres saber y pulsa enviar'
                      : `${pending.length} archivos listos · escribe qué quieres saber y pulsa enviar`}
                  </p>

                  {/* En cuadrícula, no en lista: con cuatro capturas una lista
                      vertical empujaría el campo de texto fuera de la ventana. */}
                  <div className="flex flex-wrap gap-2">
                    {pending.map((a, i) => (
                      <div key={a.url} className="relative group">
                        {a.fileType?.startsWith('image/') ? (
                          <img
                            src={a.url}
                            alt={a.fileName}
                            className="h-16 w-16 rounded object-cover border border-slate-600"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded border border-slate-600 flex flex-col items-center justify-center bg-slate-900 px-1">
                            <Paperclip size={16} className="text-cyan-400" />
                            <span className="text-[9px] text-slate-300 truncate w-full text-center mt-1">
                              {a.fileName}
                            </span>
                          </div>
                        )}

                        {/* El número deja claro en qué orden las verá el
                            asistente: sirve para poder decirle "en la imagen 2". */}
                        <span className="absolute -top-1 -left-1 bg-cyan-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {i + 1}
                        </span>

                        <button
                          onClick={() => setPending(prev => prev.filter(x => x.url !== a.url))}
                          className="absolute -top-1.5 -right-1.5 bg-slate-900 border border-slate-600 text-slate-300 hover:text-red-400 hover:border-red-400 rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none"
                          aria-label={`Quitar ${a.fileName}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={e => {
                    setInput(e.target.value);
                    const t = e.currentTarget;
                    t.style.height = "auto";
                    t.style.height = Math.min(t.scrollHeight, 120) + "px";
                  }}
                  onKeyDown={e => {
                    // Enter envía; Shift+Enter hace un salto de línea para seguir escribiendo
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  onPaste={handlePaste}
                  placeholder="Escribe tu pregunta o pega una imagen (Ctrl+V)..."
                  className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none overflow-y-auto"
                  // Solo se bloquea mientras responde. Antes también se
                  // bloqueaba al subir la imagen, y eso echaba fuera el cursor
                  // justo cuando ibas a escribir la pregunta sobre ella.
                  disabled={isLoading}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={isLoading || (!input.trim() && !pending.length) || isUploading}
                  className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-500 disabled:opacity-50 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}