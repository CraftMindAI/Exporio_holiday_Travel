-- TOUR PLACES VISIT TABLE
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
ALTER TABLE public.tour_places_visit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to tour places" ON public.tour_places_visit FOR SELECT USING (true);
