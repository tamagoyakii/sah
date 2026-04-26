import { PortableText } from '@portabletext/react';
import { getAbout } from '@/sanity/lib/queries';

export default async function AboutPage() {
  const about = await getAbout();

  if (!about) {
    return (
      <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <p className='text-gray-600 text-center py-12'>
          sah coming soon.
        </p>
      </div>
    );
  }

  return (
    <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12'>
      <section className='space-y-4'>
        {/* 팀 이름 */}
        <h1 className='text-2xl'>{about.teamName}</h1>
        {/* 팀원들 */}
        {about.teamMembers && about.teamMembers.length > 0 && (
          <div className='text-sm space-y-1'>
            {about.teamMembers.map((member, index) => (
              <div key={index}>{`${member.name} (b.${member.birth})`}</div>
            ))}
          </div>
        )}
        {/* 팀 소개 */}
        {about.teamBio && (
          <div className='prose prose-lg max-w-none text-sm'>
            <PortableText value={about.teamBio} />
          </div>
        )}
      </section>

      {/* 전시 */}
      {(about.soloExhibitions?.length || about.groupExhibitions?.length) && (
        <section>
          <h2 className='text-lg font-bold mb-3'>exhibitions</h2>

          {/* Solo Exhibitions */}
          {about.soloExhibitions && about.soloExhibitions.length > 0 && (
            <div className='mb-8'>
              <h3 className='text-base mb-3'>solo</h3>
              <div className='text-sm space-y-1'>
                {about.soloExhibitions.map(
                  ({ year, title, venue, location }, index) => (
                    <div key={index}>
                      {`${year} ${title}, ${venue}${location ? `, ${location}` : ''}`}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Group Exhibitions */}
          {about.groupExhibitions && about.groupExhibitions.length > 0 && (
            <div>
              <h3 className='text-base mb-3'>group</h3>
              <div className='text-sm space-y-1'>
                {about.groupExhibitions.map(
                  ({ year, title, venue, location }, index) => (
                    <div key={index}>
                      {`${year} ${title}, ${venue}${location ? `, ${location}` : ''}`}
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* 연락처 */}
      {about.contact && (
        <section>
          <h2 className='text-lg font-bold mb-3'>contact</h2>
          <div className='text-sm space-y-1'>
            {about.contact.email && (
              <p>
                <span className='text-gray-600'>email: </span>
                <a
                  href={`mailto:${about.contact.email}`}
                  className='hover:opacity-60 transition-opacity'
                >
                  {about.contact.email}
                </a>
              </p>
            )}
            {about.contact.instagram && (
              <p>
                <span className='text-gray-600'>instagram: </span>
                <a
                  href={about.contact.instagram}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:opacity-60 transition-opacity'
                >
                  {about.contact.instagram}
                </a>
              </p>
            )}
            {about.contact.website && (
              <p>
                <span className='text-gray-600'>website: </span>
                <a
                  href={about.contact.website}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:opacity-60 transition-opacity'
                >
                  {about.contact.website}
                </a>
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
