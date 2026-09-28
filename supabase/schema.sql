-- ===================================================
-- Supabase Schema DDL for Etripto Travel Application
-- ===================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TOURS TABLE
CREATE TABLE IF NOT EXISTS public.tours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    location VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'domestic', -- 'domestic' or 'international'
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    duration_nights INT NOT NULL,
    duration_days INT NOT NULL,
    rating DECIMAL(2,1) DEFAULT 5.0,
    review_count INT DEFAULT 450,
    image_url TEXT NOT NULL,
    highlights TEXT[],
    inclusions TEXT[],
    exclusions TEXT[],
    itinerary JSONB,
    is_featured BOOLEAN DEFAULT false,
    is_trending BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. INQUIRIES TABLE (Leads & Booking Requests)
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    tour_id UUID REFERENCES public.tours(id) ON DELETE SET NULL,
    tour_title VARCHAR(255),
    travel_date DATE,
    guests_count INT DEFAULT 2,
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'contacted', 'confirmed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. SUBSCRIBERS TABLE (Newsletter)
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(150) UNIQUE NOT NULL,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. DESTINATIONS TABLE
CREATE TABLE IF NOT EXISTS public.destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'domestic' or 'international'
    image_url TEXT NOT NULL,
    package_count INT DEFAULT 10,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ===================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===================================================

ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

-- Allow public read access to tours & destinations
CREATE POLICY "Allow public read access to tours" ON public.tours FOR SELECT USING (true);
CREATE POLICY "Allow public read access to destinations" ON public.destinations FOR SELECT USING (true);

-- Allow public to submit inquiries & subscribe to newsletter
CREATE POLICY "Allow public insert into inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert into subscribers" ON public.subscribers FOR INSERT WITH CHECK (true);

-- Allow read/manage access for authenticated admin users
CREATE POLICY "Allow admin access to inquiries" ON public.inquiries FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin access to subscribers" ON public.subscribers FOR SELECT USING (auth.role() = 'authenticated');

-- ===================================================
-- SEED DATA FOR TOURS & DESTINATIONS
-- ===================================================

INSERT INTO public.tours (title, slug, location, category, price, original_price, duration_nights, duration_days, rating, review_count, image_url, is_featured, is_trending, highlights) VALUES
('Exotic Sikkim & Gangtok Wonderland', 'sikkim-tour-package', 'Gangtok, Sikkim', 'domestic', 14999, 19999, 5, 6, 5.0, 1280, 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80', true, true, '["Tsomgo Lake & Baba Mandir", "Nathula Pass Border Visit", "Pelling & Kanchenjunga View", "Gangtok Ropeway & Monastery"]'::jsonb),

('Kashmir Paradise On Earth', 'kashmir-tour-package', 'Srinagar, Kashmir', 'domestic', 18500, 24999, 6, 7, 4.9, 950, 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80', true, true, '["Shikara Ride on Dal Lake", "Gulmarg Gondola Cable Car", "Pahalgam Valley & Betaab Valley", "Sonmarg Glacier Trek"]'::jsonb),

('Darjeeling Queen of the Hills', 'darjeeling-tour-packages', 'Darjeeling, WB', 'domestic', 11999, 15999, 4, 5, 4.8, 870, 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80', true, false, '["Tiger Hill Sunrise View", "UNESCO Heritage Toy Train", "Happy Valley Tea Garden", "Batasia Loop & Ghoom Monastery"]'::jsonb),

('Magical Kerala Backwaters & Munnar', 'kerala-tour-packages', 'Kerala', 'domestic', 16999, 21999, 5, 6, 4.9, 1120, 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80', true, true, '["Munnar Tea Plantations", "Alleppey Houseboat Cruise", "Thekkady Wildlife Sanctuary", "Kovalam Beach Sunset"]'::jsonb),

('Enchanting Andaman Islands & Havelock', 'andaman-tour-package', 'Andaman Islands', 'domestic', 22999, 29999, 5, 6, 5.0, 640, 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=800&q=80', true, true, '["Havelock Island Radhanagar Beach", "Scuba Diving & Coral Snorkeling", "Cellular Jail Light & Sound Show", "Elephant Beach Water Sports"]'::jsonb),

('Mystical Bhutan Himalayan Journey', 'bhutan-tour-packages', 'Paro & Thimphu, Bhutan', 'international', 32999, 41999, 5, 6, 4.9, 430, 'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=800&q=80', true, false, '["Tigers Nest Monastery Hike", "Buddha Dordenma Statue", "Punaka Dzong Palace", "Traditional Bhutanese Cultural Show"]'::jsonb),

('Tropical Bali Island Escape', 'bali-tour-packages', 'Bali, Indonesia', 'international', 28999, 36999, 6, 7, 4.9, 790, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80', true, true, '["Ubud Sacred Monkey Forest", "Tanah Lot Sea Temple Sunset", "Nusa Penida Island Tour", "Batur Volcano Sunrise Trek"]'::jsonb),

('Shimla & Manali Snow Adventure', 'shimla-manali-tour-package', 'Himachal Pradesh', 'domestic', 13499, 17999, 5, 6, 4.8, 1540, 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80', false, true, '["Solang Valley Snow Sports", "Rohtang Pass Snow Excursion", "Mall Road Shopping Shimla", "Atal Tunnel Experience"]'::jsonb),

('Divine Tamil Nadu Temple & Heritage Tour', 'tamilnadu-temple-tour', 'Tamil Nadu, India', 'domestic', 18999, 23999, 5, 6, 4.9, 820, 'https://images.unsplash.com/photo-1582510003544-4d00b7f7415e?auto=format&fit=crop&w=800&q=80', true, false, '["Meenakshi Amman Temple Madurai", "Rameswaram Jyotirlinga Darshan", "Kanyakumari Sunset & Vivekananda Rock", "Mahabalipuram Shore Temple"]'::jsonb),

('Ooty & Kodaikanal Hill Station Retreat', 'ooty-kodaikanal-tour-package', 'Tamil Nadu, India', 'domestic', 15999, 20999, 4, 5, 4.8, 1150, 'https://images.unsplash.com/photo-1583344075199-563b784e2079?auto=format&fit=crop&w=800&q=80', false, true, '["Nilgiri Mountain Railway Toy Train", "Ooty Botanical Gardens & Lake", "Coonoor Tea Estates", "Kodaikanal Pine Forest & Pillar Rocks"]'::jsonb),

('Royal Mysore & Coorg Coffee Estate', 'mysore-coorg-tour-package', 'Karnataka, India', 'domestic', 16500, 21500, 4, 5, 4.9, 940, 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=800&q=80', true, true, '["Mysore Palace Illumination", "Chamundi Hills Temple", "Coorg Abbey Falls & Coffee Plantations", "Dubare Elephant Camp"]'::jsonb),

('Hampi Heritage & Badami Cave Trails', 'hampi-badami-tour', 'Karnataka, India', 'domestic', 14500, 18999, 3, 4, 4.8, 560, 'https://images.unsplash.com/photo-1620766165457-a8025baa82e0?auto=format&fit=crop&w=800&q=80', false, false, '["Hampi Virupaksha Temple & Ruins", "Badami Cave Temples", "Pattadakal Group of Monuments", "Tungabhadra River Coracle Ride"]'::jsonb),

('Wayanad Wildlife & Nature Escape', 'wayanad-tour-package', 'Kerala, India', 'domestic', 13999, 17999, 3, 4, 4.8, 730, 'https://images.unsplash.com/photo-1610360662645-0d26982f64ff?auto=format&fit=crop&w=800&q=80', false, true, '["Edakkal Caves Trek", "Banasura Sagar Dam", "Wayanad Wildlife Sanctuary Safari", "Soochipara Waterfalls"]'::jsonb);

-- ===================================================
-- ADMIN AND PLACES VISIT TABLES
-- ===================================================

-- 5. ADMINS TABLE
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(150) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TOUR PLACES VISIT TABLE
CREATE TABLE IF NOT EXISTS public.tour_places_visit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
    place_name VARCHAR(255) NOT NULL,
    description TEXT,
    day_number INT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_places_visit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to admins for authenticated" ON public.admins FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow public read access to tour places" ON public.tour_places_visit FOR SELECT USING (true);
