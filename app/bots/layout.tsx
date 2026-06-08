import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bots IA | Nesux Trading Academy',
  description: 'Automatización inteligente',
  openGraph: {
    title: 'Bots IA | Nesux Trading Academy',
    description: 'Automatización inteligente',
    images: [{ url: '/og/bots.jpg', width: 1200, height: 630, alt: 'Bots IA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bots IA | Nesux Trading Academy',
    description: 'Automatización inteligente',
    images: ['/og/bots.jpg'],
  },
};

export default function BotsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
