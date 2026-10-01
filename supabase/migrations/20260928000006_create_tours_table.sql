-- TOURS TABLE
CREATE TABLE IF NOT EXISTS public.tours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    location VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'domestic' or 'international'
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    duration_nights INT NOT NULL,
    duration_days INT NOT NULL,
    rating DECIMAL(3,1) DEFAULT 5.0,
    review_count INT DEFAULT 0,
    image_url TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    is_trending BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;

-- GRANT PUBLIC ACCESS TO READ
GRANT ALL ON TABLE public.tours TO anon, authenticated, service_role;

-- POLICIES FOR TOURS
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access to tours') THEN
CREATE POLICY "Allow public read access to tours" ON public.tours FOR SELECT USING (true); END IF; END $$;

-- RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
