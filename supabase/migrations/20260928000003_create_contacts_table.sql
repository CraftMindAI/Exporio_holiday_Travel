-- CONTACTS TABLE
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'unread',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- GRANT PUBLIC ACCESS
GRANT ALL ON TABLE public.contacts TO anon, authenticated, service_role;

-- POLICIES FOR CONTACTS
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public insert contacts') THEN
CREATE POLICY "Allow public insert contacts" ON public.contacts FOR INSERT WITH CHECK (true); END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow admin read contacts') THEN
CREATE POLICY "Allow admin read contacts" ON public.contacts FOR SELECT USING (true); END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow admin delete contacts') THEN
CREATE POLICY "Allow admin delete contacts" ON public.contacts FOR DELETE USING (true); END IF; END $$;

-- RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
