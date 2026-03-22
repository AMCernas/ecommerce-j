/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@ecoomerce-jardineria/ui', '@ecoomerce-jardineria/types'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
