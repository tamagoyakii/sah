import { type SchemaTypeDefinition } from 'sanity'
import { artworkType } from './artwork'
import { aboutType } from './about'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [artworkType, aboutType],
}
