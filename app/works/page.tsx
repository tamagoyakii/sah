import Link from 'next/link';
import Image from 'next/image';
import { getArtworks } from '@/sanity/lib/queries';
import { urlFor } from '@/sanity/lib/image';

export default async function WorksPage() {
  const artworks = await getArtworks();

  if (artworks.length === 0) {
    return (
      <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <p className='text-gray-600 text-center py-12'>
          No artworks available. Please add them in the Studio.
        </p>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {artworks.map((artwork) => (
          <Link
            key={artwork._id}
            href={`/works/${artwork.slug.current}`}
            className='group relative aspect-square overflow-hidden bg-gray-100'
          >
            {/* 작품 이미지 */}
            {artwork.images && artwork.images[0] && (
              <Image
                src={urlFor(artwork.images[0]).width(800).height(800).url()}
                alt={artwork.images[0].alt || artwork.title}
                fill
                className='object-cover transition-all duration-300 group-hover:opacity-30'
              />
            )}

            {/* Hover 오버레이 */}
            <div className='absolute inset-0 flex flex-col justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
              <h2 className='text-sm font-bold'>{artwork.title}</h2>
              <div className='text-sm'>
                <p>{artwork.year}</p>
                {artwork.category && (
                  <p className='capitalize'>{artwork.category}</p>
                )}
                {artwork.medium && <p>{artwork.medium}</p>}
                {artwork.dimensions && <p>{artwork.dimensions}</p>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
