import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Trip Planner - Plan Your Perfect Trip in Sri Lanka',
  description: 'Discover attractions, book hotels, and explore routes easily. Your gateway to the pearl of the Indian Ocean.',
  keywords: 'Sri Lanka, trip planning, travel, hotels, attractions, tourism',
  authors: [{ name: 'Trip Planner Team' }],
  openGraph: {
    title: 'Trip Planner - Plan Your Perfect Trip in Sri Lanka',
    description: 'Discover attractions, book hotels, and explore routes easily.',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
