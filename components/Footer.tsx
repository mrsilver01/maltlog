'use client'

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

const CONTACT_EMAIL = "mrsilverr@naver.com";

export default function Footer() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      toast.success("이메일 주소를 복사했어요");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("복사에 실패했어요");
    }
  };

  return (
    <footer className="bg-[#2D1520] mt-12">
      <div className="container mx-auto px-6 py-4 text-center text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Maltlog. All rights reserved.</p>
        <div className="mt-2 flex items-center justify-center gap-3 flex-wrap">
          <Link href="/community/post/10" className="hover:text-amber-400 transition-colors">
            About
          </Link>
          <span className="text-gray-600">|</span>
          <button
            type="button"
            onClick={handleCopyEmail}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            {copied ? (
              <span className="text-amber-400">복사됨 ✓</span>
            ) : (
              <span>contact: {CONTACT_EMAIL}</span>
            )}
          </button>
        </div>
      </div>
    </footer>
  );
}
