import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CJ Bot a Otro Nivel | El Trading Automático Acaba de Evolucionar',
  description: 'Tu copiloto analítico que ejecuta estrategias ganadoras, protege tu capital y opera por ti 24/7.',
  openGraph: {
    title: 'CJ Bot a Otro Nivel | El Trading Automático Acaba de Evolucionar',
    description: 'Tu copiloto analítico que ejecuta estrategias ganadoras, protege tu capital y opera por ti 24/7.',
    images: [{ url: 'https://trading.nesuxglobalbusinessrd.com/og-images/bots.jpg', width: 807, height: 450, alt: 'CJ Bot a Otro Nivel' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CJ Bot a Otro Nivel | El Trading Automático Acaba de Evolucionar',
    description: 'Tu copiloto analítico que ejecuta estrategias ganadoras, protege tu capital y opera por ti 24/7.',
    images: ['https://trading.nesuxglobalbusinessrd.com/og-images/bots.jpg'],
  },
};

export default function CjBotLandingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
