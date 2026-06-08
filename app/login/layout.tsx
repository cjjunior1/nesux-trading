import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar Sesión | Nesux Trading Academy',
  description: 'Accede a tu cuenta',
  openGraph: {
    title: 'Iniciar Sesión | Nesux Trading Academy',
    description: 'Accede a tu cuenta',
    images: [{ url: '/og/login.jpg', width: 1200, height: 630, alt: 'Iniciar Sesión' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Iniciar Sesión | Nesux Trading Academy',
    description: 'Accede a tu cuenta',
    images: ['/og/login.jpg'],
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
