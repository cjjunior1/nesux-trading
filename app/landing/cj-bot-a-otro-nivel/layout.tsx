import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CJ Bot v2.30 | Lleva tu Trading a Otro Nivel',
  description: 'Inteligencia, control y seguridad: el bot que opera por ti 24/7 con estrategias profesionales en MT5.',
  openGraph: {
    title: 'CJ Bot v2.30 | Lleva tu Trading a Otro Nivel',
    description: 'Inteligencia, control y seguridad: el bot que opera por ti 24/7 con estrategias profesionales en MT5.',
    images: [{ url: '/og-images/login_files/1780452229.png', width: 807, height: 450, alt: 'CJ Bot v2.30 a otro nivel' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CJ Bot v2.30 | Lleva tu Trading a Otro Nivel',
    description: 'Inteligencia, control y seguridad: el bot que opera por ti 24/7 con estrategias profesionales en MT5.',
    images: ['/og-images/login_files/1780452229.png'],
  },
};

export default function CjBotOtroNivelLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
