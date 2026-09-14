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

    function lineasDe(f) {
      var lineas = 1, x = 0;
      (f.sub || []).forEach(function (t) {
        var w = medidor.measureText(t.t).width + 18;
        if (x + w > anchoUtil) { lineas++; x = w; } else { x += w; }
      });
      return lineas;
    }

    var filasKpi = Math.ceil(r.kpis.length / 2);
    var altoKpis = filasKpi * 78;
    var impar = r.kpis.length % 2 === 1;
    var altoDet = r.filas.reduce(function (a, f) { return a + 46 + lineasDe(f) * 16; }, 0);
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
    y += 18;

    r.filas.forEach(function (f) {
      g.strokeStyle = 'rgba(255,255,255,.08)';
      g.beginPath(); g.moveTo(M, y + 4); g.lineTo(W - M, y + 4); g.stroke();

      g.fillStyle = COLOR.panel2; redondeado(g, M, y + 16, 66, 22, 6); g.fill();
      g.fillStyle = COLOR.txt; g.font = F(12, '700');
      g.fillText(f.izq, M + 10, y + 31);

      g.font = F(15); g.fillStyle = COLOR.txt;
      g.fillText(f.centro || '', M + 82, y + 32);

      if (f.der) {
        g.font = F(16, '700'); g.fillStyle = f.derColor || COLOR.txt;
        g.textAlign = 'right'; g.fillText(f.der, W - M, y + 32); g.textAlign = 'left';
      }

      // Segunda línea: si no cabe, salta de renglón en vez de salirse.
      var base = y + 52, x = M, lineas = 1;
      g.font = F(12);
      (f.sub || []).forEach(function (t) {
        var w = g.measureText(t.t).width + 18;
        if (x - M + w > anchoUtil) { x = M; lineas++; }
        g.fillStyle = t.color || COLOR.muted;
        g.fillText(t.t, x, base + (lineas - 1) * 16);
        x += w;
      });
      y += 46 + lineas * 16;
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
    var $ = function (id) { return document.getElementById(id); };

    if ($(o.copiar)) $(o.copiar).addEventListener('click', function () {
      var btn = $(o.copiar), c = dibujar(o.obtener());
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
    });

    if ($(o.png)) $(o.png).addEventListener('click', function () {
      var c = dibujar(o.obtener());
      if (!c) return;
      c.toBlob(function (b) {
        var url = URL.createObjectURL(b), a = document.createElement('a');
        a.href = url; a.download = nombre(base, 'png');
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      }, 'image/png');
    });

    if ($(o.pdf)) $(o.pdf).addEventListener('click', function () {
      var c = dibujar(o.obtener());
      if (!c) return;
      /**
       * El PDF sale por el diálogo de impresión, que en todos los navegadores
       * ofrece "Guardar como PDF". Va en un iframe oculto y no en una ventana
       * nueva porque los bloqueadores de ventanas emergentes la matarían.
       */
      var img = c.toDataURL('image/png');
      var marco = document.createElement('iframe');
      marco.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
      document.body.appendChild(marco);
      var d = marco.contentWindow.document;
      d.open();
      d.write('<!doctype html><html><head><meta charset="utf-8"><title>' + nombre(base, 'pdf') +
        '</title><style>@page{margin:10mm}html,body{margin:0;background:#fff}img{width:100%;display:block}</style>' +
        '</head><body><img src="' + img + '"></body></html>');
      d.close();
      var lanzar = function () {
        try { marco.contentWindow.focus(); marco.contentWindow.print(); } catch (e) {}
        setTimeout(function () { marco.remove(); }, 1500);
      };
      if (d.readyState === 'complete') setTimeout(lanzar, 250);
      else marco.onload = function () { setTimeout(lanzar, 250); };
    });
  }

  global.NxInforme = { dibujar: dibujar, conectar: conectar };
})(window);
