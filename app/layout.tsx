import type { Metadata } from "next";
import { Geist, Geist_Mono, Jolly_Lodger } from "next/font/google";
import "./globals.css";
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jollyLodger.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 2000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
