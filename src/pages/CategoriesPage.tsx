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

        <div className="px-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
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
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Link
                      to={`/categoria/${cat.slug}`}
                      className={`group relative block aspect-[4/3] rounded-2xl overflow-hidden border border-border/40 shadow-sm hover:shadow-lg transition-shadow duration-300 ${image ? '' : `bg-gradient-to-br ${gradient}`}`}
                    >
                      {image ? (
                        <>
                          <img
                            src={image}
                            alt={cat.name}
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                          {/* Product count pill */}
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/85 backdrop-blur-md text-[10px] font-semibold text-foreground/80 shadow-sm">
                            {cat.productCount}
                          </div>
                          {/* Title overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <h3 className="font-display text-base font-semibold text-white leading-tight drop-shadow-md">
                              {cat.name}
                            </h3>
                            <p className="text-[10px] text-white/80 font-medium mt-0.5">
                              {cat.productCount} {cat.productCount === 1 ? 'produto' : 'produtos'}
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full p-4 flex flex-col items-center justify-center gap-2">
                          <div className="h-12 w-12 rounded-xl bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
                            <IconComp className="h-6 w-6 text-primary" strokeWidth={1.5} />
                          </div>
                          <span className="text-sm font-semibold text-foreground text-center leading-tight">
                            {cat.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {cat.productCount} {cat.productCount === 1 ? 'produto' : 'produtos'}
                          </span>
                        </div>
                      )}
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
