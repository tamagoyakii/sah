'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center'>
      <h1 className='text-2xl font-bold mb-4'>something went wrong</h1>
      <p className='text-gray-600 mb-8'>please try again later.</p>
      <button
        onClick={reset}
        className='text-sm underline underline-offset-4 hover:opacity-60 transition-opacity'
      >
        try again
      </button>
    </div>
  );
}
