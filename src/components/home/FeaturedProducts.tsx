import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const FeaturedProducts = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
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
        {/* Section title with ornaments */}
        <motion.div
          className="flex items-center justify-center gap-4 mb-8"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-px bg-accent/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-accent/50" />
          </div>
          <div className="text-center">
            <h2 className="font-display text-xl md:text-2xl font-semibold tracking-wide">
              Destaques
            </h2>
            <p className="text-[11px] text-muted-foreground tracking-widest uppercase mt-1">
              Selecionados para você
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent/50" />
            <div className="w-8 h-px bg-accent/40" />
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
        >
          {products.map(p => (
            <motion.div key={p.id} variants={item}>
              <ProductCard
                id={p.id}
                title={p.title}
                slug={p.slug}
                price={Number(p.price)}
                image={p.images?.[0]}
                featured={p.featured || false}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
