import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Palette, Scissors, Heart, Droplets, Leaf, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles, Palette, Scissors, Heart, Droplets, Leaf, Package,
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
          <h2 className="font-display text-xl font-semibold mb-5">Categorias</h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-20 rounded-2xl shrink-0" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-xl font-semibold mb-5">Categorias</h2>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 stagger-children md:grid md:grid-cols-6 md:overflow-visible">
          {categories?.map(cat => {
            const Icon = iconMap[cat.icon || 'Package'] || Package;
            return (
              <Link
                key={cat.id}
                to={`/categoria/${cat.slug}`}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl glass shrink-0 min-w-[76px] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-[11px] font-medium text-foreground/70 whitespace-nowrap">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
