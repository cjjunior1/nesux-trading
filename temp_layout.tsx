import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Trading Academy',
  description: 'Plataforma profesional de trading',
  openGraph: {
    title: 'Trading Academy',
    description: 'Aprende a operar en los mercados financieros',
    type: 'website',
    images: [
      { url: '/og/trading-academy.jpg', width: 1200, height: 630, alt: 'Trading Academy' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
