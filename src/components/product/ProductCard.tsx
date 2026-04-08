import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ProductCardProps {
  id: string;
  title: string;
  slug: string;
  price: number;
  image?: string;
  featured?: boolean;
}

const FlyingDot = ({ startX, startY, onDone }: { startX: number; startY: number; onDone: () => void }) => {
  // Target: bottom-right where FloatingCart lives
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

const ProductCard = ({ id, title, slug, price, image, featured }: ProductCardProps) => {
  const { addItem } = useCart();
  const [flying, setFlying] = useState(false);
  const [flyPos, setFlyPos] = useState({ x: 0, y: 0 });
  const [added, setAdded] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Get button position for fly animation
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      setFlyPos({ x: rect.left + rect.width / 2 - 16, y: rect.top + rect.height / 2 - 16 });
      setFlying(true);
    }

    addItem({ id, title, price, image: image || '/placeholder.svg' });

    // Brief checkmark feedback
    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  };

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
      <Link
        to={`/produto/${slug}`}
        className="group bg-transparent rounded-none overflow-hidden transition-all duration-500 relative block"
      >
        {featured && (
          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold shadow-md tracking-wide">
            <Star className="h-3 w-3 fill-current" />
            Destaque
          </div>
        )}

        <div className="aspect-[4/5] bg-secondary/20 overflow-hidden relative">
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500 pointer-events-none" />
          <img
            src={image || '/placeholder.svg'}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
            loading="lazy"
          />
        </div>

        <div className="pt-4 pb-2">
          <h3 className="text-sm font-light text-foreground uppercase tracking-widest line-clamp-2 md:truncate mb-2">
            {title}
          </h3>
          <div className="flex items-center justify-between gap-2 mt-1">
            <span className="text-sm font-medium text-foreground/80 tracking-widest">
              R$ {price.toFixed(2).replace('.', ',')}
            </span>
            <motion.div whileTap={{ scale: 0.85 }}>
              <Button
                ref={btnRef}
                size="icon"
                className="h-8 w-8 rounded-full bg-transparent border border-foreground/20 text-foreground hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-white transition-all duration-500 shrink-0"
                variant="ghost"
                onClick={handleAdd}
              >
                <AnimatePresence mode="wait">
                  {added ? (
                    <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Check className="h-4 w-4" strokeWidth={2.5} />
                    </motion.div>
                  ) : (
                    <motion.div key="bag" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </div>
      </Link>

      {flying && (
        <FlyingDot
          startX={flyPos.x}
          startY={flyPos.y}
          onDone={() => setFlying(false)}
        />
      )}
    </motion.div>
  );
};

export default ProductCard;
