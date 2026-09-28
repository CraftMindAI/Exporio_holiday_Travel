-- INQUIRIES TABLE
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
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- GRANT PUBLIC ACCESS
GRANT ALL ON TABLE public.inquiries TO anon, authenticated, service_role;

-- POLICIES FOR INQUIRIES
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public insert inquiries') THEN
CREATE POLICY "Allow public insert inquiries" ON public.inquiries FOR INSERT WITH CHECK (true); END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow admin read inquiries') THEN
CREATE POLICY "Allow admin read inquiries" ON public.inquiries FOR SELECT USING (true); END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow admin delete inquiries') THEN
CREATE POLICY "Allow admin delete inquiries" ON public.inquiries FOR DELETE USING (true); END IF; END $$;

-- RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
