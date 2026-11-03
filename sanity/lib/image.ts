import createImageUrlBuilder from '@sanity/image-url'
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

import { dataset, projectId } from '../env'

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({ projectId, dataset })

export const urlFor = (source: SanityImageSource) => {
  return builder.image(source)
}

// Sanity asset URLs include original dimensions; a rect changes the visible ratio.
export function getImageDimensions(src: string) {
  const url = new URL(src)
  const dimensions = url.pathname.match(/-(\d+)x(\d+)\.[a-zA-Z0-9]+$/)
  const rect = url.searchParams.get('rect')?.split(',').map(Number)
  if (rect?.length === 4 && rect.every(Number.isFinite) && rect[2] > 0 && rect[3] > 0) {
    return { width: rect[2], height: rect[3] }
  }
  if (dimensions) return { width: Number(dimensions[1]), height: Number(dimensions[2]) }
  return { width: 1200, height: 800 }
}
