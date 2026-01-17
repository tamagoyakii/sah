'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path);
  };

  return (
    <nav className='fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 w-full'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16'>
        {/* Logo */}
        <Link
          href='/'
          className='text-2xl font-bold tracking-tight hover:opacity-60 transition-opacity'
        >
          sah
        </Link>

        {/* Menu */}
        <div className='flex gap-8'>
          <Link
            href='/works'
            className={`text-sm transition-opacity ${
              isActive('/works')
                ? 'opacity-100 font-medium'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            works
          </Link>
          <Link
            href='/about'
            className={`text-sm transition-opacity ${
              isActive('/about')
                ? 'opacity-100 font-medium'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            about
          </Link>
        </div>
      </div>
    </nav>
  );
}
