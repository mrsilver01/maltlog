'use client'

import React, { useState } from 'react'

export default function DrawerSidebar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      {/* 서랍 손잡이 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-0 top-1/2 transform -translate-y-1/2 z-50 transition-all duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-2'
        }`}
        style={{ right: isOpen ? '320px' : '0px' }}
      >
        <div className="bg-gradient-to-b from-amber-800 to-amber-900 rounded-l-lg shadow-lg border-l border-t border-b border-amber-700">
          {/* 손잡이 디자인 */}
          <div className="px-3 py-8 flex flex-col items-center">
            <div className="w-1 h-8 bg-amber-600 rounded-full mb-2"></div>
            <div className="w-1 h-8 bg-amber-600 rounded-full"></div>
          </div>

          {/* 화살표 */}
          <div className="px-2 pb-2">
            <svg
              className={`w-4 h-4 text-amber-200 transition-transform duration-300 ${
                isOpen ? 'rotate-180' : ''
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
            </svg>
          </div>
        </div>
      </button>

      {/* 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 서랍장 본체 */}
      <div className={`fixed right-0 top-0 h-full w-80 bg-gradient-to-b from-amber-800 via-amber-900 to-amber-950 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>

        {/* 서랍장 테두리 효과 */}
        <div className="absolute inset-0 border-l-4 border-amber-700"></div>

        {/* 서랍장 내용 */}
        <div className="p-8 text-amber-100 h-full overflow-y-auto">
          {/* 제목 */}
          <div className="text-lg font-bold text-amber-200 mb-8 text-center border-b border-amber-700 pb-4">
            목록
          </div>

          {/* 지역별 섹션 */}
          <div className="mb-10">
            <div className="text-base font-bold text-amber-300 mb-6 flex items-center">
              <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
              지역별
            </div>
            <div className="space-y-3 text-sm pl-5">
              <div className="font-bold text-amber-200 hover:text-amber-100 cursor-pointer transition-colors py-1">
                SCOTCH
              </div>
              <div className="ml-4 space-y-2">
                <div className="text-amber-300 hover:text-amber-200 cursor-pointer transition-colors py-1">
                  SPEYSIDE
                </div>
                <div className="text-amber-300 hover:text-amber-200 cursor-pointer transition-colors py-1">
                  ISLAY
                </div>
                <div className="text-amber-300 hover:text-amber-200 cursor-pointer transition-colors py-1">
                  CAMBELTOWN
                </div>
              </div>
              <div className="font-bold text-amber-200 hover:text-amber-100 cursor-pointer transition-colors py-1">
                AMERICA
              </div>
              <div className="font-bold text-amber-200 hover:text-amber-100 cursor-pointer transition-colors py-1">
                IRISH
              </div>
              <div className="font-bold text-amber-200 hover:text-amber-100 cursor-pointer transition-colors py-1">
                AMERICAN
              </div>
              <div className="font-bold text-amber-200 hover:text-amber-100 cursor-pointer transition-colors py-1">
                JAPANESE
              </div>
              <div className="font-bold text-amber-200 hover:text-amber-100 cursor-pointer transition-colors py-1">
                KOREAN
              </div>
              <div className="font-bold text-amber-200 hover:text-amber-100 cursor-pointer transition-colors py-1">
                기타
              </div>
            </div>
          </div>

          {/* 종류 섹션 */}
          <div>
            <div className="text-base font-bold text-amber-300 mb-6 flex items-center">
              <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
              종류
            </div>
            <div className="space-y-3 text-sm pl-5">
              <div className="font-bold text-amber-200 hover:text-amber-100 cursor-pointer transition-colors py-1">
                AMERICAN BOURBON
              </div>
              <div className="font-bold text-amber-200 hover:text-amber-100 cursor-pointer transition-colors py-1">
                RYE
              </div>
              <div className="font-bold text-amber-200 hover:text-amber-100 cursor-pointer transition-colors py-1">
                PEATED
              </div>
              <div className="font-bold text-amber-200 hover:text-amber-100 cursor-pointer transition-colors py-1">
                SHERRY
              </div>
              <div className="font-bold text-amber-200 hover:text-amber-100 cursor-pointer transition-colors py-1">
                EUROPEAN BOURBON
              </div>
            </div>
          </div>

          {/* 서랍장 바닥 장식 */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-amber-950 to-transparent"></div>
        </div>
      </div>
    </div>
  )
}