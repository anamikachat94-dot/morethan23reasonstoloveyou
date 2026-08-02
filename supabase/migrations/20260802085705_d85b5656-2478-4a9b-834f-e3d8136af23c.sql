CREATE TABLE public.memories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot integer NOT NULL UNIQUE,
  url text NOT NULL,
  storage_path text NOT NULL,
  kind text NOT NULL DEFAULT 'image',
  caption text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.memories TO anon;
GRANT SELECT ON public.memories TO authenticated;
GRANT ALL ON public.memories TO service_role;

ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Memories are viewable by everyone"
  ON public.memories FOR SELECT
  TO anon, authenticated
  USING (true);