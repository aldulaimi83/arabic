import type { Metadata } from "next";
import { Geist, Geist_Mono, Cairo } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "Arabic Kids - Learn Arabic Reading & Writing",
  description: "Interactive Arabic learning for kids abroad. Learn to read and write Arabic with colorful lessons, games, and audio pronunciation.",
  keywords: "Arabic learning, kids education, Arabic alphabet, reading, writing",
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
        <footer className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-6 mt-12">
          <p>© 2024 Arabic Kids - Learning Made Fun! 🌟</p>
        </footer>
      </body>
    </html>
  );
}
