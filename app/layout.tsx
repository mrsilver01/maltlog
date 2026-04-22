import type { Metadata } from "next";
import { Geist, Geist_Mono, Jolly_Lodger } from "next/font/google";
import "./globals.css";
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import AgeGate from '@/components/AgeGate';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import Footer from '@/components/Footer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jollyLodger = Jolly_Lodger({
  variable: "--font-jolly-lodger",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://maltlog.kr'),
  title: {
    default: "몰트로그, 위스키의 모든 기록",
    template: "%s | 몰트로그",
  },
  description: "위스키를 사랑하는 모든 이들을 위한 완벽한 기록 공간. 위스키 리뷰, 테이스팅 노트, 커뮤니티를 한 곳에서 만나보세요.",
  keywords: [
    "위스키", "싱글몰트", "스카치", "버번", "위스키 추천",
    "테이스팅 노트", "위스키 리뷰", "위스키 커뮤니티", "몰트로그",
    "Maltlog", "whisky", "whiskey", "single malt",
  ],
  authors: [{ name: "Maltlog" }],
  creator: "Maltlog",
  publisher: "Maltlog",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://maltlog.kr",
    siteName: "몰트로그",
    title: "몰트로그, 위스키의 모든 기록",
    description: "위스키를 사랑하는 모든 이들을 위한 완벽한 기록 공간",
    images: [
      {
        url: "/LOGO.png",
        width: 512,
        height: 512,
        alt: "Maltlog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "몰트로그, 위스키의 모든 기록",
    description: "위스키를 사랑하는 모든 이들을 위한 완벽한 기록 공간",
    images: ["/LOGO.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico?v=4' },
      { url: '/Pavicon.png?v=4', type: 'image/png', sizes: '32x32' },
    ],
    shortcut: '/favicon.ico?v=4',
    apple: '/Pavicon.png?v=4',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="light">
      <head>
        <link rel="icon" href="/favicon.ico?v=3" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico?v=3" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/Pavicon.png?v=3" />
        <link rel="icon" href="/Pavicon.png?v=3" type="image/png" sizes="32x32" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jollyLodger.variable} antialiased bg-rose-50 text-neutral-900`}
      >
        <AuthProvider>
          {/* 연령 게이트 - 최초 방문시 표시 */}
          <AgeGate />

          {/* 공지사항 배너 - 헤더 바로 아래 */}
          <AnnouncementBanner />

          {children}

          <Footer />

          <Toaster
            position="top-center"
            toastOptions={{
              style: { background: '#6A3A1A', color: '#fff', borderRadius: 8 }, // 갈색
              success: { iconTheme: { primary: '#6A3A1A', secondary: '#fff' } },
              error: { style: { background: '#7B2D5C', color: '#fff' } }     // 자주색
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
