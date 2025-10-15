/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Export as static site for Vercel's static output
  output: 'export',
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
