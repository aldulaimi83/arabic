'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useUi } from './UiProvider';

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
  const { locale, setLocale } = useUi();
  const copy =
    locale === 'ar'
      ? {
          home: 'الرئيسية',
          alphabet: 'الحروف',
          recognition: 'التمييز',
          words: 'الكلمات',
          reading: 'القراءة',
          writing: 'الكتابة',
          start: 'ابدأ الدرس',
        }
      : {
          home: 'Home',
          alphabet: 'Alphabet',
          recognition: 'Recognition',
          words: 'Words',
          reading: 'Reading',
          writing: 'Writing',
          start: 'Start lesson',
        };
  const translatedLinks = [
    copy.home,
    copy.alphabet,
    copy.recognition,
    copy.words,
    copy.reading,
    copy.writing,
  ];

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
                {locale === 'ar' ? 'تعلم الحروف والكلمات والكتابة' : 'Learn letters, words, and writing'}
              </span>
            </div>
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-violet-50 hover:text-violet-700"
              >
                {translatedLinks[index]}
              </Link>
            ))}
            <div className="mx-1 flex rounded-full border border-slate-200 bg-white p-1 text-xs font-bold text-slate-600">
              <button
                onClick={() => setLocale('en')}
                className={`rounded-full px-3 py-2 ${locale === 'en' ? 'bg-violet-600 text-white' : ''}`}
              >
                EN
              </button>
              <button
                onClick={() => setLocale('ar')}
                className={`rounded-full px-3 py-2 ${locale === 'ar' ? 'bg-violet-600 text-white' : ''}`}
              >
                AR
              </button>
            </div>
            <Link
              href="/modules/1"
              className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 text-sm font-bold text-white shadow-lg hover:from-violet-700 hover:to-fuchsia-600"
            >
              {copy.start}
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
              <div className="mb-2 flex rounded-full border border-slate-200 bg-slate-50 p-1 text-xs font-bold text-slate-600">
                <button
                  onClick={() => setLocale('en')}
                  className={`flex-1 rounded-full px-3 py-2 ${locale === 'en' ? 'bg-violet-600 text-white' : ''}`}
                >
                  English
                </button>
                <button
                  onClick={() => setLocale('ar')}
                  className={`flex-1 rounded-full px-3 py-2 ${locale === 'ar' ? 'bg-violet-600 text-white' : ''}`}
                >
                  العربية
                </button>
              </div>
              {navLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-base font-semibold text-slate-700 hover:bg-violet-50 hover:text-violet-700"
                >
                  {translatedLinks[index]}
                </Link>
              ))}
              <Link
                href="/modules/1"
                onClick={() => setIsOpen(false)}
                className="mt-2 block rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-3 text-center font-bold text-white"
              >
                {copy.start}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
