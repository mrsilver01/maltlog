'use client'

import React from 'react'

interface LoadingAnimationProps {
  message?: string
}

export default function LoadingAnimation({ message = "데이터를 불러오는 중..." }: LoadingAnimationProps) {
  return (
    <div className="fixed inset-0 bg-amber-900 flex items-center justify-center z-50">
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-800 via-amber-900 to-amber-950"></div>

      {/* [개선] 지속형 애니메이션을 위한 CSS */ }
      <style jsx>{`
        /* [개선] 전체 컨테이너가 부드럽게 위아래로 움직이는 애니메이션 */
        @keyframes gentle-bob {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        /* [개선] 병 안의 위스키가 출렁이는 애니메이션 */
        @keyframes whisky-slosh {
          0%, 100% {
            transform: skewX(0deg) translateX(0);
            height: 43px;
          }
          50% {
            transform: skewX(-3deg) translateX(1px);
            height: 45px;
          }
        }
        
        /* [개선] 로딩 바가 부드럽게 채워지는 애니메이션 */
        @keyframes loading-bar-fill {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(100%);
          }
        }

        .container-bob {
          animation: gentle-bob 3s ease-in-out infinite;
        }

        .whisky-liquid {
          transform-origin: bottom center;
          animation: whisky-slosh 3s ease-in-out infinite;
        }

        .loading-bar-shine {
          animation: loading-bar-fill 1.5s ease-in-out infinite;
        }
      `}</style>

      <div className="relative z-10 text-center container-bob">
        {/* 위스키 병 SVG */}
        <div className="mb-8 relative mx-auto">
          <svg width="100" height="220" viewBox="0 0 100 220">
            <defs>
              <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.05)" />
                <stop offset="50%" stopColor="rgba(255, 255, 255, 0.15)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
              </linearGradient>
              <linearGradient id="whiskyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#9B7314" />
                <stop offset="50%" stopColor="#C8960B" />
                <stop offset="100%" stopColor="#9B7314" />
              </linearGradient>
            </defs>
            <g>
              <rect x="32" y="70" width="36" height="130" rx="3" fill="url(#glassGradient)" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5"/>
              <path d="M 32 70 Q 32 60 38 55 L 62 55 Q 68 60 68 70" fill="url(#glassGradient)" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5"/>
              <rect x="43" y="25" width="14" height="30" fill="url(#glassGradient)" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5"/>
              <ellipse cx="50" cy="25" rx="7" ry="2.5" fill="rgba(0, 0, 0, 0.2)" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1"/>
              
              {/* [개선] 출렁이는 애니메이션을 위한 클래스 추가 */}
              <rect className="whisky-liquid" x="34" y="155" width="32" height="43" rx="2" fill="url(#whiskyGradient)" opacity="0.85"/>
              
              <g transform="translate(50, 125)">
                <rect x="-18" y="-15" width="36" height="30" rx="2" fill="#F5F5DC" stroke="#D4AF87" strokeWidth="1"/>
                <text x="0" y="-2" textAnchor="middle" fontSize="11" fontWeight="800" fill="#2D1810" fontFamily="system-ui, sans-serif">Maltlog</text>
                <text x="0" y="7" textAnchor="middle" fontSize="6" fontWeight="500" fill="#5D4E37" fontFamily="system-ui, sans-serif">SINGLE MALT</text>
              </g>
              <path d="M 36 75 L 36 195" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="2" opacity="0.5" strokeLinecap="round"/>
              <ellipse cx="50" cy="18" rx="8" ry="4" fill="#8B4513" stroke="#654321" strokeWidth="1"/>
              <ellipse cx="50" cy="15" rx="8" ry="2.5" fill="#A0522D"/>
              <ellipse cx="50" cy="13" rx="6" ry="1.5" fill="#CD853F"/>
            </g>
          </svg>
        </div>

        {/* 로딩 텍스트 */}
        <div className="text-amber-100 text-lg font-medium mb-4 tracking-wider animate-pulse">
          {message}
        </div>

        {/* 로딩 바 */}
        <div className="w-56 h-2 bg-black/20 rounded-full overflow-hidden mx-auto border border-black/30">
          <div className="h-full w-full bg-gradient-to-r from-yellow-600 via-amber-400 to-yellow-600 rounded-full relative">
            <div className="loading-bar-shine absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
