import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Nesux Trading Academy',
  description: 'Métricas en tiempo real',
  openGraph: {
    title: 'Dashboard | Nesux Trading Academy',
    description: 'Métricas en tiempo real',
    images: [{ url: '/og/dashboard.jpg', width: 1200, height: 630, alt: 'Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dashboard | Nesux Trading Academy',
    description: 'Métricas en tiempo real',
    images: ['/og/dashboard.jpg'],
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
