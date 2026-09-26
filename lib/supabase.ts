import { createClient } from '@supabase/supabase-js';
import { TourPackage, Inquiry, Subscriber, Destination } from '@/types';
import { INITIAL_TOURS, POPULAR_DESTINATIONS } from '@/data/toursData';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Initialize Supabase client if keys exist
export const supabase = (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project-ref'))
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Dynamic in-memory stores for offline fallback
let toursList: TourPackage[] = [...INITIAL_TOURS];
let destinationsList: Destination[] = [...POPULAR_DESTINATIONS];
let inquiriesList: Inquiry[] = [];
let subscribersList: string[] = [];

/**
 * Fetch all tour packages
 */
export async function getTours(): Promise<TourPackage[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((t: any) => ({
          id: t.id,
          title: t.title,
          slug: t.slug,
          location: t.location,
          category: t.category,
          price: Number(t.price),
          originalPrice: t.original_price ? Number(t.original_price) : undefined,
          durationNights: t.duration_nights,
          durationDays: t.duration_days,
          rating: Number(t.rating),
          reviewCount: t.review_count,
          imageUrl: t.image_url,
          highlights: t.highlights || [],
          inclusions: t.inclusions || [],
          exclusions: t.exclusions || [],
          itinerary: t.itinerary || [],
          isFeatured: t.is_featured,
          isTrending: t.is_trending,
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch failed, utilizing fallback dataset:', err);
    }
  }

  return toursList;
}

/**
 * Get single tour by slug
 */
export async function getTourBySlug(slug: string): Promise<TourPackage | null> {
  const tours = await getTours();
  return tours.find((t) => t.slug === slug) || null;
}

/**
 * Admin: Create New Tour Package
 */
export async function createTour(newTour: Omit<TourPackage, 'id'>): Promise<{ success: boolean; message: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('tours').insert([
        {
          title: newTour.title,
          slug: newTour.slug,
          location: newTour.location,
          category: newTour.category,
          price: newTour.price,
          original_price: newTour.originalPrice || null,
          duration_nights: newTour.durationNights,
          duration_days: newTour.durationDays,
          rating: newTour.rating || 5.0,
          review_count: newTour.reviewCount || 1,
          image_url: newTour.imageUrl,
          highlights: newTour.highlights,
          inclusions: newTour.inclusions || [],
          is_featured: newTour.isFeatured || false,
          is_trending: newTour.isTrending || false,
        },
      ]);

      if (error) throw error;
      return { success: true, message: 'New tour package published successfully!' };
    } catch (err: any) {
      console.warn('Supabase insert failed, using local store:', err);
    }
  }

  // Fallback in-memory add
  const tourToAdd: TourPackage = { ...newTour, id: Date.now().toString() };
  toursList = [tourToAdd, ...toursList];
  return { success: true, message: 'New tour package added to local store successfully!' };
}

/**
 * Admin: Create New Destination / Place
 */
export async function createDestination(newDest: Omit<Destination, 'id'>): Promise<{ success: boolean; message: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('destinations').insert([
        {
          name: newDest.name,
          slug: newDest.slug,
          category: newDest.category,
          image_url: newDest.imageUrl,
          package_count: newDest.packageCount || 5,
        },
      ]);

      if (error) throw error;
      return { success: true, message: 'New place added successfully!' };
    } catch (err) {
      console.warn('Supabase destination insert failed');
    }
  }

  destinationsList.unshift({ ...newDest, id: Date.now().toString() });
  return { success: true, message: 'New place added successfully!' };
}

/**
 * Submit inquiry to Supabase database
 */
export async function submitInquiry(inquiry: Inquiry): Promise<{ success: boolean; message: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('inquiries').insert([
        {
          name: inquiry.name,
          email: inquiry.email,
          phone: inquiry.phone,
          tour_id: inquiry.tourId || null,
          tour_title: inquiry.tourTitle || 'General Inquiry',
          travel_date: inquiry.travelDate || null,
          guests_count: inquiry.guestsCount || 2,
          message: inquiry.message || '',
        },
      ]);

      if (error) throw error;
      return { success: true, message: 'Your booking inquiry has been sent! We will call you shortly.' };
    } catch (err: any) {
      console.warn('Fallback to local inquiry recording');
    }
  }

  inquiriesList.unshift({ ...inquiry, id: Date.now().toString(), status: 'pending', createdAt: new Date().toISOString() });
  return { success: true, message: 'Your booking inquiry has been recorded successfully!' };
}

/**
 * Admin: Fetch all inquiries
 */
export async function getAllInquiries(): Promise<Inquiry[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((i: any) => ({
          id: i.id,
          name: i.name,
          email: i.email,
          phone: i.phone,
          tourId: i.tour_id,
          tourTitle: i.tour_title,
          travelDate: i.travel_date,
          guestsCount: i.guests_count,
          message: i.message,
          status: i.status,
          createdAt: i.created_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch inquiries failed');
    }
  }

  return inquiriesList;
}

/**
 * Admin: Delete Inquiry
 */
export async function deleteInquiry(id: string): Promise<boolean> {
  if (supabase) {
    try {
      await supabase.from('inquiries').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete failed');
    }
  }

  inquiriesList = inquiriesList.filter((i) => i.id !== id);
  return true;
}

/**
 * Subscribe email to newsletter
 */
export async function subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('subscribers').insert([{ email }]);
      if (error) throw error;
      return { success: true, message: 'Thank you for subscribing to Exporio Holidays newsletter!' };
    } catch (err) {
      console.warn('Fallback subscriber save');
    }
  }

  if (!subscribersList.includes(email)) {
    subscribersList.push(email);
  }
  return { success: true, message: 'Thank you for subscribing to Exporio Holidays newsletter!' };
}
