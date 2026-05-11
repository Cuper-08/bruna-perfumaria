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
    addItem({ id, title, price, image: image || '/placeholder.svg' }, { openDrawer: true });
    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  };

  const optimized = optimizedImage(image, { width: 400, quality: 70 });
  const srcset = srcSet(image, 400, { quality: 70 });

  return (
    <div className="group">
      <Link
        to={`/produto/${slug}`}
        className="block relative"
      >
        <div className="relative aspect-[3/4] bg-bruna-cream/60 overflow-hidden rounded-2xl ring-1 ring-inset ring-border/30 group-hover:ring-border/60 transition-all duration-500">
          {featured && (
            <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-foreground/85 text-background backdrop-blur-sm text-[10px] uppercase tracking-[0.15em] font-semibold">
              <Star className="h-2.5 w-2.5 fill-current" strokeWidth={1.5} />
              Destaque
            </div>
          )}
          <img
            src={optimized}
            srcSet={srcset || undefined}
            sizes="(max-width: 768px) 50vw, 25vw"
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            loading="lazy"
            decoding="async"
            width={400}
            height={533}
          />
          <Button
            ref={btnRef}
            size="icon"
            className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-card/95 backdrop-blur-md text-foreground hover:bg-foreground hover:text-background border border-border/40 transition-all duration-300 shadow-sm hover:shadow-lg active:scale-90 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0"
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

        <div className="pt-4 pb-2 px-1">
          <h3 className="font-display text-base md:text-lg font-medium text-foreground line-clamp-2 leading-snug min-h-[2.75rem]">
            {title}
          </h3>
          <p className="mt-2 text-base font-semibold text-foreground tracking-tight">
            R$ {price.toFixed(2).replace('.', ',')}
          </p>
        </div>
      </Link>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
