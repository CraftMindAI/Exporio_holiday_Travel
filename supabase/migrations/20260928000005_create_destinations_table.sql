-- DESTINATIONS TABLE (Places to Visit)
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

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

-- GRANT PUBLIC ACCESS TO READ
GRANT ALL ON TABLE public.destinations TO anon, authenticated, service_role;

-- POLICIES FOR DESTINATIONS
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access to destinations') THEN
CREATE POLICY "Allow public read access to destinations" ON public.destinations FOR SELECT USING (true); END IF; END $$;

-- RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
