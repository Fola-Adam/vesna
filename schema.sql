-- ============================================
-- VESNA DATABASE SCHEMA
-- Phase 1: Core Tables for Products, Categories, Auth, Analytics
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Categories for products
CREATE TABLE categories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug text UNIQUE NOT NULL,
    name text NOT NULL,
    description text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Products table (Victory's curated items)
CREATE TABLE products (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug text UNIQUE NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2),
    sale_price numeric(10,2),
    affiliate_link text, -- NULL for NFS/archive items
    category_id uuid REFERENCES categories(id),
    image_urls text[] DEFAULT '{}',
    why_victory text, -- Personal endorsement
    item_type text CHECK (item_type IN ('curated', 'shop', 'archive')) DEFAULT 'shop',
    is_featured boolean DEFAULT false,
    is_active boolean DEFAULT true,
    curator_id uuid, -- For future multi-curator Phase 2
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Email subscribers (Brevo integration)
CREATE TABLE email_subscribers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    email text UNIQUE NOT NULL,
    first_name text,
    source text DEFAULT 'website', -- 'website', 'popup', 'checkout', etc.
    is_verified boolean DEFAULT false,
    brevo_contact_id text, -- Brevo API contact ID
    subscribed_at timestamptz DEFAULT now(),
    unsubscribed_at timestamptz
);

-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    full_name text,
    avatar_url text,
    role text CHECK (role IN ('admin', 'curator', 'user')) DEFAULT 'user',
    phone text,
    bio text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Click tracking for affiliate analytics
CREATE TABLE click_tracking (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id uuid REFERENCES products(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id text, -- For anonymous tracking
    referrer text,
    user_agent text,
    ip_address text,
    clicked_at timestamptz DEFAULT now()
);

-- Site settings (for Victory to manage)
CREATE TABLE site_settings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    key text UNIQUE NOT NULL,
    value text,
    description text,
    updated_at timestamptz DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_item_type ON products(item_type);
CREATE INDEX idx_click_tracking_product ON click_tracking(product_id);
CREATE INDEX idx_click_tracking_date ON click_tracking(clicked_at);

-- ============================================
-- NOTES ON ITEM_TYPE
-- ============================================
-- 'curated' = Victory's personal recommendations (/curated)
-- 'shop'    = Regular catalog items (/shop)
-- 'archive' = NFS collection + rare finds (/archive)
-- NULL affiliate_link for archive items (not for sale)

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE click_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Products: Anyone can read active products, only admins can write
CREATE POLICY "Products are viewable by everyone" 
  ON products FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Products are insertable by admins only" 
  ON products FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Products are updatable by admins only" 
  ON products FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Products are deletable by admins only" 
  ON products FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Categories: Public read, admin write
CREATE POLICY "Categories are viewable by everyone" 
  ON categories FOR SELECT 
  TO PUBLIC 
  USING (true);

CREATE POLICY "Categories are writable by admins only" 
  ON categories FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Profiles: Only the owner can read a profile; role is managed by trusted servers.
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Email subscribers: Admin only
CREATE POLICY "Email subscribers admin only" 
  ON email_subscribers FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Click tracking: Insert by anyone, read by admin
CREATE POLICY "Click tracking insertable by all" 
  ON click_tracking FOR INSERT 
  TO PUBLIC 
  WITH CHECK (true);

CREATE POLICY "Click tracking readable by admin" 
  ON click_tracking FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Site settings: Public read, admin write
CREATE POLICY "Site settings readable by all" 
  ON site_settings FOR SELECT 
  TO PUBLIC 
  USING (true);

CREATE POLICY "Site settings writable by admin" 
  ON site_settings FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at 
    BEFORE UPDATE ON site_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Handle new user signup: create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default categories
INSERT INTO categories (slug, name, description, display_order) VALUES
  ('tech', 'Tech', 'Gadgets and electronics', 1),
  ('audio', 'Audio', 'Headphones, speakers, and sound equipment', 2),
  ('lifestyle', 'Lifestyle', 'Everyday essentials and luxuries', 3),
  ('workspace', 'Workspace', 'Office and productivity tools', 4),
  ('travel', 'Travel', 'Bags, accessories, and travel gear', 5),
  ('home', 'Home', 'Decor, furniture, and home goods', 6)
ON CONFLICT (slug) DO NOTHING;

-- Insert default site settings
INSERT INTO site_settings (key, value, description) VALUES
  ('site_title', 'Vesna', 'Site title for SEO'),
  ('site_description', 'Curated products with a story', 'Meta description'),
  ('hero_title', 'Objects with Purpose', 'Homepage hero headline'),
  ('hero_subtitle', 'Each item tells a story. Each purchase supports independent curation.', 'Homepage hero subtitle'),
  ('newsletter_heading', 'Join the Inner Circle', 'Newsletter signup heading'),
  ('newsletter_text', 'Weekly curated finds. No spam, ever.', 'Newsletter signup text'),
  ('contact_email', 'hello@vesna.ng', 'Primary contact email'),
  ('instagram_url', 'https://instagram.com/vesna', 'Instagram profile URL'),
  ('twitter_url', 'https://twitter.com/vesna', 'Twitter profile URL')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- ADMIN SETUP INSTRUCTIONS
-- ============================================

-- After creating the admin user in Supabase Auth, run this to set their role:
-- UPDATE profiles SET role = 'admin' WHERE email = 'victory@vesna.ng';

-- Or use this function to create admin directly:
-- SELECT create_admin_user('victory@vesna.ng', 'Victory Ebenezer', 'secure_password_here');

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- Product performance view
CREATE VIEW product_analytics AS
SELECT 
    p.id,
    p.name,
    p.slug,
    p.item_type,
    p.is_active,
    COUNT(ct.id) as total_clicks,
    COUNT(DISTINCT ct.session_id) as unique_clicks,
    MAX(ct.clicked_at) as last_clicked
FROM products p
LEFT JOIN click_tracking ct ON p.id = ct.product_id
GROUP BY p.id, p.name, p.slug, p.item_type, p.is_active;

-- Daily click stats
CREATE VIEW daily_click_stats AS
SELECT 
    DATE(clicked_at) as date,
    COUNT(*) as total_clicks,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(DISTINCT product_id) as products_clicked
FROM click_tracking
GROUP BY DATE(clicked_at)
ORDER BY date DESC;

-- Harden API grants and role ownership for fresh installations as well.
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
