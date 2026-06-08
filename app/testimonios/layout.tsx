import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Testimonios | Nesux Trading Academy',
  description: 'Opiniones de estudiantes',
  openGraph: {
    title: 'Testimonios | Nesux Trading Academy',
    description: 'Opiniones de estudiantes',
    images: [{ url: '/og/testimonios.jpg', width: 1200, height: 630, alt: 'Testimonios' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Testimonios | Nesux Trading Academy',
    description: 'Opiniones de estudiantes',
    images: ['/og/testimonios.jpg'],
  },
};

export default function TestimoniosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
