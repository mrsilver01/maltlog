'use client'

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

const INSTAGRAM_URL = "https://instagram.com/malt.log";

export default function Footer() {
  const [copied, setCopied] = useState(false);

  const handleCopyInstagram = async () => {
    try {
      await navigator.clipboard.writeText(INSTAGRAM_URL);
      setCopied(true);
      toast.success("인스타그램 주소를 복사했어요");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("복사에 실패했어요");
    }
  };

  return (
    <footer className="bg-white/50 border-t border-gray-200 mt-12">
      <div className="container mx-auto px-6 py-4 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Maltlog. All rights reserved.</p>
        <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
          <Link href="/about" className="hover:text-amber-800 transition-colors">About</Link>
          <span>|</span>
          <Link href="/contact" className="hover:text-amber-800 transition-colors">Contact</Link>
          <span>|</span>

          {/* 인스타그램 링크 */}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Maltlog 인스타그램 (@malt.log)"
            className="inline-flex items-center gap-1.5 hover:text-amber-800 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            <span>@malt.log</span>
          </a>

          {/* 인스타그램 URL 복사 버튼 */}
          <button
            type="button"
            onClick={handleCopyInstagram}
            aria-label="인스타그램 주소 복사"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-gray-300 text-gray-500 hover:text-amber-800 hover:border-amber-800 transition-colors text-xs"
          >
            {copied ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3 h-3"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                복사됨
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3 h-3"
                  aria-hidden="true"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                URL 복사
              </>
            )}
          </button>
        </div>
      </div>
    </footer>
  );
}
