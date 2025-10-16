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
      <head>
        <link
          rel="icon"
          href={`data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' ry='12' fill='%231e293b'/%3E%3Ctext x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-size='36' fill='%23f59e0b'%3EN%3C/text%3E%3C/svg%3E`}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
