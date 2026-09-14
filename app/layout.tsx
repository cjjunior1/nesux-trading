import { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import LayoutShell from '@/components/layout-shell';
import PageTracker from '@/components/page-tracker';
import InstallApp from '@/components/install-app';
import { InstallAppBanner } from '@/components/install-app-banner';
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
      { url: '/og-images/trading-academy.jpg', width: 1200, height: 630, alt: 'Trading Academy' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nesux Trading Academy',
    description: 'Aprende a operar en los mercados financieros',
    images: ['/og-images/trading-academy.jpg'],
  },
  // PWA: permite instalar como app y abrir en modo pantalla completa (iOS)
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Nesux',
  },
  // iOS NO lee el manifiesto para sacar el icono: necesita un apple-touch-icon
  // aparte. Sin él, al hacer "Añadir a pantalla de inicio" el iPhone ponía una
  // miniatura borrosa de la página en vez del logo, y la app parecía un atajo
  // cualquiera. El PNG va a 180x180 y sin transparencia, que es lo que iOS
  // espera (una imagen con alfa se le pinta de negro detrás).
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#059669',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className={inter.className}>
        <Providers>
          <PageTracker />
          {/* Descarga de la app: atiende a cualquier botón con data-instalar-app (móvil y PC) */}
          <InstallApp />
          {/*
            Aviso de instalación en el móvil.
            Estaba escrito y sin montar en ningún sitio, así que la única forma
            de instalar era el botón "App" del menú — y en las páginas que no
            llevan ese menú, como la portada, no había ninguna. Ahora aparece
            solo en móvil y solo si el navegador confirma que se puede instalar.
          */}
          <InstallAppBanner />
          {/* HumanCheck retirado: la captura de leads la hace el único popup oficial (lead-popup.js). */}
          <LayoutShell>{children}</LayoutShell>
        </Providers>
        <Script
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js').catch(() => {});
              }
            `,
          }}
        />
      </body>
    </html>
  );
}