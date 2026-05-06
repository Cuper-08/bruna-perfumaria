import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import StoreLayout from '@/components/layout/StoreLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ChevronRight, Check } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useState, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

const FlyingDot = ({ startX, startY, onDone }: { startX: number; startY: number; onDone: () => void }) => {
  const endX = window.innerWidth - 28;
  const endY = window.innerHeight - 100;

  return createPortal(
    <motion.div
      initial={{ x: startX, y: startY, scale: 1, opacity: 1 }}
      animate={{
        x: [startX, (startX + endX) / 2, endX],
        y: [startY, startY - 60, endY],
        scale: [1, 0.8, 0.3],
        opacity: [1, 1, 0],
      }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      onAnimationComplete={onDone}
      className="fixed top-0 left-0 z-[9999] pointer-events-none"
      style={{ width: 32, height: 32 }}
    >
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
        <ShoppingBag className="h-4 w-4 text-primary-foreground" />
      </div>
    </motion.div>,
    document.body
  );
};

const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [flying, setFlying] = useState(false);
  const [flyPos, setFlyPos] = useState({ x: 0, y: 0 });
  const [added, setAdded] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .eq('slug', slug!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const handleAdd = () => {
    if (!product) return;

    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      setFlyPos({ x: rect.left + rect.width / 2 - 16, y: rect.top + rect.height / 2 - 16 });
      setFlying(true);
    }

    addItem({
      id: product.id,
      title: product.title,
      price: Number(product.price),
      image: product.images?.[0] || '/placeholder.svg',
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  };

  if (isLoading) {
    return (
      <StoreLayout>
        <PageHeader />
        <div className="container mx-auto px-4 py-10">
          <div className="grid md:grid-cols-2 gap-10">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-5">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-14 w-full rounded-full" />
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (!product) {
    return (
      <StoreLayout>
        <PageHeader />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-lg text-muted-foreground">Produto não encontrado</p>
          <Button asChild variant="link" className="mt-4">
            <Link to="/">Voltar ao início</Link>
          </Button>
        </div>
      </StoreLayout>
    );
  }

  const images = product.images?.length ? product.images : ['/placeholder.svg'];
  const category = product.categories as { name: string; slug: string } | null;

  return (
    <StoreLayout>
      <PageHeader />
      <div className="container mx-auto px-4 py-8 md:py-10">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8 tracking-wide">
          <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
          <ChevronRight className="h-3 w-3" />
          {category && (
            <>
              <Link to={`/categoria/${category.slug}`} className="hover:text-foreground transition-colors">
                {category.name}
              </Link>
              <ChevronRight className="h-3 w-3" />
            </>
          )}
          <span className="text-foreground/60 truncate max-w-[200px]">{product.title}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-3">
            <div className="aspect-square bg-card rounded-2xl overflow-hidden shadow-sm border border-border/30">
              <img
                src={images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto scrollbar-hide">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 shrink-0 ${
                      i === selectedImage ? 'border-accent shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6 md:space-y-8">
            <div>
              {category && (
                <Link
                  to={`/categoria/${category.slug}`}
                  className="text-[10px] uppercase tracking-[0.2em] text-accent font-semibold hover:text-accent/80 transition-colors"
                >
                  {category.name}
                </Link>
              )}
              <h1 className="font-display text-2xl md:text-3xl font-bold mt-1 leading-tight">{product.title}</h1>
            </div>

            <div>
              <p className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
                R$ {Number(product.price).toFixed(2).replace('.', ',')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ou 3x de R$ {(Number(product.price) / 3).toFixed(2).replace('.', ',')} sem juros
              </p>
            </div>

            {product.description && (
              <div className="prose prose-sm text-muted-foreground leading-relaxed">
                <p>{product.description}</p>
              </div>
            )}

            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                ref={btnRef}
                onClick={handleAdd}
                size="lg"
                className="w-full rounded-full font-semibold text-base gap-3 h-14 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <AnimatePresence mode="wait">
                  {added ? (
                    <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-2">
                      <Check className="h-5 w-5" strokeWidth={2.5} />
                      Adicionado!
                    </motion.div>
                  ) : (
                    <motion.div key="bag" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
                      Adicionar ao Carrinho
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {flying && (
        <FlyingDot startX={flyPos.x} startY={flyPos.y} onDone={() => setFlying(false)} />
      )}
    </StoreLayout>
  );
};

export default ProductPage;
