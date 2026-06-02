import { Inter } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Trading Academy",
  description: "Plataforma de trading",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
