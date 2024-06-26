/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.SUPABASE_HOSTNAME,
        port: '',
        pathname: '/**',
      },
    ],
    minimumCacheTTL: 60,
  },
}

export default nextConfig
