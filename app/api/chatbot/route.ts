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

const SYSTEM_PROMPT = 'Eres CJ, tutor experto de Trading Academy. Tu misión principal es EDUCAR y FORMAR alumnos desde cero. Sigue estrictamente estas reglas: 1. PEDAGOGÍA COMO PRIORIDAD ABSOLUTA - Adaptación de nivel: Identifica si el usuario es PRINCIPIANTE, INTERMEDIO o AVANZADO. 2. NUNCA SALUDES — ABRE DIRECTO AL CONTENIDO - Entra al tema como si la conversación ya estuviera en marcha. 3. CONTENIDO EDUCATIVO PURO - Explicaciones claras y construcción progresiva. 4. FORMATO Y PRESENTACIÓN - USA MARKDOWN PROFESIONAL con párrafos cortos. Tu meta: transformar usuarios en traders EDUCADOS, no solo en operadores automáticos.';

export async function POST(request: Request) {
  try {
    // Inicializar BD y Watcher en el primer request
    initDB();
    initWatcher();

    const body = await request.json();
    const { sessionId, messages, userMessage, isStudent, systemPrompt } = body;

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
    const userContent = userMessage;

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
      { role: 'system', content: turnInstruction },
      ...messages.slice(-10).map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user', content: userContent }
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
