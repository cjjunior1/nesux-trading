import type { Metadata } from "next";

const THUMB = "https://trading.nesuxglobalbusinessrd.com/calculadora-thumb.jpg";
const URL = "https://trading.nesuxglobalbusinessrd.com/landing/calculadora";
const TITLE = "Calculadora Trading · Nesux";
const DESC = "Simula la cesta del bot en modo Martingala (MG): respaldos, TP y protección por USD.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  openGraph: {
    title: TITLE,
    description: DESC,
    url: URL,
    type: "website",
    images: [{ url: THUMB, width: 600, height: 600, alt: "Calculadora Trading Nesux" }],
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
    <main className="w-full bg-[#0d1117]" style={{ minHeight: "calc(100vh - 64px)" }}>
      <iframe
        src="/calculadora-trading.html"
        title="Nesux Calculator Trading"
        className="w-full border-0"
        style={{ width: "100%", height: "calc(100vh - 64px)", display: "block" }}
      />
    </main>
  );
}
