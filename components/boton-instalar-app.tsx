"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

/**
 * Botón para instalar la página como app.
 *
 * No lleva lógica propia: el atributo data-instalar-app lo engancha el
 * componente InstallApp del layout, que ya resuelve el diálogo nativo en Chrome
 * y Edge y las instrucciones a mano en iPhone y Firefox.
 *
 * Se esconde solo cuando la página ya se está viendo como app instalada, porque
 * ahí el botón no haría nada.
 */
export default function BotonInstalarApp({ etiqueta = "Descargar como app" }: { etiqueta?: string }) {
  const [instalada, setInstalada] = useState(false);

  useEffect(() => {
    const enModoApp =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setInstalada(enModoApp);
  }, []);

  if (instalada) return null;

  /**
   * Botón en el verde de la marca.
   *
   * Verde esmeralda: es el color de la marca de Trading Academy, así se lee
   * como una acción del sitio. Se evita el naranja y el ámbar a propósito,
   * porque dentro de las calculadoras esos dos SÍ significan algo, volúmenes y
   * puntos, y el botón competía con los números.
   */
  return (
    <button
      type="button"
      data-instalar-app
      className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-400 transition-colors hover:border-emerald-400 hover:bg-emerald-500/25 hover:text-emerald-300"
    >
      <Download className="h-4 w-4" />
      {etiqueta}
    </button>
  );
}
