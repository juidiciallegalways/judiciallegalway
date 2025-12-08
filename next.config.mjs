/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // REMOVED: unoptimized: true
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Add your Supabase storage domain if you use it for uploads
      {
        protocol: 'https',
        hostname: 'your-project-id.supabase.co',
      },
    ],
  },
}

export default nextConfig