import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'sah',
  description: 'Portfolio website for artist sah',
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
