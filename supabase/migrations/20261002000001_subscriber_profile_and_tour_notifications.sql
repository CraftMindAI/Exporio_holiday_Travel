-- SUBSCRIBER PROFILE FIELDS (filled in from the /subscribe form)
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS name VARCHAR(150);
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS phone VARCHAR(30);
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS location VARCHAR(150);

-- LOCK DOWN SUBSCRIBERS: rows now hold phone numbers, so only the edge functions
-- (service_role, which bypasses RLS) may read or write them.
DROP POLICY IF EXISTS "Allow public insert subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Allow admin read subscribers" ON public.subscribers;
REVOKE ALL ON TABLE public.subscribers FROM anon, authenticated;

-- TOUR NOTIFICATION TRACKING: each tour notifies subscribers at most once
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS subscribers_notified_at TIMESTAMP WITH TIME ZONE;

-- Existing tours are not "new", so mark them as already announced
UPDATE public.tours SET subscribers_notified_at = created_at WHERE subscribers_notified_at IS NULL;

-- RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
