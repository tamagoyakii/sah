import { getAbout } from '@/sanity/lib/queries';

export default async function Footer() {
  const about = await getAbout();

  return (
    <footer>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12'>
        <div className='text-xs text-gray-500 text-center'>
          © {new Date().getFullYear()} {about?.teamName || 's.a.h'}. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
