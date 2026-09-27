import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/media/:path*.m3u8",
        headers: [
          { key: "Content-Type", value: "application/vnd.apple.mpegurl" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
      {
        source: "/media/:path*.m4s",
        headers: [{ key: "Content-Type", value: "video/iso.segment" }],
      },
    ];
  },
};

export default nextConfig;
