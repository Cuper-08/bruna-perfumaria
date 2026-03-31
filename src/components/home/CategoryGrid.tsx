import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
};

const CategoryGrid = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-lg font-semibold mb-5 tracking-wide text-foreground/80">Categorias</h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-24 rounded-2xl shrink-0" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-lg font-semibold mb-5 tracking-wide text-foreground/80">Categorias</h2>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 stagger-children md:grid md:grid-cols-6 md:overflow-visible">
          {categories?.map(cat => {
            const Icon = iconMap[cat.icon || 'Package'] || Package;
            return (
              <Link
                key={cat.id}
                to={`/categoria/${cat.slug}`}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl shrink-0 min-w-[84px] bg-card/80 backdrop-blur-sm border border-white/40 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 group"
              >
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 group-hover:from-primary/25 group-hover:to-primary/15 transition-all duration-300 shadow-inner">
                  <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                </div>
                <span className="text-xs font-medium tracking-wide text-foreground/70 whitespace-nowrap">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
