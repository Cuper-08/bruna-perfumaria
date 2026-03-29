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
      className="group bg-card rounded-2xl border border-border/60 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative"
    >
      {featured && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold shadow-md">
          <Star className="h-3 w-3 fill-current" />
          Destaque
        </div>
      )}

      <div className="aspect-square bg-muted overflow-hidden">
        <img
          src={image || '/placeholder.svg'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>

      <div className="p-3">
        <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-2 min-h-[2.5rem] leading-tight">
          {title}
        </h3>
        <div className="flex items-center justify-between gap-2">
          <span className="text-base font-bold text-primary">
            R$ {price.toFixed(2).replace('.', ',')}
          </span>
          <Button
            size="icon"
            className="h-8 w-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 shrink-0"
            variant="ghost"
            onClick={handleAdd}
          >
            <ShoppingBag className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
