import type { NextConfig } from "next";
import path from 'path'; // 'require' 대신 'import'를 사용합니다.

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // [추가된 부분] 웹팩(webpack) 설정을 통해 경로 별칭을 추가합니다.
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      // '@' 별칭이 프로젝트의 루트('./')를 가리키도록 설정합니다.
      '@': path.resolve(__dirname, './'),
    };
    return config;
  },
};

export default nextConfig;