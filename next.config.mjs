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
      {
        source: '/:path*', // Captura todas as rotas do domínio
        destination: '/sanduba-da-leyla/:path*', // Redireciona para a pasta correta
        has: [
          {
            type: 'host',
            value: 'sandubadaleyla.com.br',
          },
        ],
      },
    ]
  },
}

export default withMDX(nextConfig)
