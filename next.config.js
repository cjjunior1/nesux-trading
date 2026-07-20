/** @type {import('next').NextConfig} */
const nextConfig = {
  // Asegura que la base de conocimiento del chatbot (archivos .md de /knowledge)
  // se empaquete en la funcion serverless de Vercel y el bot pueda leerla en produccion.
  experimental: {
    outputFileTracingIncludes: {
      '/api/chatbot': ['./knowledge/**/*'],
    },
    // Librerías de lectura de archivos: no empaquetar (usan APIs de Node).
    serverComponentsExternalPackages: ['pdf-parse', 'mammoth', 'xlsx'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.abacus.ai',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
