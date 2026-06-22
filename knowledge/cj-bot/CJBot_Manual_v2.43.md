# CJ Bot v2.43 — Manual de Usuario Completo

> Robot de trading automático (Expert Advisor / EA) para **MetaTrader 5**.
> Autor: **CJ Junior Cabrera** — cjjuniorstore.com
> Guía para principiantes, explicada paso a paso, pero también con el detalle técnico que pide un usuario avanzado.

---

## Índice
1. [Qué es el CJ Bot](#1-qué-es-el-cj-bot)
2. [Conceptos básicos](#2-conceptos-básicos)
3. [Requisitos antes de empezar](#3-requisitos-antes-de-empezar)
4. [Instalación paso a paso](#4-instalación-paso-a-paso)
5. [Licencia y seguridad](#5-licencia-y-seguridad)
6. [Los 25 parámetros, uno por uno](#6-los-25-parámetros-uno-por-uno)
7. [El Número Mágico en detalle](#7-el-número-mágico-en-detalle)
8. [Modos de operación](#8-modos-de-operación)
9. [Las 18 estrategias por familia (nones / pares)](#9-las-18-estrategias-por-familia-nones--pares)
10. [Gestión de capital: Martingala y Recuperación](#10-gestión-de-capital-martingala-y-recuperación)
11. [Trailing Stop (protección de ganancias)](#11-trailing-stop-protección-de-ganancias)
12. [Protección de equidad](#12-protección-de-equidad)
13. [El panel visual](#13-el-panel-visual)
14. [Reportes y exportación](#14-reportes-y-exportación)
15. [Cómo hacer un backtest correctamente](#15-cómo-hacer-un-backtest-correctamente)
16. [Buenas prácticas y protección del capital](#16-buenas-prácticas-y-protección-del-capital)
17. [Novedades de la v2.43](#17-novedades-de-la-v243)
18. [Preguntas frecuentes](#18-preguntas-frecuentes)
19. [Aviso de riesgo](#19-aviso-de-riesgo)

---

## 1. Qué es el CJ Bot

El **CJ Bot v2.43** es un robot de trading (técnicamente un **Expert Advisor** o **EA**) que funciona dentro de **MetaTrader 5 (MT5)**. Un robot de trading **abre, gestiona y cierra operaciones por ti**, siguiendo reglas fijas, sin que tengas que estar frente a la pantalla.

El CJ Bot combina:
- **18 estrategias técnicas** (03–20) organizadas por familia: **nones = reversión, pares = tendencia**.
- Un **modo por tiempo** y un **modo seguidor**.
- **Gestión de capital**: martingala (cesta) o recuperación.
- **Protecciones**: trailing stop, protección de equidad y validación de margen.
- Un **panel visual** en el gráfico para ver y controlar todo en tiempo real.

> **Si nunca has usado un robot:** piénsalo como un "piloto automático". Tú defines las reglas (los parámetros), lo activas y el bot opera siguiendo esas reglas. Este manual explica cada botón y cada parámetro con palabras sencillas.

---

## 2. Conceptos básicos

| Término | Qué significa |
|---|---|
| **Operación / Posición** | Una compra o una venta abierta en el mercado. |
| **Lote / Lotaje** | El tamaño de la operación. Más lote = más dinero por cada movimiento del precio. |
| **Punto** | La mínima variación de precio. El bot mide distancias en puntos. |
| **Take Profit (TP)** | Precio objetivo donde se cierra con **ganancia**. |
| **Stop Loss (SL)** | Precio donde se cierra con **pérdida** para no perder más. |
| **Spread** | Diferencia entre el precio de compra y de venta (costo del broker). |
| **Número Mágico** | "Etiqueta" numérica que identifica las operaciones de este bot. |
| **Cuenta Demo** | Cuenta de práctica con dinero ficticio. **Ideal para empezar.** |
| **Cuenta Real** | Cuenta con dinero real. |
| **Hedging / Netting** | Hedging permite varias operaciones a la vez en el mismo símbolo (lo necesita la cesta). Netting solo permite una posición por símbolo. |

---

## 3. Requisitos antes de empezar

1. **Plataforma:** MetaTrader 5 (MT5). **No** funciona en MT4.
2. **Tipo de cuenta:** se recomienda **Hedging** (cobertura). En **Netting** la cesta de martingala **no funciona correctamente**.
3. **Licencia:** contraseña correcta y número de cuenta autorizado (ver sección 5).
4. **Capital suficiente:** sobre todo si usas martingala.

> **Hedging vs Netting (importante):**
> - **Hedging:** varias operaciones a la vez en el mismo símbolo (incluso compra y venta juntas). El bot la **necesita** para la cesta de martingala.
> - **Netting:** una sola posición por símbolo. No sirve para la cesta.

---

## 4. Instalación paso a paso

1. Copia el archivo **`CJBot_v2.43.ex5`** (ya compilado) en la carpeta `MQL5 > Experts` del terminal MT5. (Menú: *Archivo > Abrir carpeta de datos*).
2. Reinicia MT5 o actualiza la lista de Asesores Expertos (clic derecho > Actualizar).
3. Abre el gráfico del símbolo y la temporalidad que quieras operar.
4. Arrastra el **CJ Bot v2.43** desde el Navegador hasta el gráfico.
5. Activa **"Permitir Algo Trading"** y configura los parámetros (sección 6).
6. Asegúrate de que el botón **"Algo Trading"** de la barra de MT5 esté encendido (verde).

> Cuando el bot está corriendo, aparece el **panel visual** en el gráfico. Si lo ves, todo está en marcha.

---

## 5. Licencia y seguridad

El acceso lo controla el **desarrollador** desde el código, antes de compilar. El usuario final no cambia estos valores:

| Control | Para qué sirve |
|---|---|
| **Modo de cuenta permitido** | Define dónde puede correr: Solo Demo, Solo Real o Ambas. |
| **Contraseña maestra** | El usuario debe escribir la contraseña correcta. |
| **Lista de cuentas autorizadas** | Opcional: limita el bot a cuentas específicas. |
| **Fecha de vencimiento** | La licencia deja de funcionar tras una fecha. |
| **Rango de balance** | El bot no inicia si el balance está fuera de rango. |

**Parámetros de licencia que SÍ ve el usuario:**
- **Número de Cuenta de Licencia:** tu número de cuenta MT5 autorizado.
- **Contraseña de Licencia:** la contraseña que te entregaron.

> Si alguna validación falla, el bot **no arranca** y muestra el error exacto en el Diario (*Journal*) de MT5.

---

## 6. Los 25 parámetros, uno por uno

| # | Parámetro | Qué hace | Por defecto |
|---|---|---|---|
| 1 | **Estrategia de Entrada** | Cómo decide entrar: Por Tiempo, Seguidor o una de las 18 (03–20). | Solo Tiempo |
| 2 | **Dirección de Operaciones** | Solo Comprar, solo Vender o Ambas. | Ambas |
| 3 | **Temporalidad de la Señal** | Marco de tiempo de las señales (M1, M5, H1…). "Actual" = la del gráfico. | Actual |
| 4 | **Lotaje Inicial** | Tamaño de la primera operación. Principiantes: el mínimo (0.01). | 0.01 |
| 5 | **Take Profit (puntos)** | A cuántos puntos de ganancia cierra. | 100000 |
| 6 | **Stop Loss (puntos)** | A cuántos puntos de pérdida cierra (modo individual/recuperación). | 50000 |
| 7 | **Activar Trailing TP** | Si el objetivo "persigue" al precio para dejar correr la ganancia. | Sí |
| 8 | **% Activación Trailing TP** | A qué % del TP se activa ese seguimiento. | 70% |
| 9 | **% Distancia Trailing TP** | Qué tan lejos del precio se coloca el TP al seguirlo. | 30% |
| 10 | **Activar Trailing SL** | Si el SL se mueve a favor para asegurar ganancia. | Sí |
| 11 | **% Activación Trailing SL** | A qué % del TP empieza a moverse el SL. | 60% |
| 12 | **% Distancia Trailing SL** | Qué tan cerca del precio se coloca el SL. | 30% |
| 13 | **Activar Martingala** | Modo de gestión: Desactivada / Martingala (cesta) / Recuperación. | Martingala |
| 14 | **Multiplicador Martingala** | Cuánto crece el lote en cada respaldo (2.0 = doble). | 2.0 |
| 15 | **Puntos primer respaldo** | Distancia en contra para el primer respaldo. | 50000 |
| 16 | **Incremento % respaldos** | Cuánto se aleja cada respaldo respecto al anterior. | 25% |
| 17 | **Cantidad de Martingalas** | Máximo de respaldos en la cesta. | 7 |
| 18 | **Segundos de espera/estabilidad** | Tiempo que la condición debe mantenerse antes de respaldar o reentrar. | 10 |
| 19 | **Frecuencia de Vigilancia (ms)** | Cada cuánto revisa el mercado. 1000 = cada segundo. | 1000 |
| 20 | **ID Mágico** | Etiqueta que identifica las operaciones del bot (sección 7). | 100 |
| 21 | **Comentario** | Texto en cada orden del bot. | CJ Bot v2.43 |
| 22 | **Activar Protección de Equidad** | Cierra TODO al llegar a un tope de ganancia o pérdida en USD. | Sí |
| 23 | **Activar Ventanas Emergentes** | Muestra avisos en pantalla. | Sí |
| 24 | **Pérdida Máxima (USD)** | Si la pérdida total llega a este monto, cierra todo. | 5000 |
| 25 | **Ganancia Máxima (USD)** | Si la ganancia total llega a este monto, cierra todo. | 5000 |

> **Internos (no editables):** el retardo del trailing del SL es de **3 segundos** y el del TP de **5 segundos**, para que los niveles no "bailen" con velas rápidas.

---

## 7. El Número Mágico en detalle

El Número Mágico (parámetro 20) es la etiqueta que el bot pone a sus operaciones para reconocerlas. Es **fundamental** en el **modo Seguidor**.

**Reglas correctas:**
- **Seguir operaciones MANUALES:** las manuales tienen magia **0**, así que el mágico del bot debe ser **distinto de 0** (ej. 100).
- **Seguir OTRO bot:** mágico **distinto al de ese bot y distinto de 0** (ej. 777).
- En modo Seguidor el mágico **nunca** debe ser 0.

> **Recomendación pro:** usa un **mágico distinto por activo** (V75 = 40, GBPUSD = 41, USDJPY = 42…). Así cada instancia gestiona **solo lo suyo** y los reportes no se mezclan.
>
> **Caso especial:** si pones el mágico en **0**, el bot considera suyas **todas** las operaciones del símbolo (incluidas manuales o de otro EA). Útil a propósito, peligroso por accidente.

---

## 8. Modos de operación

1. **Por Tiempo (01):** entra en **cada barra nueva**, sí o sí; la dirección la deciden **5 estrategias al azar** (empate → alterna). Es el modo típico para martingala.
2. **Seguidor (02):** copia operaciones externas (manuales o de otro bot). Ver sección 7.
3. **Estrategia individual (03–20):** opera con una sola estrategia técnica.
4. **Multi-estrategia (botón MULTI ON):** combina las estrategias 03–20 marcadas y entra cuando un **mínimo de confirmaciones** coincide. Las 01 y 02 **no** participan.

> **Consejo (v2.43):** en multi conviene marcar estrategias de **una sola familia** (todas nones o todas pares) para que **tendencia y reversión no se anulen** entre sí.

---

## 9. Las 18 estrategias por familia (nones / pares)

Desde la **v2.43**, las 18 estrategias (03–20) se organizan por **paridad del número** en dos familias iguales (9 y 9):

- **NONES (impares) = Reversión:** apuestan a que el precio **rebota** desde un extremo (sobreventa/sobrecompra, toques de banda de Bollinger). Rinden mejor en mercados en **rango**.
- **PARES = Tendencia:** apuestan a que el movimiento **continúa** (cruces de EMA, EMAs alineadas, Aroon fuerte, MACD). Rinden mejor en mercados en **tendencia**.

En el panel se distinguen por color: los botones **pares** van en **verde oscuro** y los **nones** en **verde más claro**, con las letras de distinto color.

### 9.1 Nones — Reversión (rebote)

| # | Nombre | Regla exacta (compra; venta al revés) | Efectividad |
|---|---|---|---|
| 03 | EMA + RSI | Precio bajo la EMA media, RSI venía < 30 y **gira** al alza | **Media-Alta** |
| 05 | Solo RSI | RSI cruza al alza el 30 (sale de sobreventa) | Media-Baja |
| 07 | MACD + Bollinger | Precio toca banda baja **+** MACD sobre su señal | **Media-Alta** |
| 09 | Bollinger + Stochastic | Banda baja **+** Stoch venía < 20 y cruza arriba | **Alta** |
| 11 | MACD + Stochastic | Stoch < 20 cruza arriba **+** MACD alcista | **Media-Alta** |
| 13 | Stochastic + Volumen | Stoch < 20 cruza arriba **+** volumen sube | Media |
| 15 | Bollinger + Volumen | Banda baja **+** volumen sube | Media-Baja |
| 17 | Aroon + Stochastic | Stoch < 20 cruza arriba **+** Aroon up > down (giro) | Media |
| 19 | EMA + Bollinger + Stochastic | Banda baja **+** Stoch cruza **+** precio sobre EMA-100 (rebote a favor de la tendencia mayor) | **Alta** (poco frecuente) |

### 9.2 Pares — Tendencia (continuación)

| # | Nombre | Regla exacta (compra; venta al revés) | Efectividad |
|---|---|---|---|
| 04 | Cruce EMA | EMA rápida cruza arriba la media | Media-Baja |
| 06 | Triple EMA + Aroon | 3 EMAs alineadas arriba **+** Aroon > 70 | **Alta** |
| 08 | MACD + Volumen | MACD cruza arriba **+** volumen sube | Media |
| 10 | Triple EMA + RSI + Aroon | 3 EMAs **+** RSI > 50 **+** Aroon > 70 | **Alta** (poco frecuente) |
| 12 | Aroon + Volumen | Aroon > 70 **+** volumen sube | Media |
| 14 | Aroon + MACD | Aroon > 70 **+** MACD alcista | **Media-Alta** |
| 16 | Aroon + RSI | Aroon > 70 **+** RSI > 50 | Media |
| 18 | Aroon + MACD + RSI | Aroon > 70 **+** MACD alcista **+** RSI > 50 | **Alta** (poco frecuente) |
| 20 | EMA + MACD + Volumen | EMA media > lenta **+** MACD alcista **+** volumen sube | **Media-Alta** |

### 9.3 Cómo leerlo

- **Más condiciones = menos señales pero mejor calidad** → 09, 19, 06, 10, 18 son las más fiables (y más raras).
- **1–2 condiciones = más señales, más ruido** → 05, 04, 15.
- **El volumen en índices sintéticos (p. ej. V75) es de ticks y aporta poco** → resta valor a 08, 12, 13, 15, 20.
- **Reversión rinde en rango; Tendencia rinde en tendencia.** Por eso conviene activar familias completas según el mercado.

> **Honestidad:** la efectividad es **relativa** (qué tan filtrada está la señal), **no** una garantía de ganancia. En instrumentos sintéticos ninguna estrategia tiene un edge fuerte por sí sola: lo que más pesa en el resultado es la **gestión de riesgo**.
>
> Indicadores y ajustes: EMA 10/30/100, RSI 14 (niveles 30/70), Aroon 14 (umbral 70), MACD 12/26/9, Estocástico 5/3/3, Bollinger 20/2.0. Todas leen la **última vela cerrada**.

---

## 10. Gestión de capital: Martingala y Recuperación

### 10.1 Martingala (cesta)

Cuando una operación va en contra, el bot abre **respaldos** en la misma dirección para **promediar** el precio. Toda la cesta comparte un **Take Profit único** sobre el precio promedio; cuando el precio regresa, **cierra todo junto** con ganancia.

- Cada respaldo **multiplica** el lote (parámetro 14).
- La distancia de cada respaldo **crece** un porcentaje (parámetro 16).
- Máximo de respaldos: parámetro 17.
- La condición debe mantenerse estable los segundos del parámetro 18.
- **La cesta NO lleva Stop Loss por operación** (es ilógico promediar y cortar a la vez): su protección es el **Take Profit único** y la **protección de equidad** (parámetro 24).

> **Novedad v2.43 — distancia acumulada desde L0:** el umbral del siguiente respaldo se mide como **distancia acumulada desde la primera operación de la cesta (L0)**, leída de las posiciones abiertas. Así el respaldo se abre **donde de verdad corresponde** a su nivel, aunque haya habido un reinicio de MT5 o las operaciones las haya abierto otro EA. Antes, un reinicio podía hacer que los respaldos se abrieran demasiado cerca.

**Ejemplo de espaciado** (base 500 puntos de precio, incremento 50%):
- L0 → L1: a 500 del L0.
- L1 → L2: acumulado 1250 desde L0 (500 + 750).
- L2 → L3: acumulado 2375 desde L0, etc.

### 10.2 Recuperación

Modo de **una operación a la vez**. Tras una pérdida, calcula un lote que **recupere lo perdido en la racha + la ganancia objetivo inicial**, y **nunca baja del lote inicial**. Tras una ganancia, **reinicia**. Espera los segundos del parámetro 18 tras cada cierre antes de reentrar.

> **Novedad v2.43 — recuperación dirigida por estrategias:** en Recuperación el bot **ya no entra por tiempo**. Tanto la **entrada inicial** como la **reentrada** las deciden las **estrategias reales** (el modo "Solo Tiempo" queda **exclusivo de Martingala**). Además, al iniciar **reconstruye el estado de la racha leyendo el historial** de operaciones cerradas, de modo que recompilar o reiniciar MT5 **no borra** la recuperación en curso.

> **Advertencia de riesgo:** la martingala y la recuperación pueden generar **pérdidas grandes** si el mercado va en contra de forma prolongada. Usa **lote mínimo**, **distancias prudentes**, **capital suficiente** y mantén activa la **protección de equidad**. Ningún sistema con martingala está libre de riesgo.

---

## 11. Trailing Stop (protección de ganancias)

- **Trailing SL:** cuando la ganancia supera el % de activación (parámetro 11), el Stop Loss se mueve hacia el precio para **asegurar** parte de la ganancia. **Nunca retrocede.** Esto convierte muchas operaciones que se girarían en **ganadoras parciales**, en vez de volver al SL completo.
- **Trailing TP:** cuando la ganancia supera su % de activación (parámetro 8), el objetivo se **aleja** para dejar correr la ganancia.
- **Estabilidad:** el SL espera **3 segundos** y el TP **5 segundos** antes de moverse, para no reaccionar a velas rápidas.
- El trailing solo actúa cuando hay **una sola operación** abierta en esa dirección.

---

## 12. Protección de equidad

Si está activada (parámetro 22), el bot suma la ganancia/pérdida (flotante) de **todas** sus operaciones y **cierra todo** cuando llega a la **ganancia máxima** (parámetro 25) o a la **pérdida máxima** (parámetro 24). Funciona en **todos los modos**, incluida la cesta de martingala. Es tu **red de seguridad** principal, sobre todo porque la cesta no lleva Stop Loss propio.

> **Consejo:** ajusta el parámetro 24 a un % de tu balance que estés dispuesto a arriesgar (p. ej. no más del 20–30%). Es lo que frena una racha en contra.

---

## 13. El panel visual

El panel aparece en el gráfico y muestra/controla todo:

- **Estado:** Bot (Activo / Parado / MT5 off), Estrategia, Martingala, Dirección, Mercado y tipo de Cuenta.
- **Rango Máximo/Mínimo** del activo, con botón Hora / Día / Semana / Mes.
- **Estadísticas de sesión:** abiertas, cerradas, ganadas, perdidas, % de aciertos, G/P flotante y realizado, rendimiento.
- **Cesta actual:** estrategias, posiciones, lotaje, precio promedio, G/P y distancia al objetivo.
- **Multi-estrategia (03–20):** botones para marcar estrategias. **Pares en verde oscuro, nones en verde más claro** (con letras de distinto color), control del mínimo de confirmaciones (− y +) y botón **MULTI ACTIVADO/DESACTIVADO**.
- **Controles:** botón **BOT ACTIVO/PARADO** y botón de Color de fondo.
- **Exportar:** botones CSV y HTML.

**Atajos:** tecla `V` muestra/oculta el panel; `+` y `−` cambian el tamaño de letra.

> **Sobre BOT ACTIVO/PARADO:** pausa el bot, pero **no** puede apagar el "Algo Trading" de MT5 (es protección de la plataforma). Si apagas el Algo Trading en MT5, el panel lo refleja como **"MT5 off"**.

---

## 14. Reportes y exportación

El bot genera reportes en **CSV** y **HTML a color** con: operaciones cerradas, posiciones abiertas (foto actual), las estrategias usadas en cada operación y un resumen (ganadas, perdidas, % de aciertos, resultado). Se generan con los botones del panel, al **cambiar de día** o al **detener el bot** (te pregunta si guardar). Quedan en `MQL5 > Files` y el bot muestra la **ruta completa**. Todos los textos están en **español**.

---

## 15. Cómo hacer un backtest correctamente

Para probar el bot en el **Probador de Estrategias** de MT5 sin sorpresas:

1. **Licencia:** el bot valida cuenta y contraseña en el arranque. En el Probador se usa **tu cuenta actual**, así que:
   - El **Número de Cuenta de Licencia** debe coincidir con la cuenta logueada.
   - La **Contraseña de Licencia** debe ser la correcta (si la dejas vacía, **no arranca**).
   - El **rango de fechas** del test debe ser **anterior** a la fecha de vencimiento.
   - Si el bot está atado a Demo o Real, la cuenta del test debe ser de ese tipo.
   > Si no opera en el test, mira el **Diario/Journal**: casi siempre es un mensaje de licencia.
2. **Modelado:** "Cada tick basado en ticks reales" (en sintéticos como V75 los ticks importan).
3. **Modo visual ON** para ver entradas y cesta en el gráfico.
4. **Símbolo, depósito y apalancamiento** como tu cuenta real.
5. El panel no es interactivo en el Probador, pero el bot **opera igual** (arranca encendido).

---

## 16. Buenas prácticas y protección del capital

- **Empieza en demo**, lote 0.01, y observa el panel varios días.
- **Activa la protección de equidad** (param 22) y fija una **pérdida máxima** (param 24) acorde a tu balance.
- **Un mágico distinto por activo** para no mezclar gestión ni reportes.
- En **martingala**, recuerda que con multiplicador 2.0 el lote crece rápido (0.01 → 1.28 en el respaldo 7): usa lote inicial pequeño y capital suficiente.
- En **multi-estrategia**, marca **pocas y de una sola familia**; sube el **mínimo de confirmaciones** para señales más fiables.
- En **índices sintéticos** (V75, etc.), no esperes un edge mágico de los indicadores: la gestión de riesgo manda.

---

## 17. Novedades de la v2.43

- **Estrategias por familia (nones / pares):** 18 estrategias divididas 9/9 — impares = reversión, pares = tendencia. Panel con dos verdes y letras por familia. Permite activar familias completas sin que tendencia y reversión se anulen.
- **Recuperación dirigida por estrategias:** ya no entra por tiempo; entrada inicial y reentrada las deciden las estrategias. Estado de la racha **reconstruido desde el historial** (sobrevive reinicios/recompilaciones).
- **Martingala con distancia acumulada desde L0:** el respaldo se abre donde realmente corresponde, leyendo las posiciones abiertas (robusto ante reinicios o si otro EA abrió las operaciones).
- **Todos los mensajes, el panel y los reportes en español.**

---

## 18. Preguntas frecuentes

| Pregunta | Respuesta |
|---|---|
| ¿Por dónde empiezo? | Cuenta **demo**, lote 0.01, observa el panel. |
| ¿Sirve para cualquier activo? | Sí, opera sobre el símbolo del gráfico. |
| ¿Por qué cuenta Hedging? | La cesta de martingala necesita varias operaciones a la vez. |
| ¿Cómo sigo operaciones manuales? | Modo Seguidor, mágico **distinto de 0**. |
| ¿Cómo sigo otro bot? | Modo Seguidor, mágico **distinto al de ese bot y distinto de 0**. |
| ¿Garantiza ganancias? | **No.** Ningún sistema lo hace; la martingala tiene riesgo. |
| ¿Puedo pausarlo? | Sí, con el botón **BOT ACTIVO/PARADO** del panel. |
| ¿Dónde quedan los reportes? | En `MQL5 > Files`; el bot muestra la ruta exacta. |
| ¿Qué familia es cada estrategia? | **Impares = reversión, pares = tendencia.** El número te lo dice. |

---

## 19. Aviso de riesgo

El trading con apalancamiento conlleva un **alto riesgo** y puede no ser adecuado para todos. **Puedes perder tu capital.** Los resultados pasados **no** garantizan resultados futuros. Opera siempre con dinero que puedas permitirte arriesgar y **practica en demo** antes de pasar a real. Material **educativo**, no asesoramiento financiero.

---

*CJ Bot v2.43 — Manual de Usuario — CJ Junior Cabrera — cjjuniorstore.com*
