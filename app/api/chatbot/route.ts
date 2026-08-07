import { NextResponse } from "next/server";
import { readFile, readdir } from 'fs/promises';
import fsp from 'fs/promises';
import path from 'path';
import Database from 'better-sqlite3';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { getBusinessId } from "@/lib/business";
import chokidar from 'chokidar';

// --- SQLite LOCAL (en tu PC) ---
const dbPath = path.join(process.cwd(), 'data', 'chatbot.db');
let db: Database.Database | null = null;


/**
 * Quién está escribiendo y qué ha comprado.
 * Sale de la SESIÓN del servidor, no de lo que mande el navegador: así el
 * asistente no puede ser engañado para tratar a cualquiera como alumno.
 * Devuelve "" si no hay sesión (visitante anónimo).
 */
async function contextoDelAlumno(): Promise<string> {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) return '';

    const u = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true, lastName: true, clientId: true, email: true,
        courseAccess: { select: { course: { select: { title: true } } } },
      },
    });
    if (!u) return '';

    const cursos = u.courseAccess.map((a) => a.course.title);
    return [
      'QUIÉN TE ESTÁ ESCRIBIENDO (dato real del sistema, no lo inventes):',
      `- Nombre: ${u.firstName} ${u.lastName}`.trim(),
      `- ID de usuario: ${u.clientId ?? '(sin ID asignado)'}`,
      cursos.length
        ? `- Cursos a los que tiene acceso: ${cursos.join(', ')}`
        : '- Todavía no ha comprado ningún curso.',
      '',
      `Llámale por su nombre (${u.firstName}) de forma natural, sin repetirlo en cada frase.`,
      'Si te pide su ID de usuario, dáselo. No preguntes datos que ya tienes aquí.',
      cursos.length
        ? 'Céntrate en los cursos a los que tiene acceso.'
        : 'Si encaja, puedes recomendarle el curso que mejor le venga, sin agobiar.',
    ].join(String.fromCharCode(10));
  } catch {
    return ''; // el chat nunca debe romperse por esto
  }
}

/**
 * Catálogo con los precios REALES de la base. Antes el asistente se los
 * inventaba: los precios estaban escritos a mano en las páginas y él no los veía.
 */
async function catalogoActual(): Promise<string> {
  try {
    const productos = await prisma.product.findMany({
      where: { isPublished: true, businessId: await getBusinessId() },
      orderBy: { order: 'asc' },
      select: { kind: true, name: true, price: true, currency: true, subtitle: true },
    });
    if (!productos.length) return '';
    const linea = (p: any) =>
      `- ${p.name}${p.subtitle ? ` (${p.subtitle})` : ''}: ${p.price} ${p.currency}` +
      (p.kind === 'bot' ? ' al mes' : '');
    return [
      'PRECIOS OFICIALES (los únicos válidos; NO los inventes ni los redondees):',
      ...productos.map(linea),
      '',
      'Si te preguntan por un precio que no esté en esta lista, di que lo consultarás, no lo supongas.',
    ].join(String.fromCharCode(10));
  } catch {
    return '';
  }
}


// --- Memoria de la ultima imagen por sesion -------------------------------
// Igual que en Nexy (WhatsApp): el alumno adjunta una captura y pregunta sobre
// ella en los mensajes siguientes. Sin esto, el asistente solo "veia" la imagen
// en el mensaje donde se adjunto y despues respondia que necesitaba los datos,
// obligando al alumno a escribirlos a mano.
// Se guarda en disco (no en memoria) para que sobreviva a los reinicios.
const IMG_TTL_MS = 24 * 60 * 60 * 1000;             // 24 horas
const IMG_DIR = path.join(process.cwd(), '.cache-imagenes-chat');
const IMG_REF = /(imagen|foto|tabla|grafic|captura|screenshot|operacion|perdid|ganancia|balance|par|pares|arriba|adjunt)/i;

function rutaImagenSesion(sessionId: string): string {
  return path.join(IMG_DIR, sessionId.replace(/[^a-zA-Z0-9_-]/g, '') + '.txt');
}

async function guardarImagenSesion(sessionId: string, dataUrl: string) {
  if (!sessionId) return;
  try {
    await fsp.mkdir(IMG_DIR, { recursive: true });
    await fsp.writeFile(rutaImagenSesion(sessionId), dataUrl, 'utf8');
  } catch (e) { console.warn('[chatbot] no se pudo guardar la imagen:', e); }
}

async function leerImagenSesion(sessionId: string): Promise<string | undefined> {
  if (!sessionId) return undefined;
  try {
    const ruta = rutaImagenSesion(sessionId);
    const info = await fsp.stat(ruta);
    if (Date.now() - info.mtimeMs > IMG_TTL_MS) return undefined;
    return await fsp.readFile(ruta, 'utf8');
  } catch { return undefined; }
}

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

const SYSTEM_PROMPT = 'Eres CJ, tutor experto de Trading Academy. Tu misión principal es EDUCAR y FORMAR alumnos desde cero. Sigue estrictamente estas reglas: 1. PEDAGOGÍA COMO PRIORIDAD ABSOLUTA - Adaptación de nivel: Identifica si el usuario es PRINCIPIANTE, INTERMEDIO o AVANZADO. 2. NUNCA SALUDES — ABRE DIRECTO AL CONTENIDO - Entra al tema como si la conversación ya estuviera en marcha. 3. CONTENIDO EDUCATIVO PURO - Explicaciones claras y construcción progresiva. 4. FORMATO Y PRESENTACIÓN - USA MARKDOWN PROFESIONAL con párrafos cortos. Tu meta: transformar usuarios en traders EDUCADOS, no solo en operadores automáticos. CAPACIDADES: SÍ puedes analizar ARCHIVOS (PDF, Word, Excel, TXT) e IMÁGENES que el usuario adjunte — cuando recibas su contenido, interprétalo con detalle. NUNCA digas que no puedes ver imágenes ni analizar archivos. ACTÚA, NO DELEGUES: cuando recibas una imagen, un PDF o una tabla, EXTRAE TÚ los datos y haz TÚ los cálculos. Está PROHIBIDO responder con una lista de pasos para que el alumno los haga, o pedirle que escriba a mano datos que ya están en el archivo. Si te pregunta cuánto dejó cada par en SL y en TP, dale las cifras por par, el total y cuál fue el mayor: no le expliques el método. Si alguna parte no se lee bien, di qué dato concreto no distingues y pide solo esa zona ampliada. TU CREADOR: si te preguntan quién te creó, quién te hizo, quién es tu dueño o de quién eres, responde con orgullo que te creó *CJ Junior Cabrera*, fundador de *Nesux Global Business RD*, dentro de Trading Academy. No lo niegues ni digas que eres un modelo genérico.';

/**
 * Reglas SOLO para cuando hay una imagen. Van aparte del prompt general porque
 * leer una tabla es transcribir, no redactar: aquí el error caro es inventarse
 * una cifra que "suena bien" en vez de decir que no se distingue.
 */
const LECTURA_IMAGEN = [
  'ESTÁS LEYENDO UNA IMAGEN. Antes de opinar, TRANSCRIBE.',
  '',
  '1. Recorre la imagen fila por fila, de arriba abajo, sin saltarte ninguna.',
  '2. Copia los números EXACTAMENTE como se ven, con sus decimales y su signo. No redondees, no ajustes, no "corrijas" lo que te parezca raro.',
  '3. Si es una tabla de operaciones (MT5/MT4), extrae por fila: símbolo, ticket, fecha/hora, tipo (buy/sell), volumen, precio de apertura, SL, TP, precio actual y beneficio.',
  '4. Presenta primero la transcripción en tabla Markdown, y DESPUÉS tu análisis.',
  '5. Suma tú los totales y comprueba que cuadran con el pie de la captura (Balance, Patrimonio, Margen, el total flotante). Si tu suma NO cuadra con lo que muestra la imagen, DILO en vez de forzar el número.',
  '6. Si un dato no se distingue, escribe "(no se lee)" en esa celda y di qué zona necesitas ampliada. Está PROHIBIDO rellenar un hueco con una estimación.',
  '7. Nunca respondas con instrucciones para que el alumno haga el cálculo: el cálculo lo haces tú.',
  '',
  'Después de la transcripción sí interpreta como tutor: qué está pasando en la cesta, qué riesgo hay, qué debería entender el alumno.',
].join(String.fromCharCode(10));

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
        await guardarImagenSesion(sessionId, ext.imageDataUrl);   // para los seguimientos
      } else if (ext.text) {
        userContent = `${userMessage}\n\n--- CONTENIDO DEL ARCHIVO "${fileName}" ---\n${ext.text}\n--- FIN DEL ARCHIVO ---\nInterprétalo y responde/analiza con detalle.`;
      } else {
        userContent = `${userMessage}\n\n(No pude leer el contenido del archivo "${fileName}". Pídele al usuario que lo reenvíe o pegue el texto.)`;
      }
    }

    // === UNIFICACIÓN (Fase 2): intentar el CEREBRO CENTRAL compartido de Nexy ===
    // Solo si NEXY_BRAIN_URL está configurado. Si falla o no responde, cae al
    // cerebro LOCAL de abajo (nunca se pierde ninguna capacidad).
    const BRAIN_URL = process.env.NEXY_BRAIN_URL;
    if (BRAIN_URL) {
      try {
        const messageForBrain = typeof userContent === 'string' ? userContent : userMessage;
        const r = await fetch(`${BRAIN_URL.replace(/\/$/, '')}/api/nexy/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: messageForBrain,
            history: (Array.isArray(messages) ? messages : []).slice(-12).map((m: any) => ({ role: m.role, content: m.content })),
            profile: 'trading-web',
            channel: 'web',
            identity: (body?.email || body?.userEmail) ? { email: body.email || body.userEmail, name: body?.userName } : undefined,
            pageContext,
            systemOverride: systemPrompt,
            imageDataUrl,
          }),
          signal: AbortSignal.timeout(45000),
        });
        if (r.ok) {
          const d = await r.json().catch(() => ({} as any));
          if (d?.reply) {
            if (sessionId && db) {
              try { db.prepare('INSERT INTO chat_messages (sessionId, role, content) VALUES (?, ?, ?)').run(sessionId, 'assistant', d.reply); } catch {}
            }
            return NextResponse.json({ content: d.reply });
          }
        }
        console.warn('[brain-central] sin reply, uso cerebro local');
      } catch (e: any) {
        console.warn('[brain-central] error, uso cerebro local:', e?.message || e);
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
    // Seguimiento: pregunta sobre una captura enviada antes en esta misma sesion.
    if (!imageDataUrl && userMessage && IMG_REF.test(userMessage)) {
      imageDataUrl = await leerImagenSesion(sessionId);
    }

    const [alumnoInfo, catalogo] = await Promise.all([contextoDelAlumno(), catalogoActual()]);

    const apiMessages = [
      { role: 'system', content: finalSystemPrompt },
      ...(alumnoInfo ? [{ role: 'system', content: alumnoInfo }] : []),
      ...(catalogo ? [{ role: 'system', content: catalogo }] : []),
      ...(knowledgeMessage ? [{ role: 'system', content: knowledgeMessage }] : []),
      ...(pageContext ? [{ role: 'system', content: pageContext }] : []),
      ...(imageDataUrl ? [{ role: 'system', content: LECTURA_IMAGEN }] : []),
      { role: 'system', content: turnInstruction },
      ...messages.slice(-10).map((m: any) => ({ role: m.role, content: m.content })),
      {
        role: 'user',
        content: imageDataUrl
          ? [
              { type: 'text', text: userMessage || 'Analiza esta imagen a fondo. Si es de trading (operaciones, historial, gráfico), interprétala con detalle educativo: ganancias/pérdidas por operación y por par, balance total, y enseña.' },
              // detail 'high' = la imagen se procesa en alta resolución. Sin esto,
              // en capturas de MT5 con cifras pequeñas el modelo confunde dígitos.
              { type: 'image_url', image_url: { url: imageDataUrl, detail: 'high' } },
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
        // Con imagen: modelo grande y temperatura baja. Leer cifras de una tabla
        // es transcripción, no redacción creativa; el mini y una temperatura alta
        // eran justo lo que hacía que se inventara números.
        model: imageDataUrl ? 'gpt-4o' : model,
        messages: apiMessages,
        max_tokens: 4096,
        temperature: imageDataUrl ? 0.1 : 0.9,
        ...(imageDataUrl ? {} : { presence_penalty: 0.6, frequency_penalty: 0.5 }),
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
