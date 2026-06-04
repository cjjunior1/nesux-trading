import { NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

const SYSTEM_PROMPT = `Eres CJ, asistente experto de Trading Academy. Tu misión es educar, no dar señales. Sigue estrictamente estas reglas:

1. IDENTIDAD Y TONO: Habla en español latino, claro, directo y motivador. Usa lenguaje técnico pero explícalo siempre. Sé paciente, estructurado y empático.
2. EDUCACIÓN > SEÑALES: Nunca des consejos de compra/venta, precios objetivo ni garantices ganancias. Explica el "por qué" detrás de cada concepto.
3. GESTIÓN DE RIESGO: Enfatiza stop loss, tamaño de posición, ratio riesgo/beneficio y control emocional. El capital se protege antes de buscar rentabilidad.
4. ESTRUCTURA DE RESPUESTA: 
   - Definición clara
   - Ejemplo práctico (Forex/Cripto/Acciones)
   - Cómo se usa en trading real
   - Error común a evitar
   - Pregunta de cierre para profundizar
5. ADAPTACIÓN: Si el usuario es principiante, usa analogías simples. Si es avanzado, profundiza en mecánica, matemáticas o psicología.
6. PRECISIÓN TÉCNICA: Diferencia entre indicadores, patrones, fundamentos y flujo de órdenes. Si hay duda, aclara el contexto de mercado.
7. LÍMITES ÉTICOS: No promociones brokers, señales pagadas ni cursos externos. Si preguntan por plataformas, da criterios de evaluación, no recomendaciones.
8. MANEJO DE ERRORES: Si el usuario se equivoca, corrige con respeto, muestra el enfoque correcto y refuerza el aprendizaje.
9. CONTEXTO DE MERCADO: Menciona sesiones, volatilidad, noticias o liquidez solo si es relevante para la pregunta. No inventes datos en tiempo real.
10. CIERRE EDUCATIVO: Termina siempre invitando a practicar, revisar un gráfico o profundizar en un concepto específico.

SI NO SABES ALGO: Dilo con honestidad. Sugiere dónde aprenderlo o cómo verificarlo. Nunca inventes.`;

async function extractTextFromFile(filePath: string, fileType: string) {
  try {
    const buffer = await readFile(filePath);

    if (fileType.includes('pdf')) {
      const pdf = await import('pdf-parse');
      const data = await pdf.default(buffer);
      return data.text || '';
    } else if (fileType.includes('word') || fileType.includes('document')) {
      const mammoth = await import('mammoth');
      const result = await mammoth.default.extractRawText({ buffer });
      return result.value || '';
    } else if (fileType.includes('sheet') || fileType.includes('excel')) {
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
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
    form.append('base64Image', `data:image/png;base64,`);

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
Si la imagen contiene texto, transcribe lo más relevante y resume. Proporciona referencias externas útiles (links a artículos o herramientas) al final.`;

        userContent = [{ type: 'text', text: `Archivo: \nTipo: imagen\nOCR extraído:\n\n\n\nPregunta del usuario: ` }];
      } else if (buffer && ['pdf', 'doc', 'docx', 'txt'].includes(fileType)) {
        const tmpPath = path.join(process.cwd(), 'tmp', `upload--`);
        try {
          await mkdir(path.dirname(tmpPath), { recursive: true });
        } catch (e) {}
        await writeFile(tmpPath, buffer);
        const text = await extractTextFromFile(tmpPath, fileType || 'pdf');
        userContent = [{ type: 'text', text: `Archivo: \nTipo: \nContenido extraído:\n\n\nComo experto en trading, analiza, describe gráficos/figuras si existen y resume puntos clave. Incluye al final enlaces útiles para ampliar (artículos, herramientas, tutoriales). Pregunta del usuario: ` }];
      } else {
        userContent = [{ type: 'text', text: `He subido un archivo llamado , pero no pude procesarlo automáticamente. Por favor intenta describir o re-subir en un formato soportado (PDF, DOCX, JPG, PNG). Pregunta: ` }];
      }
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-10),
      { role: "user", content: userContent }
    ];

    console.log("Usando modelo:", model);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer `,
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("=== OPENAI ERROR DETALLADO ===");
      console.error("Status HTTP:", response.status);
      console.error("Cuerpo error:", JSON.stringify(errData));
      throw new Error(OpenAI rechazó la petición: );
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