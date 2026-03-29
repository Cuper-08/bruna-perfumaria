import { ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const FloatingCart = () => {
  const { items, itemCount, subtotal, updateQuantity, removeItem } = useCart();

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6">
      <Sheet>
        <SheetTrigger asChild>
          <button className="glass-primary rounded-full h-14 w-14 flex items-center justify-center text-primary-foreground shadow-2xl hover:scale-105 active:scale-95 transition-transform">
            <ShoppingBag className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce-in">
              {itemCount}
            </span>
          </button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="font-display text-xl">Sua Cesta</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex gap-3 p-3 rounded-xl bg-muted/50">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-sm font-bold text-primary mt-0.5">
                    R$ {item.price.toFixed(2).replace('.', ',')}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="h-6 w-6 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-6 w-6 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-bold text-lg">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
            </div>
            <Button asChild className="w-full h-12 rounded-xl text-base font-semibold">
              <Link to="/carrinho">Finalizar Pedido</Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default FloatingCart;
