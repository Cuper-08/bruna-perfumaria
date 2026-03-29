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
      <section className="container mx-auto px-4 py-12">
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-center mb-8">Categorias</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="font-display text-2xl md:text-3xl font-semibold text-center mb-8">Categorias</h2>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {categories?.map(cat => {
          const Icon = iconMap[cat.icon || 'Package'] || Package;
          return (
            <Link
              key={cat.id}
              to={`/categoria/${cat.slug}`}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-bruna-pink hover:bg-bruna-rose/40 transition-all hover:shadow-md hover:-translate-y-0.5 group"
            >
              <div className="p-3 rounded-full bg-primary/15 group-hover:bg-primary/25 transition-colors">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground/80">{cat.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryGrid;
