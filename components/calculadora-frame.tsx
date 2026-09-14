"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

// Marco de la calculadora: el iframe crece con su contenido (el HTML nos manda su alto),
// así en móvil se ve la página completa y no queda cortada ni se solapa con el pie.
export default function CalculadoraFrame() {
  const ref = useRef<HTMLIFrameElement | null>(null);

  /**
   * Manda el tema a la calculadora.
   *
   * Vive en un marco aparte y no ve la clase que next-themes pone en el <html>
   * de la web, así que se lo decimos por mensaje: al cargar, cada vez que se
   * toca el interruptor, y también cuando ella lo pide al arrancar, porque
   * puede terminar de cargar después de que lo hayamos enviado.
   */
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    const enviar = () => {
      ref.current?.contentWindow?.postMessage(
        { tipo: "nx-tema", tema: resolvedTheme === "light" ? "light" : "dark" },
        "*"
      );
    };
    enviar();
    const onPide = (e: MessageEvent) => {
      if (e.data && e.data.tipo === "nx-pide-tema") enviar();
    };
    window.addEventListener("message", onPide);
    return () => window.removeEventListener("message", onPide);
  }, [resolvedTheme]);

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
