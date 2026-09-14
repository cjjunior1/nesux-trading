/**
 * Deshacer y rehacer · Nesux
 *
 * Lo usan las dos calculadoras. Guarda una foto de TODOS los campos cada vez
 * que algo cambia y deja volver atrás con Ctrl+Z y hacia delante con Ctrl+Y o
 * Ctrl+Shift+Z.
 *
 * Por qué una foto entera y no el campo suelto: un solo cambio del usuario toca
 * varios campos a la vez (elegir símbolo reescribe contrato, dígitos, paso y
 * valor del punto), y deshacer solo el último de ellos dejaría la calculadora
 * en un estado que nunca existió.
 *
 * Las fotos se toman con retardo: mientras escribes un número no se guarda una
 * por tecla, se guarda cuando paras. Así un Ctrl+Z borra el número entero y no
 * el último dígito.
 */
(function (global) {
  'use strict';

  function campos(raiz) {
    return Array.prototype.slice.call(raiz.querySelectorAll('input, select, textarea'));
  }

  function foto(raiz) {
    var d = {};
    campos(raiz).forEach(function (el, i) {
      var k = el.id || 'c' + i;
      d[k] = el.type === 'checkbox' ? el.checked : el.value;
    });
    return JSON.stringify(d);
  }

  function aplicar(raiz, s) {
    var d;
    try { d = JSON.parse(s); } catch (e) { return; }
    campos(raiz).forEach(function (el, i) {
      var k = el.id || 'c' + i;
      if (!(k in d)) return;
      if (el.type === 'checkbox') el.checked = d[k];
      else el.value = d[k];
    });
  }

  /**
   * @param {object} o  raiz (elemento contenedor), alCambiar (recalcular),
   *                    retardo en ms, extra (guardar/aplicar estado propio de
   *                    la página, como el modo abiertas/cerradas).
   */
  function init(o) {
    var raiz = o.raiz || document;
    var retardo = o.retardo || 400;
    var pila = [], puntero = -1, aplicando = false, temporizador = null;

    function empaquetar() {
      return JSON.stringify({ campos: foto(raiz), extra: o.extra ? o.extra.leer() : null });
    }

    function desempaquetar(s) {
      var d = JSON.parse(s);
      aplicando = true;
      if (o.extra && d.extra !== null) o.extra.poner(d.extra);
      aplicar(raiz, d.campos);
      if (o.alCambiar) o.alCambiar();
      aplicando = false;
    }

    function guardar() {
      if (aplicando) return;
      var s = empaquetar();
      if (pila[puntero] === s) return;
      // Al escribir después de deshacer, lo que quedaba delante se descarta:
      // es la forma en que funciona deshacer en cualquier programa.
      pila = pila.slice(0, puntero + 1);
      pila.push(s);
      if (pila.length > 80) pila.shift();
      puntero = pila.length - 1;
    }

    function guardarConRetardo() {
      if (aplicando) return;
      clearTimeout(temporizador);
      temporizador = setTimeout(guardar, retardo);
    }

    guardar();   // estado de partida

    raiz.addEventListener('input', guardarConRetardo, true);
    raiz.addEventListener('change', guardarConRetardo, true);

    function deshacer() {
      clearTimeout(temporizador);
      guardar();                       // no perder lo que se acaba de escribir
      if (puntero <= 0) return false;
      puntero--; desempaquetar(pila[puntero]);
      return true;
    }

    function rehacer() {
      if (puntero >= pila.length - 1) return false;
      puntero++; desempaquetar(pila[puntero]);
      return true;
    }

    document.addEventListener('keydown', function (e) {
      if (!(e.ctrlKey || e.metaKey)) return;
      var t = (e.key || '').toLowerCase();
      if (t === 'z' && !e.shiftKey) { if (deshacer()) e.preventDefault(); }
      else if (t === 'y' || (t === 'z' && e.shiftKey)) { if (rehacer()) e.preventDefault(); }
    });

    return { deshacer: deshacer, rehacer: rehacer, guardar: guardar };
  }

  global.NxHistorial = { init: init };
})(window);
