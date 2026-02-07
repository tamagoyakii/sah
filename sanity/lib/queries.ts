import { client } from '@/sanity/lib/client';
import { About } from '@/types';

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

// About 정보 가져오기
export async function getAbout(): Promise<About | null> {
  return await client.fetch(aboutQuery);
}
