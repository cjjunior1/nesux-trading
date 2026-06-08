import type { MetadataRoute } from 'next';

// Manifest de la PWA: permite "Instalar app" / "Añadir a pantalla de inicio".
// En modo standalone el sitio se abre a pantalla completa, como una app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nesux Trading Academy',
    short_name: 'Nesux',
    description: 'Aprende y automatiza tu trading con Nesux Trading Academy.',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#059669',
    lang: 'es',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
