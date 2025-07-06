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
  rewrites() {
    return [
      // Produção: root → /store
      {
        source: '/',
        has: [
          {
            type: 'host',
            value:
              '(?!staging(?:-pinest)?.vercel.app|staging.pinest.com.br)(?<store>[^.]+)\\.pinest\\.com\\.br',
          },
        ],
        destination: '/:store',
      },
      // Produção: subpaths → /store/path
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value:
              '(?!staging(?:-pinest)?.vercel.app|staging.pinest.com.br)(?<store>[^.]+)\\.pinest\\.com\\.br',
          },
        ],
        destination: '/:store/:path*',
      },
      // Staging e localhost (já cobre root e paths)
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
}

export default withMDX(nextConfig)
