import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, ShoppingBag, Menu } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import brunaLogo from '@/assets/bruna-logo.webp';
import HeaderMobileMenu from './HeaderMobileMenu';
import HeaderSearchOverlay from './HeaderSearchOverlay';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount, openCart } = useCart();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const { data: categories } = useQuery({
    queryKey: ['header-categories'],
    queryFn: async () => {
      const { data } = await supabase
        .from('categories')
        .select('name, slug')
        .eq('active', true)
        .order('sort_order', { ascending: true })
        .limit(6);
      return data ?? [];
    },
  });

  const headerClass = scrolled ? 'glass-soft shadow-sm' : 'bg-transparent';

  return (
    <>
      <header className={`sticky top-0 z-40 transition-all duration-300 ${headerClass}`}>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Left — hamburger (mobile) + nav (desktop) */}
            <div className="flex-1 flex items-center">
              <button
                type="button"
                aria-label="Abrir menu"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-full hover:bg-foreground/5 transition-colors"
              >
                <Menu className="h-5 w-5" strokeWidth={1.5} />
              </button>

              <nav className="hidden lg:flex items-center gap-7">
                {(categories ?? []).map((c) => (
                  <NavLink
                    key={c.slug}
                    to={`/categoria/${c.slug}`}
                    className={({ isActive }) =>
                      `nav-link relative py-2 group ${isActive ? 'text-foreground' : ''}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {c.name}
                        <span className={`absolute left-1/2 -bottom-0.5 -translate-x-1/2 h-px bg-accent transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Center — logo */}
            <Link to="/" className="flex items-center shrink-0">
              <img
                src={brunaLogo}
                alt="Bruna Perfumaria"
                className="h-10 md:h-12 w-auto object-contain"
                width={120}
                height={48}
              />
            </Link>

            {/* Right — search + cart */}
            <div className="flex-1 flex items-center justify-end gap-1">
              <button
                type="button"
                aria-label="Buscar produtos"
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-full hover:bg-foreground/5 transition-colors"
              >
                <Search className="h-5 w-5" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                aria-label={`Carrinho com ${itemCount} ${itemCount === 1 ? 'item' : 'itens'}`}
                onClick={openCart}
                className="relative p-2 rounded-full hover:bg-foreground/5 transition-colors"
              >
                <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <HeaderMobileMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
      <HeaderSearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Header;
