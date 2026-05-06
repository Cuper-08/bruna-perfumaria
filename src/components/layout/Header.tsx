import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import brunaLogo from '@/assets/bruna-logo.png';

const Header = () => {
  return (
    <motion.header
      className="sticky top-0 z-50"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Promo bar with marquee */}
      <div className="bg-bruna-dark text-center py-1.5 px-4 overflow-hidden">
        <motion.p
          className="text-[11px] tracking-widest uppercase text-accent/90 font-medium whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          ✨ Frete grátis acima de R$ 50,00 • Parcele em até 6x &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ✨ Frete grátis acima de R$ 50,00 • Parcele em até 6x
        </motion.p>
      </div>

      {/* Main header — glassmorphism */}
      <div className="bg-primary/80 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src={brunaLogo}
                alt="Bruna Perfumaria"
                className="h-12 md:h-14 w-auto object-contain drop-shadow-md"
              />
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
                  className="relative px-3 py-2 text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-accent rounded-full transition-all duration-300 group-hover:w-3/4" />
                </Link>
              ))}
            </nav>

            {/* Search icon (desktop) */}
            <button className="hidden md:flex items-center justify-center h-9 w-9 rounded-full hover:bg-white/10 text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              <Search className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
