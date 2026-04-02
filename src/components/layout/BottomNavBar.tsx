import { Home, Grid3X3, Flame, ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { motion, useAnimation } from 'framer-motion';
import { useEffect, useCallback } from 'react';

const navTabs = [
  { label: 'Início', icon: Home, href: '/' },
  { label: 'Categorias', icon: Grid3X3, href: '/categorias' },
  { label: 'Em Alta', icon: Flame, href: '/destaques' },
];

const BottomNavBar = () => {
  const { pathname } = useLocation();
  const { items, itemCount, subtotal, updateQuantity, removeItem } = useCart();
  const controls = useAnimation();

  const handleBounce = useCallback(() => {
    controls.start({
      scale: [1, 1.25, 0.95, 1.1, 1],
      transition: { duration: 0.5, ease: 'easeInOut' },
    });
  }, [controls]);

  useEffect(() => {
    window.addEventListener('cart-item-added', handleBounce);
    return () => window.removeEventListener('cart-item-added', handleBounce);
  }, [handleBounce]);

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden">
      <div className="backdrop-blur-2xl bg-white/80 border-t border-accent/15 px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16">
          {navTabs.map(tab => {
            const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
            return (
              <Link
                key={tab.href}
                to={tab.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-300 ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/8' : ''}`}>
                  <tab.icon className={`h-5 w-5 transition-all duration-300 ${isActive ? 'stroke-[2]' : 'stroke-[1.5]'}`} />
                  {isActive && (
                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                  )}
                </div>
                <span className={`text-[10px] tracking-wide ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}

          {/* Cart tab with Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <motion.button
                animate={controls}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-300 text-muted-foreground hover:text-foreground"
              >
                <div className="relative p-1.5 rounded-xl">
                  <ShoppingBag className="h-5 w-5 stroke-[1.5]" />
                  {itemCount > 0 && (
                    <motion.span
                      key={itemCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                      className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </div>
                <span className="text-[10px] tracking-wide font-medium">Cesta</span>
              </motion.button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col">
              <SheetHeader>
                <SheetTitle className="font-display text-xl">Sua Cesta</SheetTitle>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                {items.length === 0 ? (
                  <p className="text-center text-muted-foreground py-10">Sua cesta está vazia</p>
                ) : (
                  items.map(item => (
                    <div key={item.id} className="flex gap-3 p-3 rounded-xl bg-muted/50">
                      <img src={item.image} alt={item.title} className="h-16 w-16 rounded-lg object-cover" />
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
                  ))
                )}
              </div>

              {itemCount > 0 && (
                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-bold text-lg">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <Button asChild className="w-full h-12 rounded-xl text-base font-semibold">
                    <Link to="/carrinho">Finalizar Pedido</Link>
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default BottomNavBar;
