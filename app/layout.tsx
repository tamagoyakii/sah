import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'sah',
    template: '%s | sah',
  },
  description: 'sah — sculpture and installation art',
  keywords: [
    'sah',
    'sculpture',
    'installation art',
    'contemporary art',
    'artist',
    'exhibition',
    '조각',
    '설치미술',
    '현대미술',
    '작가',
    '전시',
    'artwork',
    'portfolio',
    'fine art',
    'mixed media',
    'art gallery',
  ],
  authors: [{ name: 'sah' }],
  creator: 'sah',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: 'sah',
    title: 'sah',
    description: 'sah — sculpture and installation art',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'sah',
    description: 'sah — sculpture and installation art',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ko'>
      <body className='flex flex-col min-h-screen'>
        <Navigation />
        <main className='pt-16 flex-1'>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
