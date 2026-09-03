# CJ Bot v2.51 — Las dos pantallas que ve el alumno

> Referencia visual para interpretar capturas. Cuando un alumno mande una captura del bot,
> será casi siempre **una de estas dos pantallas**. Este documento describe qué campos tiene
> cada una, dónde están y cómo leerlos.
>
> Imágenes de referencia en el sitio:
> - `/cj-bot/referencia/parametros-2.51.png` — ventana de parámetros
> - `/cj-bot/referencia/panel-2.51.png` — panel en el gráfico

---

## PANTALLA 1 — Ventana de parámetros (tecla F7)

Título: `CJBot_v2.51 (Volatility 75 Index,M30)` — **el título dice el activo y la
temporalidad del gráfico**. Tiene dos pestañas: *General* y *Parámetros de entrada*.

La tabla tiene dos columnas: **Variable** y **Valor**, en este orden exacto:

```
--- CONFIGURACION DE LICENCIA Y SEGURIDAD ---
NumeroDeCuentaLicencia        (número de cuenta MT5)
ContrasenaLicencia            (clave entregada por Nesux)

(01) Modo Entrada             (01) Solo Tiempo ... (20) EMA + MACD + Vol
(02) Buy And Sell             Only Buy / Only Sell / Buy and Sell / Scalping
(03) Time                     1 Minute, 5 Minutes, 30 Minutes...
(04) Lotaje
(05) T/P en Puntos
(06) S/L en Puntos
(07) Trailing TP              true / false
(08) (%)Trailing TP
(09) (%)Distancia Trailing TP
(10) Activar Trailing SL      true / false
(11) (%)Ganancia Trailing SL
(12) (%)Distancia Trailing SL
(13) Scalping or Martingala   Scalping / Martingala
(14) Multiplo Martingala
(15) Puntos 1ra martingala
(16) (%)Incremento de Respaldo
(17) Cantidad de Martingalas
(18) Espera pra Respaldo
(19) (ms) Vigilancia
(20) ID Magico del Bot
(21) Comentario del Bot
(22) Cierre Ganancia/Perdida  true / false
(23) Ventanas Emergentes      true / false
(24) Perdida Maxima en USD
(25) Ganancia Maxima en USD
```

Abajo: botones **Cargar** y **Guardar** (plantillas de configuración) y **Aceptar /
Cancelar / Reiniciar**.

### Cómo leer una captura de esta pantalla

1. **Mirar el título primero**: da el activo y la temporalidad, que cambian todo el cálculo.
2. **(20) ID Mágico**: si está en 0, el bot está bloqueado y no opera. Es lo primero a
   revisar ante un "no hace nada".
3. **(13)**: define si hay cesta (Martingala) o si opera de a una (Scalping).
4. **(04), (14), (15), (16), (17)**: los cinco que definen la exposición total.
5. **(22)**: si está en `false`, **la protección de equidad está apagada** y los valores de
   (24) y (25) no se aplican.

---

## PANTALLA 2 — Panel en el gráfico

Es el recuadro negro que el bot dibuja sobre el gráfico. Arriba a la derecha tiene los
botones `A-` `A+` (tamaño de letra) y `X` (cerrar).

### Encabezado

```
CJ Bot v2.51   Volatility 75 Index   M1     ← versión, activo y temporalidad
2026.09.03 18:12:04                          ← fecha y hora
Sesion: 13h 13m                              ← tiempo que lleva corriendo
```

### Bloque ESTADO

| Campo | Qué significa |
|---|---|
| **Bot** | `Encendido` o apagado. Si está apagado no abre nuevas, solo gestiona |
| **Estrategia** | Cuál de las 20 está activa |
| **Martingala** | `Martingala` o `Scalping` — el parámetro (13) |
| **Direccion** | Solo compras / Solo ventas / Ambas |
| **Mercado** | `Abierto` o cerrado. Cerrado = el bot no hace nada, y es correcto |
| **Cuenta** | **`Hedge` o `Netting`**. En martingala **debe decir Hedge** |
| **Max / Min** | Rango del periodo elegido con los botones `Rango` y `Dia` (Hora/Día/Semana/Mes) |

### Bloque ESTADISTICAS SESION

| Campo | Qué significa |
|---|---|
| **Abiertas** | Posiciones propias vivas ahora |
| **Cerradas** | Cuántas cerró en la sesión |
| **Gana / Pierde / %Gana** | Ganadoras, perdedoras y porcentaje de acierto |
| **G/P flot.** | Resultado **flotante** (aún abierto). Rojo = pérdida, azul = ganancia |
| **G/P real** | Resultado **ya realizado** (cerrado) en la sesión |
| **Rendimiento** | % sobre el balance inicial de la sesión |

**No confundir G/P flot. con G/P real.** Un alumno preocupado porque "está en rojo" suele
estar mirando el flotante de una cesta que todavía no cerró.

### Bloque CESTA ACTUAL

| Campo | Qué significa |
|---|---|
| **Estrategia(s)** | Qué originó la cesta abierta |
| **Posiciones** | Cuántas operaciones tiene la cesta |
| **Lotaje** | **Lote total acumulado de la cesta**, no el inicial |
| **Promedio** | Precio promedio ponderado, del que sale el TP unificado |
| **G/P cesta** | Resultado flotante de la cesta completa |
| **Dist TP** | Puntos que faltan hasta el TP unificado |

### Bloque MULTI

Las 20 estrategias en dos columnas, con la leyenda `(par=Tendencia / non=Reversion)`:
las **pares son de tendencia** y las **impares de reversión**. Debajo, `Min
confirmaciones` con botones `-` y `+`, y el estado: **`MULTI: DESACTIVADO`** o activado.

Si dice DESACTIVADO, manda la estrategia única de (01), no las votaciones.

Más abajo continúa una sección de **CONTROLES** que queda fuera de esta captura.

---

## Ejemplo real de configuración (la de las capturas)

Sirve para enseñar a leer una configuración completa:

```
Activo: Volatility 75 Index      Gráfico: M30 (panel corriendo en M1)
Cuenta: Hedge                    (correcto para martingala)
(01) Modo Entrada:      Solo Tiempo
(02) Direccion:         Only Sell
(04) Lotaje:            0.01
(05) T/P:               100000 puntos
(13) Modo:              Martingala
(14) Multiplo:          2.0
(15) Puntos 1ra:        70000
(16) Incremento:        35.0 %
(17) Cantidad MG:       7
(20) ID Magico:         76
(22) Proteccion:        false   ← APAGADA
(24)/(25):              5000 / 5000 USD
```

### Qué exposición implica esa configuración

Con múltiplo **2.0** y **7** martingalas, los lotes de la secuencia son:

```
0.01 → 0.02 → 0.04 → 0.08 → 0.16 → 0.32 → 0.64 → 1.28
```

**Lote total acumulado: 2.55 — doscientas cincuenta y cinco veces el lotaje inicial.**

Y las distancias de cada respaldo, con 70.000 puntos e incremento del 35%:

```
70.000 → 94.500 → 127.575 → 172.226 → 232.505 → 313.882 → 423.741
```

**Distancia total recorrida hasta el último respaldo: 1.434.430 puntos.**

### La comparación que hay que enseñar

| Múltiplo | Lote total con 5 MG | Lote total con 7 MG |
|---|---|---|
| 1.25 | 0.11 (11x) | 0.19 (19x) |
| 2.00 | 0.63 (63x) | **2.55 (255x)** |

**Duplicar el múltiplo no duplica el riesgo: lo multiplica.** Pasar de 1.25 a 2.0 con 7
martingalas lleva la exposición de 19 veces a 255 veces el lotaje inicial. Es el argumento
concreto para recomendar siempre el múltiplo bajo y el lotaje mínimo.

### Advertencia sobre (22) en `false`

Con la protección de equidad apagada, **(24) Pérdida Máxima y (25) Ganancia Máxima no se
aplican**: el bot no cierra por equidad. Si un alumno muestra esta combinación —múltiplo
alto, muchas martingalas y (22) en false— hay que señalárselo.

---

## Cómo responder ante una captura

1. **Decir primero el activo y la temporalidad** que se leen en el título o el panel.
2. **Si es la ventana de parámetros**: leer los 25 valores y calcular el lote total
   acumulado y la distancia total con las fórmulas.
3. **Si es el panel**: distinguir G/P flotante de G/P real, y decir cuántas posiciones tiene
   la cesta y su lote acumulado.
4. **Señalar las incoherencias**: cuenta en Netting con Martingala, ID Mágico en 0,
   protección apagada con múltiplo alto.
5. Si algún dato no se distingue en la imagen, **decir exactamente qué campo no se lee** y
   pedir solo esa zona ampliada.
