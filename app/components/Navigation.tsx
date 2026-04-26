'use client';

import Link from 'next/link';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/modules/1', label: 'Alphabet' },
  { href: '/modules/2', label: 'Recognition' },
  { href: '/modules/3', label: 'Words' },
  { href: '/modules/4', label: 'Reading' },
  { href: '/modules/5', label: 'Writing' },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/60 bg-white/80 text-slate-900 shadow-sm backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-2xl text-white shadow-lg">
              ا
            </span>
            <div>
              <span className="block text-lg font-extrabold sm:text-2xl">Arabic Kids</span>
              <span className="hidden text-xs font-medium text-slate-500 sm:block">
                Learn letters, words, and writing
              </span>
            </div>
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-violet-50 hover:text-violet-700"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/modules/1"
              className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 text-sm font-bold text-white shadow-lg hover:from-violet-700 hover:to-fuchsia-600"
            >
              Start lesson
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-2xl border border-slate-200 p-3 text-slate-700 hover:border-violet-200 hover:bg-violet-50 lg:hidden"
            aria-label="Toggle navigation"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {isOpen && (
          <div className="space-y-2 pb-5 lg:hidden">
            <div className="rounded-[1.5rem] border border-violet-100 bg-white p-3 shadow-lg">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-base font-semibold text-slate-700 hover:bg-violet-50 hover:text-violet-700"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/modules/1"
                onClick={() => setIsOpen(false)}
                className="mt-2 block rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-3 text-center font-bold text-white"
              >
                Start lesson
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
