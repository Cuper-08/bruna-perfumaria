import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';

const FeminineSilhouette = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 60" fill="currentColor" className={className}>
    <ellipse cx="20" cy="10" rx="8" ry="9" />
    <path d="M12 18 C10 22, 8 28, 10 34 C11 37, 13 38, 14 40 L14 55 C14 57, 16 58, 20 58 C24 58, 26 57, 26 55 L26 40 C27 38, 29 37, 30 34 C32 28, 30 22, 28 18 Z" />
    <path d="M10 34 C6 32, 4 28, 6 24" strokeWidth="2" stroke="currentColor" fill="none" />
    <path d="M30 34 C34 32, 36 28, 34 24" strokeWidth="2" stroke="currentColor" fill="none" />
  </svg>
);

const Header = () => {
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Início', href: '/' },
    { label: 'Perfumes', href: '/categoria/perfumes' },
    { label: 'Maquiagem', href: '/categoria/maquiagem' },
    { label: 'Cabelo', href: '/categoria/cabelo' },
    { label: 'Corpo', href: '/categoria/corpo' },
    { label: 'Skincare', href: '/categoria/skincare' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-primary shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-primary-foreground hover:bg-white/15"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <FeminineSilhouette className="h-9 w-6 text-primary-foreground/90 hidden sm:block" />
            <div className="flex flex-col items-center">
              <span className="font-display italic text-2xl md:text-3xl font-semibold text-primary-foreground tracking-tight">
                Bruna
              </span>
              <span className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-primary-foreground/80 -mt-1">
                Perfumaria
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className="px-3 py-2 text-sm font-medium text-primary-foreground/85 hover:text-primary-foreground transition-colors rounded-md hover:bg-white/15"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Cart */}
          <Link to="/carrinho" className="relative p-2">
            <ShoppingBag className="h-5 w-5 text-primary-foreground/90" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-white text-primary text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-fade-in">
                {itemCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="md:hidden pb-4 border-t border-white/20 pt-3 animate-fade-in">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-primary-foreground/85 hover:text-primary-foreground hover:bg-white/15 rounded-md transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
