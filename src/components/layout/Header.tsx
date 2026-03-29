import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import brunaLogo from '@/assets/bruna-logo.webp';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-primary shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src={brunaLogo}
              alt="Bruna Perfumaria"
              className="h-9 w-9 md:h-10 md:w-10 rounded-full object-cover border-2 border-white/30"
            />
            <div className="flex flex-col">
              <span className="font-display italic text-xl md:text-2xl font-semibold text-primary-foreground tracking-tight leading-none">
                Bruna
              </span>
              <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-primary-foreground/70 font-medium">
                Perfumaria
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Início', href: '/' },
              { label: 'Perfumes', href: '/categoria/perfumes' },
              { label: 'Maquiagem', href: '/categoria/maquiagem' },
              { label: 'Cabelo', href: '/categoria/cabelo' },
              { label: 'Corpo', href: '/categoria/corpo' },
              { label: 'Skincare', href: '/categoria/skincare' },
            ].map(link => (
              <Link
                key={link.href}
                to={link.href}
                className="px-3 py-2 text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors rounded-lg hover:bg-white/10"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search icon (desktop) */}
          <button className="hidden md:flex items-center justify-center h-9 w-9 rounded-full hover:bg-white/10 text-primary-foreground/80 hover:text-primary-foreground transition-colors">
            <Search className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
