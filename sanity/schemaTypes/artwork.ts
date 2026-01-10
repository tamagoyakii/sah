import { defineField, defineType } from 'sanity'

export const artworkType = defineType({
  name: 'artwork',
  title: 'Artwork',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
            },
          ],
        },
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: (rule) => rule.required().min(1900).max(new Date().getFullYear() + 1),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Painting', value: 'painting' },
          { title: 'Sculpture', value: 'sculpture' },
          { title: 'Installation', value: 'installation' },
          { title: 'Photography', value: 'photography' },
          { title: 'Digital', value: 'digital' },
          { title: 'Mixed Media', value: 'mixed-media' },
          { title: 'Other', value: 'other' },
        ],
      },
    }),
    defineField({
      name: 'medium',
      title: 'Medium',
      type: 'string',
      description: 'e.g., Oil on canvas, Bronze, etc.',
    }),
    defineField({
      name: 'dimensions',
      title: 'Dimensions',
      type: 'string',
      description: 'e.g., 100 x 80 cm',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Display this artwork on the homepage',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      year: 'year',
      media: 'images.0',
    },
    prepare(selection) {
      const { title, year, media } = selection
      return {
        title,
        subtitle: year ? `${year}` : 'No year',
        media,
      }
    },
  },
})
