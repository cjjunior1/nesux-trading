import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cursos | Nesux Trading Academy',
  description: 'Formación en trading',
  openGraph: {
    title: 'Cursos | Nesux Trading Academy',
    description: 'Formación en trading',
    images: [{ url: '/og-images/cursos.jpg', width: 1200, height: 630, alt: 'Cursos' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cursos | Nesux Trading Academy',
    description: 'Formación en trading',
    images: ['/og-images/cursos.jpg'],
  },
};

export default function CursosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
