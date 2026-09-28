-- SUBSCRIBERS TABLE
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(150) UNIQUE NOT NULL,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- GRANT PUBLIC ACCESS
GRANT ALL ON TABLE public.subscribers TO anon, authenticated, service_role;

-- POLICIES FOR SUBSCRIBERS
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public insert subscribers') THEN
CREATE POLICY "Allow public insert subscribers" ON public.subscribers FOR INSERT WITH CHECK (true); END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow admin read subscribers') THEN
CREATE POLICY "Allow admin read subscribers" ON public.subscribers FOR SELECT USING (true); END IF; END $$;

-- RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
