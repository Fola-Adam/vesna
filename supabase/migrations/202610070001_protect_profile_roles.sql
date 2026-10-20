-- Run with the database owner in Supabase SQL Editor. Existing roles are preserved.
BEGIN;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

REVOKE ALL ON public.profiles FROM anon;
REVOKE UPDATE ON public.profiles FROM authenticated;
REVOKE UPDATE (id, email, full_name, avatar_url, role, phone, bio, created_at, updated_at)
  ON public.profiles FROM authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (full_name, avatar_url, phone, bio) ON public.profiles TO authenticated;

-- Defense in depth if table/column grants are broadened later. This is deliberately
-- SECURITY INVOKER: current_user must identify the caller rather than the owner.
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND current_user IN ('anon', 'authenticated') THEN
    RAISE EXCEPTION 'Profile role changes require a trusted administrator' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS protect_profile_role ON public.profiles;
CREATE TRIGGER protect_profile_role BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'user');
  RETURN NEW;
END;
$$;

-- Administrators also need to see inactive products in the management interface.
DROP POLICY IF EXISTS "Products readable by admins" ON public.products;
CREATE POLICY "Products readable by admins" ON public.products FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Signup is performed by the server, with its server-only service key. Public
-- clients must never read subscribers or insert directly around API validation.
REVOKE ALL ON public.email_subscribers FROM anon;
COMMIT;
