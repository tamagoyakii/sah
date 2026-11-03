'use client';

import Image, { type ImageLoaderProps, type ImageProps } from 'next/image';

// Keep Next's responsive selection, while transforming once at Sanity's CDN.
function sanityLoader({ src, width, quality }: ImageLoaderProps) {
  const url = new URL(src);
  const sourceWidth = Number(url.searchParams.get('w'));
  const sourceHeight = Number(url.searchParams.get('h'));
  if (sourceWidth > 0 && sourceHeight > 0) {
    url.searchParams.set('h', String(Math.max(1, Math.round(width * sourceHeight / sourceWidth))));
  }
  url.searchParams.set('w', String(width));
  url.searchParams.set('q', String(quality ?? 75));
  url.searchParams.set('auto', 'format');
  url.searchParams.set('fit', 'max');
  return url.toString();
}

export default function SanityImage(props: Omit<ImageProps, 'loader'>) {
  return <Image {...props} loader={sanityLoader} />;
}
