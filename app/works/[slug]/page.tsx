import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getArtworkBySlug } from '@/sanity/lib/queries';
import { urlFor } from '@/sanity/lib/image';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);

  if (!artwork) return {};

  const description = [
    artwork.year,
    artwork.category,
    artwork.medium,
    artwork.dimensions,
  ]
    .filter(Boolean)
    .join(', ');

  return {
    title: artwork.title,
    description: `${artwork.title} — ${description}`,
    openGraph: {
      title: `${artwork.title} | sah`,
      description,
      images: artwork.images?.[0]
        ? [{ url: urlFor(artwork.images[0]).width(1200).height(630).url() }]
        : undefined,
    },
  };
}

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
    <article className='min-h-screen'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12'>
        <header>
          <h1 className='text-4xl font-bold mb-2'>{artwork.title}</h1>
          <p className='text-sm text-gray-600'>
            {`${artwork.year} ${artwork.category} ${artwork.medium} ${artwork.dimensions}`}
          </p>
        </header>

        <section
          aria-label='artwork images'
          className='flex flex-wrap gap-6 items-center'
        >
          {artwork.images
            ?.filter((image) => image.asset?._ref)
            .map((image, index) => (
              <Image
                key={index}
                src={urlFor(image).quality(90).url()}
                alt={image.alt || `${artwork.title} - ${index + 1}`}
                width={1200}
                height={800}
                className='max-w-5xl w-full h-auto'
                priority={index === 0}
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1024px'
              />
            ))}
        </section>

        {artwork.description && (
          <section
            aria-label='artwork description'
            className='text-sm leading-relaxed max-w-3xl wrap-break-word whitespace-pre-line'
          >
            {artwork.description}
          </section>
        )}
      </div>
    </article>
  );
}
