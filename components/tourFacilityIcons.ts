import type { ElementType } from 'react';
import { UserCheck, Hotel, Utensils, Bus, Camera } from 'lucide-react';
import type { TourFacilityKey } from '@/config/tourFacilities';

/** Icon for each "Tour Includes" facility (admin form + tour page). */
export const FACILITY_ICONS: Record<TourFacilityKey, ElementType> = {
  tour_manager: UserCheck,
  hotel: Hotel,
  meals: Utensils,
  transport: Bus,
  sightseeing: Camera,
};
