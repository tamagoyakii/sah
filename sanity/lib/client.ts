import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Next.js caches server queries; revalidation must read the latest published data.
  useCdn: false,
})
