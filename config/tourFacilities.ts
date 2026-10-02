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
