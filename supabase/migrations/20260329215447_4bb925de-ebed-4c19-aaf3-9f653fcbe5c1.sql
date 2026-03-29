
-- Enums
CREATE TYPE public.payment_method_type AS ENUM ('pix', 'cartao_online', 'dinheiro_entrega', 'cartao_entrega');
CREATE TYPE public.payment_status_type AS ENUM ('pending', 'paid', 'delivery_payment', 'failed', 'refunded');
CREATE TYPE public.order_status_type AS ENUM ('received', 'preparing', 'out_for_delivery', 'delivered', 'cancelled');
CREATE TYPE public.app_role AS ENUM ('admin', 'manager');

-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT DEFAULT 'Package',
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  images TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number SERIAL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_cpf TEXT,
  address JSONB NOT NULL DEFAULT '{}',
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method public.payment_method_type NOT NULL DEFAULT 'pix',
  payment_status public.payment_status_type NOT NULL DEFAULT 'pending',
  order_status public.order_status_type NOT NULL DEFAULT 'received',
  needs_change BOOLEAN DEFAULT false,
  change_for NUMERIC(10,2),
  asaas_payment_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Admin Settings
CREATE TABLE public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_fee NUMERIC(10,2) DEFAULT 5.00,
  store_open BOOLEAN DEFAULT true,
  store_phone TEXT DEFAULT '11945778994',
  store_address TEXT DEFAULT 'Av. Olavo Egídio, 1570 - Tucuruvi, São Paulo - SP',
  business_hours JSONB DEFAULT '{"open": "08:00", "close": "20:00", "days": "Segunda a Sábado"}'
);

-- User Roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Categories RLS
CREATE POLICY "Anyone can view active categories" ON public.categories FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Products RLS
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Orders RLS
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view their order by id" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Admins can manage orders" ON public.orders FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admin Settings RLS
CREATE POLICY "Anyone can view settings" ON public.admin_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update settings" ON public.admin_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- User Roles RLS
CREATE POLICY "Admins can view roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_orders_status ON public.orders(order_status);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Storage RLS
CREATE POLICY "Anyone can view product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admins can upload product images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update product images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete product images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

-- Seed categories
INSERT INTO public.categories (name, slug, icon, sort_order) VALUES
  ('Perfumes', 'perfumes', 'Sparkles', 1),
  ('Maquiagem', 'maquiagem', 'Palette', 2),
  ('Cabelo', 'cabelo', 'Scissors', 3),
  ('Corpo', 'corpo', 'Heart', 4),
  ('Skincare', 'skincare', 'Droplets', 5),
  ('Higiene', 'higiene', 'Leaf', 6);

-- Seed admin settings
INSERT INTO public.admin_settings (delivery_fee, store_open) VALUES (5.00, true);
