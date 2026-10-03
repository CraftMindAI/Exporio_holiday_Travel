/** One day of a tour's itinerary. */
export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  /** Places visited that day */
  places?: string[];
  /** Meals included that day */
  meals?: ('Breakfast' | 'Lunch' | 'Dinner')[];
  /** Where guests stay that night */
  stay?: string;
}

export interface TourPackage {
  id: string;
  title: string;
  slug: string;
  /** Detailed description of the package */
  description?: string;
  /** The place (destination) this tour belongs to */
  destinationId?: string;
  location: string;
  category: 'domestic' | 'international';
  price: number;
  originalPrice?: number;
  /** false = price hidden on the website ("Price on request"); public data then has price 0 */
  showPrice?: boolean;
  durationNights: number;
  durationDays: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  highlights: string[];
  inclusions?: string[];
  exclusions?: string[];
  /** Facility keys from config/tourFacilities.ts */
  facilities?: string[];
  /** Tour type keys from config/tourFacilities.ts (honeymoon, family, ...) */
  tourTypes?: string[];
  itinerary?: ItineraryDay[];
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
  /** Country for international places */
  country?: string;
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
