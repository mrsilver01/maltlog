'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface LoadingAnimationProps {
  message?: string
}

export default function LoadingAnimation({ message = "데이터를 불러오는 중..." }: LoadingAnimationProps) {
  const bottleVariants = {
    animate: {
      rotate: [0, 0, 90],
      x: [0, 0, 70],
      y: [0, 0, 40],
      transition: {
        duration: 1,
        times: [0, 0.3, 1],
        ease: [0.4, 0, 0.2, 1],
        repeat: Infinity,
        repeatDelay: 0.5,
      },
    },
  }

  const bottleCorkVariants = {
    animate: {
      opacity: [1, 1, 0, 0],
      transition: {
        duration: 1,
        times: [0, 0.49, 0.5, 1],
        ease: "linear",
        repeat: Infinity,
        repeatDelay: 0.5,
      },
    },
  }

  const flyingCorkVariants = {
    animate: {
      x: [0, 0, -80],
      y: [0, 0, -60],
      rotate: [0, 0, -120],
      opacity: [0, 0, 1, 1, 0],
      transition: {
        duration: 1,
        times: [0, 0.49, 0.5, 0.85, 1],
        ease: [0, 0, 0.2, 1],
        repeat: Infinity,
        repeatDelay: 0.5,
      },
    },
  }

  return (
    <div className="fixed inset-0 bg-amber-900 flex items-center justify-center z-50">
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-800 via-amber-900 to-amber-950"></div>

      <div className="relative z-10 text-center">
        {/* 위스키 병 애니메이션 */}
        <div className="mb-8 relative mx-auto">
          <motion.svg
            width="100"
            height="220"
            viewBox="0 0 100 220"
            animate="animate"
            variants={bottleVariants}
            style={{ transformOrigin: "50px 110px" }}
          >
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
              {/* 병 본체 */}
              <rect x="32" y="70" width="36" height="130" rx="3" fill="url(#glassGradient)" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5"/>
              <path d="M 32 70 Q 32 60 38 55 L 62 55 Q 68 60 68 70" fill="url(#glassGradient)" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5"/>

              {/* 병목 */}
              <rect x="43" y="25" width="14" height="30" fill="url(#glassGradient)" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5"/>
              <ellipse cx="50" cy="25" rx="7" ry="2.5" fill="rgba(0, 0, 0, 0.2)" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1"/>

              {/* 위스키 액체 */}
              <rect
                x="34"
                y="155"
                width="32"
                height="43"
                rx="2"
                fill="url(#whiskyGradient)"
                opacity="0.85"
              />

              {/* 라벨 */}
              <g transform="translate(50, 125)">
                <rect x="-18" y="-15" width="36" height="30" rx="2" fill="#F5F5DC" stroke="#D4AF87" strokeWidth="1"/>
                <text x="0" y="-2" textAnchor="middle" fontSize="11" fontWeight="800" fill="#2D1810" fontFamily="system-ui, sans-serif">Maltlog</text>
                <text x="0" y="7" textAnchor="middle" fontSize="6" fontWeight="500" fill="#5D4E37" fontFamily="system-ui, sans-serif">SINGLE MALT</text>
              </g>

              {/* 하이라이트 */}
              <path d="M 36 75 L 36 195" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="2" opacity="0.5" strokeLinecap="round"/>

              {/* 코르크 - 병에서 사라짐 */}
              <motion.g animate="animate" variants={bottleCorkVariants}>
                <ellipse cx="50" cy="18" rx="8" ry="4" fill="#8B4513" stroke="#654321" strokeWidth="1"/>
                <ellipse cx="50" cy="15" rx="8" ry="2.5" fill="#A0522D"/>
                <ellipse cx="50" cy="13" rx="6" ry="1.5" fill="#CD853F"/>
              </motion.g>
            </g>
          </motion.svg>

          {/* 날아가는 코르크 */}
          <motion.div
            className="absolute top-4 left-12"
            animate="animate"
            variants={flyingCorkVariants}
          >
            <svg width="16" height="8" viewBox="0 0 16 8">
              <ellipse cx="8" cy="4" rx="8" ry="4" fill="#8B4513" stroke="#654321" strokeWidth="1"/>
              <ellipse cx="8" cy="2" rx="8" ry="2.5" fill="#A0522D"/>
              <ellipse cx="8" cy="1" rx="6" ry="1.5" fill="#CD853F"/>
            </svg>
          </motion.div>
        </div>

        {/* 로딩 텍스트 */}
        <div className="text-amber-100 text-lg font-medium mb-4 tracking-wider animate-pulse">
          {message}
        </div>

        {/* 로딩 바 */}
        <div className="w-56 h-2 bg-black/20 rounded-full overflow-hidden mx-auto border border-black/30">
          <div className="h-full w-full bg-gradient-to-r from-yellow-600 via-amber-400 to-yellow-600 rounded-full relative">
            <motion.div
              className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent"
              animate={{ x: ["-100%", "200%"] }}
              transition={{
                duration: 1.5,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}