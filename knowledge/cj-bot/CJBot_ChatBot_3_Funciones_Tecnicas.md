# CJ Bot v2.43 — Funciones Técnicas (documento para el ChatBot)

> Documento 3 de 3. Explica, función por función, cómo trabaja el CJ Bot por dentro. Pensado para enseñar desde cero el "motor" del bot.

## 1. Arranque y validaciones (al iniciar)
Antes de operar, el bot verifica: rango de balance, tipo de cuenta permitido (Demo/Real/Ambas, configurable por el desarrollador), contraseña, número de cuenta, lista blanca opcional y fecha de vencimiento. Si algo falla, **no arranca** y muestra el error exacto. Además prepara los indicadores, marca activas las estrategias 03–20, siembra el azar (para el modo Tiempo) y detecta si la cuenta es Hedging o Netting.

## 2. Ciclo de vigilancia (cada segundo)
Un temporizador despierta al bot según la "Frecuencia de Vigilancia" (1000 ms). En cada ciclo: actualiza el panel, revisa si exportar por cambio de día, comprueba licencia y permiso de trading, comprueba que el mercado esté abierto, aplica la protección de equidad, gestiona lo abierto o, si no hay nada y está encendido, busca una nueva señal.

## 3. Filtro de mercado abierto
Si el mercado del símbolo no está completamente operativo (cerrado o limitado), el bot no hace nada ese ciclo. Evita operar en condiciones inválidas.

## 4. Validación de margen
Antes de cualquier apertura, calcula el margen necesario y exige que el margen libre sea al menos un **20% mayor** (colchón de seguridad). Si no alcanza, no abre y avisa "margen insuficiente".

## 5. Conteo de operaciones propias
Cuenta cuántas posiciones abiertas pertenecen al bot (por número mágico y símbolo) para decidir si gestiona o busca señal.

## 6. Gestión de la cesta de martingala
Recorre todas las posiciones del bot, calcula el **precio promedio ponderado**, fija un **Take Profit único** sobre ese promedio y lo aplica a cada posición (así toda la cesta cierra junta). Si solo hay una posición, le aplica trailing. Luego decide si abrir un nuevo respaldo (solo si el bot está encendido).

## 7. Gestión individual (recuperación / sin cesta)
Coloca y ajusta el SL y TP de cada operación y le aplica trailing. La protección de equidad se aplica aparte, en el ciclo, para todos los modos.

## 8. Trailing Stop con retardo de estabilidad (los 3 y 5 segundos)
El trailing mueve los niveles a favor, pero **con un retardo**:
- **Trailing SL:** cuando la ganancia supera el % de activación, propone mover el SL hacia el precio. Solo lo aplica si la condición se mantiene **3 segundos** seguidos. El SL **nunca retrocede**.
- **Trailing TP:** cuando la ganancia supera su % de activación, propone alejar el TP. Solo lo aplica si la condición se mantiene **5 segundos**.

**¿Por qué 3 y 5 segundos?** Para que una **vela rápida** (un pico momentáneo) no arrastre el nivel y luego, al retroceder el precio, deje el SL/TP mal colocado. Esperando unos segundos, el nivel solo se mueve si el movimiento **se sostiene**, dando estabilidad y evitando que "baile". El trailing solo actúa cuando hay **una sola operación** en esa dirección.

## 9. Apertura de respaldo (martingala)
Abre un respaldo solo si: (a) no se superó el máximo de respaldos; (b) pasó el tiempo desde el último respaldo; (c) la distancia en contra alcanza el requisito (que **crece** un % en cada nivel); y (d) esa condición **se mantuvo estable** los segundos del parámetro 18. El lote del respaldo se multiplica por el multiplicador.

## 10. Modo Seguidor
Detecta operaciones **externas** (magia distinta a la del bot), abre **copias propias** en la misma dirección y, cuando la externa se cierra, **cierra su copia**. Requiere número mágico distinto de 0 para distinguir copias de originales.

## 11. Búsqueda de señal (una vez por vela)
Solo evalúa al abrir una **vela nueva** (no en cada tick). Según el modo:
- **Multi:** cuenta los votos de las estrategias marcadas; entra si un mínimo coincide y supera al lado contrario.
- **Tiempo:** elige 5 estrategias al azar para la dirección; si hay empate, alterna. Entra sí o sí.
- **Individual:** evalúa la estrategia elegida.
Calcula el lote (incluido el de recuperación) y abre en la dirección permitida.

## 12. Ganancia en TP y lote de recuperación
- **GananciaEnTP:** calcula cuánto ganaría un volumen dado al recorrer el TP.
- **Lote de recuperación:** lote = (pérdida acumulada de la racha + ganancia objetivo del lote inicial) ÷ (ganancia por lote al TP), **nunca menor al lote inicial**. Así una operación ganadora recupera lo perdido y deja el objetivo.

## 13. Evaluación de las 18 estrategias (03–20)
Cada estrategia lee sus indicadores en la **última vela cerrada** (índice fijo) y devuelve: 1 = comprar, −1 = vender, 0 = nada. Desde la **v2.43** están organizadas por **paridad**: las **impares (nones)** son de **reversión** y las **pares** de **tendencia**, 9 y 9 (detalle en la sección 20). (Reglas exactas en el documento 2.)

## 14. Abrir operación
Normaliza el lote, valida el margen, envía la orden con su comentario y nivel ("|L0", "|L1"...) y **guarda qué estrategias** la originaron (para el reporte y el panel).

## 15. Protección de equidad
Suma la ganancia/pérdida (flotante + swap) de **todas** las operaciones del bot y, si llega al tope de ganancia o de pérdida en USD, **cierra todo**. Se revisa cada segundo, en todos los modos (incluida la cesta).

## 16. Registro de historial y estrategias por posición
Al cerrarse una operación, guarda en el historial: apertura, cierre, tipo, lote, precios, resultado, nivel de martingala y las estrategias usadas. Esto alimenta los reportes.

## 17. Normalización de lote
Ajusta el lote al paso permitido por el broker y lo limita al mínimo y máximo de la cuenta, para no enviar un lote inválido.

## 18. Exportación (CSV y HTML)
Genera reportes con operaciones cerradas + posiciones abiertas (foto actual) + resumen (ganadas, perdidas, %Win, resultado). El CSV abre en Excel; el HTML en navegador (a color). Guarda en `MQL5 > Files` y muestra la ruta completa.

## 19. El panel y los eventos
Dibuja el panel (estado, estadísticas, cesta, estrategias, controles) cada ciclo. Los clics en los botones disparan acciones (marcar estrategias, MULTI ON/OFF, BOT ON/OFF, color de fondo, rango Hora/Día/Semana/Mes, exportar). El fondo del panel se mantiene "detrás" para que los botones reciban el clic, y el texto se adapta (claro/oscuro) según el color de fondo. Atajos: `V` oculta/muestra; `+`/`-` tamaño de letra.

## 20. Novedades de la v2.43

### a) Estrategias por familia (nones / pares)
Las 18 estrategias (03–20) quedan divididas 9/9 por **paridad del número**: **impares = reversión** (rebote desde extremos: sobreventa/sobrecompra, toques de banda) y **pares = tendencia** (continuación: cruces, EMAs alineadas, Aroon, MACD). En el panel los botones **pares** van en verde oscuro y los **nones** en verde más claro, con letras de distinto color, para activar familias completas sin que tendencia y reversión se anulen entre sí.

- **Nones (reversión):** 03 EMA+RSI · 05 Solo RSI · 07 MACD+Bollinger · 09 Bollinger+Stoch · 11 MACD+Stoch · 13 Stoch+Volumen · 15 Bollinger+Volumen · 17 Aroon+Stoch · 19 EMA+Bollinger+Stoch.
- **Pares (tendencia):** 04 Cruce EMA · 06 Triple EMA+Aroon · 08 MACD+Volumen · 10 Triple EMA+RSI+Aroon · 12 Aroon+Volumen · 14 Aroon+MACD · 16 Aroon+RSI · 18 Aroon+MACD+RSI · 20 EMA+MACD+Volumen.

| Efectividad relativa | Nones (reversión) | Pares (tendencia) |
|---|---|---|
| Alta | 09, 19* | 06, 10*, 18* |
| Media-Alta | 03, 07, 11 | 14, 20 |
| Media | 13, 17 | 08, 12, 16 |
| Media-Baja | 05, 15 | 04 |

(*) Muy filtradas: fiables pero disparan poco. La efectividad es **relativa**, no una garantía; el volumen aporta poco en índices sintéticos (V75) y ninguna estrategia tiene un edge fuerte por sí sola.

### b) Recuperación dirigida por estrategias
En modo **Recuperación**, el bot ya **no entra por tiempo**: tanto la entrada inicial como la reentrada las deciden las **estrategias reales** (el modo "Solo Tiempo" queda exclusivo de Martingala). Además, al **iniciar** reconstruye el estado de la racha (contador y pérdida acumulada) **leyendo el historial** de operaciones cerradas, de modo que recompilar o reiniciar MT5 **no borra** la recuperación en curso.

### c) Martingala con distancia acumulada
El umbral para abrir el siguiente respaldo se mide como **distancia acumulada desde la primera operación de la cesta (L0)**, reconstruida desde las posiciones abiertas. Así el respaldo se abre **donde realmente corresponde** a su nivel, aunque haya habido un reinicio o las operaciones las haya abierto otro EA.

### d) Mensajes en español
Todos los mensajes, el panel y los reportes del bot están en español.

## Nota técnica
Todas las estrategias usan los datos como serie temporal, leyendo la barra cerrada, lo que asegura señales fiables. Material educativo, no asesoramiento financiero.
