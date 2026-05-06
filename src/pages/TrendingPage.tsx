import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Flame } from 'lucide-react';
import StoreLayout from '@/components/layout/StoreLayout';
import PageHeader from '@/components/layout/PageHeader';
import ProductCard from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

const TrendingPage = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['trending-products'],
    queryFn: async () => {
      // Try trending from orders first
      const { data: trending } = await supabase.rpc('get_trending_products', {
        days_back: 30,
        max_results: 20,
      });

      let productIds = trending?.map((t: { product_id: string }) => t.product_id) || [];

      if (productIds.length > 0) {
        const { data: prods } = await supabase
          .from('products')
          .select('id, title, slug, price, images, featured, active')
          .in('id', productIds)
          .eq('active', true);

        if (prods && prods.length > 0) {
          // Maintain trending order
          const idOrder = new Map(productIds.map((id: string, i: number) => [id, i]));
          const sorted = [...prods].sort((a, b) => (idOrder.get(a.id) ?? 99) - (idOrder.get(b.id) ?? 99));
          return sorted;
        }
      }

      // Fallback: featured products
      const { data: featured } = await supabase
        .from('products')
        .select('id, title, slug, price, images, featured, active')
        .eq('active', true)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(20);

      return featured || [];
    },
  });

  return (
    <StoreLayout>
      <PageHeader title="Em Alta" />
      <div className="min-h-screen bg-background pb-24">
        <div className="px-4 pt-6 pb-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-accent fill-accent animate-pulse" />
            <h1 className="text-2xl font-display font-bold text-foreground">Em Alta</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Os produtos mais procurados agora</p>
        </div>

        <div className="px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
              ))
            : products?.map((product, i) => (
                <div key={product.id} className="relative">
                  {i < 3 && (
                    <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold shadow-md">
                      🔥 Top {i + 1}
                    </div>
                  )}
                  <ProductCard
                    id={product.id}
                    title={product.title}
                    slug={product.slug}
                    price={product.price}
                    image={product.images?.[0]}
                    featured={product.featured ?? false}
                  />
                </div>
              ))}
        </div>

        {!isLoading && (!products || products.length === 0) && (
          <div className="text-center py-16 px-4">
            <Flame className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum produto em destaque ainda</p>
          </div>
        )}
      </div>
    </StoreLayout>
  );
};

export default TrendingPage;
