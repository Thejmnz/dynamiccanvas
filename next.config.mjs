/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Exclude native modules from Webpack bundling
  experimental: {
    serverComponentsExternalPackages: ['canvas', 'fabric'],
  },
  webpack: (config) => {
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      "bufferutil": "commonjs bufferutil",
      "canvas": "commonjs canvas",
    });
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
      {
        protocol: "https",
        hostname: "canva-clone-ali.vercel.app",
      },
      {
        protocol: "https",
        hostname: "xsjtlbmaazrhwhoorubk.supabase.co",
      },
    ],
  },
};

export default nextConfig;
