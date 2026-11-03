import type { Metadata } from 'next';
import SanityImage from '@/components/SanityImage';
import { notFound } from 'next/navigation';
import { getArtworkBySlug } from '@/sanity/lib/queries';
import { urlFor, getImageDimensions } from '@/sanity/lib/image';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);

  if (!artwork) return {};

  const image = artwork.images?.find((image) => image.asset?._ref);
  const year = artwork.date?.slice(0, 4);
  const description = [
    year,
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
      images: image
        ? [{ url: urlFor(image).width(1200).height(630).url() }]
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
            {`${artwork.date.slice(0, 4)} ${artwork.category} ${artwork.medium} ${artwork.dimensions}`}
          </p>
        </header>

        <section
          aria-label='artwork images'
          className='flex flex-wrap gap-6 items-center'
        >
          {artwork.images
            ?.filter((image) => image.asset?._ref)
            .map((image, index) => {
              const src = urlFor(image).url();
              const dimensions = getImageDimensions(src);
              return <SanityImage
                key={index}
                src={src}
                alt={image.alt || `${artwork.title} - ${index + 1}`}
                width={dimensions.width}
                height={dimensions.height}
                className='max-w-5xl w-full h-auto'
                preload={index === 0}
                fetchPriority={index === 0 ? 'high' : undefined}
                placeholder={image.lqip ? 'blur' : 'empty'}
                blurDataURL={image.lqip || undefined}
                sizes='(min-width: 1088px) 1024px, (min-width: 1024px) calc(100vw - 64px), (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)'
              />;
            })}
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
