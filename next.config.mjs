/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [process.env.SUPABASE_HOSTNAME],
    minimumCacheTTL: 60,
  },
}

export default nextConfig
