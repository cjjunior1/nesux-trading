import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'El Método | Nesux Trading Academy',
  description: 'Estrategias probadas',
  openGraph: {
    title: 'El Método | Nesux Trading Academy',
    description: 'Estrategias probadas',
    images: [{ url: '/og-images/metodo.jpg', width: 1200, height: 630, alt: 'El Método' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'El Método | Nesux Trading Academy',
    description: 'Estrategias probadas',
    images: ['/og-images/metodo.jpg'],
  },
};

export default function MetodoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
