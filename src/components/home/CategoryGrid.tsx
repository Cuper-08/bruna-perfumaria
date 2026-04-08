import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Gem, Brush, Wind, Flower2, Leaf, ShieldCheck, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
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

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
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
        <motion.div
           className="flex items-center justify-center gap-4 mb-10"
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true, margin: '-50px' }}
           transition={{ duration: 0.5 }}
         >
           <div className="flex-1 h-[1px] bg-foreground/5 max-w-[100px]" />
           <h2 className="font-display text-sm uppercase tracking-[0.3em] font-light text-foreground/60">
             Categorias
           </h2>
           <div className="flex-1 h-[1px] bg-foreground/5 max-w-[100px]" />
         </motion.div>

        <motion.div
          className="grid grid-cols-3 md:grid-cols-6 gap-3"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
        >
          {categories.map(cat => {
            const Icon = iconMap[cat.slug] || iconMap[cat.icon || 'Package'] || Package;
            return (
              <motion.div key={cat.id} variants={item} whileHover={{ scale: 1.05, y: -2 }}>
                <Link
                  to={`/categoria/${cat.slug}`}
                  className="group flex flex-col items-center gap-4 p-2 transition-all duration-500"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-[0.5px] border-foreground/10 flex items-center justify-center group-hover:border-[#D4AF37] group-hover:scale-105 transition-all duration-500 bg-background/50 hover:bg-[#D4AF37]/5 shadow-sm group-hover:shadow-[0_0_15px_rgba(212,175,55,0.15)] relative">
                    <Icon className="h-6 w-6 md:h-7 md:w-7 text-foreground/60 group-hover:text-[#D4AF37] transition-colors duration-500" strokeWidth={1} />
                  </div>
                  <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-medium text-foreground/50 group-hover:text-foreground transition-colors text-center">
                    {cat.name}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default CategoryGrid;
