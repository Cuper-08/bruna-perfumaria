import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StoreCustomization {
  id: string;
  hero_title: string;
  hero_subtitle: string;
  hero_cta_text: string;
  hero_cta_link: string;
  promo_bar_text: string;
  whatsapp_number: string;
  whatsapp_message: string;
  footer_address: string;
  footer_phone: string;
  footer_hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
}

export function useStoreCustomization() {
  return useQuery({
    queryKey: ['store-customization'],
    queryFn: async (): Promise<StoreCustomization | null> => {
      const { data, error } = await supabase
        .from('store_customization')
        .select('*')
        .limit(1)
        .single();
      if (error) {
        console.error('Error fetching store customization:', error);
        return null;
      }
      return {
        ...data,
        footer_hours: (data.footer_hours as StoreCustomization['footer_hours']) || {
          weekdays: 'Segunda a Sexta: 8h às 20h',
          saturday: 'Sábado: 8h às 18h',
          sunday: 'Domingo: Fechado',
        },
      } as StoreCustomization;
    },
    staleTime: 1000 * 60 * 5,
  });
}
