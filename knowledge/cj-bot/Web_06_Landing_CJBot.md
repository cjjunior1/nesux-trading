# Página "Landing CJ Bot v2.30" — Trading Academy A Otro Nivel

> Página de venta del CJ Bot v2.30 (Expert Advisor para MetaTrader 5). Ruta: /landing/cj-bot. Para detalle técnico completo, ver también los manuales CJBot_* de esta misma base.

## El Trading Automático Acaba de Evolucionar (EXCLUSIVO 2024)

¿Cansado de la montaña rusa emocional del trading? **CJ Bot v2.30** es tu copiloto analítico: una máquina de precisión diseñada para ejecutar estrategias ganadoras, proteger tu capital y operar por ti 24/7 sin dudar.

## ¿Te Suena Familiar? (El Problema)

- **Decisiones Emocionales:** el miedo te hace cerrar antes de tiempo y la codicia te hace entrar tarde, saboteando tus ganancias.
- **Falta de Tiempo:** no puedes estar pegado a la pantalla todo el día esperando la señal perfecta.
- **Miedo a "Quemar la Cuenta":** has probado otros bots o estrategias que prometían mucho y solo vieron desaparecer tu capital.

El trading no tiene por qué ser una fuente de estrés. Debe ser una herramienta de libertad.

## La Solución: CJ Bot v2.30 — Tu Estratega Personal de Mercados

No es otro bot "milagroso". Es el resultado de una programación quirúrgica, enfocada en tres pilares: **Inteligencia, Control y Seguridad**.

## Un Arsenal de Estrategias

- **EMA & RSI (Doble Confirmación):** el cruce de medias móviles exponenciales da la tendencia y el RSI confirma que el mercado no está sobrecalentado. Entradas de máxima probabilidad.
- **Solo RSI (Precisión Quirúrgica):** ideal para mercados en rango. Compra en sobreventa y vende en sobrecompra.
- **Cruce de EMA (El Clásico):** seguimiento de tendencia por excelencia, con medias rápidas cruzando a las lentas.
- **Por Tiempo (Diversificación Constante):** opera alternando compra/venta en intervalos definidos. Ideal para estrategias de cesta.
- **Modo Seguidor (Gestor Inteligente):** si ya tienes operaciones abiertas, el bot las "adopta" y gestiona trailing stop y martingala sobre ellas.

## Gestión de Riesgo Integral y Martingala Inteligente

**Gestión de Riesgo Profesional:**
- Stop Loss dinámico (puntos configurables).
- Take Profit dinámico (según el precio promedio de la cesta).
- Trailing Stop Loss (se activa al alcanzar un % de ganancia y sigue el precio).
- Trailing Take Profit (mueve el TP para maximizar ganancias).
- Protección de equidad en USD (cierra todo al alcanzar tu límite de pérdida o ganancia del día).

**Sistema Martingala Inteligente (3 modos):**
- **Desactivada:** opera lote fijo siempre.
- **Martingala:** abre respaldos con lote multiplicado si el precio va en contra.
- **Recuperación:** aumenta el lote progresivamente tras cada pérdida para recuperar.
- Máximo 7 martingalas configurables.
- Distancia entre respaldos con incremento porcentual ajustable.
- Delay en segundos entre respaldos para evitar aperturas impulsivas.

## Tu Capital, Nuestra Fortaleza (Seguridad)

- **Trailing Stop Dual:** protege ganancias y maximiza el beneficio en tendencia.
- **Protección de Equidad en USD:** límites de ganancia/pérdida con cierre total.
- **Gestión de SL/TP Condicional:** sabe cuándo eliminar o aplicar stop loss y take profit.
- **Filtro de Balance Inicial (exclusivo):** el bot solo arranca si tu capital está dentro de un rango seguro.

CJ Bot está diseñado para preservar, no para apostar.

## Una Inversión que Crece Contigo

- Actualizaciones de por vida gratuitas.
- Soporte directo y prioritario.
- Comunidad privada para perfeccionar tu automatización.

## Resumen Técnico

- **Licenciamiento por cuenta:** único por número de cuenta y contraseña maestra.
- **Estrategias programables:** EMA+RSI, solo RSI, cruce de EMA, por tiempo y modo seguidor.
- **Trailing doble independiente:** TP y SL con lógica y configuración separadas.
- **Martingala inteligente y modo recuperación.**
- **Seguridad multicapa:** validación por cuenta, licenciamiento temporal, whitelist y control de balance mínimo/máximo.
- **Interfaz y monitoreo:** avisos en pantalla, logs y personalización de parámetros.
- Desarrollado con lógica profesional para **MetaTrader 5**. Compatible con cuentas reales y demo.

Incluye: archivo completo CJ Bot v2.30 (Expert Advisor) · acceso a todas las nuevas versiones · guía de configuración y soporte · activación instantánea.

## Cualidades Completas (CJ Bot v2.30)

1. **Inteligencia Multi-Indicador:** analiza 7 indicadores en simultáneo — EMA 10/30/100 (tendencia), Aroon 14 (fuerza de tendencia), RSI 14 (sobrecompra/sobreventa), MACD 12/26/9 (momentum), Stochastic 5/3/3 (reversiones), Bollinger Bands 20 (volatilidad), Volumen por tick (dinero institucional).
2. **Estrategias de Entrada Avanzadas:** 18 estrategias técnicas (03–20) seleccionables desde el panel sin tocar código, más los modos 01 Por Tiempo y 02 Seguidor (20 opciones numeradas en total).
3. **Gestión de Riesgo Profesional:** SL/TP dinámicos, trailing inteligente, protección total de equidad por USD.
4. **Martingala con Inteligencia Real:** modo fijo, martingala y recuperación progresiva; control de respaldos, lote, incrementos, delay y distancia.
5. **Configuración Total:** 21 parámetros ajustables desde el panel visual.
6. **Seguridad y Licenciamiento Premium:** licencia por cuenta y contraseña maestra, compatible demo/real, control de fecha/usuarios, balance mínimo y lista blanca.
7. **Autonomía 24/7 y Potencia MT5:** opera en cualquier activo de MT5.
8. **Indicador Aroon Nativo:** calculado desde el código, 100% portable y robusto.

## Las estrategias del CJ Bot (datos oficiales del manual v2.43)

> Numeración real del bot: **01 Por Tiempo** y **02 Seguidor** son dos *modos*; las **18 estrategias técnicas (03–20)** se dividen por la **paridad del número** en dos familias iguales (9 y 9):
> - **NONES (impares) = Reversión:** apuestan a que el precio **rebota** desde un extremo. Rinden mejor en mercados en **rango**.
> - **PARES = Tendencia:** apuestan a que el movimiento **continúa**. Rinden mejor en mercados en **tendencia**.

### Modos especiales

- **01 — Por Tiempo:** entra en cada barra nueva; la dirección la deciden 5 estrategias al azar (empate → alterna). Modo típico para martingala.
- **02 — Seguidor:** copia/gestiona operaciones externas (manuales o de otro bot).

### Nones (impares) — Reversión / rebote

- **03 — EMA + RSI:** precio bajo la EMA media, RSI venía < 30 y gira al alza. *(Efectividad: Media-Alta)*
- **05 — Solo RSI:** RSI cruza al alza el 30 (sale de sobreventa). *(Media-Baja)*
- **07 — MACD + Bollinger:** precio toca banda baja + MACD sobre su señal. *(Media-Alta)*
- **09 — Bollinger + Stochastic:** banda baja + Stoch venía < 20 y cruza arriba. *(Alta)*
- **11 — MACD + Stochastic:** Stoch < 20 cruza arriba + MACD alcista. *(Media-Alta)*
- **13 — Stochastic + Volumen:** Stoch < 20 cruza arriba + volumen sube. *(Media)*
- **15 — Bollinger + Volumen:** banda baja + volumen sube. *(Media-Baja)*
- **17 — Aroon + Stochastic:** Stoch < 20 cruza arriba + Aroon up > down (giro). *(Media)*
- **19 — EMA + Bollinger + Stochastic:** banda baja + Stoch cruza + precio sobre EMA-100 (rebote a favor de la tendencia mayor). *(Alta, poco frecuente)*

### Pares — Tendencia / continuación

- **04 — Cruce EMA:** EMA rápida cruza arriba la media. *(Media-Baja)*
- **06 — Triple EMA + Aroon:** 3 EMAs alineadas arriba + Aroon > 70. *(Alta)*
- **08 — MACD + Volumen:** MACD cruza arriba + volumen sube. *(Media)*
- **10 — Triple EMA + RSI + Aroon:** 3 EMAs + RSI > 50 + Aroon > 70. *(Alta, poco frecuente)*
- **12 — Aroon + Volumen:** Aroon > 70 + volumen sube. *(Media)*
- **14 — Aroon + MACD:** Aroon > 70 + MACD alcista. *(Media-Alta)*
- **16 — Aroon + RSI:** Aroon > 70 + RSI > 50. *(Media)*
- **18 — Aroon + MACD + RSI:** Aroon > 70 + MACD alcista + RSI > 50. *(Alta, poco frecuente)*
- **20 — EMA + MACD + Volumen:** EMA media > lenta + MACD alcista + volumen sube. *(Media-Alta)*

*(En todas, la regla descrita es para compra; la venta es a la inversa.)*

### Cómo leerlo

- **Más condiciones = menos señales pero mejor calidad** → 09, 19, 06, 10, 18 son las más fiables (y más raras).
- **1–2 condiciones = más señales, más ruido** → 05, 04, 15.
- El **volumen en índices sintéticos** (p. ej. V75) es de ticks y aporta poco → resta valor a 08, 12, 13, 15, 20.
- **Reversión rinde en rango; Tendencia rinde en tendencia.** Conviene activar familias completas según el mercado.

> **Honestidad:** la efectividad es relativa (qué tan filtrada está la señal), **no** una garantía de ganancia. En instrumentos sintéticos lo que más pesa es la **gestión de riesgo**.

## Aviso de Riesgo

El trading en los mercados financieros conlleva un alto nivel de riesgo y puede no ser adecuado para todos los inversores. Considera tus objetivos, experiencia y apetito por el riesgo. El rendimiento pasado no es indicativo de resultados futuros. CJ Bot es una herramienta: la responsabilidad es del usuario final.

---

## Recursos: enlaces e imágenes

- **Landing oficial:** [/landing/cj-bot](/landing/cj-bot)
- **Video corto (YouTube Shorts):** https://youtube.com/shorts/ZqO9s1L8cbs
- **Video de presentación (YouTube):** https://www.youtube.com/watch?v=6JZ_hLo0BTU

![Video CJ Bot - Trading automatizado](https://img.youtube.com/vi/ZqO9s1L8cbs/maxresdefault.jpg)

> Nota: existe una segunda landing en construcción en /landing/cj-bot-a-otro-nivel (versión de marketing ampliada del mismo CJ Bot v2.30, aún incompleta).
