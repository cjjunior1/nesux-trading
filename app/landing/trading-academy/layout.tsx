import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trading Academy | Formación y Automatización en Trading',
  description: 'Aprende a operar con disciplina y automatiza tu estrategia con nuestra herramienta CJ Trading. Educación real, sin promesas de ganancias.',
  openGraph: {
    title: 'Trading Academy | Formación y Automatización en Trading',
    description: 'Aprende a operar con disciplina y automatiza tu estrategia con nuestra herramienta CJ Trading.',
    images: [{ url: 'https://trading.nesuxglobalbusinessrd.com/og-images/trading-academy.jpg', width: 807, height: 450, alt: 'Trading Academy' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trading Academy | Formación y Automatización en Trading',
    description: 'Aprende a operar con disciplina y automatiza tu estrategia con nuestra herramienta CJ Trading.',
    images: ['https://trading.nesuxglobalbusinessrd.com/og-images/trading-academy.jpg'],
  },
};

export default function TradingAcademyLandingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
