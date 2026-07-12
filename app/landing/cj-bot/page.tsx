"use client";

export default function CjBotLanding() {
  return (
    <main className="landing-page min-h-screen bg-gradient-to-br from-[var(--color-darker)] via-slate-900 to-[var(--color-dark)] text-white flex flex-col items-center">
      {/* HERO - SECCIÓN 1 */}
      <section className="max-w-3xl w-full px-4 mx-auto pt-24 pb-10 text-center">
        <div className="inline-block bg-emerald-900/70 text-emerald-200 px-3 py-0.5 rounded-full font-semibold uppercase text-xs tracking-wider mb-3">EXCLUSIVO 2024</div>
        <h1 className="title-anim text-4xl md:text-5xl font-extrabold mb-4">
          El Trading Automático Acaba de Evolucionar
        </h1>
        <p className="section-subtitle max-w-2xl mx-auto">
          Cansado de la montaña rusa emocional del trading? <b>CJ Bot a Otro Nivel</b> es tu copiloto analítico, una máquina de precisión diseñada para ejecutar estrategias ganadoras, proteger tu capital y operar por ti 24/7 sin dudar.
        </p>
        <div className="w-full max-w-lg mx-auto mb-6 mt-5 rounded-xl overflow-hidden shadow-xl border-2 border-blue-900 aspect-video relative">
          <iframe
            className="absolute inset-0 w-full h-full"
            src="https://www.youtube.com/embed/78fpT_7cvmo?autoplay=1&cc_load_policy=0&iv_load_policy=3&modestbranding=1&rel=0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            frameBorder="0"
          ></iframe>
        </div>
        <a href="https://wa.me/" // Tu CTA real aquí
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-full bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 mt-8 shadow-lg font-bold transition-all hover:shadow-xl"
                >
                  🚀 Si lo quiero ya 💰
                </a>
                
      </section>

      {/* SECCIÓN 2: EL PROBLEMA */}
      <section className="max-w-3xl w-full mx-auto py-8 md:py-14 px-4 text-center">
        <div className="flex flex-col items-center gap-5">
          
          <h2 className="section-title">¿Te Suena Familiar?</h2>
          <ul className="space-y-2 text-[1.07rem] text-slate-300 list-none max-w-xl mx-auto text-justify">
            <li><b className="text-blue-400">• Decisiones Emocionales:</b> El miedo te hace cerrar antes de tiempo y la codicia te hace entrar tarde, saboteando tus ganancias.</li>
            <li><b className="text-blue-400">• Falta de Tiempo:</b> No puedes estar pegado a la pantalla todo el día esperando la señal perfecta. La vida real te llama.</li>
            <li><b className="text-blue-400">• El Miedo a "Quemar la Cuenta":</b> Has probado otros bots o estrategias que prometían el oro y el moro, solo para ver tu capital desaparecer en un abrir y cerrar de ojos.</li>
          </ul>
          <div className="font-bold mt-4 max-w-2xl mx-auto text-lg leading-relaxed" style={{ color: '#357B3B' }}>
            El trading no tiene por qué ser una fuente de estrés.<br />
            Tiene que ser una herramienta de libertad.
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: SOLUCIÓN */}
      <section className="max-w-3xl w-full mx-auto py-8 md:py-16 px-4 text-center">
        <div className="relative w-full max-w-2xl mx-auto mb-6 aspect-video rounded-2xl overflow-hidden shadow-lg bg-slate-900">
          <iframe
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[132%]"
            src="https://www.youtube-nocookie.com/embed/6JZ_hLo0BTU?modestbranding=1&rel=0&controls=0&playsinline=1&cc_load_policy=0&iv_load_policy=3"
            title="Presentamos CJ Bot a Otro Nivel"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
        <h2 className="section-title mb-1">Presentamos CJ Bot a Otro Nivel</h2>
        <div className="mb-3 text-xl text-emerald-400 font-bold">Tu Estratega Personal de Mercados</div>
        <p className="text-slate-300 mb-2">
          Imagina un sistema que no solo sigue reglas, sino que piensa, se adapta y protege. <b>CJ Bot a Otro Nivel</b> no es otro bot “milagroso”. Es el resultado de una programación quirúrgica, enfocado en tres pilares fundamentales: <span className="font-bold text-emerald-300">Inteligencia, Control y Seguridad</span>.
        </p>
      </section>

      {/* SECCIÓN 4: ESTRATEGIAS */}
      <section className="max-w-4xl mx-auto py-10 px-3">
        <h2 className="section-title text-center mb-4">Un Arsenal de Estrategias a Tu Disposición</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card bg-slate-800/40 flex flex-col md:flex-row gap-4 items-start p-5">
            <span className="text-3xl mb-2">📈</span>
            <span>
              <b>EMA & RSI (Doble Confirmación):</b> Cruce de Medias Móviles Exponenciales te da la tendencia, y el RSI confirma que el mercado no está sobrecalentado. Entradas de máxima probabilidad.
            </span>
          </div>
          <div className="card bg-slate-800/40 flex flex-col md:flex-row gap-4 items-start p-5">
            <span className="text-3xl mb-2">🎯</span>
            <span>
              <b>Solo RSI (Precisión Quirúrgica):</b> Ideal para mercados en rango. Compra en la sobreventa y vende en la sobrecompra.
            </span>
          </div>
          <div className="card bg-slate-800/40 flex flex-col md:flex-row gap-4 items-start p-5">
            <span className="text-3xl mb-2">🔀</span>
            <span>
              <b>Cruce de EMA (El Clásico):</b> La estrategia de seguimiento de tendencia por excelencia. Súbete a la ola con medias rápidas cruzando a las lentas.
            </span>
          </div>
          <div className="card bg-slate-800/40 flex flex-col md:flex-row gap-4 items-start p-5">
            <span className="text-3xl mb-2">⏱️</span>
            <span>
              <b>Por Tiempo (Diversificación Constante):</b> Haz que el bot opere alternando compra/venta en intervalos definidos. Ideal para estrategias de cesta.
            </span>
          </div>
          <div className="card bg-slate-800/40 flex flex-col md:flex-row gap-4 items-start p-5 md:col-span-2">
            <span className="text-3xl mb-2">🕵️</span>
            <span>
              <b>Modo Seguidor (El Gestor Inteligente):</b> ¿Ya tienes operaciones abiertas? Activa este modo y el bot "adopta" tus trades, gestionando trailing stop y martingala sobre ellas.
            </span>
          </div>
        </div>
      </section>

      {/* SECCIÓN 5: VENTAJA COMPETITIVA */}
      <section className="max-w-4xl mx-auto py-10 px-4">
        <h2 className="section-title text-center mb-3">Gestión de Riesgo Integral y Martingala Inteligente</h2>
        <div className="grid md:grid-cols-2 gap-7">
          <div className="bg-slate-800/50 rounded-lg p-6 shadow text-left">
            <div className="font-bold mb-2 text-emerald-400">Gestión de Riesgo Profesional</div>
            <ul className="text-slate-200 space-y-1 ml-4 text-base">
              <li><b>Stop Loss dinámico:</b> Se calcula automáticamente en puntos configurables.</li>
              <li><b>Take Profit dinámico:</b> Se ajusta según el precio promedio de la cesta.</li>
              <li><b>Trailing Stop Loss:</b> Se activa al alcanzar un % de ganancia definido y sigue el precio.</li>
              <li><b>Trailing Take Profit:</b> Mueve el TP hacia arriba/abajo para maximizar ganancias.</li>
              <li><b>Protección de equidad en USD:</b> Cierra todo si alcanzas tu límite de pérdida o ganancia del día.</li>
            </ul>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-6 shadow text-left">
            <div className="font-bold mb-2 text-emerald-400">Sistema Martingala Inteligente (3 Modos)</div>
            <ul className="text-slate-200 space-y-1 ml-4 text-base">
              <li><b>Desactivada:</b> Opera lote fijo siempre.</li>
              <li><b>Martingala:</b> Abre respaldos con lote multiplicado si el precio va en contra.</li>
              <li><b>Recuperación:</b> Aumenta el lote progresivamente tras cada pérdida para recuperar.</li>
              <li><b>Máximo 7 martingalas configurables.</b></li>
              <li><b>Distancia entre respaldos con incremento porcentual ajustable.</b></li>
              <li><b>Delay en segundos entre respaldos para evitar aperturas impulsivas.</b></li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECCIÓN 6: SEGURIDAD */}
      <section className="max-w-3xl mx-auto py-10 px-4">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="bg-emerald-800/40 rounded-full w-14 h-14 flex items-center justify-center text-3xl border-2 border-emerald-400">🛡️</div>
          <h2 className="section-title">Tu Capital, Nuestra Fortaleza</h2>
        </div>
        <div className="text-center text-lg text-emerald-300 font-bold mb-4">El Chasis de Acero Anti-Quiebras</div>
        <ul className="list-decimal list-inside text-left space-y-2 text-slate-300 ml-6">
          <li><b>Trailing Stop Dual:</b> Protege tus ganancias y maximiza el beneficio en tendencia.</li>
          <li><b>Protección de Equidad en USD:</b> Establece límites de ganancia/perdida y ejecuta cierre total; seguridad total para tu cuenta.</li>
          <li><b>Gestión de SL/TP Condicional:</b> Inteligencia anti-suicidio: sabe cuándo eliminar o aplicar stop loss y take profit.</li>
          <li><b>Filtro de Balance Inicial (Exclusivo):</b> El bot solo arranca si tu capital está dentro de rango seguro. Cero apuestas imprudentes.</li>
        </ul>
        <p className="text-emerald-300 mt-5 mb-3 font-semibold text-center">Configura correctamente y la protección de tu capital será máxima.</p>
        <p className="text-xs text-slate-400 text-center">CJ Bot está diseñado para preservar, no para apostar.</p>
      </section>

      {/* SECCIÓN 7: FUTURO Y COMUNIDAD */}
      <section className="max-w-3xl mx-auto py-10 px-4 text-center">
        <h2 className="section-title mb-3">Una Inversión que Crece Contigo</h2>
        <ul className="space-y-2 text-lg text-slate-300 font-medium mb-3">
          <li>✅ Actualizaciones de por vida gratuitas</li>
          <li>✅ Soporte directo y prioritario</li>
          <li>✅ Comunidad privada: mejora y perfecciona tu automatización constantemente</li>
        </ul>
      </section>

      {/* SECCIÓN 8: MANUAL Y CARACTERÍSTICAS */}
      <section className="max-w-4xl w-full mx-auto mb-20 px-4">
        <div className="rounded-2xl p-8 mb-6 border-2 border-teal-500/50" style={{ backgroundColor: '#0F3D3A' }}>
          <h2 className="text-3xl font-bold text-white mb-8 text-center">📘 Manual Técnico del CJ Bot</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Característica 1 */}
            <div className="rounded-xl p-5 border-l-4" style={{ backgroundColor: '#1a2a3a', borderColor: '#00D9FF' }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">1️⃣</span>
                <div>
                  <h3 className="font-bold text-white mb-2">Licenciamiento por Cuenta</h3>
                  <p className="text-slate-300 text-sm">Único por número de cuenta y contraseña maestra. Control total de acceso y seguridad garantizada.</p>
                </div>
              </div>
            </div>

            {/* Característica 2 */}
            <div className="rounded-xl p-5 border-l-4" style={{ backgroundColor: '#3a1a1a', borderColor: '#FF4444' }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">2️⃣</span>
                <div>
                  <h3 className="font-bold text-white mb-2">Estrategias Programables</h3>
                  <p className="text-slate-300 text-sm">EMA+RSI, solo RSI, cruce de EMA, por tiempo y modo seguidor. Flexibilidad total para adaptarse a tu mercado.</p>
                </div>
              </div>
            </div>

            {/* Característica 3 */}
            <div className="rounded-xl p-5 border-l-4" style={{ backgroundColor: '#3a2a1a', borderColor: '#FFAA00' }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">3️⃣</span>
                <div>
                  <h3 className="font-bold text-white mb-2">Trailing Doble Independiente</h3>
                  <p className="text-slate-300 text-sm">TP y SL con lógica y configuración separadas. Gestión avanzada del riesgo y máxima protección del beneficio.</p>
                </div>
              </div>
            </div>

            {/* Característica 4 */}
            <div className="rounded-xl p-5 border-l-4" style={{ backgroundColor: '#1a3a1a', borderColor: '#00FF88' }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">4️⃣</span>
                <div>
                  <h3 className="font-bold text-white mb-2">Martingala Inteligente</h3>
                  <p className="text-slate-300 text-sm">Cruza lotes, gestiona operaciones y limita riesgos acumulativos. Control absoluto en todo momento.</p>
                </div>
              </div>
            </div>

            {/* Característica 5 */}
            <div className="rounded-xl p-5 border-l-4" style={{ backgroundColor: '#3a1a3a', borderColor: '#FF00FF' }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">5️⃣</span>
                <div>
                  <h3 className="font-bold text-white mb-2">Seguridad Multicapa</h3>
                  <p className="text-slate-300 text-sm">Validación por cuenta, licenciamiento temporal, lista blanca de acceso y control de balance. Tu dinero siempre bajo control.</p>
                </div>
              </div>
            </div>

            {/* Característica 6 */}
            <div className="rounded-xl p-5 border-l-4" style={{ backgroundColor: '#3a3a1a', borderColor: '#FFD700' }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">6️⃣</span>
                <div>
                  <h3 className="font-bold text-white mb-2">Interfaz y Monitoreo</h3>
                  <p className="text-slate-300 text-sm">Comentarios en pantalla, logs detallados y personalización total de parámetros. Todo visible y controlable.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 italic mt-6 text-center border-t border-slate-700 pt-6">
            * Todas las estrategias y sistemas de control han sido desarrollados con lógica profesional para MetaTrader 5.<br/>
            * CJ Bot es compatible con cuentas reales y demo, configurable para distintos perfiles de usuario y reglas de riesgo.
          </div>
        </div>
        <div className="card bg-emerald-700/80 border-emerald-400/20 mb-4">
          <h3 className="text-2xl font-bold mb-2 gradient-text">Deja de Operar con Emociones</h3>
          <p className="mb-5 text-slate-200">Elige la estrategia, define tu riesgo y deja que CJ Bot a Otro Nivel haga el trabajo pesado. Recupera tu tiempo y tu paz mental.</p>
          <div className="bg-slate-900 rounded-lg px-5 py-3 mb-4">
            <ul className="text-emerald-200 text-base text-left max-w-xs mx-auto space-y-1">
              <li>✔️ Archivo completo CJ Bot a Otro Nivel (Expert Advisor)</li>
              <li>✔️ Actualizaciones continuas y soporte permanente</li>
              <li>✔️ Guía de configuración & soporte</li>
              <li>✔️ Activación instantánea y soporte personalizado</li>
            </ul>
          </div>
          <a target="_blank" rel="noopener noreferrer" href="https://wa.me/" className="btn-primary text-lg px-8 py-3 font-bold">¡OBTÉN CJ BOT AHORA!</a>
        </div>
        <small className="block text-slate-400 mt-2">El trading implica riesgos importantes. El rendimiento pasado no garantiza resultados futuros.</small>
      </section>

      {/* SECCIÓN 8B: GUÍA DE PARÁMETROS */}
      <section className="max-w-5xl w-full mx-auto mb-20 px-4">
        <div className="rounded-2xl p-8 border-2 border-slate-700" style={{ backgroundColor: '#0F1720' }}>
          <h2 className="text-3xl font-bold text-white mb-10 text-center">⚙️ Guía de Parámetros del Bot</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Sección 1 */}
            <div className="rounded-lg p-5 border-l-4" style={{ backgroundColor: '#1a2332', borderColor: '#FF5733' }}>
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span>📊</span> Estrategia de Entrada
              </h3>
              <ul className="text-slate-300 text-sm space-y-2">
                <li><strong>Estrategia de Entrada:</strong> Define cómo el bot identifica señales (EMA+RSI, Solo RSI, Cruce EMA, Por Tiempo, Modo Seguidor)</li>
                <li><strong>Dirección:</strong> Especifica si opera en compra, venta o ambas direcciones</li>
                <li><strong>Temporalidad:</strong> Marco de tiempo para analizar las señales (M1, M5, M15, H1, etc.)</li>
              </ul>
            </div>

            {/* Sección 2 */}
            <div className="rounded-lg p-5 border-l-4" style={{ backgroundColor: '#1a2332', borderColor: '#2ECC71' }}>
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span>💰</span> Gestión de Capital
              </h3>
              <ul className="text-slate-300 text-sm space-y-2">
                <li><strong>Lote Inicial:</strong> Tamaño del lote para la primera operación</li>
                <li><strong>Take Profit (TP):</strong> Ganancia objetivo en puntos para cerrar automáticamente</li>
                <li><strong>Stop Loss (SL):</strong> Pérdida máxima permitida en puntos para salir de la operación</li>
              </ul>
            </div>

            {/* Sección 3 */}
            <div className="rounded-lg p-5 border-l-4" style={{ backgroundColor: '#1a2332', borderColor: '#F39C12' }}>
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span>📈</span> Trailing Stop (Persegidor)
              </h3>
              <ul className="text-slate-300 text-sm space-y-2">
                <li><strong>Trailing TP:</strong> Mueve el Take Profit automáticamente hacia arriba conforme sube el precio</li>
                <li><strong>Trailing SL:</strong> Protege tus ganancias moviendo el Stop Loss hacia arriba</li>
                <li><strong>% de Ganancia:</strong> Porcentaje de ganancia necesario para activar el trailing</li>
              </ul>
            </div>

            {/* Sección 4 */}
            <div className="rounded-lg p-5 border-l-4" style={{ backgroundColor: '#1a2332', borderColor: '#9B59B6' }}>
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span>🔄</span> Martingala Inteligente
              </h3>
              <ul className="text-slate-300 text-sm space-y-2">
                <li><strong>Modo Martingala:</strong> Desactivado, Martingala o Recuperación (abre respaldos si el precio va en contra)</li>
                <li><strong>Multiplicador de Lote:</strong> Aumenta el tamaño del lote en cada respaldo (2.0 = el doble)</li>
                <li><strong>Cantidad de Martingalas:</strong> Máximo número de respaldos permitidos (hasta 7)</li>
                <li><strong>Puntos entre Respaldos:</strong> Distancia en puntos para abrir el siguiente respaldo</li>
              </ul>
            </div>

            {/* Sección 5 */}
            <div className="rounded-lg p-5 border-l-4" style={{ backgroundColor: '#1a2332', borderColor: '#1ABC9C' }}>
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span>🛡️</span> Protección y Seguridad
              </h3>
              <ul className="text-slate-300 text-sm space-y-2">
                <li><strong>Pérdida Máxima en USD:</strong> Si las pérdidas alcanzan este monto, el bot cierra todas las operaciones</li>
                <li><strong>Ganancia Máxima en USD:</strong> Si las ganancias alcanzan este monto, el bot cierra todas las operaciones</li>
                <li><strong>Frecuencia de Vigilancia:</strong> Cada cuántos milisegundos verifica el bot las condiciones</li>
              </ul>
            </div>

            {/* Sección 6 */}
            <div className="rounded-lg p-5 border-l-4" style={{ backgroundColor: '#1a2332', borderColor: '#E74C3C' }}>
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span>🔐</span> Licencia y Control
              </h3>
              <ul className="text-slate-300 text-sm space-y-2">
                <li><strong>Número de Cuenta:</strong> Tu número de cuenta único en el broker</li>
                <li><strong>Contraseña Maestra:</strong> Contraseña de seguridad para activar el bot</li>
                <li><strong>ID Mágico del Bot:</strong> Identificador único para distinguir operaciones del bot</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-6 rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700">
            <h3 className="text-xl font-bold text-emerald-300 mb-4">💡 Consejo Profesional</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Comienza con <strong>valores conservadores</strong>: lote pequeño, SL cercano, sin martingala activa. Una vez que compruebes que el bot funciona con tu estrategia, incrementa gradualmente los parámetros. <strong>Nunca ignores los límites de pérdida</strong> — son tu red de seguridad más importante. El objetivo no es ganar mucho en poco tiempo, sino ganar consistentemente con control del riesgo.
            </p>
          </div>
        </div>
      </section>

      {/* SECCIÓN 9: INNOVACIÓN CJ BOT */}
      <section className="max-w-4xl w-full mx-auto py-14 px-4 text-center bg-gradient-to-tr from-emerald-900/60 via-slate-900 to-slate-800 rounded-2xl shadow-2xl mb-16 border border-emerald-600/30">
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="text-3xl">🤖</span>
          <span className="text-xl font-black uppercase tracking-wider text-emerald-300">CJ Bot a Otro Nivel</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-2 gradient-text">Cualidades Completas,<br className="hidden md:inline"/> Ventaja Definitiva</h2>
        <div className="max-w-3xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div>
            <h3 className="font-bold text-emerald-200 mb-1 flex items-center gap-2 text-lg">🧠 1. Inteligencia Multi-Indicador</h3>
            <p className="text-slate-200 mb-2">No se limita a un solo indicador. <b>Analiza 7 indicadores clave en simultáneo</b> para operaciones realmente inteligentes:</p>
            <ul className="list-disc list-inside ml-4 text-slate-400 text-sm">
              <li>EMA 10, 30, 100 – Tendencia en múltiple plazos</li>
              <li>Aroon (14) – Fuerza y agotamiento de tendencia</li>
              <li>RSI (14) – Sobrecompra/sobreventa</li>
              <li>MACD (12/26/9) – Momentum y cambios de dirección</li>
              <li>Stochastic (5/3/3) – Reversiones precisas</li>
              <li>Bollinger Bands (20) – Volatilidad y rupturas</li>
              <li>Volumen (Tick) – Detección de dinero institucional</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-emerald-200 mb-1 flex items-center gap-2 text-lg">📊 2. Estrategias de Entrada Avanzadas</h3>
            <p className="text-slate-200 mb-2">Elige la estrategia exacta que tu mercado exige gracias a <b>20 combinaciones únicas</b> desde el panel sin tocar código. Cada situación, una táctica a la medida.</p>
            <ul className="list-disc list-inside text-slate-400 text-xs ml-4 max-h-44 overflow-y-auto custom-scroll">
              <li>#01 POR TIEMPO: Opera por dirección en intervalos</li>
              <li>#02 SEGUIDOR: Sigue tendencia dominante</li>
              <li>#03 EMA+RSI, #04 SOLO RSI, #05 CRUCE EMA… y más hasta #20</li>
              <li>Cada combinación pensada para condiciones específicas de mercado</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-emerald-200 mb-1 flex items-center gap-2 text-lg">🛡️ 3. Gestión de Riesgo Profesional</h3>
            <ul className="list-disc list-inside ml-4 text-slate-400 text-sm">
              <li>Stop Loss y Take Profit dinámicos</li>
              <li>Trailing inteligente para maximizar ganancias</li>
              <li>Protección total de equidad y control por USD</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-emerald-200 mb-1 flex items-center gap-2 text-lg">🔄 4. Martingala con Inteligencia Real</h3>
            <ul className="list-disc list-inside ml-4 text-slate-400 text-sm mb-1">
              <li>Modo fijo, martingala y recuperación progresiva</li>
              <li>Control absoluto: N° de respaldos, lote e incrementos</li>
              <li>Delay y distancia personalizables</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-emerald-200 mb-1 flex items-center gap-2 text-lg">⚙️ 5. Configuración Total</h3>
            <p className="text-slate-200 mb-1">Supera los límites: <b>21 parámetros ajustables</b> desde el panel visual. Sin código, todo bajo tu control.</p>
          </div>
          <div>
            <h3 className="font-bold text-emerald-200 mb-1 flex items-center gap-2 text-lg">🔐 6. Seguridad y Licenciamiento Premium</h3>
            <ul className="list-disc list-inside ml-4 text-slate-400 text-sm">
              <li>Licencia vinculada a cuenta y contraseña maestra</li>
              <li>Compatible Demo y Real, control de fecha/usuarios</li>
              <li>Balance mínimo y lista blanca</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-emerald-200 mb-1 flex items-center gap-2 text-lg">🕐 7. Autonomía 24/7 y Potencia MT5</h3>
            <ul className="list-disc list-inside ml-4 text-slate-400 text-sm">
              <li>Opera 24/7, cada milisegundo</li>
              <li>Total independencia: abre/cierra/gestiona en cualquier activo MT5</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-emerald-200 mb-1 flex items-center gap-2 text-lg">📐 8. Indicador Aroon Nativo</h3>
            <p className="text-slate-200 mb-1">Calculado desde el código, <b>sin archivos dependientes</b>, 100% portable y robusto.</p>
          </div>
        </div>
        <a
          href="https://wa.me/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-xl px-10 py-4 mt-10 shadow-lg font-bold inline-block"
        >
          Quiero la potencia de CJ Bot a Otro Nivel
        </a>
        <p className="text-slate-400 text-sm mt-3">Únete a la élite del trading algorítmico. Deja atrás los bots simples y transforma tu operativa en una estrategia profesional y automática.</p>
      </section>

      {/* DISCLAIMER */}
      <section className="max-w-4xl mx-auto px-4 text-center mb-8">
        <p className="text-xs text-slate-500 leading-relaxed">
          <span className="text-slate-600">⚠️ Aviso:</span> El trading conlleva riesgo. CJ Bot es una herramienta: la responsabilidad es del usuario. El rendimiento pasado no garantiza resultados futuros.
        </p>
      </section>
    </main>
  );
}

function StatCard({label,value}:{label:string,value:string}){
  return (
    <div className="card text-center py-6">
      <div className="text-2xl md:text-3xl font-bold text-emerald-300 mb-2">{value}</div>
      <div className="text-xs text-slate-300 uppercase tracking-wider">{label}</div>
    </div>
  )
}

function FeatureCard({title,icon,children}:{title:string,icon:string,children:React.ReactNode}){
  return (
    <div className="card h-full flex flex-col items-center py-6 px-4">
      <div className="text-4xl mb-2 animate-float select-none">{icon}</div>
      <div className="font-semibold text-lg mb-1 text-emerald-200 text-center">{title}</div>
      <div className="text-slate-300 text-sm text-center">{children}</div>
    </div>
  )
}
