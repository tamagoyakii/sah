import { client } from '@/sanity/lib/client';
import { Artwork, About } from '@/types';

const aboutQuery = `*[_type == "about"][0] {
  _id,
  teamName,
  teamBio,
  teamMembers,
  contact,
  "soloExhibitions": exhibitions[type == "solo"] | order(year desc),
  "groupExhibitions": exhibitions[type == "group"] | order(year desc),
  awards[] | order(year desc)
}`;

// GROQ 쿼리들
const artworkQuery = `*[_type == "artwork"] | order(date desc, _createdAt desc) {
  _id,
  _createdAt,
  title,
  slug,
  images,
  date,
  category,
  medium,
  dimensions,
  description,
  featured
}`;

const artworkBySlugQuery = `*[_type == "artwork" && slug.current == $slug][0] {
  _id,
  _createdAt,
  title,
  slug,
  images,
  date,
  category,
  medium,
  dimensions,
  description,
  featured
}`;

const revalidate = 60;

// About 정보 가져오기
export async function getAbout(): Promise<About | null> {
  return await client.fetch(aboutQuery, {}, { next: { revalidate } });
}

// 모든 작품 가져오기
export async function getArtworks(): Promise<Artwork[]> {
  return await client.fetch(artworkQuery, {}, { next: { revalidate } });
}

// slug로 작품 하나 가져오기
export async function getArtworkBySlug(slug: string): Promise<Artwork | null> {
  return await client.fetch(
    artworkBySlugQuery,
    { slug },
    { next: { revalidate } },
  );
}
