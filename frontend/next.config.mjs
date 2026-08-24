/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // eciesjs (client-side secret encryption) expects a Buffer global.
    // Next.js's webpack5 config no longer polyfills Node core modules automatically.
    config.resolve.fallback = { ...config.resolve.fallback, buffer: "buffer" };
    return config;
  },
};

export default nextConfig;
