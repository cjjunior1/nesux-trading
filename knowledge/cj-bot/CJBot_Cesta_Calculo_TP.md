# Cómo se calcula una cesta del CJ Bot a partir de una captura de MT5

Documento obligatorio cuando alguien manda una captura de operaciones y
pregunta cuánto queda en el TP. Aquí está el método exacto, con un ejemplo
resuelto y comprobado.

---

## Lo primero: leer bien la captura

De cada fila hacen falta **tres columnas**, y solo tres:

| Columna | Para qué |
|---|---|
| **Tipo** | Si es `sell` o `buy`. Cambia el signo de la fórmula. |
| **Volumen** | El lote. |
| **Precio** (el primero, el de apertura) | Desde dónde se abrió. |

Y un dato común a toda la cesta: el **T/P**, que es el mismo para todas las
operaciones de una misma cesta. Ese TP común es lo que confirma que pertenecen
al mismo grupo.

**No se usa la columna Beneficio.** Esa es la flotante de ahora mismo, con el
precio donde esté en este instante. No es lo que se cobra al llegar al TP, y
sumarla es el error más repetido.

**Cuidado con las dos columnas "Precio".** En MT5 la primera es la de apertura
y la segunda es el precio actual. Para este cálculo se usa **la primera**.

---

## La fórmula

Para **SELL** (se gana cuando el precio baja):

```
Resultado = (Precio de apertura − TP) × Volumen × Tamaño del contrato
```

Para **BUY** (se gana cuando el precio sube):

```
Resultado = (TP − Precio de apertura) × Volumen × Tamaño del contrato
```

En **BTCUSD** el tamaño del contrato es **1** (1 lote = 1 BTC), así que la
fórmula se queda en `(apertura − TP) × volumen` para las ventas.

En **Volatility 75** también es 1. En pares de divisas NO es 1, y hay que
decirlo en vez de suponerlo.

---

## Ejemplo resuelto y comprobado

Cesta de BTCUSD, todas **sell**, TP común en **66714.52**:

| # | Volumen | Apertura | Cálculo | Resultado |
|---|---------|----------|---------|-----------|
| 1 | 0.01 | 62642.85 | (62642.85 − 66714.52) × 0.01 | **−40.72** |
| 2 | 0.02 | 63146.36 | (63146.36 − 66714.52) × 0.02 | **−71.36** |
| 3 | 0.04 | 63804.37 | (63804.37 − 66714.52) × 0.04 | **−116.41** |
| 4 | 0.08 | 64646.28 | (64646.28 − 66714.52) × 0.08 | **−165.46** |
| 5 | 0.16 | 65702.43 | (65702.43 − 66714.52) × 0.16 | **−161.93** |
| 6 | 0.32 | 67163.63 | (67163.63 − 66714.52) × 0.32 | **+143.72** |
| 7 | 0.64 | 69342.90 | (69342.90 − 66714.52) × 0.64 | **+1682.16** |

**Total: +1 270.00 USD**

### El error que se estaba cometiendo

En la operación 1 se respondió **−407.167**. La cuenta correcta es:

```
(62642.85 − 66714.52) = −4071.67
−4071.67 × 0.01 = −40.7167
```

Se estaba dejando el resultado **diez veces más grande**: se dividía mal por el
lote. Con ese error el total salía negativo y contradecía la realidad de la
cesta. **Haz la multiplicación con cuidado y comprueba el orden de magnitud.**

---

## La comprobación que hay que hacer SIEMPRE

Existe un atajo que valida el resultado:

```
Suma de lotes = 0.01+0.02+0.04+0.08+0.16+0.32+0.64 = 1.27
1.27 ÷ 0.01 = 127 unidades
127 × 10 USD = 1 270 USD
```

**Los dos caminos deben dar lo mismo.** En el ejemplo: 1 270.00 por la fórmula
y 1 270 por el atajo. Si no coinciden, hay un dato mal leído o una
multiplicación mal hecha: **revísalo antes de responder, no entregues un total
que no cuadra**.

El atajo funciona porque el bot corta a 100 000 puntos, y en este instrumento
eso deja 10 USD por cada 0.01 de lote.

---

## Por qué una cesta no cierra en negativo

Las primeras operaciones, las de lote pequeño, cierran en pérdida. Las últimas,
que van doblando el lote, cierran en ganancia y arrastran el total.

En el ejemplo: las cinco primeras suman −555.88 y las dos últimas +1 825.88.
La diferencia son los 1 270 de ganancia.

Por eso, **ver números rojos en la columna Beneficio no significa que la cesta
vaya a cerrar en pérdida**. Si un cálculo da un total negativo, está mal hecho.

---

## Cómo se presenta la respuesta

**Si piden "vertical" o "en columna": un valor por renglón.** Nada de
separarlos con espacios o comas en la misma línea; eso es horizontal.

```
Operación 1
-40.72

Operación 2
-71.36

...

Total
+1270.00
```

**Si piden solo el total, se da el total.** Sin la tabla, sin la explicación y
sin el desarrollo. Añadir lo que no se ha pedido no es ser más útil.

**Si piden "una a una", se dan las siete filas.** Si piden "la distancia entre
una y otra", es la diferencia entre aperturas consecutivas, no la distancia de
cada una al TP.

Y cuando la pregunta es abierta —"analiza esto"— entonces sí: tabla completa,
total y qué está pasando en la cesta.

---

## Varias imágenes

Cuando lleguen varias capturas, se numeran en el orden en que se adjuntaron y
se calcula **cada una por separado**, con su encabezado. No se mezclan las
operaciones de dos capturas en una sola suma salvo que lo pidan expresamente.

Si en una misma captura hay operaciones `buy` y `sell` con TP distintos, son
**cestas distintas**: se separan y se calcula cada una con su fórmula.
