import type { Metadata } from "next";
import { Geist, Geist_Mono, Jolly_Lodger } from "next/font/google";
import "./globals.css";
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import AgeGate from '@/components/AgeGate';
import AnnouncementBanner from '@/components/AnnouncementBanner';

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
  title: "몰트로그, 위스키의 모든 기록",
  description: "위스키를 사랑하는 모든 이들을 위한 완벽한 기록 공간",
  icons: {
    icon: [
      { url: '/favicon.ico?v=2' },
      { url: '/Pavicon.png?v=2', type: 'image/png' },
    ],
    shortcut: '/favicon.ico?v=2',
    apple: '/Pavicon.png?v=2',
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
        <link rel="icon" href="/favicon.ico?v=2" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/Pavicon.png?v=2" />
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
