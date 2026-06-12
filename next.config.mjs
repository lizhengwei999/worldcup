/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gips0.baidu.com"
      },
      {
        protocol: "https",
        hostname: "gips1.baidu.com"
      },
      {
        protocol: "https",
        hostname: "gips2.baidu.com"
      },
      {
        protocol: "https",
        hostname: "gips3.baidu.com"
      }
    ]
  }
};

export default nextConfig;
