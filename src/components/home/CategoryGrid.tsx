import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Gem, Brush, Wind, Flower2, Leaf, ShieldCheck, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { LucideIcon } from 'lucide-react';
import { getCategoryImage } from '@/lib/category-icons';

const iconMap: Record<string, LucideIcon> = {
  Sparkles: Gem,
  Palette: Brush,
  Scissors: Wind,
  Heart: Flower2,
  Droplets: Leaf,
  Leaf: ShieldCheck,
  Gem, Brush, Wind, Flower2, ShieldCheck,
  Package,
  perfumes: Gem,
  maquiagem: Brush,
  cabelo: Wind,
  corpo: Flower2,
  skincare: Leaf,
  higiene: ShieldCheck,
};

const CategoryGrid = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!categories?.length) return null;

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <p className="eyebrow mb-3">Universo Bruna</p>
          <h2 className="display-lg text-foreground">Nossas categorias</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 stagger-children">
          {categories.map(cat => {
            const Icon = iconMap[cat.slug] || iconMap[cat.icon || 'Package'] || Package;
            const image = getCategoryImage(cat.slug);
            return (
              <Link
                key={cat.id}
                to={`/categoria/${cat.slug}`}
                className="group relative aspect-square rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
              >
                {image ? (
                  <>
                    <img
                      src={image}
                      alt={cat.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bruna-dark/85 via-bruna-dark/30 to-transparent" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none" />
                    <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col items-center justify-end text-center">
                      <span className="font-display text-base md:text-lg font-semibold text-bruna-cream tracking-wide group-hover:text-accent transition-colors duration-500">
                        {cat.name}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 bg-card border border-border/40 group-hover:border-accent/40 transition-colors duration-500">
                    <Icon className="h-8 w-8 text-foreground/60 group-hover:text-accent transition-colors duration-500" strokeWidth={1.25} />
                    <span className="font-display text-sm md:text-base font-medium text-foreground/85 group-hover:text-foreground transition-colors duration-500 text-center">
                      {cat.name}
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
