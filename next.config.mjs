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
      },
      {
        protocol: "https",
        hostname: "*.baidu.com"
      },
      {
        protocol: "http",
        hostname: "*.baidu.com"
      },
      {
        protocol: "https",
        hostname: "*.bdstatic.com"
      },
      {
        protocol: "http",
        hostname: "*.bdstatic.com"
      },
      {
        protocol: "https",
        hostname: "**.bdstatic.com"
      },
      {
        protocol: "http",
        hostname: "**.bdstatic.com"
      },
      {
        protocol: "https",
        hostname: "*.bcebos.com"
      },
      {
        protocol: "http",
        hostname: "*.bcebos.com"
      },
      {
        protocol: "https",
        hostname: "**.bcebos.com"
      },
      {
        protocol: "http",
        hostname: "**.bcebos.com"
      },
      {
        protocol: "https",
        hostname: "*.sinaimg.cn"
      },
      {
        protocol: "http",
        hostname: "*.sinaimg.cn"
      },
      {
        protocol: "https",
        hostname: "*.sina.com.cn"
      },
      {
        protocol: "http",
        hostname: "*.sina.com.cn"
      },
      {
        protocol: "https",
        hostname: "cdn.sportnanoapi.com"
      },
      {
        protocol: "http",
        hostname: "cdn.sportnanoapi.com"
      },
      {
        protocol: "https",
        hostname: "**.miguvideo.com"
      },
      {
        protocol: "http",
        hostname: "**.miguvideo.com"
      },
      {
        protocol: "https",
        hostname: "**.migu.cn"
      },
      {
        protocol: "http",
        hostname: "**.migu.cn"
      },
      {
        protocol: "https",
        hostname: "**.cmvideo.cn"
      },
      {
        protocol: "http",
        hostname: "**.cmvideo.cn"
      },
      {
        protocol: "https",
        hostname: "*.cctvpic.com"
      },
      {
        protocol: "http",
        hostname: "*.cctvpic.com"
      },
      {
        protocol: "https",
        hostname: "**.cctvpic.com"
      },
      {
        protocol: "http",
        hostname: "**.cctvpic.com"
      }
    ]
  }
};

export default nextConfig;
