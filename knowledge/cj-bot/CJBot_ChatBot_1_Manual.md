# CJ Bot v2.43 — Manual (documento para el ChatBot)

> Documento 1 de 3. Manual general del CJ Bot v2.43. Pensado para que el chatbot de Trading responda dudas de los alumnos/clientes.

## 1. Qué es el CJ Bot
El CJ Bot v2.43 es un robot de trading automático (Expert Advisor / EA) para **MetaTrader 5**. Abre, gestiona y cierra operaciones por sí solo siguiendo reglas fijas. Combina:
- 18 estrategias técnicas (03–20) + un modo por tiempo + un modo seguidor.
- Gestión de capital: martingala (cesta) o recuperación.
- Protección: trailing stop, protección de equidad y validación de margen.
- Un panel visual de control en el gráfico.

Autor: CJ Junior Cabrera — cjjuniorstore.com.

## 2. Requisitos
- Plataforma **MetaTrader 5** (no MT4).
- Cuenta de cobertura **Hedging** (recomendada). En **Netting** la cesta de martingala no funciona bien.
- Licencia válida (número de cuenta y contraseña correctos).
- Capital suficiente, sobre todo con martingala.

**Hedging** = varias operaciones a la vez en el mismo símbolo (lo necesita la cesta). **Netting** = una sola posición por símbolo.

## 3. Instalación (pasos)
1. MT5 → Archivo → Abrir carpeta de datos.
2. Copia `CJBot_v2.43.ex5` en `MQL5 > Experts`.
3. En el Navegador de MT5: clic derecho → Actualizar.
4. Abre el gráfico del símbolo y temporalidad.
5. Arrastra el bot al gráfico, marca "Permitir Algo Trading" y ajusta parámetros.
6. Activa el botón "Algo Trading" (verde) en la barra de MT5.

Si todo está bien, aparece el **panel** en el gráfico.

## 4. Modos de operación
1. **Por Tiempo (01):** entra en cada vela nueva; la dirección la deciden 5 estrategias al azar (empate → alterna). Ideal para martingala.
2. **Seguidor (02):** copia operaciones externas (manuales o de otro bot).
3. **Estrategia individual (03–20):** opera con una sola estrategia.
4. **Multi-estrategia (botón MULTI ON):** combina las estrategias 03–20 marcadas y entra cuando un mínimo de confirmaciones coincide. Las 01 y 02 no participan.

## 5. Gestión de capital
- **Martingala (cesta):** ante una operación en contra, abre respaldos para promediar el precio; toda la cesta cierra junta en un Take Profit único.
- **Recuperación:** una operación a la vez; tras una pérdida, el lote siguiente busca recuperar lo perdido + la ganancia objetivo, sin bajar del lote inicial.

## 6. Protecciones
- **Trailing SL:** mueve el Stop Loss a favor para asegurar ganancia (nunca retrocede).
- **Trailing TP:** aleja el objetivo para dejar correr la ganancia.
- **Protección de equidad:** cierra todo si la ganancia/pérdida total llega a un tope en USD.
- **Validación de margen:** no abre si no hay al menos 20% más del margen necesario.

## 7. El panel
Muestra y controla: estado del bot, estrategia, martingala, dirección, mercado, cuenta, máximo/mínimo, estadísticas, cesta actual, botones de estrategias (03–20), mínimo de confirmaciones, MULTI ON/OFF, BOT ON/OFF, color de fondo y exportar CSV/HTML.
Atajos: tecla `V` muestra/oculta el panel; `+` y `-` cambian el tamaño de letra.

## 8. Reportes
Genera CSV y HTML (a color) con operaciones cerradas, posiciones abiertas y un resumen. Se generan con los botones, al cambiar de día o al detener el bot. Quedan en `MQL5 > Files` y el bot muestra la ruta.

## 9. Preguntas frecuentes
- **¿Por dónde empiezo?** Cuenta demo, lote 0.01, observa el panel.
- **¿Garantiza ganancias?** No. Ningún sistema lo hace; la martingala tiene riesgo.
- **¿Sirve para cualquier activo?** Sí, opera el símbolo del gráfico.
- **¿Cómo sigo operaciones manuales?** Modo Seguidor con número mágico distinto de 0.
- **¿Cómo sigo otro bot?** Modo Seguidor con número mágico distinto al de ese bot y distinto de 0.
- **¿Puedo pausarlo?** Sí, con el botón BOT ON/OFF.

## 10. Estrategias por familia: nones y pares (novedad v2.43)
Desde la **v2.43**, las 18 estrategias técnicas (03–20) están organizadas por **paridad del número**, en dos familias iguales (9 y 9):

- **NONES (impares) = Reversión:** apuestan a que el precio **rebota** desde un extremo (sobreventa/sobrecompra, toques de banda de Bollinger). Rinden mejor en mercados en **rango**.
- **PARES = Tendencia:** apuestan a que el movimiento **continúa** (cruces de EMA, EMAs alineadas, Aroon fuerte, MACD). Rinden mejor en mercados en **tendencia**.

En el panel se distinguen por color: los botones **pares** van en **verde oscuro** y los **nones** en **verde más claro**, con las letras de distinto color. Así, mezclar tendencia y reversión en el voto multi (que se anularían entre sí) se evita activando familias completas de **una sola** según cómo esté el mercado.

### Nones — Reversión (rebote)
| # | Combinación | Efectividad relativa |
|---|---|---|
| 03 | EMA + RSI | Media-Alta |
| 05 | Solo RSI | Media-Baja |
| 07 | MACD + Bollinger | Media-Alta |
| 09 | Bollinger + Stochastic | Alta |
| 11 | MACD + Stochastic | Media-Alta |
| 13 | Stochastic + Volumen | Media |
| 15 | Bollinger + Volumen | Media-Baja |
| 17 | Aroon + Stochastic | Media |
| 19 | EMA + Bollinger + Stochastic | Alta (poco frecuente) |

### Pares — Tendencia (continuación)
| # | Combinación | Efectividad relativa |
|---|---|---|
| 04 | Cruce EMA | Media-Baja |
| 06 | Triple EMA + Aroon | Alta |
| 08 | MACD + Volumen | Media |
| 10 | Triple EMA + RSI + Aroon | Alta (poco frecuente) |
| 12 | Aroon + Volumen | Media |
| 14 | Aroon + MACD | Media-Alta |
| 16 | Aroon + RSI | Media |
| 18 | Aroon + MACD + RSI | Alta (poco frecuente) |
| 20 | EMA + MACD + Volumen | Media-Alta |

> La efectividad es **relativa** (qué tan filtrada está la señal), no una garantía de ganancia. Regla general: **más condiciones = señales más fiables pero menos frecuentes**. En índices sintéticos (p. ej. Volatility 75) el volumen es de ticks y aporta poco, y ninguna estrategia tiene un edge fuerte por sí sola: la **gestión de riesgo** (martingala/recuperación y la protección de equidad) es lo que más pesa en el resultado.

## 11. Aviso de riesgo
El trading con apalancamiento es de alto riesgo. Puedes perder tu capital. Resultados pasados no garantizan resultados futuros. Practica en demo y opera solo con dinero que puedas permitirte perder. Material educativo, no asesoramiento financiero.
