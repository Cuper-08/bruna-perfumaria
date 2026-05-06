import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

const FeaturedProducts = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, slug, price, images, featured')
        .eq('featured', true)
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products?.length) return null;

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-4 mb-8 animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-8 h-px bg-accent/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-accent/50" />
          </div>
          <div className="text-center">
            <h2 className="font-display text-xl md:text-2xl font-semibold tracking-wide">Destaques</h2>
            <p className="text-[11px] text-muted-foreground tracking-widest uppercase mt-1">Selecionados para você</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent/50" />
            <div className="w-8 h-px bg-accent/40" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {products.map(p => (
            <ProductCard
              key={p.id}
              id={p.id}
              title={p.title}
              slug={p.slug}
              price={Number(p.price)}
              image={p.images?.[0]}
              featured={p.featured || false}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
