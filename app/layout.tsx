/**
 * Root layout component for the News Report Generator application.
 *
 * Configures global styles, fonts, and metadata for the entire application.
 * Uses Inter font from Google Fonts for a modern, clean look.
 *
 * @component
 */
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NewsForge AI',
  description: 'AI-powered news aggregation and intelligent reporting',
};

/**
 * Root layout that wraps all pages in the application.
 *
 * @param props - Component props
 * @param props.children - Child components to render
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
