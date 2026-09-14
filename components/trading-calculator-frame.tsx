"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Marco de Trading Calculator.
 *
 * El iframe crece con su contenido: la calculadora manda su alto real por
 * postMessage y aquí se aplica, así en móvil se ve entera y no queda cortada ni
 * aparecen dos barras de desplazamiento.
 *
 * Encima va el botón de instalar. No lleva lógica propia: el atributo
 * data-instalar-app lo engancha el componente InstallApp del layout, que ya
 * gestiona el diálogo nativo en Chrome y Edge y las instrucciones a mano en
 * iPhone y Firefox.
 */
export default function TradingCalculatorFrame({
  // Dentro de Calculator Plus el botón de instalar ya está arriba de la página:
  // repetirlo aquí confundiría sobre qué se está instalando.
  mostrarInstalar = true,
}: { mostrarInstalar?: boolean } = {}) {
  const [alto, setAlto] = useState(1100);

  const marco = useRef<HTMLIFrameElement | null>(null);

  /**
   * Alto del iframe.
   *
   * Se mide de dos maneras a propósito. La calculadora manda su alto por
   * postMessage, pero si ese aviso se pierde el marco se queda corto, el
   * contenido se corta por abajo y el pie de la web se sube encima. Como el
   * iframe es del mismo dominio, aquí también se puede leer su alto real
   * directamente, y eso es lo que cierra el problema.
   */
  useEffect(() => {
    const aplicar = (h: number) => {
      if (h > 200) setAlto((prev) => (Math.abs(prev - h) > 8 ? Math.ceil(h) : prev));
    };

    const onMsg = (e: MessageEvent) => {
      const d = e.data;
      if (d && d.tipo === "nx-calc-alto" && typeof d.alto === "number") aplicar(d.alto);
      // El botón de descargar vive dentro del iframe; instalar es cosa de esta
      // página, así que el aviso llega por mensaje y aquí se lanza el evento.
      if (d && d.tipo === "nx-instalar-app") window.dispatchEvent(new Event("nx-instalar-app"));
    };
    window.addEventListener("message", onMsg);

    const medir = () => {
      try {
        const doc = marco.current?.contentDocument;
        if (!doc) return;
        aplicar(Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight));
      } catch {
        // Otro origen: no se puede medir. Queda el aviso por postMessage.
      }
    };
    const t = setInterval(medir, 500);
    medir();

    return () => {
      window.removeEventListener("message", onMsg);
      clearInterval(t);
    };
  }, []);


  return (
    <>

      <iframe
        ref={marco}
        onLoad={() => {
          const doc = marco.current?.contentDocument;
          if (doc) setAlto(Math.ceil(Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight)));
        }}
        src="/trading-calculator.html"
        title="Trading Calculator"
        // Sin este permiso el botón Copiar no puede escribir en el portapapeles
        // desde dentro del iframe: el navegador lo bloquea sin avisar.
        allow="clipboard-write"
        scrolling="no"
        className="block w-full border-0"
        style={{ width: "100%", height: alto, display: "block", overflow: "hidden" }}
      />
    </>
  );
}
