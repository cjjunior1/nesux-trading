/**
 * Exportador de informes · Nesux
 *
 * Lo usan las dos calculadoras, Calculator Plus y Trading Calculator, para
 * sacar el mismo informe por tres vías: copiarlo al portapapeles, descargarlo
 * en PNG o mandarlo a imprimir para guardarlo en PDF.
 *
 * Todo se dibuja a mano en un lienzo, sin ninguna librería externa, para que
 * las apps instaladas sigan exportando sin conexión.
 *
 * La imagen SIEMPRE mide 900 × 1150, tenga el informe 3 filas o 15: así dos
 * capturas puestas una al lado de otra no bailan de tamaño. Si el contenido no
 * cabe se reduce en proporción, y si sobra sitio se centra.
 *
 * Cada página solo tiene que construir un objeto con esta forma:
 *
 *   {
 *     titulo:'Trading Calculator',
 *     modo:'CESTA ABIERTA',          // se pinta con el color de acento
 *     acento:'#3aa585',
 *     meta:'Volatility 75 · Compra · 14/9/2026',
 *     kpis:[{l:'LOTES', v:'0.07', color:'#f7931a'}],
 *     tituloDetalle:'RESULTADO POR OPERACIÓN',
 *     filas:[{izq:'Op 1', centro:'51,173.61', der:'-$17.33', derColor:'#f85149',
 *             sub:[{t:'0.01 lotes', color:'#f7931a'}]}],
 *     total:{texto:'El total de las filas suma', valor:'-$41.51', color:'#f85149'},
 *     pie:'…'
 *   }
 */
(function (global) {
  'use strict';

  var COLOR = {
    fondo: '#0d1117', panel2: '#1c2330', borde: '#30363d',
    txt: '#e6edf3', muted: '#8b949e'
  };

  var W = 900, M = 36, H = 1150;

  function redondeado(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  var F = function (p, w) { return (w || '400') + ' ' + p + "px 'Segoe UI', system-ui, sans-serif"; };

  function dibujar(r) {
    if (!r) return null;
    var esc = 2;                               // el doble de resolución: nada borroso
    var colW = (W - M * 2 - 16) / 2;
    var acento = r.acento || '#58a6ff';

    // --- Medir antes de dibujar: una fila con notas largas ocupa dos renglones
    //     y si no se cuenta, el texto se sale por abajo.
    var medidor = document.createElement('canvas').getContext('2d');
    medidor.font = F(12);
    var anchoUtil = W - M * 2;

    var filasKpi = Math.ceil(r.kpis.length / 2);
    var altoKpis = filasKpi * 78;
    var impar = r.kpis.length % 2 === 1;
    var altoDet = 34 + r.filas.length * 26;   // cabecera + una linea por operacion
    var Hnat = 150 + altoKpis + 56 + altoDet + 90;

    var escala = Math.min(1, (H - 48) / Hnat);
    var dx = (W - W * escala) / 2, dy = (H - Hnat * escala) / 2;

    var c = document.createElement('canvas');
    c.width = W * esc; c.height = H * esc;
    var g = c.getContext('2d');
    g.scale(esc, esc);

    g.fillStyle = COLOR.fondo; g.fillRect(0, 0, W, H);
    g.fillStyle = acento; g.fillRect(0, 0, W, 5);
    g.translate(dx, dy); g.scale(escala, escala);

    // Cabecera
    g.fillStyle = COLOR.txt; g.font = F(25, '700');
    g.fillText(r.titulo, M, 52);
    g.fillStyle = acento; g.font = F(14, '700');
    g.fillText(r.modo, M, 78);
    g.fillStyle = COLOR.muted; g.font = F(13);
    g.fillText(r.meta, M, 100);

    // Resumen. Si el número de datos es impar, el último ocupa el ancho entero
    // y la rejilla no se queda con un hueco a la derecha.
    var y = 124;
    r.kpis.forEach(function (k, i) {
      var solo = impar && i === r.kpis.length - 1;
      var ancho = solo ? colW * 2 + 16 : colW;
      var x = M + (solo ? 0 : (i % 2) * (colW + 16));
      var fy = y + Math.floor(i / 2) * 78;
      g.fillStyle = COLOR.panel2; redondeado(g, x, fy, ancho, 66, 10); g.fill();
      g.strokeStyle = COLOR.borde; g.lineWidth = 1; redondeado(g, x, fy, ancho, 66, 10); g.stroke();
      g.fillStyle = COLOR.muted; g.font = F(11, '600');
      g.fillText(k.l.toUpperCase(), x + 14, fy + 24);
      g.fillStyle = k.color || COLOR.txt; g.font = F(20, '700');
      g.fillText(k.v, x + 14, fy + 50);
      if (k.s) {
        g.fillStyle = COLOR.muted; g.font = F(11);
        g.fillText(k.s, x + 14 + g.measureText(k.v).width, fy + 50);
      }
    });
    y += altoKpis + 30;

    g.fillStyle = COLOR.txt; g.font = F(14, '700');
    g.fillText((r.tituloDetalle || '').toUpperCase(), M, y);
    y += 22;

    /**
     * Detalle en filas y columnas, como una hoja de calculo.
     *
     * Las columnas se reparten el ancho segun los pesos que trae el informe y
     * los numeros van pegados a la derecha, que es como se comparan. La franja
     * tenue va por FILA, nunca por columna: lo que se sigue con la vista es la
     * operacion entera, de izquierda a derecha.
     */
    var cols = r.columnas || [];
    var libre = W - M * 2;
    var pesos = cols.reduce(function (a, c) { return a + (c.peso || 1); }, 0) || 1;
    var xs = [], acum = M;
    cols.forEach(function (c) {
      var an = libre * (c.peso || 1) / pesos;
      xs.push({ x: acum, an: an, der: c.der !== false });
      acum += an;
    });

    g.font = F(10.5, '600'); g.fillStyle = COLOR.muted;
    cols.forEach(function (c, i) {
      var p = xs[i];
      g.textAlign = p.der ? 'right' : 'left';
      g.fillText(c.t.toUpperCase(), p.der ? p.x + p.an - 6 : p.x, y);
    });
    g.textAlign = 'left';
    g.strokeStyle = COLOR.borde; g.beginPath();
    g.moveTo(M, y + 6); g.lineTo(W - M, y + 6); g.stroke();
    y += 12;

    r.filas.forEach(function (f, n) {
      if (n % 2 === 0) { g.fillStyle = 'rgba(255,255,255,.04)'; g.fillRect(M, y, libre, 26); }
      g.font = F(12.5);
      (f.celdas || []).forEach(function (cel, i) {
        var p = xs[i]; if (!p) return;
        g.fillStyle = cel.color || COLOR.txt;
        g.font = F(12.5, cel.fuerte ? '700' : '400');
        g.textAlign = p.der ? 'right' : 'left';
        g.fillText(cel.t, p.der ? p.x + p.an - 6 : p.x, y + 18);
      });
      g.textAlign = 'left';
      y += 26;
    });

    if (r.total) {
      g.strokeStyle = COLOR.borde; g.beginPath(); g.moveTo(M, y + 6); g.lineTo(W - M, y + 6); g.stroke();
      g.fillStyle = COLOR.txt; g.font = F(15);
      g.fillText(r.total.texto, M, y + 38);
      g.font = F(20, '700'); g.fillStyle = r.total.color || COLOR.txt;
      g.fillText(r.total.valor, M + 240, y + 38);
    }
    if (r.pie) {
      g.fillStyle = COLOR.muted; g.font = F(11);
      g.fillText(r.pie, M, y + 62);
    }
    g.fillStyle = COLOR.muted; g.font = F(11);
    g.fillText('Nesux Global Business RD · reglas del CJ Bot', M, Hnat - 22);

    return c;
  }

  function nombre(base, ext) {
    var d = new Date(), p = function (n) { return String(n).padStart(2, '0'); };
    return base + '-' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) +
      '-' + p(d.getHours()) + p(d.getMinutes()) + '.' + ext;
  }

  /**
   * Engancha los tres botones.
   *
   * @param {object} o  {copiar, png, pdf} ids de los botones, `obtener` que
   *                    devuelve el informe y `archivo` para el nombre.
   */
  function conectar(o) {
    var base = o.archivo || 'informe';
    /**
     * Cada accion puede tener MAS DE UN boton: los mismos tres estan arriba de
     * los resultados y tambien junto a los datos, para no tener que subir a
     * buscarlos. `cada` los recorre todos.
     */
    var cada = function (ids, fn) {
      (Array.isArray(ids) ? ids : [ids]).forEach(function (id) {
        var el = document.getElementById(id);
        if (el) fn(el);
      });
    };

    cada(o.copiar, function (btn) { btn.addEventListener('click', function () {
      var c = dibujar(o.obtener());
      if (!c) return;
      var original = btn.textContent;
      var avisar = function (t) { btn.textContent = t; setTimeout(function () { btn.textContent = original; }, 1800); };
      c.toBlob(function (blob) {
        // El navegador exige gesto del usuario y permiso de portapapeles; si
        // falta alguno, se avisa en el propio botón en vez de callar.
        try {
          navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
            .then(function () { avisar('✓ Copiado'); })
            .catch(function () { avisar('No se pudo copiar'); });
        } catch (e) { avisar('No se pudo copiar'); }
      }, 'image/png');
    }); });

    cada(o.png, function (btn) { btn.addEventListener('click', function () {
      var c = dibujar(o.obtener());
      if (!c) return;
      c.toBlob(function (b) {
        var url = URL.createObjectURL(b), a = document.createElement('a');
        a.href = url; a.download = nombre(base, 'png');
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      }, 'image/png');
    }); });

    cada(o.pdf, function (btn) { btn.addEventListener('click', function () {
      var c = dibujar(o.obtener());
      if (!c) return;
      /**
       * El PDF sale por el diálogo de impresión, que en todos los navegadores
       * ofrece "Guardar como PDF". Va en un iframe oculto y no en una ventana
       * nueva porque los bloqueadores de ventanas emergentes la matarían.
       */
      /**
       * Ojo con las etiquetas de cierre dentro de este texto.
       * El servidor inyecta el widget de captación de leads justo antes del
       * cierre del cuerpo de cada página, y lo busca como texto plano. Si esa
       * etiqueta aparece aquí dentro, el servidor mete la suya EN MEDIO de este
       * archivo y corta el nuestro por la mitad: el resto del código se ve como
       * texto suelto en la página. Por eso las etiquetas van partidas.
           */
      var CUERPO = 'bo' + 'dy';
      var img = c.toDataURL('image/png');
      var marco = document.createElement('iframe');
      marco.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
      document.body.appendChild(marco);
      var d = marco.contentWindow.document;
      d.open();
      d.write('<!doctype html><html><head><meta charset="utf-8"><title>' + nombre(base, 'pdf') +
        '</title><style>@page{margin:10mm}html,body{margin:0;background:#fff}img{width:100%;display:block}</style>' +
        '</head><' + CUERPO + '><img src="' + img + '"></' + CUERPO + '></html>');
      d.close();
      var lanzar = function () {
        try { marco.contentWindow.focus(); marco.contentWindow.print(); } catch (e) {}
        setTimeout(function () { marco.remove(); }, 1500);
      };
      if (d.readyState === 'complete') setTimeout(lanzar, 250);
      else marco.onload = function () { setTimeout(lanzar, 250); };
    }); });
  }

  global.NxInforme = { dibujar: dibujar, conectar: conectar };
})(window);
