# CJ Bot v2.43 — Descripción Detallada (documento para el ChatBot)

> Documento 2 de 3. Descripción detallada del manual: identifica a CJ Bot y explica a fondo cada parámetro, modo y estrategia. Pensado para vender e informar.

## IDENTIFICACIÓN DE CJ BOT
- **Nombre y versión:** CJ Bot v2.43.
- **Qué es:** robot de trading automático (Expert Advisor) para MetaTrader 5.
- **Autor / marca:** CJ Junior Cabrera — cjjuniorstore.com.
- **Para quién:** principiantes que quieren empezar con piloto automático y traders que desean automatizar su operativa.
- **Qué lo distingue:** 18 estrategias técnicas (03–20) organizadas por familia (nones=reversión / pares=tendencia), modo por tiempo, modo seguidor, gestión por martingala o recuperación, trailing stop con estabilidad, protección de equidad y un panel visual completo.
- **Filosofía:** reglas claras, control total desde el panel y transparencia (reportes con las estrategias usadas en cada operación).

## LOS 25 PARÁMETROS, EXPLICADOS A FONDO

1. **Estrategia de Entrada** — Define cómo decide entrar el bot: Por Tiempo, Seguidor o una de las 18 estrategias técnicas (03–20). Recomendación: en demo, empieza con "Por Tiempo" o una estrategia clara.
2. **Dirección de Operaciones** — Ambas, Solo Compras o Solo Ventas. Útil si tienes un sesgo de mercado.
3. **Temporalidad de la Señal** — En qué velas lee (M1, M5, H1...). "Actual" = la del gráfico. Altas = más estable; bajas = más señales y ruido.
4. **Lotaje Inicial** — Tamaño de la primera operación. Para principiantes: el mínimo (0.01). En martingala, vital que sea pequeño.
5. **Take Profit (puntos)** — Puntos de ganancia para cerrar. En la cesta se calcula sobre el promedio.
6. **Stop Loss (puntos)** — Puntos de pérdida para cerrar (modo individual). 0 = sin SL fijo.
7. **Activar Trailing TP** — El objetivo persigue al precio para dejar correr la ganancia.
8. **% Activación Trailing TP** — A qué porcentaje del TP se activa (ej. 70%).
9. **% Distancia Trailing TP** — Qué tan lejos del precio se coloca el TP (ej. 30%).
10. **Activar Trailing SL** — El Stop Loss se mueve a favor para asegurar ganancia. Muy recomendado.
11. **% Activación Trailing SL** — A qué porcentaje del TP se activa (ej. 60%).
12. **% Distancia Trailing SL** — Qué tan cerca del precio se coloca el SL (ej. 30%).
13. **Activar Martingala** — Desactivada / Martingala (cesta) / Recuperación.
14. **Multiplicador Martingala** — Cuánto crece el lote en cada respaldo (2.0 = doble). Más = más agresivo y más riesgo.
15. **Puntos primer respaldo** — Distancia en contra para abrir el primer respaldo.
16. **Incremento % de los respaldos** — Cuánto se aleja cada respaldo siguiente (ej. 25%).
17. **Cantidad de Martingalas** — Máximo de respaldos en la cesta (ej. 7).
18. **Segundos de espera / estabilidad** — Tiempo que la condición debe mantenerse antes de respaldar o reentrar. Da estabilidad y evita entradas por un pico momentáneo.
19. **Frecuencia de Vigilancia (ms)** — Cada cuánto revisa (1000 = 1 segundo).
20. **ID Mágico** — Etiqueta que identifica las operaciones del bot. Clave en modo Seguidor.
21. **Comentario** — Texto de las órdenes; el bot le añade el nivel de martingala (ej. "|L1").
22. **Activar Protección de Equidad** — Cierra todo al llegar a un tope de ganancia/pérdida. Recomendado.
23. **Activar Ventanas Emergentes** — Muestra avisos en pantalla.
24. **Pérdida Máxima (USD)** — Si la pérdida total llega aquí, cierra todo.
25. **Ganancia Máxima (USD)** — Si la ganancia total llega aquí, cierra todo y asegura el beneficio.

**Internos (no editables):** trailing del SL espera 3 segundos y del TP 5 segundos antes de moverse.

## EL NÚMERO MÁGICO Y EL MODO SEGUIDOR
- **Seguir operaciones MANUALES:** número mágico **distinto de 0** (ej. 100). Las manuales tienen magia 0, así el bot las ve como externas y las copia.
- **Seguir OTRO bot:** número mágico **distinto al de ese bot y distinto de 0** (ej. 777).
- En modo Seguidor el mágico **nunca** debe ser 0 (no distinguiría sus copias de los originales).

## LAS 18 ESTRATEGIAS (03–20) — REGLA EXACTA
Organizadas por **paridad**: los números **impares (nones)** son de **reversión** y los **pares** de **tendencia** (9 y 9).

- **03 EMA + RSI** *(non · reversión)*: COMPRA si el precio está por debajo de la EMA media, el RSI venía < 30 y gira al alza. VENDE al revés (precio sobre la EMA media, RSI > 70 girando a la baja).
- **04 Cruce EMA** *(par · tendencia)*: COMPRA en cruce al alza de la EMA rápida sobre la media; VENDE en cruce a la baja.
- **05 Solo RSI** *(non · reversión)*: COMPRA cuando el RSI sube y cruza 30. VENDE cuando baja y cruza 70.
- **06 3 EMA + Aroon** *(par · tendencia)*: COMPRA con 3 EMA alineadas al alza y Aroon Up > 70; VENDE alineadas a la baja y Aroon Down > 70.
- **07 MACD + Bollinger** *(non · reversión)*: COMPRA si el precio toca la banda inferior y el MACD está sobre su señal; VENDE en banda superior con MACD bajo su señal.
- **08 MACD + Volumen** *(par · tendencia)*: COMPRA si el MACD cruza arriba de su señal y el volumen sube; VENDE al revés.
- **09 Bollinger + Stochastic** *(non · reversión)*: COMPRA en banda inferior con estocástico girando al alza desde < 20; VENDE en banda superior desde > 80.
- **10 Triple EMA + RSI + Aroon** *(par · tendencia)*: COMPRA con 3 EMA alineadas al alza, RSI > 50 y Aroon Up > 70; VENDE alineadas a la baja, RSI < 50 y Aroon Down > 70.
- **11 MACD + Stochastic** *(non · reversión)*: COMPRA si el estocástico venía < 20 y cruza al alza, con MACD alcista; VENDE desde > 80 con MACD bajista.
- **12 Aroon + Volumen** *(par · tendencia)*: COMPRA con Aroon Up > 70 y volumen al alza; VENDE con Aroon Down > 70.
- **13 Stochastic + Volumen** *(non · reversión)*: COMPRA si el estocástico venía < 20, gira al alza y el volumen sube; VENDE desde > 80.
- **14 Aroon + MACD** *(par · tendencia)*: COMPRA con Aroon Up > 70 y MACD sobre su señal; VENDE con Aroon Down > 70 y MACD bajo su señal.
- **15 Bollinger + Volumen** *(non · reversión)*: COMPRA en banda inferior con volumen al alza; VENDE en banda superior.
- **16 Aroon + RSI** *(par · tendencia)*: COMPRA con Aroon Up > 70 y RSI > 50; VENDE con Aroon Down > 70 y RSI < 50.
- **17 Aroon + Stochastic** *(non · reversión)*: COMPRA si el estocástico venía < 20 y cruza al alza con Aroon Up > Aroon Down; VENDE desde > 80 con Aroon Down > Aroon Up.
- **18 Aroon + MACD + RSI** *(par · tendencia)*: COMPRA con Aroon Up > 70, MACD alcista y RSI > 50; VENDE al revés.
- **19 EMA + Bollinger + Stochastic** *(non · reversión)*: COMPRA en banda inferior con estocástico al alza y precio por encima de la EMA lenta (rebote a favor de la tendencia mayor); VENDE en banda superior con precio bajo la EMA lenta.
- **20 EMA + MACD + Volumen** *(par · tendencia)*: COMPRA con EMA media > lenta, MACD alcista y volumen al alza; VENDE al revés.

Indicadores y ajustes: EMA 10/30/100, RSI 14 (niveles 30/70), Aroon 14 (umbral 70), MACD 12/26/9, Estocástico 5/3/3, Bandas de Bollinger 20/2.0. Todas leen la **última vela cerrada**.

## PERFILES DE CONFIGURACIÓN (referencia educativa)
- **Conservador:** lote 0.01, multiplicador bajo, distancias amplias, pocos respaldos, protección de equidad ajustada.
- **Moderado:** lote 0.01, multiplicador 2.0, 5–7 respaldos, protección activada.
- **Agresivo:** multiplicador alto, más respaldos. Solo con mucho capital y entendiendo el riesgo.

## AVISO
Material educativo e informativo, no asesoramiento financiero. El trading conlleva riesgo de pérdida del capital.
