import { defineField, defineType } from 'sanity';

export const aboutType = defineType({
  name: 'about',
  title: 'About',
  type: 'document',
  fields: [
    defineField({
      name: 'teamName',
      title: 'Team Name',
      type: 'string',
      initialValue: 's.a.h',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'teamBio',
      title: 'Team Biography',
      type: 'array',
      of: [{ type: 'block' }],
      description: '팀 소개',
    }),
    defineField({
      name: 'teamMembers',
      title: 'Team Members',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (rule) => rule.required(),
            },
            {
              name: 'birth',
              title: 'Birth Year',
              type: 'number',
              description: '출생년도',
              validation: (rule) =>
                rule.min(1900).max(new Date().getFullYear()),
            },
          ],
          preview: {
            select: {
              title: 'name',
            },
          },
        },
      ],
      validation: (rule) => rule.max(2),
    }),
    defineField({
      name: 'contact',
      title: 'Contact Information',
      type: 'object',
      fields: [
        {
          name: 'email',
          title: 'Email',
          type: 'string',
          validation: (rule) => rule.email(),
        },
        {
          name: 'website',
          title: 'Website',
          type: 'url',
        },
        {
          name: 'instagram',
          title: 'Instagram',
          type: 'url',
        },
      ],
    }),
    defineField({
      name: 'exhibitions',
      title: 'Exhibitions',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'year',
              title: 'Year',
              type: 'number',
            },
            {
              name: 'title',
              title: 'Exhibition Title',
              type: 'string',
            },
            {
              name: 'venue',
              title: 'Venue',
              type: 'string',
            },
            {
              name: 'location',
              title: 'Location',
              type: 'string',
            },
            {
              name: 'type',
              title: 'Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Solo', value: 'solo' },
                  { title: 'Group', value: 'group' },
                ],
              },
            },
          ],
          preview: {
            select: {
              title: 'title',
              year: 'year',
              venue: 'venue',
            },
            prepare(selection) {
              const { title, year, venue } = selection;
              return {
                title,
                subtitle: `${year} - ${venue}`,
              };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'teamName',
    },
  },
});
