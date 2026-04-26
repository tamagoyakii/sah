import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center'>
      <h1 className='text-6xl font-bold mb-4'>404</h1>
      <p className='text-gray-600 mb-8'>page not found.</p>
      <Link
        href='/'
        className='text-sm underline underline-offset-4 hover:opacity-60 transition-opacity'
      >
        back to home
      </Link>
    </div>
  );
}
