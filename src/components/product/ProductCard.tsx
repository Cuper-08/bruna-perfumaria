import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

interface ProductCardProps {
  id: string;
  title: string;
  slug: string;
  price: number;
  image?: string;
}

const ProductCard = ({ id, title, slug, price, image }: ProductCardProps) => {
  const { addItem } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id, title, price, image: image || '/placeholder.svg' });
    toast.success(`${title} adicionado ao carrinho!`);
  };

  return (
    <Link
      to={`/produto/${slug}`}
      className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
    >
      <div className="aspect-square bg-muted overflow-hidden">
        <img
          src={image || '/placeholder.svg'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div className="p-3 md:p-4">
        <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-2 min-h-[2.5rem]">
          {title}
        </h3>
        <div className="flex items-center justify-between gap-2">
          <span className="text-lg font-bold text-primary">
            R$ {price.toFixed(2).replace('.', ',')}
          </span>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full shrink-0"
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
