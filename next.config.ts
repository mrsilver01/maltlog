import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // 프로덕션 빌드에서 console.* 자동 제거 (console.error/warn은 유지하여 장애 추적)
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },
  images: {
    unoptimized: false, // Enable Next.js Image optimization for Supabase Storage
    domains: ['localhost'],
    remotePatterns: [
      // Supabase Storage
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      // Kakao OAuth 프로필 이미지
      {
        protocol: 'https',
        hostname: '*.kakaocdn.net',
      },
      {
        protocol: 'http',
        hostname: '*.kakaocdn.net',
      },
      // 기타 외부 이미지 (공지사항 등 관리자 업로드)
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
};

export default nextConfig;