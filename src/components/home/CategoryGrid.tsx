import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Gem, Brush, Wind, Flower2, Leaf, ShieldCheck, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { LucideIcon } from 'lucide-react';

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
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!categories?.length) return null;

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        {/* Section title */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-accent/30" />
          <h2 className="font-display text-lg font-semibold tracking-wide text-foreground/80">
            Categorias
          </h2>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-accent/30" />
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 stagger-children">
          {categories.map(cat => {
            const Icon = iconMap[cat.slug] || iconMap[cat.icon || 'Package'] || Package;
            return (
              <Link
                key={cat.id}
                to={`/categoria/${cat.slug}`}
                className="group flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-card border border-border/40 shadow-sm hover:shadow-md hover:border-accent/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/15 to-accent/5 flex items-center justify-center group-hover:from-accent/25 group-hover:to-accent/10 transition-all duration-300">
                  <Icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
                </div>
                <span className="text-xs font-medium tracking-wide text-foreground/70 group-hover:text-foreground transition-colors">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
