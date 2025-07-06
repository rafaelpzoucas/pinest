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
  async rewrites() {
    return [
      // Produção: foo.pinest.com.br/* → /[public_store]/*
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
        destination: '/[public_store]/:path*',
      },
      // Staging (subpath) em staging.pinest.com.br ou staging-pinest.vercel.app e localhost
      {
        source: '/:store/:path*',
        has: [
          { type: 'host', value: 'staging.pinest.com.br' },
          { type: 'host', value: 'staging-pinest.vercel.app' },
          { type: 'host', value: 'localhost:3000' },
        ],
        destination: '/[public_store]/:path*',
      },
      // Fallback para localhost sem subpath
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'localhost:3000' }],
        destination: '/[public_store]/:path*',
      },
    ]
  },
}

export default withMDX(nextConfig)
