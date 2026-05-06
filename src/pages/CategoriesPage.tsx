import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import StoreLayout from '@/components/layout/StoreLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Package, Sparkles, Droplets, Palette, Heart, Scissors, Leaf } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getCategoryImage } from '@/lib/category-icons';

const iconMap: Record<string, React.ElementType> = {
  Package, Sparkles, Droplets, Palette, Heart, Scissors, Leaf,
};

const gradients = [
  'from-rose-500/10 to-pink-500/5',
  'from-amber-500/10 to-orange-500/5',
  'from-violet-500/10 to-purple-500/5',
  'from-emerald-500/10 to-teal-500/5',
  'from-sky-500/10 to-blue-500/5',
  'from-fuchsia-500/10 to-pink-500/5',
];

const CategoriesPage = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories-with-count'],
    queryFn: async () => {
      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('sort_order');

      if (!cats) return [];

      const withCounts = await Promise.all(
        cats.map(async (cat) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', cat.id)
            .eq('active', true);
          return { ...cat, productCount: count || 0 };
        })
      );

      return withCounts;
    },
  });

  return (
    <StoreLayout>
      <PageHeader title="Categorias" />
      <div className="min-h-screen bg-background pb-24">
        <div className="px-4 pt-6 pb-4">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-muted-foreground"
          >
            Explore nossos produtos por categoria
          </motion.p>
        </div>

        <div className="px-4 grid grid-cols-3 gap-x-3 gap-y-5">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Skeleton className="aspect-square w-full rounded-2xl" />
                  <Skeleton className="h-3 w-16 rounded-full" />
                </div>
              ))
            : categories?.map((cat, i) => {
                const IconComp = iconMap[cat.icon || 'Package'] || Package;
                const gradient = gradients[i % gradients.length];
                const image = getCategoryImage(cat.slug);

                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.35 }}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <Link
                      to={`/categoria/${cat.slug}`}
                      className="group flex flex-col items-center gap-2"
                    >
                      {image ? (
                        <div className="relative w-full aspect-square rounded-2xl overflow-hidden ring-1 ring-accent/10 shadow-sm group-hover:shadow-lg group-hover:ring-accent/30 transition-all duration-300">
                          <img
                            src={image}
                            alt={cat.name}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          {cat.productCount > 0 && (
                            <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-white/85 backdrop-blur-md text-[9px] font-semibold text-foreground/80 shadow-sm">
                              {cat.productCount}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className={`w-full aspect-square rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center ring-1 ring-border/40 shadow-sm group-hover:shadow-md transition-all duration-300`}>
                          <IconComp className="h-8 w-8 text-primary" strokeWidth={1.5} />
                        </div>
                      )}
                      <span className="text-xs font-medium tracking-wide text-foreground/80 group-hover:text-foreground transition-colors text-center leading-tight">
                        {cat.name}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
        </div>
      </div>
    </StoreLayout>
  );
};

export default CategoriesPage;
