import type { MetadataRoute } from 'next';

// Manifest de la PWA: permite "Instalar app" / "Añadir a pantalla de inicio".
// En modo standalone el sitio se abre a pantalla completa, como una app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Trading Academy · A Otro Nivel',
    short_name: 'Trading Academy',
    description: 'Cursos, bots y asistente de trading con IA. Todo Nesux Trading Academy en tu pantalla de inicio.',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#059669',
    lang: 'es',
    // Sin 'orientation' fija: en PC la app se abre como ventana normal.
    // PNG 192 y 512: es lo que Chrome/Edge exigen para ofrecer "Instalar" en escritorio y Android.
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  };
}
