import type { MetadataRoute } from 'next';

// Manifest de la PWA: permite "Instalar app" / "Añadir a pantalla de inicio".
// En modo standalone el sitio se abre a pantalla completa, como una app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Asistente Trading Academy',
    short_name: 'Asistente',
    description: 'Tu asistente de trading con IA: conversa por voz o texto, aprende y automatiza.',
    start_url: '/?chat=1',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#059669',
    lang: 'es',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
