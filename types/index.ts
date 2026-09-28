export interface TourPackage {
  id: string;
  title: string;
  slug: string;
  location: string;
  category: 'domestic' | 'international';
  price: number;
  originalPrice?: number;
  durationNights: number;
  durationDays: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  highlights: string[];
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: { day: number; title: string; description: string }[];
  isFeatured?: boolean;
  isTrending?: boolean;
}

export interface Inquiry {
  id?: string;
  name: string;
  email: string;
  phone: string;
  tourId?: string;
  tourTitle?: string;
  travelDate?: string;
  guestsCount?: number;
  message?: string;
  status?: 'pending' | 'contacted' | 'confirmed' | 'cancelled';
  createdAt?: string;
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  category: 'domestic' | 'international';
  imageUrl: string;
  packageCount: number;
  description?: string;
}

export interface Blog {
  id?: string;
  title: string;
  slug?: string;
  image_url: string;
  content: string;
  author: string;
  created_at?: string;
}

export interface Review {
  id: string;
  author: string;
  location: string;
  rating: number;
  comment: string;
  tourName: string;
  date: string;
  avatarUrl?: string;
}
