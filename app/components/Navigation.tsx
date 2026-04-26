'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-4xl">🌟</span>
            <span className="font-bold text-2xl hidden sm:inline">Arabic Kids</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8">
            <Link href="/" className="hover:text-yellow-200 transition">
              Home
            </Link>
            <Link href="/modules/1" className="hover:text-yellow-200 transition">
              Alphabet
            </Link>
            <Link href="/modules/2" className="hover:text-yellow-200 transition">
              Recognition
            </Link>
            <Link href="/modules/3" className="hover:text-yellow-200 transition">
              Words
            </Link>
            <Link href="/modules/4" className="hover:text-yellow-200 transition">
              Reading
            </Link>
            <Link href="/modules/5" className="hover:text-yellow-200 transition">
              Writing
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href="/"
              className="block px-4 py-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition"
            >
              Home
            </Link>
            <Link
              href="/modules/1"
              className="block px-4 py-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition"
            >
              Alphabet
            </Link>
            <Link
              href="/modules/2"
              className="block px-4 py-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition"
            >
              Recognition
            </Link>
            <Link
              href="/modules/3"
              className="block px-4 py-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition"
            >
              Words
            </Link>
            <Link
              href="/modules/4"
              className="block px-4 py-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition"
            >
              Reading
            </Link>
            <Link
              href="/modules/5"
              className="block px-4 py-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition"
            >
              Writing
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
