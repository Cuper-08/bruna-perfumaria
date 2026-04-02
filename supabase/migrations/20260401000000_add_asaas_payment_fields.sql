
-- Add Asaas/PIX payment fields to orders table
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS asaas_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS pix_qr_code TEXT,
  ADD COLUMN IF NOT EXISTS pix_copy_paste TEXT,
  ADD COLUMN IF NOT EXISTS pix_expire_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS invoice_url TEXT;
