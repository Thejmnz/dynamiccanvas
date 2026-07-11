/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // Keep development assets separate from production builds. Running
  // `next build` while the local editor is open must not invalidate its CSS.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
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
        hostname: "*.ufs.sh",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
      {
        protocol: "https",
        hostname: "qhfbwqijhefoeebxnota.supabase.co",
      },
    ],
  },
};

export default nextConfig;
