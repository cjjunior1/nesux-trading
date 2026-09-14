import type { Metadata } from "next";
import TradingCalculatorFrame from "@/components/trading-calculator-frame";

const URL = "https://trading.nesuxglobalbusinessrd.com/landing/trading-calculator";
const TITLE = "Trading Calculator · Nesux";
const DESC =
  "Calcula una cesta del CJ Bot con datos reales: martingalas usadas, resultado de cada operación y precio de cierre en T/P.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  /**
   * Manifiesto PROPIO, distinto al de la web.
   *
   * Con su `scope` y su `start_url` apuntando a esta ruta, el navegador la trata
   * como una app aparte: se instala con su nombre y al abrirla arranca aquí, no
   * en la portada de Trading Academy.
   */
  manifest: "/trading-calculator.webmanifest",
  openGraph: { title: TITLE, description: DESC, url: URL, type: "website" },
  twitter: { card: "summary", title: TITLE, description: DESC },
};

export default function TradingCalculatorPage() {
  return (
    // pt-16 = alto del navbar fijo; sin esto el título queda debajo del menú.
    <main className="w-full bg-[#0d1117] pt-16" style={{ minHeight: "100dvh" }}>
      <TradingCalculatorFrame />
    </main>
  );
}
