import { notFound } from 'next/navigation';
import { getArtworkBySlug } from '@/sanity/lib/queries';
import { urlFor } from '@/sanity/lib/image';

export default async function ArtworkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);

  if (!artwork) {
    notFound();
  }

  return (
    <div className='min-h-screen'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12'>
        {/* 상단: 제목과 캡션 */}
        <div>
          <h1 className='text-4xl font-bold mb-2'>{artwork.title}</h1>

          {/* 캡션 */}
          <div className='text-sm text-gray-600'>
            {`${artwork.year} ${artwork.category} ${artwork.medium} ${artwork.dimensions}`}
          </div>
        </div>

        {/* 하단: 이미지들 */}
        <div className='flex flex-wrap gap-6 items-center'>
          {artwork.images
            ?.filter((image) => image.asset?._ref)
            .map((image, index) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={index}
                src={urlFor(image).quality(90).url()}
                alt={image.alt || `${artwork.title} - ${index + 1}`}
                className='max-w-5xl'
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            ))}
        </div>

        {/* 설명 */}
        {artwork.description && (
          <div className='text-sm leading-relaxed max-w-3xl break-words'>
            {artwork.description}
          </div>
        )}
      </div>
    </div>
  );
}
