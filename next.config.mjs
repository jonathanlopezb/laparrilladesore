/** @type {import('next').NextConfig} */
const nextConfig = {
  // Node.js runtime for all API routes (required for mongodb driver)
  experimental: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
