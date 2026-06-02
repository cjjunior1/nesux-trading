import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import LayoutShell from "@/components/layout-shell";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return {
    metadataBase: new URL(baseUrl),
    title: "Trading Academy A Otro Nivel | Aprende Trading y Logra tu Libertad Financiera",
    description:
      "Descubre el método probado para ser parte del 5% de traders exitosos. Cursos de trading, bots automatizados y mentoría personalizada para el mercado latinoamericano.",
    keywords:
      "trading, cursos trading, bots trading, forex, criptomonedas, libertad financiera, inversión, educación financiera",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "Trading Academy A Otro Nivel | Tu Camino Hacia la Libertad Financiera",
      description:
        "Aprende a hacer trading con nuestro método probado. Sé parte del 5% de traders exitosos.",
      images: ["/og-image.png"],
      type: "website",
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js" />
      </head>
      <body className={inter.className}>
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  );
}
