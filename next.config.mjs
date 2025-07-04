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
  images: {
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
    minimumCacheTTL: 60,
  },
  experimental: {
    middlewareHost: true,
  },
  async rewrites() {
    return [
      // Produção: foo.pinest.com.br/* → /foo/*
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            // Captura o subdomínio em um grupo nomeado, excluindo hosts de staging
            value:
              '(?!staging(?:-pinest)?.vercel.app|staging.pinest.com.br)(?<store>[^.]+).pinest.com.br',
          },
        ],
        destination: '/:store/:path*',
      },
      // Staging (subpath) em staging.pinest.com.br ou staging-pinest.vercel.app e localhost
      {
        source: '/:store/:path*',
        has: [
          { type: 'host', value: 'staging.pinest.com.br' },
          { type: 'host', value: 'staging-pinest.vercel.app' },
          { type: 'host', value: 'localhost:3000' },
        ],
        destination: '/:store/:path*',
      },
    ]
  },
  middleware: {
    matcher: [
      '/:path((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
  },
}

export default withMDX(nextConfig)
