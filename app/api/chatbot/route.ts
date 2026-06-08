import { NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

const SYSTEM_PROMPT = `Eres CJ, asistente experto de Trading Academy. Tu misión es educar, no dar señales. Sigue estrictamente estas reglas:

1. IDENTIDAD Y TONO: Habla en español latino, claro, directo y motivador. Usa lenguaje técnico pero explícalo siempre. Sé paciente, estructurado y empático.

2. SALUDOS — REGLA CRÍTICA: SOLO saludas en el PRIMER mensaje de la conversación. A partir del segundo mensaje en adelante, NUNCA empieces con "Hola", "Hey", "Qué tal", "Bienvenido" ni ningún saludo: responde DIRECTAMENTE a lo que se te pregunta. Repetir un saludo en cada respuesta es un error grave.
   - Cuando SÍ saludes (solo la primera vez), varía entre muchas formas para no sonar robótico. No uses siempre la misma. Ejemplos de estilos posibles (no te limites a estos, sé creativo): "¡Hola! ¿En qué puedo ayudarte?", "¡Bienvenido a Trading Academy! ¿Qué quieres aprender?", "¡Hey, qué bueno verte! ¿Por dónde empezamos?", "¡Listo para aprender trading? Cuéntame tu duda", "Encantado de ayudarte. ¿Qué tema te interesa?".
   - Cuando NO saludes (segundo mensaje en adelante), también varía cómo introduces la respuesta: a veces directo al grano, a veces con una frase conectora ("Buena pregunta...", "Vamos con eso...", "Te explico...", "Mira..."), pero SIN repetir la misma muletilla. Da la sensación de una conversación real e inteligente, con miles de formas distintas de responder.

3. PROHIBIDO HABLAR DE MOVIMIENTOS DE ACTIVOS: NUNCA menciones precios actuales, "El EUR/USD está subiendo", ni datos de mercado en tiempo real. Solo explicas conceptos educativos.

4. PEDIR ACLARACIÓN INTELIGENTE: Si el usuario escribe mensajes ambiguos o cortos sin contexto, pide aclaración de forma natural:
   - Si escribe "sí" sin contexto → "¿Sí a qué? ¿Podrías darme más detalles sobre lo que necesitas?"
   - Si escribe "ya dime" → "Claro, pero necesito saber qué tema te interesa para ayudarte mejor"
   - Si escribe solo una palabra como "estrategias" → "¿Qué te gustaría saber sobre estrategias? ¿Buscas estrategias para principiantes, avanzadas, para un mercado específico?"
   Sé conversacional y no asumas cosas.

5. EDUCACIÓN > SEÑALES: Nunca des consejos de compra/venta, precios objetivo ni garantices ganancias. Explica el "por qué" detrás de cada concepto.

6. GESTIÓN DE RIESGO: Enfatiza stop loss, tamaño de posición, ratio riesgo/beneficio y control emocional. El capital se protege antes de buscar rentabilidad.

7. ESTRUCTURA DE RESPUESTA (FLEXIBLE Y NATURAL):
   - No uses estructura rígida siempre. Adapta tu respuesta al contexto.
   - Para preguntas simples: respuesta directa + ejemplo breve.
   - Para preguntas complejas: definición + ejemplo + aplicación + error común.
   - TEXTO PLANO OBLIGATORIO: NUNCA uses formato markdown. Prohibido usar asteriscos (* o **), almohadillas (#, ##, ###), guiones bajos (_ o __), comillas invertidas (\`) ni viñetas con guiones. Para resaltar usa MAYÚSCULAS puntuales o simplemente el orden de las frases. Para listas, escribe cada punto en su propia línea empezando con un número ("1.", "2.") o con texto normal, nunca con "*" ni "-".
   - Usa saltos de línea naturales y párrafos cortos.
   - Sé conciso, no repitas información.

8. ADAPTACIÓN: Si el usuario es principiante, usa analogías simples. Si es avanzado, profundiza en mecánica, matemáticas o psicología.

9. PRECISIÓN TÉCNICA: Diferencia entre indicadores, patrones, fundamentos y flujo de órdenes. Si hay duda, aclara el contexto de mercado.

10. LÍMITES ÉTICOS: No promociones brokers, señales pagadas ni cursos externos. Si preguntan por plataformas, da criterios de evaluación, no recomendaciones.

11. MANEJO DE ERRORES: Si el usuario se equivoca, corrige con respeto, muestra el enfoque correcto y refuerza el aprendizaje.

12. CONTEXTO DE MERCADO: Menciona sesiones, volatilidad, noticias o liquidez solo si es relevante para la pregunta. No inventes datos en tiempo real.

13. CIERRE EDUCATIVO: Termina invitando a practicar, revisar un gráfico o profundizar en un concepto específico. No seas repetitivo.

SI NO SABES ALGO: Dilo con honestidad. Sugiere dónde aprenderlo o cómo verificarlo. Nunca inventes.`;

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
    const { message, conversationHistory = [], fileUrl, fileName } = body;

    if (!message) {
      return NextResponse.json({ error: "Mensaje requerido" }, { status: 400 });
    }

    let model = "gpt-4o-mini";
    let userContent: any[] = [{ type: "text", text: message }];

    if (fileUrl) {
      let buffer: Buffer | null = null;
      let fileType = '';

      try {
        if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
          const res = await fetch(fileUrl);
          const arr = await res.arrayBuffer();
          buffer = Buffer.from(arr);
          const urlParts = fileUrl.split('?')[0].split('.');
          fileType = urlParts[urlParts.length - 1].toLowerCase();
        } else {
          const relative = fileUrl.replace(/^\/+/, '');
          const filePath = path.join(process.cwd(), 'public', relative);
          const arr = await readFile(filePath);
          buffer = arr;
          fileType = relative.split('.').pop()?.toLowerCase() || '';
        }
      } catch (err) {
        console.error('Error leyendo archivo subido:', err);
      }

      console.log('Procesando archivo:', fileUrl, fileType);

      if (buffer && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType)) {
        const ocrText = await performOCR(buffer);
        const analysisPrompt = `Analiza esta imagen como si fueras un experto en trading. Si es un gráfico, describe:
- Tipo de gráfico (velas, líneas, barras)
- Tendencia predominante y su fuerza
- Niveles clave (soporte, resistencia)
- Patrones técnicos (triángulos, hombro-cabeza-hombro, canales, etc.)
- Indicadores visibles (SMA, EMA, RSI, MACD) y su interpretación
- Posibles sesgos de mercado y riesgos
Si la imagen contiene texto, transcribe lo más relevante y resume. Proporciona referencias externas útiles al final.`;

        userContent = [{ type: 'text', text: `Archivo: ${fileName}\nTipo: imagen\nOCR extraído:\n${ocrText}\n\n${analysisPrompt}\nPregunta del usuario: ${message}` }];
      } else if (buffer && ['pdf', 'doc', 'docx', 'txt'].includes(fileType)) {
        const tmpPath = path.join(process.cwd(), 'tmp', `upload-${Date.now()}-${fileName}`);
        try {
          await mkdir(path.dirname(tmpPath), { recursive: true });
        } catch (e) {}
        await writeFile(tmpPath, buffer as any);
        const text = await extractTextFromFile(tmpPath, fileType || 'pdf');
        userContent = [{ type: 'text', text: `Archivo: ${fileName}\nTipo: ${fileType}\nContenido extraído:\n${text}\n\nComo experto en trading, analiza, describe gráficos/figuras si existen y resume puntos clave. Incluye al final enlaces útiles para ampliar. Pregunta del usuario: ${message}` }];
      } else {
        userContent = [{ type: 'text', text: `He subido un archivo llamado ${fileName}, pero no pude procesarlo automáticamente. Por favor intenta describir o re-subir en un formato soportado (PDF, DOCX, JPG, PNG). Pregunta: ${message}` }];
      }
    }

    // ¿Es el primer mensaje? (sin historial previo del usuario)
    const hasHistory = Array.isArray(conversationHistory)
      && conversationHistory.some((m: any) => m && m.role === "user");

    const turnInstruction = hasHistory
      ? "NOTA DE ESTE TURNO: Esta NO es la primera interacción. NO saludes. NO empieces con 'Hola' ni similar. Responde directo y de forma distinta a respuestas anteriores."
      : "NOTA DE ESTE TURNO: Es el primer mensaje. Puedes saludar UNA sola vez, de forma natural y variada.";

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "system", content: turnInstruction },
      ...conversationHistory.slice(-10),
      { role: "user", content: userContent }
    ];

    console.log("Usando modelo:", model);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: 2000,
        temperature: 0.9,
        presence_penalty: 0.6,
        frequency_penalty: 0.5,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("=== OPENAI ERROR DETALLADO ===");
      console.error("Status HTTP:", response.status);
      console.error("Cuerpo error:", JSON.stringify(errData));
      throw new Error(`OpenAI rechazó la petición: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({ content });

  } catch (error: any) {
    console.error("=== CHATBOT CATCH ERROR ===");
    console.error(error.message || error);
    return NextResponse.json(
      { error: "Error al procesar tu mensaje. Intenta nuevamente." },
      { status: 500 }
    );
  }
}