import type { Metadata } from "next";
import CalculadoraFrame from "@/components/calculadora-frame";
import TradingCalculatorFrame from "@/components/trading-calculator-frame";

const THUMB = "https://trading.nesuxglobalbusinessrd.com/calculadora-thumb.jpg";
const URL = "https://trading.nesuxglobalbusinessrd.com/landing/calculadora";
const TITLE = "Calculator Plus · Nesux";
const DESC = "Simula la cesta del bot en modo Martingala (MG): respaldos, TP y protección por USD.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  /**
   * Manifiesto PROPIO de Calculator Plus.
   *
   * Con su scope en esta ruta, el navegador la instala como una app aparte: se
   * abre aquí, con las dos calculadoras dentro, y no en la portada de la web.
   */
  manifest: "/calculator-plus.webmanifest",
  openGraph: {
    title: TITLE,
    description: DESC,
    url: URL,
    type: "website",
    images: [{ url: THUMB, width: 600, height: 600, alt: "Calculator Plus Nesux" }],
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESC,
    images: [THUMB],
  },
};

// Página interna: muestra la calculadora embebida DENTRO de la app (no en pestaña aparte).
export default function CalculadoraTradingPage() {
  return (
    // pt-16 = alto del navbar fijo: sin esto el título de la calculadora queda debajo del menú.
    <main className="w-full bg-[#0d1117] pt-16" style={{ minHeight: "100dvh" }}>
      {/* Arriba el simulador de siempre. */}
      <CalculadoraFrame />

      {/*
        Debajo, Trading Calculator COMPLETA.
        Antes iba embebida a medias dentro de la tarjeta izquierda del simulador,
        donde no cabía y se quedaba sin la mitad de sus funciones. Aquí entra
        entera, con sus dos columnas, su exportación y su propio símbolo.
      */}
      <div className="mx-auto my-2 h-px max-w-[1240px] bg-white/10" />
      <TradingCalculatorFrame mostrarInstalar={false} />

      <div className="pb-10" />
    </main>
  );
}
