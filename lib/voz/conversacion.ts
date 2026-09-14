/**
 * Conversación de voz en tiempo real.
 *
 * ── Qué es esto ───────────────────────────────────────────────────────────
 * El motor de voz, aislado de cualquier asistente concreto. No sabe nada de
 * Trading, ni de cursos, ni de personalidad: recibe unas instrucciones al
 * arrancar y avisa de lo que va pasando. El mismo archivo sirve para el tutor
 * de Trading, para Nutrilife o para el que venga.
 *
 * ── Por qué WebRTC y no lo de antes ───────────────────────────────────────
 * Hasta ahora la conversación era una cadena de esperas: transcribir en el
 * navegador → esperar la respuesta entera → trocearla → pedir un MP3 por
 * trozo → reproducirlos en fila. Tres esperas encadenadas antes de oír la
 * primera palabra.
 *
 * Con WebRTC el navegador habla directamente con OpenAI: tu voz sube mientras
 * hablas y la suya baja mientras se genera. No hay archivos temporales, ni
 * conversiones, ni una llamada HTTP por frase. La respuesta empieza a sonar
 * en cuanto existe la primera sílaba.
 *
 * ── Quién decide los turnos ───────────────────────────────────────────────
 * OpenAI, no nosotros. Su detección de voz sabe cuándo empiezas y cuándo
 * terminas, y si hablas mientras responde, cancela su respuesta en el acto.
 * Antes eso se intentaba comparando lo que oía con lo que estaba diciendo,
 * y fallaba de las dos maneras posibles: no te oía, o se cortaba solo.
 *
 * ── El eco ────────────────────────────────────────────────────────────────
 * La cancelación de eco la hace el propio navegador (`echoCancellation`), que
 * es quien tiene acceso a la señal del altavoz. Es la única forma que existe
 * en la web de hacerlo de verdad; compararlo por texto era un apaño.
 */

export type EstadoVoz =
  | 'IDLE'
  | 'CONECTANDO'
  | 'ESCUCHANDO'
  | 'USUARIO_HABLANDO'
  | 'PROCESANDO'
  | 'ASISTENTE_HABLANDO'
  | 'INTERRUMPIDO'
  | 'RECONECTANDO'
  | 'ERROR';

export interface TurnoTexto {
  /** Identificador del turno en la conversación. Evita duplicados. */
  id: string;
  quien: 'usuario' | 'asistente';
  texto: string;
}

export interface OpcionesConversacion {
  /** Personalidad e instrucciones del asistente. Lo único propio de cada bot. */
  instrucciones?: string;
  /** Historial previo, para no empezar la conversación en blanco. */
  historial?: { role: string; content: string }[];
  onEstado?: (estado: EstadoVoz) => void;
  /** Un turno terminado y listo para escribirse en el chat. */
  onTurno?: (turno: TurnoTexto) => void;
  /** Lo que se va oyendo o diciendo, para el panel de voz. Es efímero. */
  onParcial?: (texto: string, quien: 'usuario' | 'asistente') => void;
  onError?: (mensaje: string) => void;
}

/**
 * ¿Puede este navegador mantener una conversación por voz?
 *
 * Se comprueba ANTES de pedir el micrófono, para poder decir qué falla en vez
 * de fallar en silencio o dejar al usuario mirando un botón que no responde.
 * Devuelve `null` si todo está en orden, o el motivo si no.
 */
export function porQueNoSePuedeHablar(): string | null {
  if (typeof window === 'undefined') return 'Sin navegador';

  /**
   * Navegador incrustado en otra app (WhatsApp, Facebook, Instagram).
   *
   * Ahí el micrófono está capado o pide permisos que nunca se conceden. Es la
   * causa más habitual de "pulso y no pasa nada" en el móvil, y no tiene
   * arreglo desde aquí: hay que abrirlo en el navegador de verdad.
   */
  if (/FBAN|FBAV|Instagram|Line\/|WhatsApp/i.test(navigator.userAgent)) {
    return 'Estás dentro del navegador de otra app y ahí no se puede usar el micrófono. Ábrelo en Chrome o Safari.';
  }

  // El micrófono exige conexión segura. En localhost el navegador hace una
  // excepción, por eso funciona en desarrollo.
  if (!window.isSecureContext) {
    return 'La conversación por voz necesita una conexión segura (https).';
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    return 'Este navegador no da acceso al micrófono.';
  }

  if (typeof RTCPeerConnection === 'undefined') {
    return 'Este navegador no admite conversación en tiempo real.';
  }

  return null;
}

export class ConversacionVoz {
  private pc: RTCPeerConnection | null = null;
  private canal: RTCDataChannel | null = null;
  private micro: MediaStream | null = null;
  private altavoz: HTMLAudioElement | null = null;

  private estado: EstadoVoz = 'IDLE';
  private op: OpcionesConversacion;

  /**
   * Turnos ya entregados.
   *
   * OpenAI puede mandar el mismo evento más de una vez —y al reconectar se
   * repiten los últimos—. Sin esta lista, cada repetición escribiría otra vez
   * el mismo mensaje en el chat: el "no dupliques respuestas" del encargo.
   */
  private entregados = new Set<string>();

  /** Texto que se va acumulando por turno, indexado por id de la respuesta. */
  private enCurso = new Map<string, string>();

  private intentos = 0;
  private cerrandoAdrede = false;

  /**
   * Se guarda como propiedad y no como función suelta para poder QUITAR el
   * listener exacto al cerrar. Con una función anónima quedaría enganchado
   * para siempre y se acumularía uno por cada conversación abierta.
   */
  private alVolver = () => {
    if (this.cerrandoAdrede) return;
    if (document.visibilityState !== 'visible') return;
    // Si la conexión no sobrevivió al segundo plano, se rehace.
    const s = this.pc?.connectionState;
    if (s && s !== 'connected' && s !== 'connecting') this.reconectar();
  };

  constructor(opciones: OpcionesConversacion = {}) {
    this.op = opciones;
  }

  get estadoActual(): EstadoVoz {
    return this.estado;
  }

  /**
   * Única puerta para cambiar de estado.
   *
   * Todo pasa por aquí para que no haya dos sitios decidiendo a la vez, que es
   * como se acaba con el asistente "hablando" y "escuchando" al mismo tiempo.
   */
  /**
   * Le cuenta al servidor dónde se rompió.
   *
   * Va sin esperar respuesta y sin romper nada si falla: es un aviso, no una
   * parte del funcionamiento. Sirve para poder mirar la causa en el registro
   * del servidor en vez de pedirle a nadie que lea mensajes en pantalla.
   */
  private avisarAlServidor(etapa: string, mensaje: string) {
    try {
      fetch('/api/voz/diagnostico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ etapa, mensaje }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* da igual: no puede entorpecer la conversación */
    }
  }

  private ir(nuevo: EstadoVoz) {
    if (this.estado === nuevo) return;
    this.estado = nuevo;
    this.op.onEstado?.(nuevo);
  }

  async iniciar(): Promise<void> {
    if (this.estado !== 'IDLE' && this.estado !== 'ERROR') return;  // ya en marcha

    const impedimento = porQueNoSePuedeHablar();
    if (impedimento) {
      this.avisarAlServidor('entorno', impedimento);
      this.ir('ERROR');
      this.op.onError?.(impedimento);
      return;
    }

    this.cerrandoAdrede = false;
    this.ir('CONECTANDO');

    try {
      const r = await fetch('/api/voz/realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instrucciones: this.op.instrucciones || '' }),
      });
      const datos = await r.json();
      if (!r.ok || !datos.clientSecret) {
        throw new Error(datos.error || 'No se pudo abrir la sesión de voz');
      }

      await this.conectar(datos.clientSecret, datos.modelo);
      this.intentos = 0;
    } catch (e) {
      /**
       * Si falla a medias, se recoge todo.
       *
       * Al reventar dentro de `conectar` quedaban la conexión y —a veces— el
       * micrófono abiertos: el punto rojo del navegador encendido y una
       * conexión muerta que seguía recibiendo eventos. Al segundo intento se
       * acumulaban dos.
       */
      this.soltarRecursos();
      this.avisarAlServidor('arranque', (e as Error).message);
      this.ir('ERROR');
      this.op.onError?.((e as Error).message);
    }
  }

  private async conectar(clave: string, modelo: string) {
    const pc = new RTCPeerConnection();
    this.pc = pc;

    // Altavoz: el audio del asistente llega por aquí y suena solo.
    const audio = document.createElement('audio');
    audio.autoplay = true;
    this.altavoz = audio;
    pc.ontrack = (e) => { audio.srcObject = e.streams[0]; };

    /**
     * Micrófono con el procesado del navegador activado.
     *
     * `echoCancellation` es lo que impide que el asistente se oiga a sí mismo
     * por el altavoz y crea que le estás hablando. Es imprescindible aquí:
     * sin esto, en cuanto empieza a hablar se interrumpe él solo.
     */
    /**
     * Los fallos del micrófono se traducen a algo entendible.
     *
     * El navegador los devuelve en inglés y con nombres técnicos
     * ("NotFoundError"), que en pantalla no dicen nada. Y son justo los tres
     * casos que más ocurren: no hay micrófono, no se dio permiso, o lo tiene
     * ocupado otro programa. Sin distinguirlos, la conversación se encendía y
     * se apagaba al instante sin explicar por qué.
     */
    try {
      this.micro = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (e) {
      const nombre = (e as Error)?.name || '';
      if (nombre === 'NotFoundError' || nombre === 'DevicesNotFoundError') {
        throw new Error('No se detecta ningún micrófono en este equipo. Prueba desde el móvil.');
      }
      if (nombre === 'NotAllowedError' || nombre === 'PermissionDeniedError') {
        throw new Error('No diste permiso para usar el micrófono. Pulsa el candado de la barra de direcciones y permítelo.');
      }
      if (nombre === 'NotReadableError' || nombre === 'TrackStartError') {
        throw new Error('El micrófono lo está usando otro programa. Ciérralo e inténtalo otra vez.');
      }
      throw new Error('No se pudo abrir el micrófono: ' + (nombre || (e as Error).message));
    }
    this.micro.getTracks().forEach((t) => pc.addTrack(t, this.micro!));

    // Canal de datos: por aquí viajan los eventos (qué se dijo, cuándo empieza
    // y termina cada turno). El audio va por su propio carril.
    const canal = pc.createDataChannel('oai-events');
    this.canal = canal;
    canal.onmessage = (e) => this.alRecibirEvento(e.data);
    canal.onopen = () => {
      this.ir('ESCUCHANDO');
      this.sembrarHistorial();
    };

    pc.onconnectionstatechange = () => {
      if (this.cerrandoAdrede) return;
      const s = pc.connectionState;
      if (s === 'failed' || s === 'disconnected') {
        this.avisarAlServidor('conexion', 'estado ' + s + ' en estado interno ' + this.estado);
        this.reconectar();
      }
    };

    /**
     * Volver a la app después de tenerla en segundo plano.
     *
     * En el móvil, al bloquear la pantalla o cambiar de aplicación, el sistema
     * suspende la captura del micrófono. No es algo que se pueda evitar desde
     * la web: ningún permiso lo levanta. Lo que sí se puede es no quedarse
     * colgado al volver — si la conexión murió mientras tanto, se rehace sola
     * en lugar de dejar un micrófono que ya no escucha nada.
     */
    document.addEventListener('visibilitychange', this.alVolver);

    const oferta = await pc.createOffer();
    await pc.setLocalDescription(oferta);

    const r = await fetch(`https://api.openai.com/v1/realtime?model=${encodeURIComponent(modelo)}`, {
      method: 'POST',
      body: oferta.sdp,
      headers: {
        Authorization: `Bearer ${clave}`,
        'Content-Type': 'application/sdp',
      },
    });
    if (!r.ok) {
      /**
       * El motivo de OpenAI se conserva.
       *
       * Antes se tiraba y quedaba un "rechazó la conexión" que no dice nada:
       * puede ser el modelo, la llave caducada, el formato del audio o la
       * región. Sin el texto no se puede distinguir cuál.
       */
      const detalle = await r.text().catch(() => '');
      throw new Error(`OpenAI rechazó la conexión (${r.status}): ${detalle.slice(0, 200)}`);
    }

    await pc.setRemoteDescription({ type: 'answer', sdp: await r.text() });
  }

  /**
   * Mete la conversación anterior en la sesión.
   *
   * Sin esto, hablar sería empezar de cero cada vez: no sabría de qué venís
   * hablando por escrito. Se mandan los últimos turnos como mensajes ya
   * dichos, no como una instrucción.
   */
  private sembrarHistorial() {
    const previos = (this.op.historial || []).slice(-8);
    for (const m of previos) {
      if (!m.content?.trim()) continue;
      this.enviar({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: [{ type: m.role === 'assistant' ? 'text' : 'input_text', text: m.content.slice(0, 2000) }],
        },
      });
    }
  }

  private enviar(evento: Record<string, unknown>) {
    if (this.canal?.readyState === 'open') {
      this.canal.send(JSON.stringify(evento));
    }
  }

  /** Traduce los eventos de OpenAI a estados y turnos. */
  private alRecibirEvento(crudo: string) {
    let ev: any;
    try {
      ev = JSON.parse(crudo);
    } catch {
      return;
    }

    switch (ev.type) {
      // ── El usuario empieza a hablar ────────────────────────────────────
      case 'input_audio_buffer.speech_started':
        // Si estaba hablando, esto ES una interrupción. OpenAI ya cancela su
        // respuesta por su cuenta; aquí solo se corta el audio que aún esté
        // sonando por el altavoz, que si no seguiría unos segundos más.
        if (this.estado === 'ASISTENTE_HABLANDO') {
          this.cortarAudio();
          this.ir('INTERRUMPIDO');
        }
        this.ir('USUARIO_HABLANDO');
        break;

      case 'input_audio_buffer.speech_stopped':
        this.ir('PROCESANDO');
        break;

      // ── Lo que dijo el usuario, ya transcrito ──────────────────────────
      case 'conversation.item.input_audio_transcription.completed': {
        const texto = String(ev.transcript || '').trim();
        if (texto) this.entregarTurno(`u-${ev.item_id}`, 'usuario', texto);
        break;
      }

      // ── La respuesta del asistente, según se genera ────────────────────
      case 'response.audio_transcript.delta': {
        const id = ev.response_id || 'actual';
        const acumulado = (this.enCurso.get(id) || '') + (ev.delta || '');
        this.enCurso.set(id, acumulado);
        this.ir('ASISTENTE_HABLANDO');
        // Solo al panel de voz: el chat no se reescribe en cada palabra.
        this.op.onParcial?.(acumulado, 'asistente');
        break;
      }

      case 'response.audio_transcript.done': {
        const id = ev.response_id || 'actual';
        const texto = String(ev.transcript || this.enCurso.get(id) || '').trim();
        this.enCurso.delete(id);
        if (texto) this.entregarTurno(`a-${id}`, 'asistente', texto);
        break;
      }

      case 'response.done':
        // Si terminó de hablar sin que nadie le cortara, vuelve a escuchar.
        if (this.estado !== 'USUARIO_HABLANDO') this.ir('ESCUCHANDO');
        break;

      case 'error':
        this.avisarAlServidor('openai', ev.error?.message || JSON.stringify(ev).slice(0, 200));
        this.op.onError?.(ev.error?.message || 'Error en la conversación');
        break;
    }
  }

  /**
   * Entrega un turno UNA sola vez.
   *
   * El mismo evento puede llegar repetido, y al reconectar se repiten los
   * últimos. Con la lista de entregados, escribir dos veces el mismo mensaje
   * en el chat deja de ser posible.
   */
  private entregarTurno(id: string, quien: 'usuario' | 'asistente', texto: string) {
    if (this.entregados.has(id)) return;
    this.entregados.add(id);
    // La lista no crece sin fin en una conversación larga.
    if (this.entregados.size > 200) {
      this.entregados = new Set([...this.entregados].slice(-100));
    }
    this.op.onTurno?.({ id, quien, texto });
  }

  /** Calla el altavoz en el acto, sin esperar a que termine el audio en curso. */
  private cortarAudio() {
    const a = this.altavoz;
    if (!a) return;
    try {
      a.pause();
      // Se vacía el buffer: pausar deja el resto de la frase esperando y al
      // reanudar volvería a sonar lo ya interrumpido.
      const flujo = a.srcObject as MediaStream | null;
      a.srcObject = null;
      a.srcObject = flujo;
      a.play().catch(() => {});
    } catch {
      /* el navegador ya lo había parado */
    }
  }

  /** Corta al asistente a mano (botón "para"), sin hablarle. */
  interrumpir() {
    if (this.estado !== 'ASISTENTE_HABLANDO') return;
    this.enviar({ type: 'response.cancel' });
    this.cortarAudio();
    this.ir('ESCUCHANDO');
  }

  /**
   * Reconexión tras un corte de red.
   *
   * Con espera creciente: reintentar cada segundo contra una red caída solo
   * gasta batería. Se rinde a los cinco intentos y lo dice, en vez de quedarse
   * en un bucle silencioso.
   */
  private async reconectar() {
    if (this.cerrandoAdrede || this.estado === 'RECONECTANDO') return;
    this.ir('RECONECTANDO');

    this.intentos++;
    if (this.intentos > 5) {
      this.ir('ERROR');
      this.op.onError?.('Se perdió la conexión de voz. Vuelve a iniciarla.');
      return;
    }

    this.soltarRecursos();
    await new Promise((r) => setTimeout(r, Math.min(8000, 1000 * this.intentos)));
    if (this.cerrandoAdrede) return;

    this.estado = 'IDLE';   // sin avisar: es un reintento, no un estado real
    await this.iniciar();
  }

  /**
   * Suelta micrófono y conexión.
   *
   * Se llama en cada cierre y en cada reconexión. Sin esto quedan pistas de
   * audio vivas —el punto rojo del navegador sigue encendido— y se acumulan
   * conexiones que siguen recibiendo eventos: es el origen clásico de las
   * respuestas duplicadas y de que la pestaña se vaya poniendo lenta.
   */
  private soltarRecursos() {
    try { document.removeEventListener('visibilitychange', this.alVolver); } catch {}
    try { this.canal?.close(); } catch {}
    try { this.pc?.getSenders().forEach((s) => s.track?.stop()); } catch {}
    try { this.pc?.close(); } catch {}
    try { this.micro?.getTracks().forEach((t) => t.stop()); } catch {}
    if (this.altavoz) {
      try { this.altavoz.pause(); } catch {}
      this.altavoz.srcObject = null;
    }
    this.canal = null;
    this.pc = null;
    this.micro = null;
    this.altavoz = null;
  }

  detener() {
    this.cerrandoAdrede = true;
    this.soltarRecursos();
    this.enCurso.clear();
    this.ir('IDLE');
  }
}
