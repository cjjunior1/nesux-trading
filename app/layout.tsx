import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import LayoutShell from '@/components/layout-shell';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nesux Trading Academy',
  description: 'Plataforma profesional de trading',
  metadataBase: new URL('https://trading.nesuxglobalbusinessrd.com'),
  openGraph: {
    title: 'Nesux Trading Academy',
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
      <body className={inter.className}>
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  );
}