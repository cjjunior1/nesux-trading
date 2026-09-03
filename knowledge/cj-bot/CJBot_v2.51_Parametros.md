# CJ Bot v2.51 — Los 25 parámetros de configuración

> Extraído directamente del código fuente `CJBot_v2.51.mq5`. Los valores por defecto son
> los que trae el bot al cargarlo. **El número entre paréntesis es el que ve el alumno en
> la ventana de MetaTrader**: usarlo siempre al dar instrucciones.

---

## Tabla completa

| # | Nombre en MT5 | Valor por defecto | Qué controla |
|---|---|---|---|
| 01 | Modo Entrada | Solo Tiempo | Cuál de las 20 estrategias decide la entrada |
| 02 | Buy And Sell | Only Buy | Dirección: solo compras, solo ventas, ambas o scalping |
| 03 | Time | Gráfico actual | Temporalidad de la señal |
| 04 | Lotaje | **0.01** | Tamaño de la operación inicial |
| 05 | T/P en Puntos | 100000 | Take profit en puntos |
| 06 | S/L en Puntos | 100000 | Stop loss en puntos |
| 07 | Trailing TP | Activado | Si el take profit persigue al precio |
| 08 | (%)Trailing TP | 95.0 | % de avance hacia el TP que lo activa |
| 09 | (%)Distancia Trailing TP | 5.0 | % de distancia que mantiene el TP |
| 10 | Activar Trailing SL | Activado | Si el stop loss persigue al precio |
| 11 | (%)Ganancia Trailing SL | 75.0 | % de ganancia que activa el trailing del SL |
| 12 | (%)Distancia Trailing SL | 10.0 | % de distancia que mantiene el SL |
| 13 | Scalping or Martingala | **Martingala** | Modo de gestión |
| 14 | Multiplo Martingala | **1.25** | Por cuánto se multiplica el lote en cada respaldo |
| 15 | Puntos 1ra martingala | **100000** | Distancia en puntos del primer respaldo |
| 16 | (%)Incremento de Respaldo | **35.0** | Cuánto se aleja cada respaldo respecto al anterior |
| 17 | Cantidad de Martingalas | **5** | Máximo de respaldos por cesta |
| 18 | Espera pra Respaldo | 10 | Segundos que la condición debe sostenerse antes de respaldar |
| 19 | (ms) Vigilancia | 1000 | Cada cuántos milisegundos revisa el mercado |
| 20 | ID Magico del Bot | 0 | Identidad del bot: separa sus operaciones de las demás |
| 21 | Comentario del Bot | "CJ Bot 2.51" | Texto que aparece en cada operación |
| 22 | Cierre Ganancia/Perdida | Activado | Protección de equidad global |
| 23 | Ventanas Emergentes | Activado | Alertas en pantalla |
| 24 | Perdida Maxima en USD | 100.0 | Cierra todo al llegar a esta pérdida |
| 25 | Ganancia Maxima en USD | 500.0 | Cierra todo al llegar a esta ganancia |

Además existen dos campos de licencia: **Número de cuenta de licencia** y **Contraseña de
licencia**, que entrega Nesux Global Business RD al comprar el bot.

---

## Los cinco parámetros que definen el riesgo

Estos cinco, junto con el capital de la cuenta, determinan si una configuración es viable
o quema la cuenta. **Nunca se evalúan por separado.**

### (04) Lotaje — por defecto 0.01

El tamaño de la primera operación. **Se recomienda siempre el más bajo que permita el
bróker.** Todo lo demás se multiplica a partir de acá: si el lotaje inicial está mal, ningún
otro parámetro lo salva.

### (14) Múltiplo Martingala — por defecto 1.25

Cuánto crece el lote en cada respaldo.

```
Lote del nivel n = Lotaje × Múltiplo^n
```

Con 0.01 y múltiplo 1.25, los seis niveles dan:
`0.0100 · 0.0125 · 0.0156 · 0.0195 · 0.0244 · 0.0305`

**Lote total expuesto: 0.1126 — once veces el lotaje inicial.**

Un múltiplo de 2.0 en cambio da `0.01 · 0.02 · 0.04 · 0.08 · 0.16 · 0.32` = **0.63 total,
sesenta y tres veces el inicial**. Por eso el múltiplo bajo es la primera defensa.

### (15) Puntos 1ra martingala — por defecto 100000

A qué distancia entra el primer respaldo. Cuanto más corta, antes respalda el bot y más
rápido se acumulan las operaciones. Cuanto más larga, más aguanta antes de escalar, pero
cada operación queda más lejos del precio de recuperación.

### (16) % Incremento de Respaldo — por defecto 35.0

Cuánto se aleja cada respaldo respecto al anterior.

```
Distancia teórica del respaldo n = Puntos1ra × (1 + Incremento/100)^(n-1)
```

Con 100.000 y 35%: `100.000 · 135.000 · 182.250 · 246.038 · 332.151`

Un incremento alto separa los respaldos y da más aire a la cuenta, pero aleja el punto de
recuperación. Un incremento bajo los junta y consume el margen rápido.

**En la 2.51 este porcentaje se aplica sobre el tramo real que separó a las dos últimas
posiciones**, no sobre el teórico, y solo puede alejar el próximo respaldo, nunca acercarlo.

### (17) Cantidad de Martingalas — por defecto 5

El tope duro de respaldos. Es el parámetro que limita el daño total: define cuántas veces
puede escalar antes de detenerse.

---

## Cómo se relacionan con el capital

La exposición total no es el lotaje inicial: es la suma de todos los lotes de la secuencia,
multiplicada por la distancia que recorre el precio hasta el último respaldo.

Los tres factores que hay que mirar juntos:

1. **Lote total acumulado** = suma de `Lotaje × Múltiplo^n` para todos los niveles.
2. **Distancia total recorrida** = suma de todas las distancias de respaldo.
3. **Valor del punto del activo**, que depende del símbolo y del bróker. No es el mismo en
   BTCUSD que en Volatility 75.

El drawdown en USD sale de combinar los tres. **Sin conocer el activo no se puede dar una
cifra en dólares** — pedirle al alumno el instrumento antes de calcular nada.

---

## Reglas al aconsejar configuración

1. **Preguntar primero el capital y el activo.** Sin esos dos datos, cualquier recomendación
   de lotaje es adivinanza.
2. **Lotaje más bajo posible**, sobre todo en cuentas pequeñas y alumnos nuevos.
3. **Múltiplo bajo antes que cantidad de martingalas alta.** El múltiplo crece de forma
   exponencial; es el que descontrola la exposición.
4. **Recordar siempre que el lote total es varias veces el inicial**, con el número concreto
   de su configuración.
5. **Nunca prometer resultados.** Ninguna configuración garantiza ganancias.
6. **La protección de equidad (22) con la pérdida máxima (24) debe estar activa**, y el
   alumno tiene que saber en cuánto la puso.
