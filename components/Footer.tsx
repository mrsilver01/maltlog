'use client'

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white/50 border-t border-gray-200 mt-12">
      <div className="container mx-auto px-6 py-4 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Maltlog. All rights reserved.</p>
        <div className="mt-2">
          <Link href="/about" className="hover:text-amber-800 transition-colors">About</Link>
          <span className="mx-2">|</span>
          <Link href="/contact" className="hover:text-amber-800 transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
