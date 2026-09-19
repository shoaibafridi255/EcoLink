CREATE TABLE public.company_profiles (
  user_id uuid PRIMARY KEY,
  company_name text NOT NULL,
  company_type text NOT NULL DEFAULT 'private',
  registration_status text NOT NULL DEFAULT 'not_registered',
  registration_number text,
  year_established integer,
  employee_range text,
  customer_count integer,
  industry text,
  services text[] NOT NULL DEFAULT '{}'::text[],
  materials_handled text[] NOT NULL DEFAULT '{}'::text[],
  description text,
  country text,
  city text,
  zone text,
  address text,
  postal_code text,
  company_email text,
  phone text,
  website text,
  logo_url text,
  registration_doc_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_profiles TO authenticated;
GRANT SELECT ON public.company_profiles TO anon;
GRANT ALL ON public.company_profiles TO service_role;

ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company profiles are viewable by everyone"
  ON public.company_profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert own company profile"
  ON public.company_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own company profile"
  ON public.company_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own company profile"
  ON public.company_profiles FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any company profile"
  ON public.company_profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete any company profile"
  ON public.company_profiles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX idx_company_profiles_country_city ON public.company_profiles (country, city);
CREATE INDEX idx_company_profiles_industry ON public.company_profiles (industry);
CREATE INDEX idx_company_profiles_services ON public.company_profiles USING GIN (services);
CREATE INDEX idx_company_profiles_materials ON public.company_profiles USING GIN (materials_handled);

CREATE TRIGGER company_profiles_updated_at
  BEFORE UPDATE ON public.company_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();