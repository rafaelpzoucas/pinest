import nextMDX from '@next/mdx'

const withMDX = nextMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['mdx', 'ts', 'tsx'],

  // Otimizações de imagem
  images: {
    formats: ['image/webp', 'image/avif'], // Formatos modernos - CRÍTICO para LCP
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Tamanhos responsivos
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Tamanhos pequenos
    minimumCacheTTL: 60 * 60 * 24 * 7, // Cache 7 dias (era 60 segundos!)
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname:
          process.env.SUPABASE_HOSTNAME ?? 'uguiyoavathssoqpzxrq.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Otimizações experimentais
  experimental: {
    // Otimiza imports de pacotes
    optimizePackageImports: [
      'lucide-react',
      '@tanstack/react-query',
      'date-fns',
      'zod',
      'zustand',
    ],

    // Parallel ISR
    isrFlushToDisk: false,
  },

  // Compressão
  compress: true,

  // Headers de performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        // Cache assets estáticos
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache imagens - IMPORTANTE para suas imagens do Supabase
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400', // 24 horas
          },
        ],
      },
    ]
  },
}

export default withMDX(nextConfig)
