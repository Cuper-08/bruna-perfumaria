
CREATE TABLE public.store_customization (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_title text DEFAULT 'Beleza, fragrância e cuidado',
  hero_subtitle text DEFAULT 'Qualidade e beleza em um só lugar.',
  hero_cta_text text DEFAULT 'Ver Coleção',
  hero_cta_link text DEFAULT '/categoria/perfumes',
  promo_bar_text text DEFAULT '✨ Frete grátis acima de R$199 • Parcele em até 3x',
  whatsapp_number text DEFAULT '5511945778994',
  whatsapp_message text DEFAULT 'Olá! Vim pelo app da Bruna Perfumaria 🌸',
  footer_address text DEFAULT 'Av. Olavo Egídio, 1570 - Tucuruvi, São Paulo - SP',
  footer_phone text DEFAULT '(11) 94577-8994',
  footer_hours jsonb DEFAULT '{"weekdays":"Segunda a Sexta: 8h às 20h","saturday":"Sábado: 8h às 18h","sunday":"Domingo: Fechado"}'::jsonb
);

ALTER TABLE public.store_customization ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view store customization"
  ON public.store_customization FOR SELECT TO public USING (true);

CREATE POLICY "Admins can update store customization"
  ON public.store_customization FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.store_customization DEFAULT VALUES;
