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
import { duenoDe, bloqueDePreferencias, extraerYGuardar } from '@/lib/preferencias';

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
/**
 * Cómo se le explica al asistente que SÍ puede recordar.
 *
 * Antes contestaba con sinceridad que no podía guardar nada, porque no había
 * dónde. Ahora sí lo hay: escribe la marca al final y el servidor la guarda y
 * la borra del texto, así que la persona nunca la ve.
 */
const COMO_RECORDAR = [
  'PUEDES RECORDAR CÓMO TRABAJAR CON ESTA PERSONA.',
  'Cuando te pida guardar una forma de responder ("hazlo siempre así", "recuerda que los números los quiero en vertical", "no me des la teoría"), añade al FINAL de tu respuesta una marca así:',
  '[[RECORDAR: los valores en columna, alineados y sin explicación adicional]]',
  'Escríbela en una sola línea, en tercera persona y concreta. El sistema la guarda y la borra del mensaje: la persona nunca la ve, así que no la menciones ni digas "he guardado la marca".',
  'LA MARCA ES OBLIGATORIA. Sin ella no se guarda nada: responder solo "hecho, lo tendré en cuenta" sin escribir la marca es MENTIR, porque no queda anotado en ninguna parte y a la siguiente conversación se habrá perdido.',
  'Antes de enviar una respuesta en la que confirmas que recordarás algo, comprueba que la línea [[RECORDAR: ...]] está escrita al final. Si no está, escríbela.',
  'Confirma con naturalidad ("hecho, lo tendré en cuenta a partir de ahora") y a continuación, en la última línea, la marca.',
  'NUNCA digas que no puedes guardar ni aprender: sí puedes recordar preferencias por esta vía.',
  'Lo que NO debes guardar: datos sueltos de una conversación, cifras concretas ni nada personal que no te hayan pedido recordar. Solo indicaciones sobre cómo quiere que trabajes.',
].join(String.fromCharCode(10));

/**
 * La calculadora de cestas. La cuenta la hace el servidor, no el modelo.
 *
 * ── Por qué existe ────────────────────────────────────────────────────────
 * Se intentó dos veces por instrucciones —"multiplicar por 0.01 divide entre
 * cien", "comprueba el orden de magnitud"— y las dos veces volvió a entregar
 * los siete valores diez veces más grandes, con un total negativo en una
 * cesta que cierra en +1 270. Un modelo de lenguaje predice texto; no calcula.
 * Pedirle que se revise a sí mismo es pedirle que detecte un fallo con la
 * misma facultad que lo produjo.
 *
 * Así que ya no calcula: LEE la captura (eso sí sabe hacerlo) y nos pasa los
 * datos. La aritmética la hace JavaScript, que no se equivoca nunca, y el
 * modelo solo presenta el resultado.
 */
const HERRAMIENTA_CESTA = {
  type: 'function' as const,
  function: {
    name: 'calcular_cesta',
    description:
      'Calcula el resultado exacto de una cesta de operaciones al llegar al TP. ' +
      'ÚSALA SIEMPRE que haya que dar cifras de una cesta: nunca hagas tú la multiplicación.',
    parameters: {
      type: 'object',
      properties: {
        tp: {
          type: 'number',
          description:
            'El Take Profit común a toda la cesta, leído de la columna T/P. ' +
            'Si cada fila tiene un T/P distinto, no pongas este campo y usa el `tp` de cada operación.',
        },
        contrato: {
          type: 'number',
          description:
            'Tamaño del contrato. 1 para BTCUSD y Volatility 75. Si no lo sabes, no lo pongas.',
        },
        operaciones: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              tipo: { type: 'string', enum: ['sell', 'buy'] },
              volumen: {
                type: 'number',
                description:
                  'El lote, tal cual está escrito en la columna Volumen: 0.01 es 0.01, NUNCA 1.',
              },
              apertura: {
                type: 'number',
                description:
                  'El PRIMER precio, el de apertura. No el precio actual, que es la segunda columna Precio.',
              },
              tp: {
                type: 'number',
                description: 'El T/P de esta fila. Solo si es distinto del común.',
              },
            },
            required: ['tipo', 'volumen', 'apertura'],
          },
        },
      },
      required: ['operaciones'],
    },
  },
};

function calcularCesta(args: any): string {
  const tpComun = Number(args?.tp);
  const contrato = Number(args?.contrato) > 0 ? Number(args.contrato) : 1;
  const ops = Array.isArray(args?.operaciones) ? args.operaciones : [];

  if (!ops.length) return JSON.stringify({ error: 'No llegó ninguna operación.' });

  // Dos decimales: es lo que mueve la cuenta del broker, y arrastrar cuatro
  // solo invita a que el modelo los reescriba a su manera.
  const redondear = (n: number) => Math.round(n * 100) / 100;

  type Fila = {
    n: number;
    tipo: 'sell' | 'buy';
    volumen: number;
    apertura: number;
    tp: number | null;
    resultado: number | null;
  };

  let faltaTp = false;
  const filas: Fila[] = ops.map((o: any, i: number): Fila => {
    const volumen = Number(o?.volumen) || 0;
    const apertura = Number(o?.apertura) || 0;
    const tp = Number.isFinite(Number(o?.tp)) ? Number(o.tp) : tpComun;
    const esVenta = String(o?.tipo || '').toLowerCase().startsWith('s');

    if (!Number.isFinite(tp)) faltaTp = true;

    return {
      n: i + 1,
      tipo: esVenta ? 'sell' : 'buy',
      volumen,
      apertura,
      tp: Number.isFinite(tp) ? tp : null,
      resultado: Number.isFinite(tp)
        ? redondear((esVenta ? apertura - tp : tp - apertura) * volumen * contrato)
        : null,
    };
  });

  if (faltaTp) {
    return JSON.stringify({
      error: 'Falta el T/P de alguna operación. Léelo en la columna T/P; no lo supongas.',
    });
  }

  /**
   * Ventas y compras van SIEMPRE separadas, además del total.
   *
   * En una cesta mixta el total junto no dice gran cosa: son dos apuestas en
   * direcciones contrarias y lo que se quiere saber es cómo va cada lado. Se
   * calculan los tres números siempre, y así responder "la suma de las ventas
   * y la de las compras" no obliga a una segunda pasada.
   */
  const suma = (f: any[], campo: 'resultado' | 'volumen') =>
    redondear(f.reduce((t, x) => t + (Number(x[campo]) || 0), 0));

  const ventas = filas.filter((f) => f.tipo === 'sell');
  const compras = filas.filter((f) => f.tipo === 'buy');

  /**
   * El atajo de comprobación es SOLO para una cesta del CJ Bot.
   *
   * Vale porque el bot corta a 100 000 puntos en BTCUSD, y eso deja 10 USD por
   * cada 0.01 de lote. Fuera de ese caso —una cesta mixta, lotes que no van
   * doblando, otro instrumento— el atajo no significa nada, y al aplicarlo a
   * todo el asistente terminaba cada respuesta correcta con un "algún dato
   * pudo leerse mal" que no era verdad y solo sembraba dudas.
   *
   * Así que solo se comprueba cuando el patrón es el del bot: todas en la
   * misma dirección y los lotes doblando desde el más pequeño.
   */
  const mismaDireccion = !ventas.length || !compras.length;
  const vols = filas.map((f) => f.volumen).filter((v) => v > 0).sort((a, b) => a - b);
  const vanDoblando =
    vols.length >= 3 && vols.every((v, i) => i === 0 || Math.abs(v - vols[i - 1] * 2) < 1e-9);
  const esCestaDelBot = mismaDireccion && vanDoblando;

  const total = suma(filas, 'resultado');
  const lotes = suma(filas, 'volumen');
  const porAtajo = redondear((lotes / 0.01) * 10);

  return JSON.stringify({
    filas,
    total,
    total_ventas: suma(ventas, 'resultado'),
    total_compras: suma(compras, 'resultado'),
    lotes_ventas: suma(ventas, 'volumen'),
    lotes_compras: suma(compras, 'volumen'),
    lotes_sumados: lotes,
    // Sin nota de instrucciones aquí dentro: el modelo la copió literalmente
    // al final de la respuesta y el alumno leyó "cópialos tal cual, no los
    // recalcules", que era una orden para él, no información para nadie. Lo
    // que hay que decirle va en el prompt de cierre, no en los datos.
    ...(esCestaDelBot
      ? {
          comprobacion_atajo: porAtajo,
          cuadra: Math.abs(porAtajo - total) < Math.max(5, Math.abs(total) * 0.02),
        }
      : {}),
  });
}

/**
 * Parte la captura en franjas horizontales y las amplía.
 *
 * ── El límite real que sortea ─────────────────────────────────────────────
 * Una captura de pantalla completa llega con las cifras a unos 10 píxeles de
 * alto. Y ampliar la imagen entera no sirve de nada: el modelo la reescala a
 * un ancho máximo fijo, así que vuelve al tamaño de partida. Da igual mandarla
 * a 4K.
 *
 * Lo que sí funciona es cortarla en franjas y ampliar cada una: una franja es
 * más estrecha, así que al reescalarla cabe más grande, y sus letras acaban
 * ocupando alrededor de un 50 % más de píxeles. Es la diferencia entre leer
 * 1262.34 y leer un borrón.
 *
 * Se dejan unos píxeles de solape entre franjas para no partir una fila por la
 * mitad. Si eso hace que alguna aparezca dos veces, la comprobación contra el
 * pie de la captura lo detecta.
 */
async function franjasAmpliadas(dataUrl: string): Promise<string[]> {
  try {
    const sharp = (await import('sharp')).default;
    const base64 = dataUrl.split(',')[1];
    if (!base64) return [dataUrl];

    const original = Buffer.from(base64, 'base64');
    const info = await sharp(original).metadata();
    const ancho = info.width || 0;
    const alto = info.height || 0;

    // Una imagen pequeña ya se lee bien y no gana nada con esto.
    if (ancho < 900 || alto < 400) return [dataUrl];

    const cuantas = Math.min(4, Math.max(2, Math.ceil(alto / 260)));
    const paso = Math.ceil(alto / cuantas);
    const solape = 30;

    const trozos: string[] = [];
    for (let i = 0; i < cuantas; i++) {
      const arriba = Math.max(0, i * paso - (i ? solape : 0));
      const altura = Math.min(alto - arriba, paso + (i ? solape : 0));
      if (altura <= 0) continue;

      const buf = await sharp(original)
        .extract({ left: 0, top: arriba, width: ancho, height: altura })
        .resize({ width: Math.round(ancho * 2), kernel: 'lanczos3' })
        // Un punto de nitidez ayuda con el texto fino de las tablas.
        .sharpen()
        .png()
        .toBuffer();

      trozos.push('data:image/png;base64,' + buf.toString('base64'));
    }

    return trozos.length ? trozos : [dataUrl];
  } catch (e) {
    console.warn('[franjas] no se pudo trocear la captura:', e);
    return [dataUrl];
  }
}

/**
 * El paso de LEER, separado del de calcular.
 *
 * Va solo, sin conocimiento del negocio ni herramientas, porque aquí no hay
 * nada que interpretar: es copiar lo que pone en la pantalla. Cuanto menos
 * ruido tenga delante, mejor lee.
 */
const TRANSCRIBIR = [
  'Tu único trabajo ahora es TRANSCRIBIR la tabla de la captura. No calcules nada, no interpretes, no opines.',
  '',
  'Devuelve SOLO un JSON con esta forma:',
  '{"pestana":"historial"|"operaciones","filas":[{"tipo":"sell"|"buy","volumen":0.01,"apertura":95170.89,"tp":94670.89,"beneficio":5.22}],"pie":{"beneficio_total":5247.05,"balance":5247.05}}',
  '',
  'PESTAÑA: es "historial" si cada fila tiene una SEGUNDA Fecha/Hora (la de cierre) y hay columna Swap; es "operaciones" si son posiciones abiertas.',
  'FILAS: una por operación, en el mismo orden en que aparecen, sin saltarte ninguna ni repetir.',
  '  · apertura = el PRIMER precio, no el segundo (el segundo es el de cierre o el actual).',
  '  · beneficio = la columna Beneficio con su signo. En ROJO es NEGATIVO. Fíjate bien: hay filas con valores de miles junto a otras de unidades.',
  'PIE: el total que aparece abajo ("Beneficio: 5 247.05"). Es el dato más importante de todos, cópialo con cuidado.',
  '',
  'Copia los números EXACTAMENTE como se ven, con todos sus decimales. No redondees y no "corrijas" lo que te parezca raro.',
  'Si una celda no se distingue, pon null en ese campo. ESTÁ PROHIBIDO estimarla o repetir el valor de la fila de al lado.',
  'Es preferible una transcripción con huecos declarados que una completa e inventada.',
].join(String.fromCharCode(10));

/**
 * Sumar la columna Beneficio de operaciones YA CERRADAS.
 *
 * ── Por qué hace falta otra herramienta ───────────────────────────────────
 * `calcular_cesta` sirve para posiciones ABIERTAS: proyecta lo que dejarán al
 * llegar al TP. En la pestaña Historial las operaciones ya cerraron, y ahí la
 * columna Beneficio no es una flotante que cambia: es el resultado definitivo.
 * Calcularlo contra el TP en ese caso da un número que no significa nada.
 *
 * Son dos preguntas distintas —"cuánto va a dejar" y "cuánto dejó"— y hacen
 * falta dos herramientas, porque el dato de partida no es el mismo.
 */
const HERRAMIENTA_CERRADAS = {
  type: 'function' as const,
  function: {
    name: 'sumar_cerradas',
    description:
      'Suma la columna Beneficio de operaciones YA CERRADAS (pestaña Historial), separando ventas y compras. ' +
      'Úsala cuando la captura sea de historial y no de posiciones abiertas. Nunca sumes tú.',
    parameters: {
      type: 'object',
      properties: {
        operaciones: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              tipo: { type: 'string', enum: ['sell', 'buy'] },
              beneficio: {
                type: 'number',
                description: 'El valor de la columna Beneficio, con su signo. En rojo es negativo.',
              },
            },
            required: ['tipo', 'beneficio'],
          },
        },
        total_declarado: {
          type: 'number',
          description:
            'El total que muestra el pie de la captura ("Beneficio: 5 247.05"), si se ve. ' +
            'Sirve para comprobar que no se saltó ninguna fila.',
        },
      },
      required: ['operaciones'],
    },
  },
};

function sumarCerradas(args: any): string {
  const ops = Array.isArray(args?.operaciones) ? args.operaciones : [];
  if (!ops.length) return JSON.stringify({ error: 'No llegó ninguna operación.' });

  const redondear = (n: number) => Math.round(n * 100) / 100;
  type Cerrada = { n: number; tipo: 'sell' | 'buy'; beneficio: number };
  const filas: Cerrada[] = ops.map((o: any, i: number): Cerrada => ({
    n: i + 1,
    tipo: String(o?.tipo || '').toLowerCase().startsWith('s') ? 'sell' : 'buy',
    beneficio: Number(o?.beneficio) || 0,
  }));

  const suma = (f: Cerrada[]) => redondear(f.reduce((t, x) => t + x.beneficio, 0));
  const ventas = filas.filter((f) => f.tipo === 'sell');
  const compras = filas.filter((f) => f.tipo === 'buy');
  const total = suma(filas);

  /**
   * El pie de la captura es la mejor comprobación que hay: lo escribe la
   * plataforma. Si nuestra suma no coincide, es que se saltó una fila al
   * transcribir, y eso hay que decirlo en vez de entregar un total incompleto.
   */
  const declarado = Number(args?.total_declarado);
  const hayDeclarado = Number.isFinite(declarado);

  return JSON.stringify({
    filas,
    total_ventas: suma(ventas),
    total_compras: suma(compras),
    total,
    cuantas_ventas: ventas.length,
    cuantas_compras: compras.length,
    ...(hayDeclarado
      ? { total_declarado: declarado, cuadra: Math.abs(declarado - total) < 0.05 }
      : {}),
  });
}

/**
 * Instrucciones de la vuelta de cierre: ya están los números, solo hay que
 * presentarlos. Corto a propósito, porque aquí lo único que puede estropear
 * la respuesta es que se ponga a recalcular.
 */
const CIERRE_CON_CUENTAS = [
  'Eres el asistente de trading de Nesux Trading Academy. Hablas claro y al grano, en español.',
  'La calculadora ya te ha devuelto los resultados exactos de la cesta. COPIA esas cifras tal cual.',
  'PROHIBIDO recalcular, redondear de otra forma o cambiar un número. Si algo no cuadra, dilo; no lo arregles por tu cuenta.',
  'Responde solo lo que se te ha pedido y en el formato que se te haya pedido. Si pidieron los valores en columna, uno por renglón.',
  'Tienes `total_ventas` y `total_compras` ya calculados: si preguntan por las ventas y las compras por separado, esos son los números, no los sumes tú.',
  'Si viene `total_declarado` y `cuadra` es true, tu suma coincide con el pie de la captura: dilo en una línea, da confianza.',
  'Cuidado con no confundir las dos comprobaciones: `total_declarado` es el pie de la captura; `comprobacion_atajo` es la regla de los 10 USD por 0.01 de lote del CJ Bot. Si solo viene el atajo, NO digas que coincide con el pie de la captura, porque no lo has mirado.',
  'Si `cuadra` es false, NO presentes los totales como buenos. Di que la transcripción no coincide con el pie de la captura y pide que se amplíe la zona que no se lee. Un total confiado y equivocado hace más daño que reconocer que no se ve bien.',
  'Solo avisa de que algún dato pudo leerse mal si viene el campo `cuadra` y vale false. Si `cuadra` no aparece, NO menciones ninguna comprobación ni siembres dudas: el resultado es correcto.',
  'Nada de lo que se te dice aquí se repite en la respuesta: son instrucciones para ti, no texto para el alumno.',
].join(String.fromCharCode(10));

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
  '',
  'ANTES DE NADA, MIRA QUÉ CAPTURA ES. Hay dos y no se tratan igual:',
  '  · POSICIONES ABIERTAS (pestaña Operaciones): todavía no han cerrado. La columna Beneficio es la flotante de este instante y NO sirve. Lo que se pide es lo que dejarán al llegar al TP, y eso se calcula con la herramienta `calcular_cesta`.',
  '  · HISTORIAL (pestaña Historial, con Fecha/Hora de cierre y a menudo Swap): ya cerraron. Aquí la columna Beneficio SÍ es el resultado definitivo, y lo que hay que hacer es SUMARLA con la herramienta `sumar_cerradas`. Calcular contra el TP en este caso da un número sin sentido.',
  'Si dudas, fíjate en si hay una segunda Fecha/Hora (la de cierre) y un pie con "Beneficio:" total: eso es historial.',
  'CADA FILA QUE PASES A LA HERRAMIENTA TIENE QUE ESTAR EN LA CAPTURA. Ni una inventada, ni una repetida, ni una redondeada a un número bonito. Si ves once ventas, pasas once, con sus once valores distintos. Rellenar la lista con valores iguales (5, 5, 5, 5…) es fabricar datos, y es el peor fallo posible: quien lo lee cree que son sus operaciones.',
  'Cuenta las filas de la captura antes de empezar y comprueba que has pasado ese mismo número.',
  'En el historial, pasa también ese total del pie como `total_declarado`: lo escribe la plataforma y confirma que no te saltaste ninguna fila.',
  '',
  'CESTAS DEL CJ BOT — cómo se calcula, sin excepciones:',
  'Usa SOLO tres columnas: Tipo (sell/buy), Volumen y el PRIMER Precio (el de apertura). Más el T/P, que es común a toda la cesta.',
  'NO sumes la columna Beneficio: es la flotante de ahora mismo, no el resultado en el TP.',
  'Fórmula para SELL: (apertura − TP) × volumen. Para BUY: (TP − apertura) × volumen. En BTCUSD y en Volatility 75 el contrato es 1, así que no hay más factores.',
  '',
  'TÚ NO HACES LA MULTIPLICACIÓN. Tienes la herramienta `calcular_cesta`: pásale el TP y, de cada fila, tipo, volumen y precio de apertura. Te devuelve los resultados exactos y el total.',
  'Es OBLIGATORIO llamarla antes de dar ninguna cifra de una cesta, aunque la cuenta te parezca fácil. Está prohibido escribir un resultado que no venga de ella.',
  'Cuando te responda, copia sus números TAL CUAL. No los recalcules, no los ajustes, no los redondees de otra forma.',
  'El VOLUMEN se pasa tal cual está escrito: 0.01 es 0.01, nunca 1. Y la APERTURA es la PRIMERA columna Precio, nunca la segunda (esa es el precio de ahora).',
  'Si en la captura hay ventas y compras mezcladas, mándalas TODAS en la misma llamada con su tipo: la herramienta ya devuelve el total de las ventas y el de las compras por separado.',
  'Si cada fila tiene un T/P distinto, pasa el T/P dentro de cada operación en vez del común.',
  'Una cesta nunca cierra en negativo: los lotes grandes, que van doblando, superan de sobra a los pequeños. Si tu total sale negativo, está mal.',
  '',
  'EXCEPCIÓN QUE MANDA SOBRE TODO LO ANTERIOR — PETICIÓN CONCRETA:',
  'Si te piden un dato o un formato ESPECÍFICO, das exactamente eso y nada más.',
  '  · "solo los valores de las ventas, en columna" → una columna con esas cifras. Sin tabla, sin transcripción previa, sin análisis, sin introducción.',
  '  · "solo el total" → el número.',
  '  · "en la imagen 2" → miras la segunda que se adjuntó, no todas.',
  'Añadir la transcripción completa o consejos que nadie pidió NO es ser más útil: es no haber hecho caso. La transcripción de arriba es el método por defecto cuando la petición es abierta ("analiza esto"), no una obligación en cada respuesta.',
  'Y si te piden algo en una disposición concreta —en columna, en una línea, separado por comas, solo los negativos— respeta esa disposición al pie de la letra.',
  'VERTICAL o "en columna" o "uno debajo del otro" significa UN VALOR POR RENGLÓN, cada uno en su propia línea. No los separes con espacios ni con comas en la misma línea: eso es horizontal.',
  'Si te piden varias imágenes por separado, encabeza cada bloque con "Imagen 1", "Imagen 2"… en su propio renglón, y debajo sus valores, uno por línea.',
  'Ejemplo de lo que se espera cuando piden las ventas en vertical de dos imágenes:',
  'Imagen 1',
  '-20.56',
  '-26.95',
  '',
  'Imagen 2',
  '-10.28',
  '-6.46',
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

    /**
     * De quién son las preferencias que se van a recordar.
     *
     * Con sesión iniciada se usa el id del alumno, para que le acompañen en el
     * móvil y en el PC. Sin sesión, la del chat: es lo único que hay.
     */
    const sesionWeb = await getServerSession(authOptions).catch(() => null);
    const duenoDelChat = duenoDe((sesionWeb?.user as any)?.id, sessionId);

    // Construir contexto
    let model = 'gpt-4o';
    let userContent: any = userMessage;
    let imageDataUrl: string | undefined;

    /**
     * Varias imágenes en un mismo mensaje.
     *
     * Antes solo se leía `fileUrl`, una sola: mandar dos capturas para
     * compararlas era imposible, la segunda se perdía. `archivos` trae la cola
     * entera y cada imagen entra como una parte más del mensaje, numerada,
     * para poder decirle "en la imagen 2" y que sepa cuál es.
     */
    const listaArchivos: { url: string; fileName?: string }[] = Array.isArray(body.archivos)
      ? body.archivos
      : [];
    const imagenesTurno: string[] = [];

    for (const a of listaArchivos.slice(0, 6)) {   // tope: seis por mensaje
      const ext = await extractFile(a.url, a.fileName || '');
      if (ext.imageDataUrl) {
        imagenesTurno.push(ext.imageDataUrl);
        await guardarImagenSesion(sessionId, ext.imageDataUrl);
      } else if (ext.text) {
        userContent = `${userContent}\n\n--- CONTENIDO DE "${a.fileName}" ---\n${ext.text}\n--- FIN ---`;
      }
    }

    // Si hay archivo adjunto, léelo: imagen -> visión; documento -> texto en el contexto.
    if (fileUrl && !listaArchivos.length) {
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

    /**
     * Con imágenes de por medio, el cerebro compartido se salta.
     *
     * ── Por qué ───────────────────────────────────────────────────────────
     * Su contrato solo admite UNA imagen (`imageDataUrl`) y recibe el
     * historial como texto plano. Con dos capturas adjuntas llegaba sin
     * ninguna, y respondía lo único que podía responder: "envíamelas". Y en
     * los seguimientos —"descríbeme la segunda"— tampoco le llegaban las
     * anteriores, así que la memoria visual moría aquí.
     *
     * El camino local sí sabe leer varias y recuperar las del historial, así
     * que cuando hay imágenes se usa ese. El cerebro compartido sigue
     * atendiendo todo lo demás, que es la mayoría de la conversación.
     */
    const hayImagenesEnHistorial = (Array.isArray(messages) ? messages : []).some(
      (m: any) => Array.isArray(m.archivos) && m.archivos.length,
    );
    const conVision = imagenesTurno.length > 0 || !!imageDataUrl || hayImagenesEnHistorial;

    if (BRAIN_URL && !conVision) {
      try {
        const messageForBrain = typeof userContent === 'string' ? userContent : userMessage;
        const r = await fetch(`${BRAIN_URL.replace(/\/$/, '')}/api/nexy/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: messageForBrain,
            // 30 y no 12: con doce se perdía el principio de cualquier
            // conversación de trabajo, y el hilo seguía entero en pantalla —
            // por eso parecía que 'olvidaba' sin haber borrado nada.
            history: (Array.isArray(messages) ? messages : []).slice(-30).map((m: any) => ({ role: m.role, content: m.content })),
            profile: 'trading-web',
            channel: 'web',
            identity: (body?.email || body?.userEmail) ? { email: body.email || body.userEmail, name: body?.userName } : undefined,
            pageContext,
            // Las preferencias viajan también por aquí: si no, el asistente
            // las respetaría solo cuando hay imágenes de por medio.
            // `systemOverride` REEMPLAZA la persona del cerebro. Solo debe ir
            // ahí el modo aliado, que es justo lo que quiere reemplazarla.
            // Las preferencias y la regla de recordar se AÑADEN: mandarlas
            // como override borraba la persona del asistente en cada mensaje
            // de texto, y con ella la regla de la marca [[RECORDAR]] nunca
            // llegaba entera. Por eso decía que no podía aprender nada.
            systemOverride: systemPrompt || undefined,
            extraInstructions: [bloqueDePreferencias(duenoDelChat), COMO_RECORDAR].filter(Boolean).join(String.fromCharCode(10, 10)),
            imageDataUrl,
          }),
          signal: AbortSignal.timeout(45000),
        });
        if (r.ok) {
          const d = await r.json().catch(() => ({} as any));
          if (d?.reply) {
            const extraido = extraerYGuardar(d.reply, duenoDelChat);
            d.reply = extraido.texto;
            if (extraido.guardadas.length) console.log('🧠 Preferencias guardadas:', extraido.guardadas.join(' | '));
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

    /**
     * Con una captura delante, la base de conocimiento va recortada.
     *
     * ── Por qué ───────────────────────────────────────────────────────────
     * Los doce archivos suman 85 KB, unos 22 000 tokens, y la cuenta de
     * OpenAI admite 30 000 por minuto. Una sola pregunta con imagen se comía
     * el minuto entero: la siguiente respondía "tuve un problema al procesar"
     * aunque todo lo demás funcionara.
     *
     * Y para leer una tabla de operaciones no hace falta nada de eso: ni los
     * testimonios, ni el mapa del sitio, ni la landing. Hace falta saber
     * calcular una cesta. Eso es lo que se manda.
     */
    const knowledge = await loadKnowledge();
    const soloLoDelCalculo = () => {
      const trozos = knowledge.split('===== ARCHIVO: ').filter(Boolean);
      // Con una captura delante hacen falta: el calculo de cesta, las funciones
      // tecnicas y -sobre todo- como se leen las dos pantallas del bot (ventana de
      // parametros y panel), que es lo que el alumno fotografia. Sin esto ultimo el
      // bot describia la imagen sin saber que campo era cada uno.
      const utiles = trozos.filter((t) =>
        /^CJBot_(Cesta|ChatBot_3|v2\.51_(Pantallas_Referencia|Parametros))/.test(t)
      );
      return utiles.length ? utiles.map((t) => '===== ARCHIVO: ' + t).join('\n\n') : knowledge;
    };

    // Como función: `todasLasImagenes` se conoce más abajo, y hasta entonces
    // no se sabe si esta pregunta lleva captura.
    const knowledgeMessage = () => {
      const usado = conVision ? soloLoDelCalculo() : knowledge;
      return usado ? 'BASE DE CONOCIMIENTO OFICIAL:\n\n' + usado : '';
    };

    const finalSystemPrompt = systemPrompt || SYSTEM_PROMPT;
    // Seguimiento: pregunta sobre una captura enviada antes en esta misma sesion.
    if (!imageDataUrl && userMessage && IMG_REF.test(userMessage)) {
      imageDataUrl = await leerImagenSesion(sessionId);
    }

    // Las de este turno: la de `fileUrl` (camino antiguo) más las de la cola.
    const todasLasImagenes = [...(imageDataUrl ? [imageDataUrl] : []), ...imagenesTurno];

    /**
     * El historial, con sus imágenes puestas otra vez delante del modelo.
     *
     * ── El fallo que arregla ──────────────────────────────────────────────
     * El historial se mandaba como texto plano. Las imágenes de turnos
     * anteriores no viajaban, así que al preguntar "¿y cuánto sumaban las
     * ventas de la captura?" el modelo contestaba con sinceridad que no
     * recordaba ninguna imagen: nunca le había llegado. No era falta de
     * memoria, era que no se la dábamos.
     *
     * Se limitan a las tres últimas imágenes del historial: cada una consume
     * bastante contexto y con más la conversación se corta a media respuesta.
     */
    async function historialConImagenes(previos: any[]): Promise<any[]> {
      const ultimos = (Array.isArray(previos) ? previos : []).slice(-30);
      let cupo = 3;
      const salida: any[] = [];

      // Se recorre del final hacia atrás para que el cupo se gaste en las
      // imágenes más recientes, que son de las que se suele preguntar.
      for (let i = ultimos.length - 1; i >= 0; i--) {
        const m = ultimos[i];
        const suyas: { url: string }[] = Array.isArray(m.archivos) ? m.archivos : [];

        if (m.role !== 'user' || !suyas.length || cupo <= 0) {
          salida.unshift({ role: m.role, content: m.content });
          continue;
        }

        const partes: any[] = [{ type: 'text', text: m.content }];
        for (const a of suyas) {
          if (cupo <= 0) break;
          const ext = await extractFile(a.url, '');
          if (ext.imageDataUrl) {
            partes.push({ type: 'image_url', image_url: { url: ext.imageDataUrl, detail: 'high' } });
            cupo--;
          }
        }
        salida.unshift({ role: 'user', content: partes.length > 1 ? partes : m.content });
      }

      return salida;
    }

    const [alumnoInfo, catalogo] = await Promise.all([contextoDelAlumno(), catalogoActual()]);

    /**
     * Lo que esta persona pidió que se recordara.
     *
     * Va delante en cada respuesta, así que no hay que repetirle cómo quiere
     * las cosas. No es que el modelo "aprenda" —eso no ocurre—: es que se le
     * recuerda antes de cada turno.
     */
    const preferencias = bloqueDePreferencias(duenoDelChat);

    const apiMessages = [
      { role: 'system', content: finalSystemPrompt },
      ...(alumnoInfo ? [{ role: 'system', content: alumnoInfo }] : []),
      ...(preferencias ? [{ role: 'system', content: preferencias }] : []),
      { role: 'system', content: COMO_RECORDAR },
      ...(catalogo ? [{ role: 'system', content: catalogo }] : []),
      ...((): any[] => { const k = knowledgeMessage(); return k ? [{ role: 'system', content: k }] : []; })(),
      ...(pageContext ? [{ role: 'system', content: pageContext }] : []),
      // `conVision` y no solo las de este turno: las reglas de lectura hacen
      // igual de falta cuando se pregunta por una captura de más arriba.
      ...(conVision ? [{ role: 'system', content: LECTURA_IMAGEN }] : []),
      { role: 'system', content: turnInstruction },
      ...(await historialConImagenes(messages)),
      {
        role: 'user',
        content: todasLasImagenes.length
          ? [
              {
                type: 'text',
                text:
                  (userMessage ||
                    'Analiza esta imagen a fondo. Si es de trading (operaciones, historial, gráfico), interprétala con detalle educativo: ganancias/pérdidas por operación y por par, balance total, y enseña.') +
                  (todasLasImagenes.length > 1
                    ? `\n\n(Van ${todasLasImagenes.length} imágenes, en el orden en que se adjuntaron: imagen 1, imagen 2, etc. Respeta esa numeración si el usuario se refiere a una en concreto.)`
                    : ''),
              },
              // detail 'high' = la imagen se procesa en alta resolución. Sin esto,
              // en capturas de MT5 con cifras pequeñas el modelo confunde dígitos.
              ...todasLasImagenes.map((url) => ({
                type: 'image_url' as const,
                image_url: { url, detail: 'high' as const },
              })),
            ]
          : userContent,
      }
    ];

    /**
     * El reloj se reinicia en CADA llamada, no una vez para todas.
     *
     * Antes había un solo temporizador de 60 s para toda la conversación con
     * el modelo. Al entrar la calculadora hay dos idas y vueltas —leer la
     * captura y redactar con los números ya hechos— y el corte llegaba a
     * mitad de la segunda: la cuenta salía bien y el alumno veía "error al
     * procesar tu mensaje".
     */

    /**
     * Cuándo se OBLIGA a usar la calculadora.
     *
     * Dejarlo a su criterio no funciona: con la herramienta delante y la
     * instrucción de que era obligatoria, respondió igualmente de cabeza. Una
     * vez acertó y otra entregó las siete cifras diez veces más grandes. Que
     * salga bien por suerte es peor que que salga mal, porque no se nota.
     *
     * Así que cuando hay una captura delante y la pregunta va de lo que deja
     * la cesta, la llamada a la herramienta no es opcional. Fuera de ese caso
     * —"explícame qué es la martingala"— se deja libre, que no toca cuentas.
     */
    const PIDE_CUENTAS = /(cuant[oa]|total|suma|gana|ganancia|benefici|result|detalle|cesta|canasta|tp\b|take profit|falta|cierra|cerrar[áa]?|sell|buy|venta|compra)/i;

    /**
     * Cuenta también la captura de un turno ANTERIOR.
     *
     * Con `todasLasImagenes` a secas solo se activaba si la imagen venía
     * adjunta en ese mismo mensaje. Pero lo normal es subir la captura y
     * preguntar en los mensajes siguientes —"dame ahora las ventas y las
     * compras"—, y justo ahí se quedaba sin transcripción y sin calculadora:
     * volvía a echar las cuentas de cabeza y entregaba las cifras diez veces
     * más grandes que ya habíamos corregido.
     */
    const obligarCalculadora =
      (todasLasImagenes.length > 0 || hayImagenesEnHistorial) && PIDE_CUENTAS.test(userMessage || '');

    let primeraVuelta = true;
    let sinPoderLeer = false;
    let sinTranscripcion = false;

    /**
     * Antes de calcular, LEER. Dos pasos, no uno.
     *
     * ── El fallo que arregla ──────────────────────────────────────────────
     * Al obligar a llamar la calculadora en la primera respuesta, el modelo
     * tenía que rellenar la lista de operaciones de golpe, sin haber mirado
     * la tabla con calma. Y cuando no le da tiempo a leer, no dice "no lo
     * veo": rellena. De ahí salieron catorce ventas de "5" y cinco compras
     * de "0.5" que no existían en ninguna captura.
     *
     * Ahora primero transcribe, sin herramientas y sin prisa, que es lo que
     * un modelo de visión sabe hacer bien. Con su propia transcripción ya
     * escrita delante, rellenar la llamada es copiar de un texto, no
     * recordar una imagen. Son dos habilidades distintas y conviene no
     * pedirlas a la vez.
     */
    if (obligarCalculadora) {
      /**
       * La captura que se va a leer, ya troceada y ampliada.
       *
       * Se coge la última imagen de la conversación: es de la que se pregunta.
       */
      const ultimaConImagen = apiMessages.filter(
        (m: any) => m.role === 'user' && Array.isArray(m.content) && m.content.some((p: any) => p.type === 'image_url'),
      ).slice(-1)[0];

      const urlOriginal = (ultimaConImagen?.content || []).find((p: any) => p.type === 'image_url')?.image_url?.url;
      const franjas = urlOriginal ? await franjasAmpliadas(urlOriginal) : [];
      if (franjas.length > 1) console.log(`🔍 Captura partida en ${franjas.length} franjas ampliadas`);

      const conImagen: any[] = franjas.length
        ? [{
            role: 'user',
            content: [
              {
                type: 'text',
                text:
                  franjas.length > 1
                    ? `Esta captura viene partida en ${franjas.length} franjas horizontales y ampliadas, de arriba abajo. ` +
                      'Júntalas mentalmente: son una sola tabla. Se solapan unos píxeles, así que si una fila aparece ' +
                      'al final de una franja y al principio de la siguiente, cuéntala UNA sola vez.'
                    : 'Esta es la captura.',
              },
              ...franjas.map((url) => ({ type: 'image_url', image_url: { url, detail: 'high' } })),
            ],
          }]
        : [];

      /**
       * Se lee hasta TRES veces, y el pie de la captura decide cuál vale.
       *
       * ── Por qué hace falta ────────────────────────────────────────────
       * La suma lleva tiempo siendo exacta; lo que falla es leer cifras
       * diminutas de una captura de pantalla completa. En una lectura salió
       * 84.89 de ventas y −168.07 de compras cuando eran 71.49 y 5 175.56:
       * se saltó las dos filas grandes.
       *
       * Pero la propia captura trae la respuesta: el pie dice
       * "Beneficio: 5 247.05", y lo escribe la plataforma, no nosotros. Si
       * la suma de lo transcrito no da eso, la lectura está mal y punto. Y
       * si está mal, se vuelve a leer diciéndole en cuánto se ha desviado.
       *
       * Eso convierte un "a ver si acierta" en algo comprobable: o cuadra
       * con el pie, o se avisa de que no se pudo leer. Nunca un total
       * inventado con aire de certeza.
       */
      const leerUnaVez = async (pista: string) => {
        const r = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            temperature: 0,
            max_tokens: 3000,
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: TRANSCRIBIR },
              ...conImagen,
              { role: 'user', content: 'Transcribe la tabla de esa captura siguiendo las instrucciones.' + pista },
            ],
          }),
          signal: AbortSignal.timeout(60000),
        }).catch(() => null);

        if (!r?.ok) return null;
        const d = await r.json().catch(() => null);
        try {
          return JSON.parse(d?.choices?.[0]?.message?.content || '');
        } catch {
          return null;
        }
      };

      const redondear2 = (n: number) => Math.round(n * 100) / 100;
      let mejor: any = null;
      let pista = '';

      for (let intento = 1; intento <= 3; intento++) {
        const leido = await leerUnaVez(pista);
        const filas = Array.isArray(leido?.filas) ? leido.filas : [];
        if (!filas.length) continue;

        mejor = leido;

        const pie = Number(leido?.pie?.beneficio_total);
        // Sin pie no hay con qué comprobar. Se acepta la lectura, pero queda
        // marcado: no es lo mismo un número verificado que uno que nadie ha
        // podido contrastar.
        if (!Number.isFinite(pie)) {
          mejor.sinPie = true;
          break;
        }

        const sumado = redondear2(filas.reduce((t: number, f: any) => t + (Number(f?.beneficio) || 0), 0));
        const desvio = redondear2(pie - sumado);
        console.log(`👁️ Lectura ${intento}: ${filas.length} filas, suma ${sumado}, pie ${pie}`);

        if (Math.abs(desvio) < 0.05) {
          mejor.verificada = true;
          break;
        }

        pista =
          `\n\nATENCIÓN: en tu lectura anterior sumaste ${sumado} pero el pie de la captura dice ${pie}. ` +
          `Faltan ${desvio} por cuadrar, así que hay filas que te has saltado o valores mal leídos. ` +
          'Repásala entera fila por fila, mira bien las de importe grande y las que están en rojo, y vuelve a transcribirla completa.';
      }

      /**
       * Segunda pasada solo para la columna Tipo.
       *
       * ── Por qué hace falta otra comprobación ──────────────────────────
       * El pie de la captura valida el TOTAL, y por eso una lectura puede
       * cuadrar perfectamente y aun así estar mal repartida: pasó con dos
       * filas de compra etiquetadas como venta. El total seguía dando
       * 5 247.05 —los mismos números, otro montón— pero "ventas" y "compras"
       * salían falseadas, que era justo lo que se había pedido.
       *
       * Preguntar solo por esa columna es barato: devuelve una lista de
       * palabras, sin cifras que confundan. Y si las dos lecturas no
       * coinciden, se pregunta una tercera vez y manda la mayoría.
       */
      /**
       * El repaso se hace FRANJA POR FRANJA, no con la tabla entera.
       *
       * Con las 21 filas delante en una sola pregunta, el repaso repetía
       * exactamente el mismo error que la lectura: daba dos compras por
       * ventas. No es casualidad —es el mismo modelo con la misma carga— y
       * por eso dos lecturas iguales no valen como comprobación.
       *
       * Con siete filas delante el trabajo es otro: hay poco que seguir y la
       * columna se lee bien. Después se juntan las franjas.
       */
      const leerTiposDeFranja = async (franja: string): Promise<{ tipo: string; beneficio: number }[] | null> => {
        const r = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            temperature: 0,
            max_tokens: 400,
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'system',
                content: [
                  // La palabra "JSON" tiene que aparecer aquí: la API la exige
                  // cuando se pide respuesta en JSON, y sin ella devuelve un
                  // error 400 que dejaba esta comprobación muerta en silencio.
                  'Para cada fila de la tabla dime dos cosas: si es sell o buy, y su importe de la columna Beneficio.',
                  'Devuelve un JSON así: {"filas":[{"tipo":"sell","beneficio":5.22}]}',
                  'Nada más: ni precios de apertura, ni volúmenes, ni totales.',
                  // Se pide el importe junto al tipo a propósito: es lo que
                  // permite emparejar esta lectura con la transcripción por el
                  // número y no por la posición. Contar filas falla —la
                  // cabecera, el solape entre franjas—, pero un importe como
                  // 1262.34 identifica su fila sin lugar a dudas.
                  'El importe es la referencia para saber de qué fila hablas, así que cópialo exacto.',
                  'NO incluyas la cabecera ni el pie con los totales. Solo operaciones.',
                  'En esta imagen solo hay una parte de la tabla: transcribe las filas que veas, sin suponer las que no están.',
                ].join(' '),
              },
              {
                role: 'user',
                content: [
                  { type: 'text', text: 'Estas son las filas que tienes que mirar.' },
                  { type: 'image_url', image_url: { url: franja, detail: 'high' } },
                ],
              },
            ],
          }),
          signal: AbortSignal.timeout(45000),
        }).catch(() => null);

        if (!r?.ok) return null;
        const d = await r.json().catch(() => null);
        try {
          const t = JSON.parse(d?.choices?.[0]?.message?.content || '')?.filas;
          if (!Array.isArray(t)) return null;
          const limpio = t
            .filter((x: any) => Number.isFinite(Number(x?.beneficio)))
            .map((x: any) => ({
              tipo: /^(s|v)/i.test(String(x?.tipo || '').trim()) ? 'sell' : 'buy',
              beneficio: Number(x.beneficio),
            }));
          return limpio.length ? limpio : null;
        } catch {
          return null;
        }
      };

      if (mejor?.filas?.length && (mejor.verificada || mejor.sinPie)) {
        const porFranja = await Promise.all(franjas.map((f) => leerTiposDeFranja(f)));
        const juntas = porFranja.filter(Boolean).flat() as { tipo: string; beneficio: number }[];
        const repaso = juntas.length ? juntas : null;

        if (repaso) {
          /**
           * Se empareja por el importe, no por la posición.
           *
           * Contar filas no es fiable: unas veces cuela la cabecera, otras
           * duplica las del solape entre franjas. Pero un importe como
           * 1262.34 señala su fila sin ambigüedad, y es justo el dato que ya
           * está verificado contra el pie de la captura.
           */
          const porImporte = new Map<string, string>();
          for (const r of repaso) porImporte.set(r.beneficio.toFixed(2), r.tipo);

          let corregidas = 0;
          let sinPareja = 0;

          for (const f of mejor.filas) {
            const suyo = String(f?.tipo || '').toLowerCase().startsWith('s') ? 'sell' : 'buy';
            const delRepaso = porImporte.get(Number(f?.beneficio || 0).toFixed(2));

            if (!delRepaso) { sinPareja++; continue; }
            if (delRepaso !== suyo) { f.tipo = delRepaso; corregidas++; }
          }

          console.log(
            `👁️ Repaso de compra/venta: ${mejor.filas.length} filas, ${corregidas} corregidas, ${sinPareja} sin pareja`,
          );

          // Si más de un tercio no se pudo emparejar, el repaso no es de fiar
          // y conviene decirlo en vez de dar el reparto por bueno.
          if (sinPareja > mejor.filas.length / 3) mejor.tipoDudoso = true;
        } else {
          mejor.tipoDudoso = true;
          console.warn('👁️ El repaso de compra/venta no respondió.');
        }
      }

      const utilizable = mejor?.filas?.length && (mejor.verificada || mejor.sinPie);

      if (utilizable) {
        apiMessages.push(
          {
            role: 'assistant',
            content:
              'Transcripción de la captura' +
              (mejor.verificada ? ' (comprobada: la suma coincide con el pie de la captura)' : '') +
              ':\n' + JSON.stringify(mejor),
          } as any,
          {
            role: 'user',
            content:
              'Esa transcripción es la buena. Pasa ESAS filas, todas y sin cambiar ni un número, ' +
              'a la herramienta que corresponda, y responde a lo que te pedí.' +
              (mejor.tipoDudoso
                ? ' Aviso: no hay acuerdo sobre qué filas son compra y cuáles venta, así que el total conjunto es fiable ' +
                  'pero el reparto entre ventas y compras no. Dilo al darlo.'
                : ''),
          } as any,
        );
      } else if (mejor) {
        /**
         * Se leyó tres veces y ninguna cuadró con el pie de la captura: esos
         * números están mal y no se entregan.
         *
         * Dar un total "por si acaso" es lo peor que puede hacer aquí. Quien
         * lo lee cree que son sus operaciones y decide con eso. Antes decía
         * "no cuadra" y a renglón seguido soltaba las cifras igualmente, que
         * es la parte que había que quitar: si no se puede leer, se dice y
         * ya está.
         */
        console.warn('👁️ Tres lecturas y ninguna cuadra: no se entregan cifras.');
        sinPoderLeer = true;
      } else {
        /**
         * Ni una lectura devolvió filas: o la captura no tiene tabla, o no se
         * distingue nada.
         *
         * Aquí NO se puede cortar la conversación, porque igual la pregunta no
         * iba de operaciones. Pero sí hay que atar una cosa: sin transcripción,
         * el modelo se ponía a responder con las cifras del EJEMPLO del manual
         * —la cesta de 1 270— como si las hubiera leído de la captura. Tenía
         * los números a mano en la base de conocimiento y el hueco que
         * rellenar; el resto lo hace solo.
         */
        console.warn('👁️ Ninguna lectura devolvió filas.');
        sinTranscripcion = true;
        apiMessages.push({
          role: 'system',
          content: [
            'AVISO: se ha intentado transcribir la captura y no se ha podido sacar ninguna tabla de operaciones.',
            'Si te están preguntando por operaciones, di con claridad que no puedes leer esa captura y pide que te la manden más de cerca, solo la zona de la tabla. No des ninguna cifra.',
            'ESTÁ TERMINANTEMENTE PROHIBIDO usar los números de los EJEMPLOS de tu base de conocimiento (la cesta de 62642.85 y el total de 1270, o cualquier otro) como si fueran los de esta captura. Son un ejemplo para explicar el método, no datos de nadie.',
            'Si la pregunta no iba de una tabla de operaciones, respóndela con normalidad.',
          ].join(String.fromCharCode(10)),
        } as any);
      }
    }

    // Se responde aquí mismo, sin pasar por el modelo: si se le da la palabra
    // teniendo la transcripción mala delante, la acaba usando igualmente.
    if (sinPoderLeer) {
      const aviso = [
        'No he podido leer esa captura con seguridad.',
        '',
        'La he repasado tres veces y mis sumas no coinciden con el total que muestra la propia plataforma abajo, así que hay filas que no distingo bien. Prefiero decírtelo a darte unos números que podrían estar mal.',
        '',
        'Mándame la tabla más de cerca —solo la zona de las operaciones, sin el resto de la pantalla— y te la calculo entera.',
      ].join(String.fromCharCode(10));

      if (sessionId && db) {
        try {
          db.prepare('INSERT INTO chat_messages (sessionId, role, content) VALUES (?, ?, ?)').run(sessionId, 'assistant', aviso);
        } catch {}
      }
      return NextResponse.json({ content: aviso });
    }

    /**
     * La vuelta de cierre va LIGERA, sin la captura ni la base de conocimiento.
     *
     * ── Por qué ───────────────────────────────────────────────────────────
     * La cuenta de OpenAI admite 30 000 tokens por minuto y una petición con
     * imagen y los doce archivos de conocimiento se come unos 24 000. Repetir
     * todo eso para la segunda vuelta pasaba del límite y devolvía 429: la
     * calculadora hacía bien su trabajo y aun así el alumno leía "error al
     * procesar tu mensaje".
     *
     * Y no hace falta nada de eso: en esta vuelta la imagen ya está leída y
     * los números ya están calculados. Lo único que queda es redactar con
     * ellos, así que se manda lo justo para eso.
     */
    const mensajesDeCierre = () => {
      const cola = apiMessages.slice(apiMessages.findIndex((m: any) => m.role === 'user'));
      // El turno del usuario, sin las imágenes: solo lo que preguntó.
      const limpia = cola.map((m: any) =>
        m.role === 'user' && Array.isArray(m.content)
          ? { role: 'user', content: m.content.filter((p: any) => p.type === 'text').map((p: any) => p.text).join(' ') }
          : m,
      );
      return [
        { role: 'system', content: CIERRE_CON_CUENTAS },
        ...(preferencias ? [{ role: 'system', content: preferencias }] : []),
        ...limpia,
      ];
    };

    const pedir = () => {
      const control = new AbortController();
      const reloj = setTimeout(() => control.abort(), 60000);
      return fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
      },
      body: JSON.stringify({
        tools: [HERRAMIENTA_CESTA, HERRAMIENTA_CERRADAS],
        // Se obliga a usar ALGUNA de las dos, pero se le deja elegir cuál:
        // solo él ve la captura y sabe si son posiciones abiertas o historial.
        // Forzar una en concreto sería decidir por él con los ojos cerrados.
        // Si no se pudo transcribir nada, no se le obliga a llamar la
        // herramienta: obligarle sin datos que pasarle es empujarle a
        // inventárselos, que es exactamente lo que hacía.
        ...(obligarCalculadora && primeraVuelta && !sinTranscripcion ? { tool_choice: 'required' } : {}),
        // Con imagen: modelo grande y temperatura baja. Leer cifras de una tabla
        // es transcripción, no redacción creativa; el mini y una temperatura alta
        // eran justo lo que hacía que se inventara números.
        // `todasLasImagenes` y no `imageDataUrl`: con la cola nueva puede haber
        // imágenes sin que la variable antigua esté puesta, y entonces se caía
        // al modelo pequeño justo cuando más vista hacía falta.
        model: conVision ? 'gpt-4o' : model,
        messages: primeraVuelta ? apiMessages : mensajesDeCierre(),
        max_tokens: 4096,
        // Leer cifras de una tabla es transcripción, no redacción: con la
        // temperatura alta se inventaba dígitos.
        temperature: conVision ? 0.1 : 0.9,
        ...(conVision ? {} : { presence_penalty: 0.6, frequency_penalty: 0.5 }),
      }),
        signal: control.signal,
      } as any).finally(() => clearTimeout(reloj));
    };

    /**
     * Hasta tres vueltas: el modelo lee la captura y pide la cuenta, se la
     * damos hecha, y responde con esos números. Tres bastan de sobra —una
     * captura puede traer dos cestas— y evitan quedarse dando vueltas si el
     * modelo se empeña en llamar a la herramienta una y otra vez.
     */
    let crudo = '';
    for (let vuelta = 0; vuelta < 3; vuelta++) {
      let response = await pedir();

      /**
       * Si se agota el cupo del minuto, se espera y se reintenta una vez.
       *
       * La cuenta admite 30 000 tokens por minuto y una pregunta con captura
       * gasta buena parte. Cuando dos alumnos coinciden, OpenAI responde 429 y
       * dice en cuántos segundos vuelve a haber sitio. Esperar esos segundos
       * es mucho mejor que contestar "tuve un problema al procesar": la
       * respuesta llega, solo que algo más tarde.
       */
      if (response.status === 429) {
        const aviso = await response.clone().json().catch(() => ({} as any));
        const segundos = Number(/try again in ([\d.]+)s/.exec(aviso?.error?.message || '')?.[1]);
        const espera = Math.min(Math.max(segundos || 20, 5), 45);
        console.warn(`⏳ Cupo de OpenAI agotado, reintento en ${espera}s`);
        await new Promise((r) => setTimeout(r, espera * 1000));
        response = await pedir();
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error('OpenAI error:', response.status, errData);
        throw new Error('OpenAI: ' + response.status);
      }

      const data = await response.json();
      const msg = data.choices?.[0]?.message;
      const llamadas = msg?.tool_calls;

      if (!llamadas?.length) {
        crudo = msg?.content || '';
        break;
      }

      // Solo al pasar de vuelta se marca: si se hiciera antes, el reintento
      // por cupo agotado mandaría los mensajes de cierre sin haber llegado
      // nunca a leer la captura.
      primeraVuelta = false;

      apiMessages.push(msg as any);
      for (const llamada of llamadas) {
        const nombre = llamada.function?.name;
        let resultado: string;
        try {
          const datos = JSON.parse(llamada.function?.arguments || '{}');
          resultado = nombre === 'sumar_cerradas' ? sumarCerradas(datos) : calcularCesta(datos);
        } catch (e) {
          resultado = JSON.stringify({ error: 'No se pudieron leer los datos de las operaciones.' });
        }
        console.log(`🧮 ${nombre} →`, resultado.slice(0, 160));
        apiMessages.push({
          role: 'tool',
          tool_call_id: llamada.id,
          content: resultado,
        } as any);
      }
    }

    // Se sacan las preferencias que haya pedido guardar y se quitan del texto:
    // la marca es cosa nuestra, no algo que deba leer nadie.
    const { texto: content, guardadas } = extraerYGuardar(crudo, duenoDelChat);
    if (guardadas.length) console.log('🧠 Preferencias guardadas:', guardadas.join(' | '));

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
