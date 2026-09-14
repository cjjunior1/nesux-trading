"use client";

import { useEffect, useRef, useState } from "react";

// Marco de la calculadora: el iframe crece con su contenido (el HTML nos manda su alto),
// así en móvil se ve la página completa y no queda cortada ni se solapa con el pie.
export default function CalculadoraFrame() {
  const ref = useRef<HTMLIFrameElement | null>(null);
  const [alto, setAlto] = useState(900);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data;
      if (d && d.tipo === "nx-calc-alto" && typeof d.alto === "number" && d.alto > 200) {
        setAlto(Math.ceil(d.alto));
      }
      /**
       * El botón de descargar la app vive DENTRO del iframe, pero quien sabe
       * instalar es esta página. El botón avisa por mensaje y aquí se lanza el
       * evento que recoge InstallApp, en el layout.
       */
      if (d && d.tipo === "nx-instalar-app") {
        window.dispatchEvent(new Event("nx-instalar-app"));
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  return (
    <iframe
      ref={ref}
      src="/calculadora-trading.html"
      title="Nesux Calculator Trading"
      scrolling="no"
      className="w-full border-0 block"
      style={{ width: "100%", height: alto, display: "block", overflow: "hidden" }}
    />
  );
}
