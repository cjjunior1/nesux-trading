import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Regístrate | Nesux Trading Academy',
  description: 'Crea tu cuenta hoy',
  openGraph: {
    title: 'Regístrate | Nesux Trading Academy',
    description: 'Crea tu cuenta hoy',
    images: [{ url: '/og-images/registro.jpg', width: 1200, height: 630, alt: 'Regístrate' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Regístrate | Nesux Trading Academy',
    description: 'Crea tu cuenta hoy',
    images: ['/og-images/registro.jpg'],
  },
};

export default function RegistroLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
