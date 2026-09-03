# CJ Bot v2.51 — Funcionamiento interno completo

> Documentado leyendo el código fuente `CJBot_v2.51.mq5` línea por línea.
> Describe **cómo actúa el bot por dentro**: en qué orden hace las cosas, qué decide
> automáticamente y por qué a veces "no hace nada". Sirve para responder soporte real.
>
> **Nota de seguridad:** este documento excluye deliberadamente la contraseña maestra
> de licencia y la lista de cuentas autorizadas. Si un alumno las pide, no se entregan.

---

## 1. Los dos sistemas de escalado (la confusión más común)

El CJ Bot tiene **dos formas distintas de escalar el lote**, y no son lo mismo.
Confundirlas es el error número uno de configuración.

### A) MARTINGALA — parámetro (13) en "Martingala"

- Abre **operaciones simultáneas** que conviven: una cesta.
- Cada respaldo se suma a los anteriores; todos quedan abiertos a la vez.
- La cesta se cierra junta con un **TP unificado** calculado sobre el precio promedio ponderado.
- **Requiere cuenta de COBERTURA (HEDGING).** En cuenta de NETEO el bot avisa por el log:
  *"ADVERTENCIA: Cuenta de NETEO (NETTING) en modo MARTINGALA. La cesta de respaldos
  requiere cuenta de COBERTURA (HEDGING) para funcionar correctamente."*

### B) SCALPING ESCALADO — parámetro (13) en "Scalping" **con múltiplo (14) mayor que 1**

- Es la vieja "Recuperación", ahora absorbida por Scalping.
- **No abre operaciones simultáneas.** Opera de a una: si pierde, la **siguiente** entra
  con lote multiplicado.
- El lote sale de la racha de pérdidas: `Lote = Inicial × Múltiplo^racha`.
- Con múltiplo (14) ≤ 1.0 el Scalping es simple: **lote fijo, sin racha**.
- En este modo **el bot NUNCA entra por "Solo Tiempo"**, ni en la entrada inicial ni en
  las reentradas: la dirección la deciden las estrategias 3-20. El bot lo avisa al
  arrancar: *"AVISO: En SCALPING con escalado (14>1) el bot NO opera por 'Solo Tiempo'."*
- Tras cada cierre espera los segundos de (18) antes de reentrar.

**El contador de racha sobrevive a reinicios**: al arrancar, el bot reconstruye la racha
leyendo el historial cerrado de los últimos 60 días. Un cierre ganador la reinicia a cero,
y al llegar al máximo de (17) también se reinicia.

---

## 2. La compuerta de seguridad: por qué el bot "no opera"

Antes de hacer nada, el bot pide permiso. **Nunca opera ni adopta posiciones sin
autorización explícita.** Hay dos motivos de bloqueo:

### Motivo 1 — Falta el Número Mágico

Si (20) ID Mágico del Bot está en 0, el bot queda bloqueado y muestra:

> *"Debe colocar un Numero Magico (mayor que 0) para poder operar. Abra las propiedades
> del Asesor Experto (tecla F7) y configure el parametro (20)."*

Este aviso sale **una sola vez** (no cada 5 segundos), porque con NM=0 el bot no opera y
no tiene sentido insistir. **Esta es la primera causa a revisar cuando un alumno dice que
el bot no hace nada.**

### Motivo 2 — Hay operaciones abiertas que coinciden con su identidad

Si al arrancar ya existen posiciones con el mismo símbolo, Número Mágico y dirección, el
bot **pregunta antes de tomarlas**. Muestra una ventana con el detalle completo: ticket,
tipo y lote de cada una, más el lote total, y ofrece Aceptar / Cancelar. Si se cancela,
**vuelve a preguntar cada 5 segundos**.

### Excepciones donde no pregunta

- **En el Probador de Estrategias** (backtest y optimización) adopta automáticamente, sin
  ventanas, para que el backtest pueda correr.
- **En una continuación**: si el EA se reinició por cambio de temporalidad del gráfico,
  cambio de parámetros o recarga de plantilla, **no es un arranque nuevo**. El bot ya
  tenía permiso y sigue gestionando sin volver a preguntar.

---

## 3. Qué valida el bot al arrancar (OnInit), en orden

1. **Balance dentro de rango.** Fuera de rango → error crítico, el bot no carga.
2. **Tipo de cuenta permitido** (demo / real / ambas, según la compilación).
3. **Licencia**: contraseña, número de cuenta y fecha de vencimiento.
   **En el Probador de Estrategias se salta toda la validación de licencia**, para poder
   hacer backtesting libremente.
4. **Detecta cobertura o neteo** y lo informa en el log.
5. **Avisos de configuración incoherente** (Seguidor sin NM, escalado con Solo Tiempo).
6. Inicializa indicadores y nombres.
7. **Quita el SL de las posiciones propias**, para que el trailing recuente desde cero.
8. **Bloquea "Ambas" en cuenta en vivo** (ver punto 4).
9. **Reconstruye la racha de recuperación** desde el historial.
10. Hace un censo de posiciones propias y evalúa el permiso para operar.

---

## 4. "Ambas" solo funciona en backtesting

Si (02) está en **Buy and Sell** o **Scalping** y el bot está en una **cuenta en vivo
(demo o real), NO abre operaciones nuevas**. Solo sigue gestionando lo que ya hubiera, y
avisa:

> *"Ambos sentidos (Ambas) solo funciona en backtesting. En vivo usa dos gráficos: uno en
> compra y otro en venta."*

**La forma correcta de operar los dos sentidos en vivo es con dos gráficos**, cada uno con
su instancia, su dirección y su Número Mágico. Así cada instancia ve solo su mitad.

En el Probador sí funciona: el bot recorre su tubería dos veces, una por compras y otra
por ventas, y **cada lado lleva su propia cesta independiente**.

---

## 5. El reloj de entrada: por tiempo, no por velas

En la 2.51 el filtro de entrada **ya no mira el cierre de vela**: cuenta **segundos desde
la última entrada real**. La temporalidad (03) se traduce a segundos (M1=60, M5=300,
M30=1800; "Current" usa el periodo del gráfico).

**El reloj se reinicia en cada carga del EA.** Tras una plantilla, un F7 o un reinicio del
terminal, el bot **guarda silencio un intervalo completo** y en ese tiempo censa las
posiciones abiertas antes de actuar. Es intencional: nunca más una entrada en el segundo cero.

Si un alumno dice *"le di F7 y no entra"*, es esto: está esperando el intervalo.

---

## 6. Ciclo de trabajo (OnTimer), en orden exacto

Se ejecuta cada (19) milisegundos:

1. Actualiza el panel.
2. **Si no hay permiso para operar → muestra el bloqueo y no hace nada más.**
3. Al cambiar de día, ofrece exportar el reporte.
4. Si la licencia venció → se detiene.
5. Si el trading no está permitido en el terminal → se detiene.
6. **Si el mercado está cerrado → se detiene.**
7. Limpia el registro de trailing de tickets ya cerrados.
8. **Protección de equidad**, si (22) está activa.
9. Ejecuta la tubería: si hay operaciones propias **las gestiona**; si no hay y el bot está
   encendido, **busca señal nueva**.

Es decir: **primero gestiona lo abierto, y solo si no hay nada abierto busca entrar.**

---

## 7. Cómo gestiona la cesta de martingala

Cada ciclo recalcula:

- **Precio promedio ponderado** de todas las posiciones de la cesta (por lote).
- **TP unificado** = promedio ponderado ± (05) puntos, aplicado a todas por igual.

### El stop loss en martingala

- **Con 2 o más operaciones: la cesta NO lleva SL.** Solo TP unificado, y sin trailing.
- **Con 1 sola operación**: el SL lo gobierna el trailing (si (10) está activo). Lo coloca
  al activarse y **solo lo mueve a favor**; no lo quita aunque la ganancia vuelva a bajar
  del umbral. Al abrir el primer respaldo deja de ser una sola operación y el SL se quita.
- **Cualquier SL fijo o manual que se ponga en martingala, el bot lo quita en cada ciclo.**

### Vigilancia del TP

El TP base es un **suelo**: el trailing puede alejarlo para dejar correr la ganancia, y una
vez alejado **no retrocede**. El bot lo repone solo si falta, si quedó peor que el base, o
si hubo un cambio de parámetros.

---

## 8. Trailing: cómo funciona de verdad

Los porcentajes **se calculan sobre el Take Profit en puntos (05)**, no sobre el precio.

```
Umbral de activación del SL = (05) × (11) / 100
Distancia que mantiene el SL = (05) × (12) / 100
Umbral de activación del TP = (05) × (08) / 100
Distancia que mantiene el TP = (05) × (09) / 100
```

Con los valores por defecto (TP 100.000 puntos, activación SL 75%, distancia 10%): el
trailing del SL se activa con **75.000 puntos de ganancia** y mantiene el SL a **10.000
puntos** del precio.

### Tres reglas del trailing

1. **Solo se mueve a favor.** Nunca retrocede.
2. **La mejora debe sostenerse**: 3 segundos para el SL, 5 para el TP. Un tick aislado no
   mueve nada.
3. **Respeta la distancia mínima del bróker.** Si el nivel queda muy pegado al precio, lo
   aleja al mínimo permitido para que el servidor no rechace la modificación.

### Diagnóstico en pantalla

Cada 3 segundos el bot escribe en la pestaña **Expertos** una línea `[TRAIL]` con la
ganancia actual en puntos y los umbrales exactos de activación. **Si un alumno dice que el
trailing no funciona, esa línea dice si llega al umbral o no.**

---

## 9. Modificación de SL/TP: qué respeta el bot

Antes de enviar cualquier modificación:

1. **Verifica el lado correcto.** Un SL de compra va debajo del precio y el de venta
   arriba. Si el nivel pedido quedaría del lado equivocado —por ejemplo una operación muy
   negativa cuyo SL fijo ya fue rebasado por el precio— **no lo coloca**: lo inhibe y
   mantiene el actual. **No persigue al precio ni cierra a la fuerza.**
2. **Respeta la distancia mínima del bróker.** Si es válido pero queda pegado, lo aleja al
   mínimo permitido para evitar el rechazo (retcode 10016).
3. **Anti-flood.** Si un envío falla, no reintenta los mismos valores durante 30 segundos,
   para no entrar en bucle y que el servidor no apague el algo-trading.

Cuando una modificación falla, escribe en el log una línea `[MODIFY-FALLO]` con el ticket,
los valores, el código de error y la distancia mínima del bróker.

---

## 10. Apertura de respaldos: las condiciones exactas

Un respaldo entra solo si se cumple **todo** esto:

1. El número de operaciones abiertas es **menor** que (17).
2. Pasaron los segundos de (18) desde el último respaldo.
3. La distancia desde la **última posición abierta** alcanza el requisito.
4. Esa condición **se mantiene** durante los segundos de (18) — no basta un pico.
5. El bot está encendido.

### El requisito de distancia

```
Requisito teórico = (15) × (1 + (16)/100)^(conteo-1)
```

Pero además: si el tramo real que separó a las dos últimas posiciones fue mayor que el
teórico —por un hueco, slippage o los segundos de confirmación— **manda el tramo real
multiplicado por el factor**. El tramo real **solo puede alejar el próximo respaldo, nunca
acercarlo**. El teórico funciona como suelo infranqueable.

La distancia se mide **al precio real de entrada**: una compra de respaldo entra al ASK y
una venta al BID, para que el spread no la haga entrar más cerca de lo fijado.

### Notificación por intervención

Si el bot arrancó sobre una cesta adoptada, la **primera vez** que respalda lo notifica.
Es informativo, **no bloquea**. Después opera en silencio.

---

## 11. El modo Seguidor (02) — comportamiento real en 2.51

- **Adopta por identidad propia**: mismo Número Mágico, mismo gráfico, misma dirección.
- **Nunca abre la operación inicial y NUNCA cierra.** Solo gestiona: SL, TP, trailing y
  respaldos, con el mismo motor dinámico que los demás modos.
- El "nunca cierra" es deliberado: antes cerraba la posición si la operación externa
  desaparecía, y al reiniciar —cuando la detección fallaba un instante— cerraba la cesta
  en pérdida. Eso se eliminó.
- Requiere Número Mágico distinto de 0; el bot lo avisa al arrancar.

---

## 12. Protección de equidad (22)

Cada ciclo suma el beneficio flotante de todas las posiciones propias (profit + swap). Si:

- el beneficio **cae a −(24)**, o
- el beneficio **llega a +(25)**

→ **cierra todas las operaciones propias** y registra:
*"Proteccion de equidad: cierre total en X USD"*.

Funciona en **todos los modos**, incluida la cesta de martingala. Un valor en 0 desactiva
ese lado.

---

## 13. Validación de margen

Antes de abrir cualquier operación, el bot calcula el margen requerido y exige que el
**margen libre sea al menos un 20% mayor**. Si no alcanza, no abre. En el Seguidor lo
registra como *"SEG: margen insuficiente para copiar."*

---

## 14. Modo multi-estrategia

El bot puede operar con **varias estrategias votando a la vez** (solo las 3 a 20; la 01 y
la 02 quedan fuera del multi). Por defecto todas las de 3 a 20 quedan marcadas.

Se abre una operación cuando los votos de un lado **alcanzan el mínimo configurado** (2 por
defecto) **y superan** a los del lado contrario. El bot registra qué estrategias generaron
la entrada, y esa lista queda visible en el panel y en el historial.

---

## 15. Panel y reportes

- **Panel en pantalla** con 15 fondos seleccionables y texto adaptativo, ganancia en azul y
  pérdida en rojo, estadísticas de sesión (cerradas, ganadas, perdidas, P&L realizado) y
  rango máx/mín por Hora, Día, Semana o Mes.
- **Exportación diaria**: al cambiar de día pregunta si guardar el reporte y genera **CSV y
  HTML**. En el Probador guarda directo, sin preguntar.
- **Historial interno** de cada operación: apertura, cierre, tipo, lote, precios, resultado
  en USD, estrategia y nivel de martingala.

---

## 16. Preguntas de soporte y su causa real

| El alumno dice | Causa más probable |
|---|---|
| "El bot no abre nada" | (20) Número Mágico en 0 → bloqueado |
| "Me sale una ventana pidiendo permiso" | Hay operaciones abiertas con su misma identidad; debe aceptar |
| "Le di F7 y no entra" | El reloj de entrada se reinició: espera un intervalo completo |
| "No respalda" | No se cumplió la distancia, o no se sostuvo los segundos de (18) |
| "Puse un SL y desaparece" | En martingala el bot quita el SL fijo en cada ciclo: es correcto |
| "El trailing no hace nada" | Revisar la línea `[TRAIL]` en Expertos: dice si llega al umbral |
| "En Ambas no opera" | "Ambas" solo funciona en el Probador; en vivo van dos gráficos |
| "Los respaldos no se abren en Scalping" | En Scalping escalado no hay cesta: opera de a una |
| "En Solo Tiempo con Scalping no entra" | Con escalado el bot no entra por tiempo: mandan las estrategias 3-20 |
| "Se reinició MT5 y perdí la racha" | No se pierde: la reconstruye del historial de 60 días |
| "El bot no modifica el SL" | Puede estar inhibido por lado incorrecto o distancia mínima del bróker |
