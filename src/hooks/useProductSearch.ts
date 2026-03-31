import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProductSearch = (term: string) => {
  return useQuery({
    queryKey: ['search-products', term],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('search_products', {
        search_term: term,
      });
      if (error) throw error;
      return data as Array<{
        id: string;
        title: string;
        slug: string;
        price: number;
        images: string[] | null;
        description: string | null;
        category_id: string | null;
        active: boolean | null;
        featured: boolean | null;
        created_at: string | null;
        updated_at: string | null;
      }>;
    },
    enabled: term.length >= 2,
    staleTime: 30000,
  });
};
