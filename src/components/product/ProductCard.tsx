import { Link } from 'react-router-dom';
import { ShoppingBag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

interface ProductCardProps {
  id: string;
  title: string;
  slug: string;
  price: number;
  image?: string;
  featured?: boolean;
}

const ProductCard = ({ id, title, slug, price, image, featured }: ProductCardProps) => {
  const { addItem } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id, title, price, image: image || '/placeholder.svg' });
    toast.success(`${title} adicionado à cesta!`);
  };

  return (
    <Link
      to={`/produto/${slug}`}
      className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-400 hover:-translate-y-1 relative border border-border/30"
    >
      {featured && (
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold shadow-md tracking-wide">
          <Star className="h-3 w-3 fill-current" />
          Destaque
        </div>
      )}

      <div className="aspect-[3/4] bg-muted overflow-hidden">
        <img
          src={image || '/placeholder.svg'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
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
            size="icon"
            className="h-8 w-8 rounded-full bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-300 shrink-0"
            variant="ghost"
            onClick={handleAdd}
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
