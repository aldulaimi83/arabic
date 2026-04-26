import type { Metadata } from 'next';
import { Geist, Geist_Mono, Cairo } from 'next/font/google';
import './globals.css';
import Navigation from './components/Navigation';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const cairo = Cairo({
  variable: '--font-cairo',
  subsets: ['arabic', 'latin'],
});

export const metadata: Metadata = {
  title: 'Arabic Kids | Learn Arabic Letters, Reading, and Writing',
  description:
    'Mobile-friendly Arabic learning for kids abroad. Teach letters, recognition, words, reading, and guided writing practice in one structured site.',
  keywords:
    'Arabic learning for kids, Arabic alphabet, Arabic writing practice, learn Arabic abroad, Arabic reading lessons',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        <Navigation />
        <main className="flex-1">{children}</main>
        <footer className="mt-12 border-t border-white/60 bg-white/80 py-6 text-center text-sm font-medium text-slate-600 backdrop-blur-xl">
          <p>Arabic Kids • structured Arabic lessons for reading, recognition, and writing</p>
        </footer>
      </body>
    </html>
  );
}
