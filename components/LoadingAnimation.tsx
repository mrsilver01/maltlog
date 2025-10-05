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

      {/* CSS 애니메이션 */}
      <style jsx>{`
        @keyframes bottle-fall {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
          }
          15% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
          }
          45% {
            transform: translate(8px, 80px) rotate(25deg);
            opacity: 1;
          }
          70% {
            transform: translate(18px, 150px) rotate(60deg);
            opacity: 1;
          }
          85% {
            transform: translate(25px, 200px) rotate(80deg);
            opacity: 1;
          }
          95% {
            transform: translate(30px, 230px) rotate(90deg);
            opacity: 1;
          }
          100% {
            transform: translate(30px, 240px) rotate(90deg);
            opacity: 1;
          }
        }

        @keyframes cork-pop {
          0%, 84% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
          }
          85% {
            transform: translate(-5px, -8px) rotate(-15deg);
            opacity: 1;
          }
          87% {
            transform: translate(-15px, -20px) rotate(-30deg);
            opacity: 1;
          }
          90% {
            transform: translate(-35px, -45px) rotate(-75deg);
            opacity: 0.9;
          }
          94% {
            transform: translate(-65px, -80px) rotate(-150deg);
            opacity: 0.7;
          }
          97% {
            transform: translate(-100px, -120px) rotate(-240deg);
            opacity: 0.4;
          }
          100% {
            transform: translate(-140px, -160px) rotate(-360deg);
            opacity: 0;
          }
        }

        @keyframes impact-shake {
          84%, 86% {
            transform: translate(30px, 240px) rotate(90deg);
          }
          85% {
            transform: translate(32px, 242px) rotate(92deg);
          }
          87%, 100% {
            transform: translate(30px, 240px) rotate(90deg);
          }
        }

        .bottle-container {
          animation: bottle-fall 2.5s ease-in-out forwards, impact-shake 2.5s ease-out forwards;
        }

        .cork {
          animation: cork-pop 2.5s ease-out forwards;
        }

        .impact-splash {
          animation: splash-effect 2.5s ease-out forwards;
        }

        @keyframes splash-effect {
          0%, 84% {
            opacity: 0;
            transform: scale(0);
          }
          85% {
            opacity: 0.8;
            transform: scale(0.5);
          }
          88% {
            opacity: 0.6;
            transform: scale(1.2);
          }
          92% {
            opacity: 0.3;
            transform: scale(1.8);
          }
          100% {
            opacity: 0;
            transform: scale(2.5);
          }
        }
      `}</style>

      <div className="relative z-10 text-center">
        {/* 위스키 병 애니메이션 */}
        <div className="mb-8 relative mx-auto w-96 h-80">
          {/* 병 컨테이너 */}
          <div className="bottle-container absolute left-1/2 top-12 -translate-x-1/2" 
               style={{ transformOrigin: 'center center' }}>
            <svg width="100" height="220" viewBox="0 0 100 220">
              <defs>
                {/* 심플한 유리 그라데이션 */}
                <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.05)" />
                  <stop offset="50%" stopColor="rgba(255, 255, 255, 0.15)" />
                  <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
                </linearGradient>
                
                {/* 위스키 그라데이션 */}
                <linearGradient id="whiskyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#9B7314" />
                  <stop offset="50%" stopColor="#C8960B" />
                  <stop offset="100%" stopColor="#9B7314" />
                </linearGradient>
              </defs>
              
              {/* 병 몸체 */}
              <rect x="32" y="70" width="36" height="130" rx="3" 
                    fill="url(#glassGradient)" 
                    stroke="rgba(255, 255, 255, 0.25)" 
                    strokeWidth="1.5"/>
              
              {/* 병 어깨 */}
              <path d="M 32 70 Q 32 60 38 55 L 62 55 Q 68 60 68 70" 
                    fill="url(#glassGradient)" 
                    stroke="rgba(255, 255, 255, 0.25)" 
                    strokeWidth="1.5"/>
              
              {/* 병 목 */}
              <rect x="43" y="25" width="14" height="30" 
                    fill="url(#glassGradient)" 
                    stroke="rgba(255, 255, 255, 0.25)" 
                    strokeWidth="1.5"/>
              
              {/* 병 입구 */}
              <ellipse cx="50" cy="25" rx="7" ry="2.5" 
                       fill="rgba(0, 0, 0, 0.2)" 
                       stroke="rgba(255, 255, 255, 0.3)" 
                       strokeWidth="1"/>
              
              {/* 내부 위스키 액체 */}
              <rect x="34" y="155" width="32" height="43" rx="2" 
                    fill="url(#whiskyGradient)" 
                    opacity="0.85"/>
              
              {/* Maltlog 라벨 */}
              <g transform="translate(50, 125)">
                {/* 라벨 배경 */}
                <rect x="-18" y="-15" width="36" height="30" rx="2" 
                      fill="#F5F5DC" 
                      stroke="#D4AF87" 
                      strokeWidth="1"/>
                
                {/* Maltlog 텍스트 */}
                <text x="0" y="-2" 
                      textAnchor="middle" 
                      fontSize="11" 
                      fontWeight="800" 
                      fill="#2D1810" 
                      fontFamily="system-ui, sans-serif">
                  Maltlog
                </text>
                
                {/* Single Malt 서브텍스트 */}
                <text x="0" y="7" 
                      textAnchor="middle" 
                      fontSize="6" 
                      fontWeight="500" 
                      fill="#5D4E37"
                      fontFamily="system-ui, sans-serif">
                  SINGLE MALT
                </text>
              </g>
              
              {/* 심플한 하이라이트 */}
              <path d="M 36 75 L 36 195" 
                    stroke="rgba(255, 255, 255, 0.4)" 
                    strokeWidth="2" 
                    opacity="0.5" 
                    strokeLinecap="round"/>
            </svg>

            {/* 코르크 */}
            <div className="cork absolute top-4 left-1/2 -translate-x-1/2" 
                 style={{ transformOrigin: 'center center' }}>
              <svg width="20" height="18" viewBox="0 0 20 18">
                {/* 코르크 메인 */}
                <ellipse cx="10" cy="10" rx="8" ry="5" 
                         fill="#8B4513" 
                         stroke="#654321" 
                         strokeWidth="1"/>
                {/* 코르크 상단 */}
                <ellipse cx="10" cy="7" rx="8" ry="2.5" 
                         fill="#A0522D"/>
                {/* 코르크 윗면 */}
                <ellipse cx="10" cy="5" rx="6" ry="1.5" 
                         fill="#CD853F"/>
              </svg>
            </div>
          </div>

          {/* 충격 효과 */}
          <div className="impact-splash absolute bottom-16 left-1/2 -translate-x-1/2">
            <div className="w-4 h-4 bg-amber-300/60 rounded-full blur-sm"></div>
          </div>
          <div className="impact-splash absolute bottom-14 left-1/2 -translate-x-1/2" style={{ animationDelay: '0.1s' }}>
            <div className="w-6 h-2 bg-amber-200/40 rounded-full blur-md"></div>
          </div>

          {/* 반짝임 효과 */}
          <div className="absolute top-16 left-1/2 -translate-x-6">
            <div className="animate-ping w-2 h-2 bg-yellow-300 rounded-full opacity-60"></div>
          </div>
          <div className="absolute top-20 left-1/2 translate-x-4">
            <div className="animate-ping w-1.5 h-1.5 bg-amber-200 rounded-full opacity-50" 
                 style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>

        {/* 로딩 텍스트 */}
        <div className="text-amber-100 text-lg font-medium mb-4 tracking-wide">
          {message}
        </div>

        {/* 로딩 바 */}
        <div className="w-56 h-2.5 bg-amber-950/50 rounded-full overflow-hidden mx-auto border border-amber-800/30">
          <div className="h-full bg-gradient-to-r from-yellow-600 via-amber-400 to-yellow-600 rounded-full animate-pulse">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-pulse"></div>
          </div>
        </div>

        {/* 모래시계들 */}
        <div className="flex justify-center gap-6 mt-8 opacity-50">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              <svg width="22" height="34" viewBox="0 0 22 34" className="text-amber-300/80">
                <path d="M 3 2 L 19 2 L 19 9 L 11 17 L 19 25 L 19 32 L 3 32 L 3 25 L 11 17 L 3 9 Z"
                      fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M 5 4 L 17 4 L 17 8 L 11 14 L 17 20 L 17 30 L 5 30 L 5 20 L 11 14 L 5 8 Z"
                      fill="currentColor" fillOpacity="0.3"/>
                <circle cx="11" cy="17" r="0.8" fill="currentColor"/>
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}