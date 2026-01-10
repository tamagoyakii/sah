export interface Artwork {
  _id: string;
  _createdAt: string;
  title: string;
  slug: {
    current: string;
  };
  images: Array<{
    asset: {
      _ref: string;
      _type: string;
    };
    alt?: string;
  }>;
  year: number;
  category?: string;
  medium?: string;
  dimensions?: string;
  description?: string;
  featured?: boolean;
}

export interface TeamMember {
  name: string;
  birth: number;
}

export interface Exhibition {
  year: number;
  title: string;
  venue: string;
  location?: string;
  type?: 'solo' | 'group';
}

export interface About {
  _id: string;
  teamName: string;
  teamBio?: any[]; // Portable Text
  teamMembers?: TeamMember[];
  contact?: {
    email?: string;
    website?: string;
    instagram?: string;
  };
  soloExhibitions?: Exhibition[];
  groupExhibitions?: Exhibition[];
}
