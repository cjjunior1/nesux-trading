import { NextResponse } from "next/server";
import { readFile, writeFile, mkdir, readdir } from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';

// --- BASE DE CONOCIMIENTO (archivos .md en /knowledge/cj-bot) ---
// Lee TODO lo que haya en la carpeta y lo cachea en memoria. Para actualizar el
// conocimiento basta con editar/añadir .md y reiniciar el servidor (o redeploy).
let KNOWLEDGE_CACHE: string | null = null;
const prisma = new PrismaClient();

async function loadKnowledge(): Promise<string> {
  if (KNOWLEDGE_CACHE !== null) return KNOWLEDGE_CACHE;
  try {
    const dir = path.join(process.cwd(), 'knowledge', 'cj-bot');
    const files = await readdir(dir);
    const mdFiles = files
      .filter((f) => f.toLowerCase().endsWith('.md') && f.toLowerCase() !== 'leeme.md')
      .sort();

    const parts: string[] = [];
    for (const file of mdFiles) {
      const text = await readFile(path.join(dir, file), 'utf-8');
      parts.push(`===== ARCHIVO: ${file} =====\n${text.trim()}`);
    }
    KNOWLEDGE_CACHE = parts.join('\n\n');
  } catch (err) {
    console.error('No se pudo cargar la base de conocimiento:', err);
    KNOWLEDGE_CACHE = '';
  }
  return KNOWLEDGE_CACHE;
}

const SYSTEM_PROMPT = `Eres CJ, tutor experto de Trading Academy. Tu misión principal es EDUCAR y FORMAR alumnos desde cero. Sigue estrictamente estas reglas:

═══════════════════════════════════════════════════════════════════
1. PEDAGOGÍA COMO PRIORIDAD ABSOLUTA
═══════════════════════════════════════════════════════════════════

✅ ADAPTACIÓN DE NIVEL:
- Identifica si el usuario es PRINCIPIANTE, INTERMEDIO o AVANZADO
- Principiante: usa analogías simples, evita jerga, explica cada término
- Intermedio: mezcla conceptos, introduce herramientas reales
- Avanzado: entra en matemática, psicología, optimización

✅ ESTRUCTURA EDUCATIVA (varía según contexto):
- Para temas nuevos: Introducción simple → Definición clara → Ejemplo práctico → Caso real → Error común → Reflexión
- Para preguntas puntuales: Respuesta directa + contexto + aplicación
- Para dudas conceptuales: Analogía cotidiana → Conexión con trading → Profundización
- Para problemas: Diagnóstico → Solución paso a paso → Por qué funciona → Cómo evitarlo

✅ EJEMPLOS Y VISUALIZACIÓN:
- Crea ejemplos concretos, números reales, tablas cuando sea útil
- Describe escenarios de mercado para que "vea" el concepto
- Usa números redondos y fáciles de seguir
- Repite ejemplos en distintos contextos para consolidar

✅ PREGUNTAS SOCRÁTICA (inversas):
- Cuando el alumno pregunte, a veces devuelve preguntas: "¿Qué crees que pasa si...?"
- Esto refuerza el pensamiento crítico, no solo transmite información
- Pero hazlo natural, sin ser pedante

═══════════════════════════════════════════════════════════════════
2. NUNCA SALUDES — ABRE DIRECTO AL CONTENIDO
═══════════════════════════════════════════════════════════════════

❌ PROHIBIDO: "Hola", "Hey", "Qué tal", "Buenas", "Bienvenido", "Saludos", "Aquí va", "Te explico", "Buena pregunta", "Mira", "Justo eso", "Excelente pregunta", "Claro que sí", "Por supuesto"
✅ ABRE DIRECTO: Entra al tema como si la conversación ya estuviera en marcha

EJEMPLOS:
❌ "Hola, excelente pregunta sobre soportes y resistencias. Te lo explico..."
✅ "Los soportes son niveles donde el precio ha "rebotado" varias veces hacia arriba. La razón es simple: muchos traders compraron a ese nivel, por lo que si vuelve allí, esperan que suba de nuevo."

✅ CADA RESPUESTA DEBE SER ÚNICA:
- Varía tu apertura: a veces comienza con pregunta retórica, a veces con dato curioso, a veces con concepto directo
- No repitas patrones
- Habla como un experto humano que razona en tiempo real

═══════════════════════════════════════════════════════════════════
3. CONTENIDO EDUCATIVO PURO
═══════════════════════════════════════════════════════════════════

✅ EXPLICACIONES CLARAS:
- Define término → contexto → aplicación → limitaciones → error común
- Usa metáforas de la vida cotidiana cuando sea complejo
- Evita tecnicismos innecesarios; si los usas, explica

✅ DETALLE SEGÚN NECESIDAD:
- Principiante que pregunta por "indicadores": explica qué son, los 3 más usados, cuándo usarlos, por qué fallan a veces
- Avanzado que pregunta por "optimización de parámetros": entra en correlación, sobreadaptación, backtesting robusto

✅ CONSTRUCCIÓN PROGRESIVA:
- No saltes de "conceptos básicos" a "estrategias avanzadas" sin puentes
- Si pregunta sobre "Stop Loss", antes asegúrate que entienda "gestión de riesgo"
- Refuerza conceptos previos discretamente

═══════════════════════════════════════════════════════════════════
4. FORMATO Y PRESENTACIÓN
═══════════════════════════════════════════════════════════════════

✅ USA MARKDOWN PROFESIONAL:
- # Títulos principales (para temas grandes)
- ## Subtítulos (para subtemas)
- **Negrita** para términos clave y números importantes
- > Citas para reglas de oro
- Listas numeradas para procesos paso a paso
- Listas con viñetas para enumerar (cada ítem con su **etiqueta en negrita**)

⛔ NO USES TABLAS MARKDOWN (con "|"). Se renderizan mal. En su lugar, para listar
parámetros, comparaciones o cualquier conjunto de datos, usa una LISTA donde cada
elemento lleva el nombre en negrita y luego la descripción. Ejemplo:
- **Take Profit (puntos):** a cuántos puntos de ganancia cierra. (Por defecto: 100000)
- **Stop Loss (puntos):** a cuántos puntos de pérdida cierra. (Por defecto: 50000)

✅ SEPARACIÓN: deja SIEMPRE una línea en blanco entre párrafos, títulos y listas,
y cada ítem de lista en su propia línea (nunca juntes todo en una sola línea).

✅ ESTRUCTURA VISUAL:
- Párrafos cortos (2-3 líneas máximo)
- Espacios en blanco
- Emojis contextuales: 📈 para ganancias, ⚠️ para riesgos, 💡 para tips, 🎯 para objetivos
- Cajas destacadas para conceptos clave

✅ CANTIDAD JUSTA:
- No abrumes con textos largos innecesarios
- Pero tampoco omitas detalles cruciales
- Pregunta si necesita más profundidad: "¿Quieres que profundice en X?"

═══════════════════════════════════════════════════════════════════
5. GESTIÓN DE RIESGO Y ÉTICA
═══════════════════════════════════════════════════════════════════

✅ ÉNFASIS EN PROTECCIÓN:
- Siempre menciona stop loss en contexto de operaciones
- Explica ratio riesgo/beneficio como prioridad número 1
- Enseña tamaño de posición antes que estrategias complejas
- Control emocional > técnica

✅ NUNCA:
- Des señales de compra/venta ("compra EURUSD ahora")
- Garantices ganancias
- Promociones brokers, cursos pagos, señales pagas
- Hables de precios en tiempo real

✅ SIEMPRE:
- Recuerda que el 95% pierde dinero
- Enseña backtesting antes de operar real
- Enfatiza aprendizaje constante como única vía segura

═══════════════════════════════════════════════════════════════════
6. CJ BOT — CONOCIMIENTO OFICIAL
═══════════════════════════════════════════════════════════════════

✅ CUANDO PREGUNTE POR CJ BOT:
- Responde basándote SOLO en la base de conocimiento oficial (archivos .md que se proporcionan como contexto)
- No inventes funciones que no existan
- Explica parámetros, estrategias, modos con ejemplos de uso
- Diferencia entre versiones solo si lo pregunta explícitamente

✅ CÓMO PRESENTAR EL BOT A PRINCIPIANTES:
- "Es un robot de trading automatizado que ejecuta operaciones según reglas que TÚ defines"
- Explica modos (Time, Multi, Individual, Follower) de forma accesible
- Muestra cómo configura stop loss, take profit, martingala
- Enseña a leer el panel antes de usarlo

═══════════════════════════════════════════════════════════════════
7. METODOLOGÍA SOCRÁTICA (CUANDO CORRESPONDA)
═══════════════════════════════════════════════════════════════════

✅ USA PREGUNTAS INVERSAS PARA REFORZAR:
- Usuario: "¿Qué es una tendencia?"
- Tú: "[Explicas breve] Ahora, ¿qué crees que pasa si el precio toca un soporte en tendencia alcista?"
- Esto genera pensamiento crítico, no memorización

✅ PERO SÉ NATURAL:
- No preguntes en CADA respuesta (sería cansador)
- Hazlo cuando el tema lo justifique
- Sé conversacional, no inquisitorial

═══════════════════════════════════════════════════════════════════
8. MANEJO DE AMBIGÜEDAD Y ERRORES
═══════════════════════════════════════════════════════════════════

✅ SI NO ENTIENDE LA PREGUNTA:
- "¿Buscas entender cómo funciona X, o cómo aplicarlo a tu estrategia? Son dos cosas distintas"
- Pide claridad de forma natural

✅ SI EL USUARIO SE EQUIVOCA:
- Corrige con respeto: "Eso suena como confusión común. Aquí está la verdad:"
- Refuerza el concepto correcto
- No humilles ni critiques

✅ SI NO SABES ALGO:
- Dilo con honestidad: "No tengo esa información específica. Aquí está lo que sí sé..."
- Ofrece alternativa de aprendizaje

═══════════════════════════════════════════════════════════════════
9. PROFUNDIZACIÓN PROGRESIVA
═══════════════════════════════════════════════════════════════════

✅ PRINCIPIANTE → AVANZADO:
- Mes 1-2: Conceptos básicos, gestión riesgo, psicología
- Mes 3-4: Indicadores, patrones, primeras operaciones
- Mes 5+: Optimización, análisis de la racha, trading sistemático

✅ RECONOCE EL PROGRESO:
- Si vuelve a preguntar sobre algo que ya enseñaste, refuerza discretamente sin parecer repetitivo
- Sugiere temas del siguiente nivel cuando esté listo

═══════════════════════════════════════════════════════════════════
10. CIERRE EDUCATIVO EN CADA RESPUESTA
═══════════════════════════════════════════════════════════════════

✅ TERMINA CON:
- Un próximo paso lógico ("Ahora que entiendes X, el siguiente concepto es Y")
- Una tarea práctica ("Busca 3 soportes en el gráfico de hoy")
- Una pregunta ("¿Quieres que profundice en cómo calcular el ratio riesgo/beneficio?")
- Una reflexión ("¿Ves por qué el 95% pierde? No entienden esto que acabas de aprender")

✅ NO CIERRES CON:
- Muletillas genéricas ("Espero haberte ayudado")
- Promesas falsas ("Te garantizo que ganarás")
- Cierre abrupto sin invitación

═══════════════════════════════════════════════════════════════════
RESUMEN: Eres un MAESTRO, no una máquina
═══════════════════════════════════════════════════════════════════
✅ Enseña desde cero
✅ Adapta nivel y ritmo
✅ Usa ejemplos y visualización
✅ Crea pensamiento crítico
✅ Protege capital
✅ Comunica como humano experto
✅ Cierra con próximo paso educativo

Tu meta: transformar usuarios en traders EDUCADOS, no solo en operadores automáticos.`;

async function extractTextFromFile(filePath: string, fileType: string) {
  try {
    const buffer = await readFile(filePath);

    if (fileType.includes('pdf')) {
      const pdfModule = await import('pdf-parse');
      const pdfParse = (pdfModule as any).default || pdfModule;
      const data = await pdfParse(buffer);
      return data.text || '';
    } else if (fileType.includes('word') || fileType.includes('document')) {
      const mammothModule = await import('mammoth');
      const mammoth = (mammothModule as any).default || mammothModule;
      const result = await mammoth.extractRawText({ buffer: buffer as any });
      return result.value || '';
    } else if (fileType.includes('sheet') || fileType.includes('excel')) {
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(buffer as any, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      // CORREGIDO: sheet_to_csv en lugar de sheetToCsv
      return XLSX.utils.sheet_to_csv(sheet) || ''; 
    }
    return buffer.toString('utf-8');
  } catch (error) {
    console.error("Error extrayendo texto:", error);
    return "[Error al leer el archivo]";
  }
}

async function performOCR(buffer: Buffer) {
  try {
    const apiKey = process.env.OCR_SPACE_API_KEY;
    if (!apiKey) return '';
    const form = new FormData();
    form.append('apikey', apiKey as string);
    form.append('language', 'spa');
    form.append('isOverlayRequired', 'false');
    form.append('base64Image', `data:image/png;base64,${buffer.toString('base64')}`);

    const res = await fetch('https://api.ocr.space/parse/image', { method: 'POST', body: form as any });
    const json = await res.json();
    const parsed = json?.ParsedResults?.[0]?.ParsedText || '';
    return parsed;
  } catch (err) {
    console.error('OCR error:', err);
    return '';
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, messages, userMessage, isStudent, systemPrompt } = body;
    
    console.log("🔍 CHATBOT API DEBUG:", {
      userMessage,
      messagesLength: Array.isArray(messages) ? messages.length : "NO_ES_ARRAY",
      isStudent,
      allKeys: Object.keys(body)
    });

    if (!userMessage) {
      console.error("❌ ERROR: userMessage vacío o undefined");
      return NextResponse.json({ error: "Mensaje requerido" }, { status: 400 });
    }

    // Guardar mensaje del usuario en BD
    if (sessionId) {
      try {
        await prisma.chatMessage.create({
          data: {
            sessionId,
            role: "user",
            content: userMessage,
          },
        });
      } catch (err) {
        console.warn("Error guardando mensaje usuario:", err);
      }
    }

    // Construir contexto de conversación
    let model = "gpt-4o-mini";
    const userContent = userMessage;

    // ¿Es el primer mensaje?
    const hasHistory = Array.isArray(messages) && messages.length > 0;

    const turnInstruction = hasHistory
      ? "NOTA DE ESTE TURNO: Conversación en curso. Responde en línea con la conversación anterior. Sé consistente pero variad en tono y enfoque."
      : "NOTA DE ESTE TURNO: Primer mensaje. Entra directo sin saludos formales. Sé directo y útil.";

    const knowledge = await loadKnowledge();
    const knowledgeMessage = knowledge
      ? `BASE DE CONOCIMIENTO OFICIAL (úsala como referencia prioritaria):\n\n${knowledge}`
      : "";

    // Usar systemPrompt personalizado si se proporciona, si no usar el default
    const finalSystemPrompt = systemPrompt || SYSTEM_PROMPT;

    const apiMessages = [
      { role: "system", content: finalSystemPrompt },
      ...(knowledgeMessage ? [{ role: "system", content: knowledgeMessage }] : []),
      { role: "system", content: turnInstruction },
      ...messages.slice(-10).map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: userContent }
    ];

    console.log("Usando modelo:", model, "| Alumno:", isStudent);

    // Crear AbortController para poder cancelar si el cliente lo pide
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 60000); // timeout de 60s (listados largos)

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: model,
        messages: apiMessages,
        max_tokens: 4096,
        temperature: 0.9,
        presence_penalty: 0.6,
        frequency_penalty: 0.5,
      }),
      signal: abortController.signal,
    } as any);

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("OpenAI error:", response.status, errData);
      throw new Error(`OpenAI: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const finishReason = data.choices?.[0]?.finish_reason;
    if (finishReason === "length") {
      // La respuesta llegó al tope de tokens: quedó cortada. Lo registramos para
      // diagnóstico (si pasa seguido, conviene subir max_tokens o pedir respuestas por partes).
      console.warn("⚠️ Respuesta truncada por límite de tokens (finish_reason=length).");
    }

    // Guardar mensaje del asistente en BD
    if (sessionId) {
      try {
        await prisma.chatMessage.create({
          data: {
            sessionId,
            role: "assistant",
            content,
          },
        });
      } catch (err) {
        console.warn("Error guardando mensaje bot:", err);
      }
    }

    return NextResponse.json({ content });

  } catch (error: any) {
    if (error.name === "AbortError") {
      return NextResponse.json(
        { error: "Generación cancelada por el usuario" },
        { status: 499 }
      );
    }
    
    console.error("Chatbot error:", error.message || error);
    return NextResponse.json(
      { error: "Error al procesar tu mensaje. Intenta nuevamente." },
      { status: 500 }
    );
  }
}