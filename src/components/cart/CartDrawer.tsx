import { Link } from 'react-router-dom';
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { optimizedImage } from '@/lib/image';

const CartDrawer = () => {
  const { items, itemCount, subtotal, updateQuantity, removeItem, isCartOpen, closeCart } = useCart();

  return (
    <Sheet open={isCartOpen} onOpenChange={(open) => { if (!open) closeCart(); }}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 bg-card/95 backdrop-blur-xl border-l border-border/50 flex flex-col"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40 space-y-0">
          <SheetTitle className="font-display text-xl flex items-center justify-between">
            <span>Seu Carrinho</span>
            {itemCount > 0 && (
              <span className="eyebrow text-foreground/60">{itemCount} {itemCount === 1 ? 'item' : 'itens'}</span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
            <div className="w-20 h-20 rounded-full bg-muted/40 flex items-center justify-center">
              <ShoppingBag className="h-9 w-9 text-foreground/30" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-display text-xl mb-1">Seu carrinho está vazio</p>
              <p className="text-sm text-muted-foreground">Adicione produtos para começar</p>
            </div>
            <SheetClose asChild>
              <Button asChild className="rounded-full mt-2 gap-2">
                <Link to="/categorias">
                  Explorar produtos
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 group">
                  <img
                    src={optimizedImage(item.image, { width: 160 })}
                    alt={item.title}
                    loading="lazy"
                    className="w-20 h-20 rounded-xl object-cover bg-muted shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-medium leading-snug line-clamp-2">{item.title}</h4>
                      <p className="text-primary font-bold text-sm mt-1">
                        R$ {item.price.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5 bg-muted/40 rounded-full p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Diminuir quantidade"
                          className="h-7 w-7 rounded-full hover:bg-card flex items-center justify-center transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-semibold w-5 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Aumentar quantidade"
                          className="h-7 w-7 rounded-full hover:bg-card flex items-center justify-center transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label="Remover item"
                        className="text-foreground/40 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border/40 px-6 py-5 space-y-4 bg-card/80 backdrop-blur-md">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Subtotal</p>
                  <p className="font-display text-2xl font-bold">
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <p className="text-[11px] text-muted-foreground text-right">
                  Frete calculado<br />no checkout
                </p>
              </div>
              <SheetClose asChild>
                <Button asChild size="lg" className="w-full rounded-full font-semibold gap-2 h-12">
                  <Link to="/checkout">
                    Finalizar Compra
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Link to="/carrinho" className="block text-center text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors">
                  Ver carrinho completo
                </Link>
              </SheetClose>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
