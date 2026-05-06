import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useState, useRef, memo } from 'react';
import { optimizedImage, srcSet } from '@/lib/image';

interface ProductCardProps {
  id: string;
  title: string;
  slug: string;
  price: number;
  image?: string;
  featured?: boolean;
}

const ProductCard = memo(({ id, title, slug, price, image, featured }: ProductCardProps) => {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id, title, price, image: image || '/placeholder.svg' });
    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  };

  const optimized = optimizedImage(image, { width: 400, quality: 70 });
  const srcset = srcSet(image, 400, { quality: 70 });

  return (
    <div className="transition-transform duration-300 hover:-translate-y-1">
      <Link
        to={`/produto/${slug}`}
        className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 relative border border-border/30 block"
      >
        {featured && (
          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold shadow-md tracking-wide">
            <Star className="h-3 w-3 fill-current" />
            Destaque
          </div>
        )}

        <div className="aspect-[3/4] bg-muted overflow-hidden">
          <img
            src={optimized}
            srcSet={srcset || undefined}
            sizes="(max-width: 768px) 50vw, 25vw"
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
            decoding="async"
            width={400}
            height={533}
          />
        </div>

        <div className="p-3.5">
          <h3 className="text-sm font-medium text-foreground/85 line-clamp-2 mb-2.5 min-h-[2.5rem] leading-snug">
            {title}
          </h3>
          <div className="flex items-center justify-between gap-2">
            <span className="text-base font-bold text-primary tracking-tight">
              R$ {price.toFixed(2).replace('.', ',')}
            </span>
            <Button
              ref={btnRef}
              size="icon"
              className="h-8 w-8 rounded-full bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-300 shrink-0 active:scale-90"
              variant="ghost"
              aria-label={added ? 'Adicionado' : 'Adicionar ao carrinho'}
              onClick={handleAdd}
            >
              {added ? (
                <Check className="h-4 w-4" strokeWidth={2.5} />
              ) : (
                <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
              )}
            </Button>
          </div>
        </div>
      </Link>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
