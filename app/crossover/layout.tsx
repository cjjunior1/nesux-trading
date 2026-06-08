import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crossover | Nesux Trading Academy',
  description: 'Golden Cross Strategy',
  openGraph: {
    title: 'Crossover | Nesux Trading Academy',
    description: 'Golden Cross Strategy',
    images: [{ url: '/og/crossover.jpg', width: 1200, height: 630, alt: 'Crossover' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crossover | Nesux Trading Academy',
    description: 'Golden Cross Strategy',
    images: ['/og/crossover.jpg'],
  },
};

export default function CrossoverLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
