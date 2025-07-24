/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
  optimizeFonts: true,
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  experimental: {
    optimizeCss: true,
  },
}

export default nextConfig; 