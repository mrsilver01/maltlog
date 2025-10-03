'use client'

import React from 'react'

interface LoadingAnimationProps {
  message?: string
}

export default function LoadingAnimation({ message = "로딩 중..." }: LoadingAnimationProps) {
  return (
    <div className="fixed inset-0 bg-amber-900 flex items-center justify-center z-50">
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-800 via-amber-900 to-amber-950"></div>

      <div className="relative z-10 text-center">
        {/* 위스키 따르는 장면 */}
        <div className="mb-8 relative mx-auto w-80 h-64">
          {/* SVG 위스키 병 */}
          <div className="absolute right-8 top-0 w-24 h-48 pouring-bottle">
            <svg width="96" height="192" viewBox="0 0 96 192" className="text-amber-800">
              {/* 병 몸체 */}
              <path d="M28 60 L28 170 C28 178 32 185 38 185 L58 185 C64 185 68 178 68 170 L68 60 Z"
                    fill="#2D1810" stroke="#1A0F08" strokeWidth="1"/>

              {/* 병 목 */}
              <rect x="38" y="25" width="20" height="35"
                    fill="#2D1810" stroke="#1A0F08" strokeWidth="1"/>

              {/* 병 목 입구 */}
              <ellipse cx="48" cy="25" rx="10" ry="3"
                       fill="#1A0F08" stroke="#0F0704" strokeWidth="1"/>

              {/* 코르크 */}
              <ellipse cx="48" cy="22" rx="8" ry="4"
                       fill="#8B4513" stroke="#654321" strokeWidth="1" className="cork"/>

              {/* 코르크 윗부분 */}
              <ellipse cx="48" cy="20" rx="6" ry="2"
                       fill="#A0522D" className="cork-top"/>

              {/* 병 어깨 */}
              <path d="M28 60 C28 52 32 45 38 40 L58 40 C64 45 68 52 68 60"
                    fill="#2D1810" stroke="#1A0F08" strokeWidth="1"/>

              {/* 라벨 */}
              <rect x="32" y="90" width="32" height="50" rx="4"
                    fill="#F5E6D3" stroke="#D4AF87" strokeWidth="1"
                    transform="rotate(8 48 115)"/>

              {/* Maltlog 텍스트 */}
              <text x="48" y="110" textAnchor="middle"
                    className="text-xs font-bold fill-amber-900"
                    transform="rotate(8 48 110)">Maltlog</text>

              {/* 병 하이라이트 */}
              <path d="M32 65 L32 165 C32 170 34 175 36 175"
                    fill="none" stroke="#4A2C17" strokeWidth="2" opacity="0.6"/>

              {/* 액체 (위스키) */}
              <path d="M30 160 L30 170 C30 176 33 180 38 180 L58 180 C63 180 66 176 66 170 L66 160 Z"
                    fill="#B8860B" opacity="0.8" className="bottle-liquid"/>
            </svg>

            {/* 코르크 빠지는 파티클 효과 */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 cork-particles">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-yellow-300 rounded-full opacity-0"
                  style={{
                    left: `${(i - 2) * 6}px`,
                    top: `${Math.sin(i) * 3}px`,
                    animationDelay: `${0.5 + i * 0.1}s`
                  }}
                />
              ))}
            </div>
          </div>

          {/* 왼쪽 글래스 */}
          <div className="absolute left-8 bottom-8 w-16 h-24 receiving-glass">
            <svg width="64" height="96" viewBox="0 0 64 96" className="text-amber-200">
              {/* 글렌케언 잔 모양 */}
              <path d="M12 88 L52 88 L48 48 C48 44 46 40 42 36 L40 32 L24 32 L22 36 C18 40 16 44 16 48 L12 88 Z"
                    fill="none" stroke="currentColor" strokeWidth="2"/>
              {/* 입구 */}
              <ellipse cx="32" cy="32" rx="8" ry="2"
                       fill="none" stroke="currentColor" strokeWidth="2"/>
              {/* 베이스 */}
              <ellipse cx="32" cy="88" rx="20" ry="4"
                       fill="none" stroke="currentColor" strokeWidth="2"/>

              {/* 채워지는 위스키 */}
              <path d="M14 86 L50 86 L47 52 C47 49 45 46 42 43 L40.5 41 L23.5 41 L22 43 C19 46 17 49 17 52 L14 86 Z"
                    fill="#B8860B" fillOpacity="0" className="filling-whisky"/>
            </svg>
          </div>

          {/* 위스키 액체 흐름 - 메인 스트림 */}
          <div className="whisky-stream absolute"
               style={{
                 left: '175px',
                 top: '45px',
                 width: '4px',
                 height: '0px',
                 background: 'linear-gradient(to bottom, #DAA520 0%, #B8860B 50%, #8B4513 100%)',
                 transformOrigin: 'top center',
                 borderRadius: '2px',
                 boxShadow: '0 0 6px rgba(218, 165, 32, 0.8), inset 0 0 2px rgba(255, 255, 255, 0.3)'
               }}>
          </div>

          {/* 위스키 방울들 - 개선된 효과 */}
          <div className="whisky-drops">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-amber-500 rounded-full opacity-0"
                style={{
                  left: `${175 + (Math.sin(i * 0.3) * 1.5)}px`,
                  top: `${50 + i * 12}px`,
                  width: `${2.5 - i * 0.15}px`,
                  height: `${2.5 - i * 0.15}px`,
                  animationDelay: `${1.2 + i * 0.06}s`,
                  filter: 'blur(0.1px)',
                  boxShadow: '0 0 3px rgba(218, 165, 32, 0.6)'
                }}
              />
            ))}
          </div>

          {/* 위스키 스플래시 효과 (잔에 떨어질 때) */}
          <div className="absolute left-12 bottom-12 w-8 h-2 opacity-0 splash-effect">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-amber-400 rounded-full"
                style={{
                  left: `${i * 3}px`,
                  animationDelay: `${2 + i * 0.1}s`
                }}
              />
            ))}
          </div>

          {/* 반짝이는 효과 */}
          <div className="absolute top-4 right-12 transform">
            <div className="animate-ping w-2 h-2 bg-yellow-300 rounded-full opacity-75"></div>
          </div>
        </div>

        {/* 로딩 텍스트 */}
        <div className="text-amber-100 text-lg font-medium mb-4">
          {message}
        </div>

        {/* 로딩 바 */}
        <div className="w-48 h-2 bg-amber-800 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-300 rounded-full animate-pulse">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-ping"></div>
          </div>
        </div>

        {/* 모래시계 모양 아이콘들 */}
        <div className="flex justify-center gap-6 mt-8 opacity-60">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="animate-bounce"
              style={{ animationDelay: `${i * 0.3}s` }}
            >
              <svg width="20" height="32" viewBox="0 0 20 32" className="text-amber-200">
                {/* 모래시계 모양 */}
                <path d="M2 2 L18 2 L18 8 L10 16 L18 24 L18 30 L2 30 L2 24 L10 16 L2 8 Z"
                      fill="none" stroke="currentColor" strokeWidth="1.5"/>
                {/* 모래 */}
                <path d="M4 4 L16 4 L16 7 L10 13 L16 19 L16 28 L4 28 L4 19 L10 13 L4 7 Z"
                      fill="currentColor" fillOpacity="0.4"/>
                {/* 떨어지는 모래 */}
                <circle cx="10" cy="16" r="0.5" fill="currentColor" className="falling-sand"/>
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}