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
          Cansado de la montaña rusa emocional del trading? <b>CJ Bot v2.30</b> es tu copiloto analítico, una máquina de precisión diseñada para ejecutar estrategias ganadoras, proteger tu capital y operar por ti 24/7 sin dudar.
        </p>
        <a href="https://youtube.com/shorts/ZqO9s1L8cbs?si=jDVr0E7nQlT31pEi" target="_blank" rel="noopener noreferrer">
  <img
    src="https://img.youtube.com/vi/ZqO9s1L8cbs/maxresdefault.jpg"
    alt="Video CJ Bot - Trading automatizado"
    className="w-full max-w-lg object-contain bg-slate-900/80 rounded-xl mx-auto animate-float animate-pulse-glow mb-6 mt-5 shadow-xl border-2 border-blue-900"
  />
</a>
        <a href="https://wa.me/" // Tu CTA real aquí
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-xl px-10 py-4 mt-2 shadow-lg font-bold"
                >
                  ¡QUIERO MI LICENCIA AHORA!
                </a>
                
      </section>

      {/* SECCIÓN 2: EL PROBLEMA */}
      <section className="max-w-3xl w-full mx-auto py-8 md:py-14 px-4 text-center">
        <div className="flex flex-col items-center gap-5">
          
          <h2 className="section-title">¿Te Suena Familiar?</h2>
          <ul className="space-y-2 text-[1.07rem] text-slate-300 list-none max-w-xl mx-auto text-left">
            <li><b>• Decisiones Emocionales:</b> El miedo te hace cerrar antes de tiempo y la codicia te hace entrar tarde, saboteando tus ganancias.</li>
            <li><b>• Falta de Tiempo:</b> No puedes estar pegado a la pantalla todo el día esperando la señal perfecta. La vida real te llama.</li>
            <li><b>• El Miedo a "Quemar la Cuenta":</b> Has probado otros bots o estrategias que prometían el oro y el moro, solo para ver tu capital desaparecer en un abrir y cerrar de ojos.</li>
          </ul>
          <div className="text-emerald-300 font-bold mt-4">
            El trading no tiene por qué ser una fuente de estrés. Tiene que ser una herramienta de libertad.
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: SOLUCIÓN */}
      <section className="max-w-3xl w-full mx-auto py-8 md:py-16 px-4 text-center">
        <div className="relative w-full max-w-2xl mx-auto mb-6 aspect-video rounded-2xl overflow-hidden shadow-lg bg-slate-900">
          <iframe
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[132%]"
            src="https://www.youtube-nocookie.com/embed/6JZ_hLo0BTU?modestbranding=1&rel=0&controls=0&playsinline=1"
            title="Presentamos CJ Bot v2.30"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
        <h2 className="section-title mb-1">Presentamos CJ Bot v2.30</h2>
        <div className="mb-3 text-xl text-emerald-400 font-bold">Tu Estratega Personal de Mercados</div>
        <p className="text-slate-300 mb-2">
          Imagina un sistema que no solo sigue reglas, sino que piensa, se adapta y protege. <b>CJ Bot v2.30</b> no es otro bot “milagroso”. Es el resultado de una programación quirúrgica, enfocado en tres pilares fundamentales: <span className="font-bold text-emerald-300">Inteligencia, Control y Seguridad</span>.
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

      {/* SECCIÓN 8: RESUMEN TÉCNICO Y CTA FINAL */}
      <section className="max-w-2xl w-full mx-auto mb-20 px-4 text-center">
        <div className="bg-emerald-800/60 rounded-xl p-5 mb-6 border border-emerald-500/30">
          <h2 className="text-xl font-bold text-emerald-300 mb-4 flex items-center gap-2">🔎 Resumen técnico y características exclusivas</h2>
          <table className="w-full text-xs bg-slate-900/80 rounded-md border border-emerald-700 overflow-hidden">
            <tbody>
              <tr className="border-b border-emerald-800">
                <td className="py-2 px-2 text-emerald-300 font-semibold">Licenciamiento por cuenta</td>
                <td>Único por número de cuenta y contraseña maestra. Control total de acceso.</td>
              </tr>
              <tr className="border-b border-emerald-800">
                <td className="py-2 px-2 text-emerald-300 font-semibold">Estrategias programables</td>
                <td>EMA+RSI, solo RSI, cruce de EMA, por tiempo y modo seguidor. Flexibilidad total.</td>
              </tr>
              <tr className="border-b border-emerald-800">
                <td className="py-2 px-2 text-emerald-300 font-semibold">Trailing doble independiente</td>
                <td>TP y SL con lógica y configuración separadas. Gestión avanzada del riesgo y beneficio.</td>
              </tr>
              <tr className="border-b border-emerald-800">
                <td className="py-2 px-2 text-emerald-300 font-semibold">Martingala inteligente & modo recuperación</td>
                <td>Cruza lotes, gestiona operaciones, y limita riesgos acumulativos. Control en todo momento.</td>
              </tr>
              <tr className="border-b border-emerald-800">
                <td className="py-2 px-2 text-emerald-300 font-semibold">Seguridad multicapa</td>
                <td>Comprende validación por cuenta, licenciamiento temporal, whitelist y control de balance mínimo/máximo. <b>Tu dinero siempre bajo control.</b></td>
              </tr>
              <tr>
                <td className="py-2 px-2 text-emerald-300 font-semibold">Interfaz y monitoreo</td>
                <td>Comentarios y avisos en pantalla de actividad, logs y personalización de parámetros.</td>
              </tr>
            </tbody>
          </table>
          <div className="text-xs text-slate-400 italic mt-5">* Todas las estrategias y sistemas de control han sido desarrollados con lógica profesional para MetaTrader 5.<br/>* CJ Bot es compatible con cuentas reales y demo, configurable para distintos perfiles de usuario y reglas de riesgo.</div>
        </div>
        <div className="card bg-emerald-700/80 border-emerald-400/20 mb-4">
          <h3 className="text-2xl font-bold mb-2 gradient-text">Deja de Operar con Emociones</h3>
          <p className="mb-5 text-slate-200">Elige la estrategia, define tu riesgo y deja que CJ Bot v2.30 haga el trabajo pesado. Recupera tu tiempo y tu paz mental.</p>
          <div className="bg-slate-900 rounded-lg px-5 py-3 mb-4">
            <ul className="text-emerald-200 text-base text-left max-w-xs mx-auto space-y-1">
              <li>✔️ Archivo completo CJ Bot v2.30 (Expert Advisor)</li>
              <li>✔️ Acceso a todas las nuevas versiones</li>
              <li>✔️ Guía de configuración & soporte</li>
              <li>✔️ Activación instantánea y soporte personalizado</li>
            </ul>
          </div>
          <a target="_blank" rel="noopener noreferrer" href="https://wa.me/" className="btn-primary text-lg px-8 py-3 font-bold">¡OBTÉN MI CJ BOT v2.30 AHORA!</a>
        </div>
        <small className="block text-slate-400 mt-2">El trading implica riesgos importantes. El rendimiento pasado no garantiza resultados futuros.</small>
      </section>

      {/* SECCIÓN 9: INNOVACIÓN CJ BOT V2.30 */}
      <section className="max-w-4xl w-full mx-auto py-14 px-4 text-center bg-gradient-to-tr from-emerald-900/60 via-slate-900 to-slate-800 rounded-2xl shadow-2xl mb-16 border border-emerald-600/30">
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="text-3xl">🤖</span>
          <span className="text-xl font-black uppercase tracking-wider text-emerald-300">CJ Bot v2.30</span>
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
          Quiero la potencia de CJ Bot v2.30
        </a>
        <p className="text-slate-400 text-sm mt-3">Únete a la élite del trading algorítmico. Deja atrás los bots simples y transforma tu operativa en una estrategia profesional y automática.</p>
      </section>

      {/* DISCLAIMER */}
      <section className="max-w-3xl mx-auto py-10 px-4 text-center">
        <div className="bg-red-900/80 border-2 border-red-700 text-red-200 rounded-xl p-6 text-md font-semibold shadow-lg tracking-wide leading-relaxed flex flex-col items-center justify-center">
          <span className="text-2xl mb-2">⚠️</span>
          <span>
            <b>Aviso de Riesgo:</b> El trading en los mercados financieros conlleva un alto nivel de riesgo y puede no ser adecuado para todos los inversores.<br/>
            Antes de decidirse a invertir, considere cuidadosamente sus objetivos, experiencia y apetito por el riesgo.<br/>
            El rendimiento pasado no es indicativo de resultados futuros.<br/>
            <span className="block mt-2"><b>CJ Bot</b> es una herramienta: la responsabilidad es del usuario final.</span>
          </span>
        </div>
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
