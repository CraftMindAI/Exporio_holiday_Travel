// What a tour package can include ("Tour Includes" on the tour page / admin tour form).
export const TOUR_FACILITIES = [
  { key: 'tour_manager', label: 'Tour Manager' },
  { key: 'hotel', label: 'Hotel' },
  { key: 'meals', label: 'Meals' },
  { key: 'transport', label: 'Transport' },
  { key: 'sightseeing', label: 'Sight Seeing' },
] as const;

export type TourFacilityKey = (typeof TOUR_FACILITIES)[number]['key'];

/** Meals that can be marked for each itinerary day. */
export const DAY_MEALS = ['Breakfast', 'Lunch', 'Dinner'] as const;
export type DayMeal = (typeof DAY_MEALS)[number];

/** Longest package the admin form allows. */
export const MAX_TOUR_DAYS = 30;

/** Tour types an admin can tag a package with; also the "Tour Type" filter on location pages. */
export const TOUR_TYPES = [
  { key: 'honeymoon', label: 'Honeymoon' },
  { key: 'friends_group', label: 'Friends/Group' },
  { key: 'adventure', label: 'Adventure' },
  { key: 'nature', label: 'Nature' },
  { key: 'solo', label: 'Solo' },
  { key: 'family', label: 'Family' },
] as const;

/** "Price Range" filter bands (price per person, ₹). */
export const PRICE_RANGES = [
  // min 0 so very cheap packages still fall in the first band
  { key: '1800-5000', label: '₹1,800 - ₹5,000', min: 0, max: 5000 },
  { key: '5001-8000', label: '₹5,001 - ₹8,000', min: 5001, max: 8000 },
  { key: '8001-11000', label: '₹8,001 - ₹11,000', min: 8001, max: 11000 },
  { key: '11001-15000', label: '₹11,001 - ₹15,000', min: 11001, max: 15000 },
  { key: '15001-18000', label: '₹15,001 - ₹18,000', min: 15001, max: 18000 },
  { key: '18001-22000', label: '₹18,001 - ₹22,000', min: 18001, max: 22000 },
  { key: '22001-25000', label: '₹22,001 - ₹25,000', min: 22001, max: 25000 },
  { key: '25001-plus', label: '₹25,000 and above', min: 25001, max: Infinity },
] as const;

/** "Tour Duration" filter bands (days). */
export const DURATION_RANGES = [
  { key: '1-3', label: '1 - 3 Days', min: 1, max: 3 },
  { key: '4-6', label: '4 - 6 Days', min: 4, max: 6 },
  { key: '7-9', label: '7 - 9 Days', min: 7, max: 9 },
  { key: '10-plus', label: '10+ Days', min: 10, max: Infinity },
] as const;
