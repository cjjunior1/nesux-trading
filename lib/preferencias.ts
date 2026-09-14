import Database from 'better-sqlite3';
import path from 'path';

/**
 * Lo que el asistente recuerda de cada persona.
 *
 * ── Qué problema resuelve ─────────────────────────────────────────────────
 * Un modelo de lenguaje no aprende de las conversaciones: lo que sabe quedó
 * fijado al entrenarlo. Cuando alguien le pide "guarda esto y hazlo siempre
 * así", decía la verdad al responder que no podía — no había dónde guardarlo.
 *
 * Esto es ese dónde. No enseña nada al modelo; guarda las indicaciones de la
 * persona y se las pone delante en cada respuesta, que a efectos prácticos es
 * lo mismo: no hay que repetirle cómo quieres las cosas.
 *
 * ── Por qué preferencias y no "todo" ──────────────────────────────────────
 * Se guardan indicaciones cortas sobre CÓMO trabajar ("los números en vertical
 * y alineados", "no me des la teoría, solo las cifras"), no la conversación
 * entera. El historial ya viaja aparte, y meter todo lo hablado en cada
 * petición saldría caro y empeoraría las respuestas.
 */

const RUTA = path.join(process.cwd(), 'data', 'chatbot.db');

/** Tope por persona: un prompt lleno de instrucciones se contradice a sí mismo. */
const MAX_PREFERENCIAS = 25;

let db: Database.Database | null = null;

function abrir(): Database.Database | null {
  if (db) return db;
  try {
    db = new Database(RUTA);
    db.exec(`
      CREATE TABLE IF NOT EXISTS preferencias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        duenoId TEXT NOT NULL,
        texto TEXT NOT NULL,
        creadoEn DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_pref_dueno ON preferencias(duenoId);
    `);
  } catch (e) {
    console.error('[preferencias] no se pudo abrir la base:', e);
    db = null;
  }
  return db;
}

/**
 * Quién es el dueño de la preferencia.
 *
 * Con sesión iniciada se usa el id del alumno, para que le siga en el móvil y
 * en el PC. Sin sesión se cae a la sesión del chat: es lo único que hay, y al
 * menos aguanta mientras dure esa conversación.
 */
export function duenoDe(userId?: string | null, sessionId?: string | null): string {
  return userId ? `u:${userId}` : `s:${sessionId || 'anonimo'}`;
}

export function guardarPreferencia(dueno: string, texto: string): boolean {
  const limpio = String(texto || '').trim().slice(0, 300);
  if (!limpio) return false;

  const base = abrir();
  if (!base) return false;

  try {
    // No se repite lo que ya está anotado casi igual: si no, pedir dos veces
    // lo mismo llenaría la lista de duplicados y desplazaría a los demás.
    const existentes = leerPreferencias(dueno);
    const normal = (s: string) => s.toLowerCase().replace(/[^a-záéíóúñ0-9 ]/gi, '').trim();
    if (existentes.some((p) => normal(p) === normal(limpio))) return true;

    base.prepare('INSERT INTO preferencias (duenoId, texto) VALUES (?, ?)').run(dueno, limpio);

    // Se conservan las más recientes; las viejas caen solas.
    base
      .prepare(
        `DELETE FROM preferencias
          WHERE duenoId = ?
            AND id NOT IN (SELECT id FROM preferencias WHERE duenoId = ? ORDER BY id DESC LIMIT ?)`,
      )
      .run(dueno, dueno, MAX_PREFERENCIAS);

    return true;
  } catch (e) {
    console.error('[preferencias] no se pudo guardar:', e);
    return false;
  }
}

export function leerPreferencias(dueno: string): string[] {
  const base = abrir();
  if (!base) return [];
  try {
    const filas = base
      .prepare('SELECT texto FROM preferencias WHERE duenoId = ? ORDER BY id ASC')
      .all(dueno) as { texto: string }[];
    return filas.map((f) => f.texto);
  } catch {
    return [];
  }
}

export function olvidarTodo(dueno: string): number {
  const base = abrir();
  if (!base) return 0;
  try {
    const r = base.prepare('DELETE FROM preferencias WHERE duenoId = ?').run(dueno);
    return r.changes || 0;
  } catch {
    return 0;
  }
}

/** El bloque que se le pone delante al asistente en cada respuesta. */
export function bloqueDePreferencias(dueno: string): string {
  const lista = leerPreferencias(dueno);
  if (!lista.length) return '';
  return [
    'LO QUE ESTA PERSONA TE HA PEDIDO QUE RECUERDES (cúmplelo sin que te lo repita):',
    ...lista.map((p, i) => `${i + 1}. ${p}`),
  ].join(String.fromCharCode(10));
}

/**
 * Marca con la que el asistente pide guardar algo.
 *
 * Se le explica en las instrucciones que, cuando le pidan recordar una forma
 * de trabajar, escriba [[RECORDAR: ...]] al final. El servidor lo saca del
 * texto, lo guarda y lo borra de la respuesta: la persona nunca ve la marca.
 *
 * Es más simple que montar llamadas a herramientas, y el asistente solo tiene
 * que aprender una regla.
 */
const MARCA = /\[\[\s*RECORDAR\s*:\s*([^\]]+)\]\]/gi;

export function extraerYGuardar(respuesta: string, dueno: string): { texto: string; guardadas: string[] } {
  const guardadas: string[] = [];
  const texto = String(respuesta || '').replace(MARCA, (_m, contenido) => {
    const pref = String(contenido).trim();
    if (pref && guardarPreferencia(dueno, pref)) guardadas.push(pref);
    return '';
  });

  return { texto: texto.replace(/\n{3,}/g, '\n\n').trim(), guardadas };
}
