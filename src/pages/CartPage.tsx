import { Link } from 'react-router-dom';
import StoreLayout from '@/components/layout/StoreLayout';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

const CartPage = () => {
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
          <h1 className="font-display text-2xl font-semibold mb-2">Carrinho vazio</h1>
          <p className="text-muted-foreground mb-6">Adicione produtos para começar suas compras 🌸</p>
          <Button asChild className="rounded-full">
            <Link to="/">Explorar Produtos</Link>
          </Button>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="font-display text-2xl md:text-3xl font-bold mb-6">
          Carrinho ({itemCount} {itemCount === 1 ? 'item' : 'itens'})
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => (
              <div
                key={item.id}
                className="flex gap-4 bg-card border border-border rounded-xl p-4 animate-fade-in"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-20 h-20 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm line-clamp-2">{item.title}</h3>
                  <p className="text-primary font-bold mt-1">
                    R$ {item.price.toFixed(2).replace('.', ',')}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-full"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-full"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-bold">
                    R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-card border border-border rounded-xl p-6 h-fit sticky top-24">
            <h2 className="font-display text-lg font-semibold mb-4">Resumo</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Entrega</span>
                <span className="text-muted-foreground text-xs">Calculada no checkout</span>
              </div>
            </div>
            <div className="border-t border-border mt-4 pt-4 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
            </div>
            <Button asChild className="w-full mt-6 rounded-full font-semibold gap-2" size="lg">
              <Link to="/checkout">
                Finalizar Pedido
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
};

export default CartPage;
