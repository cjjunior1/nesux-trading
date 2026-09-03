# CJ Bot v2.51 — Qué es y qué puede hacer (capacidades completas)

> Fuente: código fuente oficial `CJBot_v2.51.mq5` (2.298 líneas), de CJ Junior Cabrera,
> Nesux Global Business RD. Este documento describe la versión **2.51**, que es la vigente.
> Si el alumno menciona una versión anterior (2.43, 2.44, 2.50), avisarle que hay diferencias
> y preguntarle cuál tiene instalada antes de dar instrucciones de configuración.

---

## 1. Qué es el CJ Bot

Es un **asesor experto (EA) para MetaTrader 5** que opera de forma automatizada.

Funciona en **cualquier instrumento negociado en bolsa**: pares de divisas, acciones,
opciones, índices sintéticos, criptomonedas y demás.

**Su especialidad es la martingala (MG).** El bot puede hacer scalping, pero su fortaleza
real y depurada es el sistema de martingala: escala progresivamente el tamaño del lote
después de cada pérdida, según el multiplicador configurado, hasta el límite de intentos
permitido. Mantiene la coherencia de la racha **incluso si se reinicia la plataforma**.

Las entradas se rigen exclusivamente por estrategias técnicas. Incorpora periodos de
estabilidad antes de reentrar, take profit unificado para cestas de operaciones, trailing
stop interno y alertas de control.

**Exige configuración precisa.** No es un bot de "ponerlo y olvidarse".

---

## 2. Las 20 estrategias de entrada — parámetro (01) Modo Entrada

El bot decide cuándo abrir la operación inicial según la estrategia elegida:

| # | Estrategia | Qué combina |
|---|---|---|
| 01 | Solo Tiempo | No usa indicadores: entra por intervalo de tiempo |
| 02 | Solo Seguidor | No abre nada: adopta y gestiona operaciones que ya existen |
| 03 | EMA + RSI | Medias exponenciales con RSI |
| 04 | Cruce EMA | Cruce de medias exponenciales |
| 05 | Solo RSI | Únicamente RSI |
| 06 | Triple EMA + Aroon | Tres EMAs con Aroon |
| 07 | MACD + Bollinger | MACD con bandas de Bollinger |
| 08 | MACD + Volumen | MACD confirmado por volumen |
| 09 | Bollinger + Stochastic | Bandas con estocástico |
| 10 | Triple EMA + RSI + Aroon | Tres indicadores combinados |
| 11 | MACD + Stochastic | MACD con estocástico |
| 12 | Aroon + Volumen | Aroon confirmado por volumen |
| 13 | Stochastic + Volumen | Estocástico con volumen |
| 14 | Aroon + MACD | Aroon con MACD |
| 15 | Bollinger + Volumen | Bandas con volumen |
| 16 | Aroon + RSI | Aroon con RSI |
| 17 | Aroon + Stochastic | Aroon con estocástico |
| 18 | Aroon + MACD + RSI | Tres indicadores |
| 19 | EMA + Bollinger + Stochastic | Tres indicadores |
| 20 | EMA + MACD + Volumen | Tres indicadores |

### El modo SEGUIDOR (02) tiene reglas propias

Es el más malentendido. El Seguidor **nunca abre la operación inicial y nunca cierra por su
cuenta**: solo gestiona lo que ya existe.

- **Adopta** operaciones que coincidan en identidad: mismo Número Mágico, mismo gráfico y
  misma dirección.
- Una vez adoptadas, aplica el **mismo motor dinámico** que los demás modos: recalcula y
  aplica TP, SL y trailing en cada tick, y respalda si corresponde.
- Es 100% dinámico: no usa valores fijos.

---

## 3. Configuración de indicadores (fija, no editable por el alumno)

Estos periodos están dentro del código y **el alumno no los puede cambiar** desde la ventana
de parámetros:

```
EMA rápida: 10        EMA media: 30         EMA lenta: 100
RSI: periodo 14       Sobrecompra: 70       Sobreventa: 30
Aroon: periodo 14     Umbral: 70
MACD: 12 / 26 / 9
Stochastic: K=5  D=3  Slow=3
Bollinger: periodo 20, desviación 2.0
```

Si un alumno pide "cambiar el RSI a 21", la respuesta correcta es que esos periodos son
internos del bot y no se modifican desde la configuración.

---

## 4. Dirección de operaciones — parámetro (02)

| Opción | Comportamiento |
|---|---|
| Only Buy | Solo compras |
| Only Sell | Solo ventas |
| Buy and Sell | Ambas direcciones |
| Scalping | Modo scalping en ambas direcciones |

---

## 5. Modo de gestión — parámetro (13)

| Opción | Comportamiento |
|---|---|
| **Martingala** | Escala el lote tras cada pérdida. Es la especialidad del bot. |
| **Scalping** | Sin escalado de recuperación. Con multiplicador ≤ 1.0 el lote queda fijo. |

---

## 6. Cómo funciona realmente la martingala en 2.51

Esto es lo más importante que debe entender un alumno.

### Tamaño del lote de cada respaldo

```
Lote del nivel n = LotajeInicial × Multiplicador^n
```

Con lotaje 0.01 y múltiplo 1.25, los lotes son:
`0.0100 → 0.0125 → 0.0156 → 0.0195 → 0.0244 → 0.0305`

**El lote total expuesto con 5 martingalas es 0.1126: once veces el lotaje inicial.**
Un múltiplo que parece bajo (1.25) igual multiplica por once la exposición total.

### Distancia a la que entra cada respaldo

```
Distancia mínima teórica del respaldo n = PuntosPrimerRespaldo × (1 + Incremento%/100)^(n-1)
```

Con 100.000 puntos e incremento del 35%, las distancias teóricas son:
`100.000 → 135.000 → 182.250 → 246.038 → 332.151`

### Tres reglas de la 2.51 que cambian respecto a versiones anteriores

1. **La distancia se mide desde la ÚLTIMA posición abierta, no desde la primera.**
   Con tres operaciones abiertas, ya no tiene sentido medir desde L0.

2. **El incremento se aplica sobre el tramo REAL, no sobre el teórico.** Si un respaldo
   abrió más lejos de lo previsto (por un hueco, slippage o los segundos de confirmación),
   ese tramo mayor es el que manda para calcular el siguiente. El tramo real **solo puede
   alejar el próximo respaldo, nunca acercarlo**.

3. **Existe un suelo teórico infranqueable.** Un respaldo jamás entra por debajo de la
   distancia base y sus incrementos, pase lo que pase.

### Confirmación antes de respaldar

La condición de distancia **debe mantenerse durante los segundos configurados en (18)**
antes de que el respaldo entre. No respalda ante un pico momentáneo.

### La distancia se mide en el precio real de entrada

Una compra de respaldo entra al ASK y una venta al BID. El bot mide con el lado correcto
para que el spread no haga entrar el respaldo más cerca de lo fijado.

### El respaldo nunca se frena

Si el bot arrancó sobre una cesta adoptada por intervención manual, la primera vez que
respalda lo **notifica** — pero es informativo, no bloquea. Después opera en silencio.

---

## 7. Protecciones de cuenta que trae el bot

| Protección | Qué hace |
|---|---|
| **Protección de equidad global** (22) | Cierra todo al alcanzar la pérdida máxima (24) o la ganancia máxima (25) en USD |
| **Verificación de margen** | Antes de abrir cualquier operación comprueba que haya margen suficiente |
| **Mercado abierto** | No intenta operar con el mercado cerrado |
| **Límite de martingalas** (17) | Tope duro de respaldos por cesta |
| **Espera entre respaldos** (18) | Impide respaldar en cadena por un movimiento brusco |
| **Trailing SL** (10-12) | Protege ganancia acumulada moviendo el stop |
| **Trailing TP** (07-09) | Persigue el objetivo cuando el precio acompaña |
| **Ventanas emergentes** (23) | Alertas visibles de lo que hace el bot |
| **Licencia y vencimiento** | El bot valida licencia y tiene fecha de expiración interna |

### Estabilidad interna (no configurable)

```
Retardo trailing SL: 3 segundos que debe sostenerse la mejora antes de mover el SL
Retardo trailing TP: 5 segundos que debe sostenerse la mejora antes de mover el TP
Cooldown anti-flood: 30 segundos sin reintentar una modificación que falló con los mismos valores
```

El trailing **no reacciona a un tick aislado**: la mejora tiene que sostenerse.

---

## 8. Otras capacidades

- **Take profit unificado por cesta.** Las operaciones de una misma racha se gestionan como
  un conjunto, no una por una.
- **Sobrevive al reinicio de MetaTrader.** Reconstruye el estado de recuperación: al volver
  sabe en qué nivel de martingala iba.
- **Identidad por Número Mágico** (20). Distingue sus operaciones de las de otros bots o de
  las manuales. Varios CJ Bot pueden convivir en la misma cuenta con Números Mágicos
  distintos.
- **Exportación diaria de historial**, con confirmación.
- **Registro de la señal que originó cada posición**: se puede saber qué estrategia abrió
  cada operación.
- **Comentario configurable** (21) en cada operación, visible en el terminal.
- **Frecuencia de vigilancia configurable** (19) en milisegundos.

---

## 9. Cómo responder preguntas sobre el CJ Bot

- **Antes de recomendar configuración, preguntar el capital de la cuenta y el activo.**
  Una misma configuración es prudente en una cuenta y suicida en otra.
- **Siempre recordar que el lote total expuesto es varias veces el inicial.** Con 5
  martingalas y múltiplo 1.25 son once veces.
- **Recomendar siempre el lotaje más bajo posible** que permita el bróker, especialmente
  a alumnos principiantes.
- **Nunca prometer ganancias.** El bot es una herramienta; el resultado depende del mercado,
  del activo, del capital y de la configuración.
- Si el alumno pregunta por un parámetro, dar el **número entre paréntesis** — así lo
  encuentra en la ventana de MetaTrader.
