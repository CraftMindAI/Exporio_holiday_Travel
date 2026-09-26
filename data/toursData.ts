import { TourPackage, Destination, Review } from '@/types';

export const INITIAL_TOURS: TourPackage[] = [
  {
    id: '1',
    title: 'Exotic Sikkim & Gangtok Wonderland Package',
    slug: 'sikkim-tour-package',
    location: 'Gangtok, Sikkim',
    category: 'domestic',
    price: 14999,
    originalPrice: 19999,
    durationNights: 5,
    durationDays: 6,
    rating: 5.0,
    reviewCount: 1280,
    imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1000&q=80',
    isFeatured: true,
    isTrending: true,
    highlights: [
      'Glacial Tsomgo Lake & Sacred Baba Mandir Visit',
      'Nathula Pass Indo-China Border Experience',
      'Panoramic Kanchenjunga View from Pelling Skywalk',
      'Gangtok Cable Car Ropeway & MG Marg Sightseeing'
    ],
    inclusions: ['Luxury Hotel Stay', 'Breakfast & Dinner', 'Private AC Vehicle', 'All State Permits', 'Sightseeing Transfers'],
    exclusions: ['Airfare / Train Tickets', 'Personal Laundry & Drinks', 'Nathula Pass Permit Surcharge'],
    itinerary: [
      { day: 1, title: 'Arrival at NJP/IXB & Transfer to Gangtok', description: 'Meet our representative at Bagdogra Airport or NJP Station. Scenic drive along Teesta River to Gangtok. Evening free to stroll at MG Marg.' },
      { day: 2, title: 'Gangtok Local Sightseeing', description: 'Visit Rumtek Monastery, Hanuman Tok, Ganesh Tok, Tashi Viewpoint, Flower Exhibition Center, and Ropeway Ride.' },
      { day: 3, title: 'Excursion to Tsomgo Lake & Baba Mandir', description: 'Excursion to high-altitude Tsomgo Lake (12,400 ft) and Baba Harbhajan Singh Mandir. Optional Nathula Pass tour.' },
      { day: 4, title: 'Transfer to Pelling via Namchi', description: 'Drive to Pelling. En route visit Char Dham in Namchi and Samdruptse Statue. Check-in at hotel in Pelling.' },
      { day: 5, title: 'Pelling Sightseeing & Skywalk', description: 'Explore Skywalk, Pemayangtse Monastery, Rabdentse Ruins, Khecheopalri Wish-Fulfilling Lake, and Rimbi Waterfalls.' },
      { day: 6, title: 'Departure from Pelling to NJP/IXB', description: 'After breakfast, drive back to Bagdogra Airport or NJP Station for onward departure with cherished memories.' }
    ]
  },
  {
    id: '2',
    title: 'Kashmir Paradise On Earth - Houseboat & Glaciers',
    slug: 'kashmir-tour-package',
    location: 'Srinagar, Kashmir',
    category: 'domestic',
    price: 18500,
    originalPrice: 24999,
    durationNights: 6,
    durationDays: 7,
    rating: 4.9,
    reviewCount: 950,
    imageUrl: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1000&q=80',
    isFeatured: true,
    isTrending: true,
    highlights: [
      'Romantic Shikara Ride on Dal Lake Srinagar',
      'Gulmarg Gondola World Highest Cable Car',
      'Pahalgam Aru Valley & Betaab Valley Excursion',
      'Sonmarg Thajiwas Glacier Pony Ride'
    ],
    inclusions: ['Traditional Houseboat Night Stay', 'Deluxe Hotel Accommodation', 'Daily Breakfast & Dinner', 'Private Cab Transfers'],
    exclusions: ['Gondola Phase 2 Tickets', 'Garden Entrance Fees', 'Pony Rides']
  },
  {
    id: '3',
    title: 'Darjeeling Queen of Hills & Toy Train Heritage',
    slug: 'darjeeling-tour-packages',
    location: 'Darjeeling, WB',
    category: 'domestic',
    price: 11999,
    originalPrice: 15999,
    durationNights: 4,
    durationDays: 5,
    rating: 4.8,
    reviewCount: 870,
    imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80',
    isFeatured: true,
    isTrending: false,
    highlights: [
      'Tiger Hill Sunrise Golden Kanchenjunga View',
      'UNESCO World Heritage Toy Train Joyride',
      'Happy Valley Tea Estate & Tasting',
      'Batasia Loop War Memorial & Ghoom Monastery'
    ],
    inclusions: ['Star Accommodation', 'Breakfast & Dinner', 'All Sightseeing in Private Car']
  },
  {
    id: '4',
    title: 'Magical Kerala Backwaters & Munnar Hills',
    slug: 'kerala-tour-packages',
    location: 'Munnar & Alleppey, Kerala',
    category: 'domestic',
    price: 16999,
    originalPrice: 21999,
    durationNights: 5,
    durationDays: 6,
    rating: 4.9,
    reviewCount: 1120,
    imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1000&q=80',
    isFeatured: true,
    isTrending: true,
    highlights: [
      'Munnar Misty Tea Gardens & Mattupetty Dam',
      'Alleppey Luxury Houseboat Overnight Cruise',
      'Thekkady Periyar Spice Plantation & Boat Safari',
      'Kovalam Beach Sunset & Lighthouse'
    ],
    inclusions: ['Premium Houseboat Stay with All Meals', 'Resort Stays', 'Sightseeing & Transfers']
  },
  {
    id: '5',
    title: 'Enchanting Andaman Islands & Radhanagar Beach',
    slug: 'andaman-tour-package',
    location: 'Havelock Island, Andaman',
    category: 'domestic',
    price: 22999,
    originalPrice: 29999,
    durationNights: 5,
    durationDays: 6,
    rating: 5.0,
    reviewCount: 640,
    imageUrl: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1000&q=80',
    isFeatured: true,
    isTrending: true,
    highlights: [
      'Radhanagar Beach Asia #1 Beach Visit',
      'Scuba Diving & Coral Snorkeling Experience',
      'Cellular Jail Light & Sound Historic Show',
      'Inter-Island High Speed Ferry Cruise'
    ],
    inclusions: ['Beachfront Resort Stay', 'Makruzz / Nautika Cruise Tickets', 'Breakfast', 'Airport Pickup']
  },
  {
    id: '6',
    title: 'Mystical Bhutan Himalayan Kingdom Tour',
    slug: 'bhutan-tour-packages',
    location: 'Paro & Thimphu, Bhutan',
    category: 'international',
    price: 32999,
    originalPrice: 41999,
    durationNights: 5,
    durationDays: 6,
    rating: 4.9,
    reviewCount: 430,
    imageUrl: 'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=1000&q=80',
    isFeatured: true,
    isTrending: false,
    highlights: [
      'Tigers Nest Monastery (Taktsang) Cliff Trek',
      'Buddha Dordenma Giant Golden Statue Thimphu',
      'Punakha Suspension Bridge & Dzong Palace',
      'Traditional Bhutanese Archery & Cultural Night'
    ],
    inclusions: ['Bhutan SDF Sustainable Development Fee', '3-Star Hotel Stays', 'All Meals', 'English Speaking Bhutanese Guide']
  },
  {
    id: '7',
    title: 'Tropical Bali Island & Ubud Culture Escape',
    slug: 'bali-tour-packages',
    location: 'Ubud & Seminyak, Bali',
    category: 'international',
    price: 28999,
    originalPrice: 36999,
    durationNights: 6,
    durationDays: 7,
    rating: 4.9,
    reviewCount: 790,
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80',
    isFeatured: true,
    isTrending: true,
    highlights: [
      'Ubud Bali Swing & Tegallalang Rice Terraces',
      'Tanah Lot Sea Temple Sunset View',
      'Nusa Penida Kelingking Beach Day Tour',
      'Mount Batur Sunrise Trekking'
    ],
    inclusions: ['Private Pool Villa 2 Nights + 4-Star Resort 4 Nights', 'Daily Breakfast', 'Nusa Penida Speedboat', 'Airport Pickup']
  },
  {
    id: '8',
    title: 'Shimla & Manali Snow Adventure Delight',
    slug: 'shimla-manali-tour-package',
    location: 'Himachal Pradesh',
    category: 'domestic',
    price: 13499,
    originalPrice: 17999,
    durationNights: 5,
    durationDays: 6,
    rating: 4.8,
    reviewCount: 1540,
    imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1000&q=80',
    isFeatured: false,
    isTrending: true,
    highlights: [
      'Solang Valley Paragliding & Snow Activities',
      'Atal Tunnel & Sissu Lahaul Valley Excursion',
      'Mall Road Shopping & Ridge Walk Shimla',
      'Hadimba Temple & Vashisht Hot Springs'
    ],
    inclusions: ['Volvo Bus / Private Cab', 'Deluxe Hotel Accommodation', 'Breakfast & Dinner']
  }
];

export const POPULAR_DESTINATIONS: Destination[] = [
  { id: 'd1', name: 'Sikkim & Gangtok', slug: 'sikkim-tour-package', category: 'domestic', imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80', packageCount: 24 },
  { id: 'd2', name: 'Kashmir', slug: 'kashmir-tour-package', category: 'domestic', imageUrl: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=600&q=80', packageCount: 18 },
  { id: 'd3', name: 'Darjeeling', slug: 'darjeeling-tour-packages', category: 'domestic', imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80', packageCount: 15 },
  { id: 'd4', name: 'Kerala', slug: 'kerala-tour-packages', category: 'domestic', imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80', packageCount: 22 },
  { id: 'd5', name: 'Andaman Islands', slug: 'andaman-tour-package', category: 'domestic', imageUrl: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=600&q=80', packageCount: 12 },
  { id: 'd6', name: 'Bhutan', slug: 'bhutan-tour-packages', category: 'international', imageUrl: 'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=600&q=80', packageCount: 10 },
  { id: 'd7', name: 'Bali', slug: 'bali-tour-packages', category: 'international', imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80', packageCount: 14 },
  { id: 'd8', name: 'Shimla Manali', slug: 'shimla-manali-tour-package', category: 'domestic', imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80', packageCount: 20 }
];

export const TESTIMONIALS: Review[] = [
  {
    id: 'r1',
    author: 'Rajesh Sharma',
    location: 'Mumbai, Maharashtra',
    rating: 5,
    comment: 'Our Sikkim trip organized by Etripto was flawless! The hotel views of Kanchenjunga in Pelling and the driver were top notch. Highly recommended travel agency!',
    tourName: 'Sikkim & Gangtok Package',
    date: 'February 2026'
  },
  {
    id: 'r2',
    author: 'Priya & Ankit Roy',
    location: 'Kolkata, West Bengal',
    rating: 5,
    comment: 'Booked our honeymoon in Kashmir through Etripto. The houseboat stay in Srinagar and Gulmarg cable car booking were arranged without any hassle.',
    tourName: 'Kashmir Paradise Package',
    date: 'January 2026'
  },
  {
    id: 'r3',
    author: 'Sunil Nair',
    location: 'Bengaluru, Karnataka',
    rating: 5,
    comment: 'Etripto provided transparent pricing and 24/7 customer assistance during our family trip to Bhutan. Everything from SDF permits to hotels was super smooth.',
    tourName: 'Bhutan Himalayan Journey',
    date: 'December 2025'
  }
];
