import { NextResponse } from "next/server";
import { readFile, readdir } from 'fs/promises';
import path from 'path';
import Database from 'better-sqlite3';
import chokidar from 'chokidar';

// --- SQLite LOCAL (en tu PC) ---
const dbPath = path.join(process.cwd(), 'data', 'chatbot.db');
let db: Database.Database | null = null;

function initDB() {
  if (db) return db;
  try {
    db = new Database(dbPath);
    db.exec(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sessionId TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_sessionId ON chat_messages(sessionId);
    `);
    console.log('✅ SQLite inicializado en:', dbPath);
  } catch (err) {
    console.error('❌ Error inicializando SQLite:', err);
  }
  return db;
}

// --- FILE WATCHER: Lee cambios en segundo plano ---
let KNOWLEDGE_CACHE: string | null = null;
let watcher: any = null;

async function loadKnowledge(): Promise<string> {
  try {
    const dir = path.join(process.cwd(), 'knowledge', 'cj-bot');
    const files = await readdir(dir);
    const mdFiles = files
      .filter((f) => f.toLowerCase().endsWith('.md') && f.toLowerCase() !== 'leeme.md')
      .sort();

    const parts: string[] = [];
    for (const file of mdFiles) {
      const text = await readFile(path.join(dir, file), 'utf-8');
      parts.push('===== ARCHIVO: ' + file + ' =====\n' + text.trim());
    }
    KNOWLEDGE_CACHE = parts.join('\n\n');
    console.log('📚 Conocimiento cargado:', mdFiles.length, 'archivos');
  } catch (err) {
    console.error('❌ Error cargando conocimiento:', err);
    KNOWLEDGE_CACHE = '';
  }
  return KNOWLEDGE_CACHE;
}

// Inicializar File Watcher (Lee cambios automáticamente)
function initWatcher() {
  if (watcher) return;
  const knowledgeDir = path.join(process.cwd(), 'knowledge', 'cj-bot');
  watcher = chokidar.watch(knowledgeDir, { persistent: true });

  watcher.on('change', async () => {
    console.log('🔄 Cambio detectado en archivos .md, recargando conocimiento...');
    KNOWLEDGE_CACHE = null; // Invalida cache
    await loadKnowledge();
  });

  watcher.on('add', async () => {
    console.log('✨ Nuevo archivo detectado, recargando conocimiento...');
    KNOWLEDGE_CACHE = null;
    await loadKnowledge();
  });

  console.log('👁️ File Watcher activo para:', knowledgeDir);
}

const SYSTEM_PROMPT = 'Eres CJ, tutor experto de Trading Academy. Tu misión principal es EDUCAR y FORMAR alumnos desde cero. Sigue estrictamente estas reglas: 1. PEDAGOGÍA COMO PRIORIDAD ABSOLUTA - Adaptación de nivel: Identifica si el usuario es PRINCIPIANTE, INTERMEDIO o AVANZADO. 2. NUNCA SALUDES — ABRE DIRECTO AL CONTENIDO - Entra al tema como si la conversación ya estuviera en marcha. 3. CONTENIDO EDUCATIVO PURO - Explicaciones claras y construcción progresiva. 4. FORMATO Y PRESENTACIÓN - USA MARKDOWN PROFESIONAL con párrafos cortos. Tu meta: transformar usuarios en traders EDUCADOS, no solo en operadores automáticos. CAPACIDADES: SÍ puedes analizar ARCHIVOS (PDF, Word, Excel, TXT) e IMÁGENES que el usuario adjunte — cuando recibas su contenido, interprétalo con detalle. NUNCA digas que no puedes ver imágenes ni analizar archivos.';

// --- Lectura de ARCHIVOS ADJUNTOS: extrae texto (PDF/Word/Excel/TXT) o prepara imagen (visión) ---
async function extractFile(fileUrl: string, fileName: string): Promise<{ text?: string; imageDataUrl?: string }> {
  try {
    const rel = fileUrl.replace(/^\//, ''); // /uploads/... -> uploads/...
    const filePath = path.join(process.cwd(), 'public', rel);
    const buffer = await readFile(filePath);
    const name = (fileName || rel).toLowerCase();

    // Imágenes -> data URL para visión
    if (/\.(jpe?g|png|gif|webp)$/.test(name)) {
      const ext = name.split('.').pop();
      const mime = ext === 'jpg' ? 'jpeg' : ext;
      return { imageDataUrl: `data:image/${mime};base64,${buffer.toString('base64')}` };
    }
    // PDF
    if (name.endsWith('.pdf')) {
      const mod: any = await import('pdf-parse');
      const fn: any = mod?.default ?? mod;
      if (typeof fn === 'function') {
        const data: any = await fn(buffer);
        return { text: (data?.text || '').trim().slice(0, 12000) };
      }
      return {};
    }
    // Word
    if (name.endsWith('.docx') || name.endsWith('.doc')) {
      const mammoth: any = await import('mammoth');
      const res = await mammoth.extractRawText({ buffer });
      return { text: (res?.value || '').trim().slice(0, 12000) };
    }
    // Excel
    if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      const XLSX: any = await import('xlsx');
      const wb = XLSX.read(buffer, { type: 'buffer' });
      const out: string[] = [];
      for (const sheet of wb.SheetNames) out.push(`# Hoja: ${sheet}\n` + XLSX.utils.sheet_to_csv(wb.Sheets[sheet]));
      return { text: out.join('\n\n').slice(0, 12000) };
    }
    // Texto plano
    if (name.endsWith('.txt') || name.endsWith('.md') || name.endsWith('.csv')) {
      return { text: buffer.toString('utf-8').slice(0, 12000) };
    }
    return {};
  } catch (err) {
    console.error('❌ extractFile error:', (err as Error).message);
    return {};
  }
}

export async function POST(request: Request) {
  try {
    // Inicializar BD y Watcher en el primer request
    initDB();
    initWatcher();

    const body = await request.json();
    const { sessionId, messages, userMessage, isStudent, systemPrompt, fileUrl, fileName, pageContext } = body;

    console.log('🔍 CHATBOT API DEBUG:', {
      userMessage,
      messagesLength: Array.isArray(messages) ? messages.length : 'NO_ES_ARRAY',
      isStudent,
    });

    if (!userMessage) {
      console.error('❌ ERROR: userMessage vacío o undefined');
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 });
    }

    // Guardar mensaje del usuario en SQLite LOCAL
    if (sessionId && db) {
      try {
        const stmt = db.prepare('INSERT INTO chat_messages (sessionId, role, content) VALUES (?, ?, ?)');
        stmt.run(sessionId, 'user', userMessage);
        console.log('💾 Mensaje usuario guardado en SQLite');
      } catch (err) {
        console.warn('⚠️ Error guardando en SQLite:', err);
      }
    }

    // Construir contexto
    let model = 'gpt-4o-mini';
    let userContent: any = userMessage;
    let imageDataUrl: string | undefined;

    // Si hay archivo adjunto, léelo: imagen -> visión; documento -> texto en el contexto.
    if (fileUrl) {
      const ext = await extractFile(fileUrl, fileName || '');
      if (ext.imageDataUrl) {
        imageDataUrl = ext.imageDataUrl;
      } else if (ext.text) {
        userContent = `${userMessage}\n\n--- CONTENIDO DEL ARCHIVO "${fileName}" ---\n${ext.text}\n--- FIN DEL ARCHIVO ---\nInterprétalo y responde/analiza con detalle.`;
      } else {
        userContent = `${userMessage}\n\n(No pude leer el contenido del archivo "${fileName}". Pídele al usuario que lo reenvíe o pegue el texto.)`;
      }
    }

    const hasHistory = Array.isArray(messages) && messages.length > 0;
    const turnInstruction = hasHistory
      ? 'NOTA: Conversación en curso. Sé consistente pero variad en tono.'
      : 'NOTA: Primer mensaje. Entra directo sin saludos.';

    const knowledge = await loadKnowledge();
    const knowledgeMessage = knowledge
      ? 'BASE DE CONOCIMIENTO OFICIAL:\n\n' + knowledge
      : '';

    const finalSystemPrompt = systemPrompt || SYSTEM_PROMPT;

    const apiMessages = [
      { role: 'system', content: finalSystemPrompt },
      ...(knowledgeMessage ? [{ role: 'system', content: knowledgeMessage }] : []),
      ...(pageContext ? [{ role: 'system', content: pageContext }] : []),
      { role: 'system', content: turnInstruction },
      ...messages.slice(-10).map((m: any) => ({ role: m.role, content: m.content })),
      {
        role: 'user',
        content: imageDataUrl
          ? [
              { type: 'text', text: userMessage || 'Analiza esta imagen a fondo. Si es de trading (operaciones, historial, gráfico), interprétala con detalle educativo: ganancias/pérdidas por operación y por par, balance total, y enseña.' },
              { type: 'image_url', image_url: { url: imageDataUrl } },
            ]
          : userContent,
      }
    ];

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 60000);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
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
      console.error('OpenAI error:', response.status, errData);
      throw new Error('OpenAI: ' + response.status);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Guardar respuesta en SQLite LOCAL
    if (sessionId && db) {
      try {
        const stmt = db.prepare('INSERT INTO chat_messages (sessionId, role, content) VALUES (?, ?, ?)');
        stmt.run(sessionId, 'assistant', content);
        console.log('💾 Respuesta bot guardada en SQLite');
      } catch (err) {
        console.warn('⚠️ Error guardando respuesta:', err);
      }
    }

    return NextResponse.json({ content });

  } catch (error: any) {
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Generación cancelada por el usuario' },
        { status: 499 }
      );
    }

    console.error('Chatbot error:', error.message || error);
    return NextResponse.json(
      { error: 'Error al procesar tu mensaje. Intenta nuevamente.' },
      { status: 500 }
    );
  }
}
