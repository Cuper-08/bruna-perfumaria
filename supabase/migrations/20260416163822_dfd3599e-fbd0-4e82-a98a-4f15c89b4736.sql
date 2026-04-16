UPDATE store_customization SET 
  footer_address = 'Rua Pastoril de Itapetininga, 541, Jardim Danfer',
  footer_hours = '{"weekdays": "Segunda a Sexta: 9h às 15h", "saturday": "Sábado: 9h às 14h", "sunday": "Domingo: Fechado"}'::jsonb
WHERE id = (SELECT id FROM store_customization LIMIT 1);