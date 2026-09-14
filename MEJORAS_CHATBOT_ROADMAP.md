# Roadmap de mejoras — Chatbot Trading Academy (CJ Bot)

> Análisis realizado el 2026-09-03 sobre el código real del proyecto.
> Archivos clave: `app/api/chatbot/route.ts`, `components/chatbot.tsx`,
> `lib/chatbot/initial-messages.ts`, `knowledge/cj-bot/*.md`.

---

## 1. DIAGNÓSTICO — Qué tiene hoy (es más avanzado de lo que parece)

Fortalezas reales detectadas en el código:

- **Visión sobre capturas MT5 de tablas**: pipeline muy pulido — trocea la imagen en
  franjas ampliadas, transcribe hasta 3 veces, verifica la suma contra el pie de la
  captura (`cuadra`), y hace una segunda pasada para validar compra/venta.
- **Cálculo por herramientas (function calling)**: `calcular_cesta` y `sumar_cerradas`.
  Filosofía correcta: *"un modelo predice texto, no calcula"* → los números los hace JS.
- **Memoria**: historial en SQLite + imagen de la sesión 24 h + "preferencias" del alumno
  con marca `[[RECORDAR]]` + contexto real del alumno (nombre, cursos) y precios oficiales
  desde la BD.
- **Archivos adjuntos**: PDF, Word, Excel, TXT e imágenes (hasta 6 por mensaje).
- **Voz**: TTS (`gpt-4o-mini-tts`) y modo tiempo real (`gpt-realtime`).
- **Robustez**: reintento ante límite 429, timeouts por llamada, no rompe por errores.

Limitaciones detectadas (con evidencia en el código):

| # | Limitación | Evidencia |
|---|---|---|
| L1 | **Modelo fijo y antiguo: `gpt-4o`** (sin "razonamiento" ni lo último) | `route.ts` líneas 713, 1073, 1390 |
| L2 | **No hay RAG**: mete TODA la base (83 KB ≈ 21 000 tokens) en el prompt del sistema en cada mensaje | `loadKnowledge()` + `knowledgeMessage()` |
| L3 | **Con imagen, recorta el conocimiento a solo 2 de 13 archivos** → el bot "olvida" el manual mientras analiza una captura | `soloLoDelCalculo()` (filtra solo `Cesta` y `ChatBot_3`) |
| L4 | **No sabe "más del 100 %" del CJ Bot**: solo conoce lo escrito en los 13 `.md` (derivan del manual v2.43 y páginas web). Errores de instalación, casos de soporte reales, config Deriv/MT5, FAQ de alumnos, diferencias v2.30 vs v2.43… **no existen como conocimiento** | carpeta `knowledge/cj-bot/` |
| L5 | **No hay pipeline de "lectura de GRÁFICOS"** (velas, tendencia, soporte/resistencia). Todo está optimizado para *tablas de operaciones*. Un gráfico cae en el prompt general sin guía estructurada | `LECTURA_IMAGEN` / `TRANSCRIBIR` son solo para tablas |
| L6 | **No hay análisis de mercado en vivo**: sin API de precios solo analiza lo que el alumno adjunta | ninguna llamada a datos de mercado |
| L7 | **Costo/velocidad**: 21 000 tokens fijos por mensaje ≈ caro y cerca del límite de 30 k/min de la cuenta | comentarios en `route.ts` |
| L8 | **Sin citar la fuente**: responde con el manual pero no dice "según el manual, sección…" | sistema de prompt plano |
| L9 | **Mensajes iniciales muy agresivos** ("el 95% pierde", "tu Bot gana SIEMPRE") — riesgo legal y de confianza | `initial-messages.ts` |
| L10 | **Sin disclaimers legales** consistentes en respuestas de análisis/cifras | prompts actuales |

---

## 2. RECOMENDACIONES POR FASES

### FASE A — Impacto inmediato (horas, sin arquitectura nueva)

1. **Modelo configurable y actualizado**
   - Centralizar el modelo en `.env`: `OPENAI_CHAT_MODEL`, `OPENAI_VISION_MODEL`,
     `OPENAI_FAST_MODEL`, con `gpt-4o` como fallback automático si falla.
   - Subir a la serie actual de OpenAI (a fecha de hoy, **GPT-5.x**, p. ej. GPT-5.5 /
     variantes instantáneas para velocidad/costo; verificar en el dashboard de OpenAI
     cuáles tiene disponibles su cuenta).
   - Hacer prueba A/B de calidad: misma captura de MT5 con gpt-4o vs. modelo nuevo;
     medir cuántas lecturas cuadran con el pie a la primera.

2. **Conocimiento "100 % CJ Bot" — ampliar la base (tarea de contenido)**
   Crear en `knowledge/cj-bot/` los archivos que faltan (uno por tema):
   - `FAQ_Soporte.md` — preguntas reales de alumnos/soporte con respuestas.
   - `Instalacion_Paso_a_Paso.md` — MT5 + Deriv + VPS + móvil (comprobable, no inventado).
   - `Errores_Comunes.md` — códigos de error MT5/Deriv y su solución.
   - `Configuracion_Recomendada.md` — parámetros por par/instrumento según manual.
   - `Diferencias_Version.md` — v2.30 vs v2.43 vs futuras.
   - `Gestion_Riesgo_Bot.md` — cómo protege el capital el bot (para explicarlo educativamente).
   - `Glosario.md` — términos (EA, cesta, martingala, TP, lote, spread…).
   - Auditar contra la fuente de verdad (manual real, config del EA, chats de soporte,
     videos del curso) para detectar huecos.
   - Regla al responder: cuando use un archivo, citar su nombre ("según el manual del
     CJ Bot v2.43, sección Instalación…").

3. **Cargar conocimiento por contexto (sin RAG todavía)**
   Ya lo hacen para cestas (`soloLoDelCalculo`). Extender la idea:
   - Adjuntar imagen de *tabla* → solo docs de cálculo (como hoy).
   - Adjuntar imagen de *gráfico* → solo docs de análisis/estrategia.
   - Pregunta de *soporte/instalación* → solo docs operativos.
   - Pregunta *comercial* (precios, cursos) → solo docs web/landing.
   Detección simple por palabras clave en `userMessage` (patrón ya usado con `PIDE_CUENTAS`).

4. **Disclaimers legales**
   Añadir al prompt de cierre: "esto es educación, no asesoría financiera; el pasado no
   garantiza resultados; el riesgo es del usuario" — siempre que se den cifras/análisis.

### FASE B — Lectura de GRÁFICOS (visión técnica estructurada)

5. Nuevo modo **`ANALISIS_GRAFICO`** (separado de `TRANSCRIBIR`): cuando la imagen sea un
   gráfico de velas (detectar por la petición o por contenido), guiar al modelo con un
   protocolo fijo:
   - Pedir/confirmar **activo + timeframe** antes de opinar (si no están, preguntar).
   - Salida estructurada: tendencia general → estructura de mercado → soportes/resistencias
     aproximados → patrones de velas visibles → contexto del CJ Bot (dónde podría operar su
     estrategia según manual) → riesgos → **próximo paso educativo**.
   - Prohibir inventar niveles exactos: presentarlos como "zonas aproximadas".
   - Reutilizar las franjas ampliadas ya implementadas (`franjasAmpliadas`) para leer
     etiquetas de precio pequeñas.
6. Enseñar "qué haría el CJ Bot aquí": explicar el razonamiento de la estrategia del bot
   sobre el gráfico (educativo, nunca promesa de ganancia).

### FASE C — Análisis de mercado con datos reales

7. **Integrar datos de mercado en vivo** como nueva herramienta (function calling):
   - Los instrumentos del CJ Bot (BTCUSD y Volatility 75) son de **Deriv** → API pública
     de Deriv (o alternativa gratuita tipo Binance para BTC) para precio/velas.
   - Herramienta `consultar_mercado(activo, timeframe)` → el modelo pide el dato, lo recibe
     y lo interpreta educativamente. Nunca debe "inventar" el precio.
   - Mismo principio que las cestas: *el modelo no calcula ni inventa el dato; la API lo trae*.
8. **Resumen de mercado opcional**: análisis diario de tendencia/volatilidad para alumnos
   (con disclaimer).

### FASE D — IA avanzada en la calidad de las respuestas

9. **RAG real (búsqueda semántica)** cuando la base crezca:
   - Indexar los `.md` por secciones con embeddings de OpenAI.
   - Guardar vectores en **Supabase pgvector** (ya usan Supabase) o SQLite con búsqueda
     simple de palabras clave (más fácil, sin dependencias).
   - Por cada pregunta, recuperar solo las 3-5 secciones relevantes → respuestas precisas,
     con fuente, y sin gastar 21 000 tokens por mensaje.
10. **Enrutar por dificultad/intención** (dos "cerebros"):
    - Pregunta conceptual o de análisis complejo → modelo grande con razonamiento.
    - Soporte rápido (precios, versión, instalación, catálogo) → modelo instantáneo barato.
11. **Streaming**: enviar la respuesta por trozos (UX moderna) — hoy el usuario espera la
    respuesta completa.
12. **Memoria de largo plazo por alumno**: resumen persistente (qué bot configura, su nivel,
    sus preferencias) además del historial de 30 mensajes.
13. **Más herramientas de cálculo** (extender la filosofía actual):
    - `calcular_tamano_lote(saldo, riesgo_%, sl_pips)`.
    - `proyectar_martingala(niveles, lote_inicial, multiplicador)`.
    - `interpretar_cesta_riesgo(filas)` — qué riesgo asume el alumno con su cesta abierta.
14. **Calidad y medición**: registrar logs de cada respuesta con su captura y resultado
    (cuadra/no cuadra) para medir mejoras; revisar los mensajes iniciales
    (`initial-messages.ts`) para quitar promesas de ganancias ("SIEMPRE gana") y sustituirlas
    por lenguaje educativo con disclaimer.

---

## 3. ORDEN SUGERIDO DE EJECUCIÓN

1. **A1 + A3** (modelo por env + carga por contexto) → cambio de código pequeño, gran efecto.
2. **A2** (ampliar conocimiento CJ Bot) → tarea de contenido; el bot mejora al día siguiente.
3. **A4 + B5** (disclaimers + modo análisis de gráfico) → nueva capacidad visible.
4. **C7** (datos de mercado en vivo vía Deriv API).
5. **D9-D14** (RAG, enrutamiento, streaming, memoria) → cuando la base y el uso lo pidan.

> Regla de oro que ya sigue el proyecto y hay que mantener: **los datos y las cuentas los
> traen herramientas deterministas (JS/APIs); el modelo solo lee, interpreta y explica.**
