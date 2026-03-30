import { Search } from 'lucide-react';
import brunaLogo from '@/assets/bruna-logo.png';

const HeroBanner = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/85">
      {/* Decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-1/4 w-24 h-24 rounded-full bg-white/5 animate-pulse-soft" />
      </div>

      <div className="container mx-auto px-4 py-10 md:py-16 relative z-10">
        <div className="flex flex-col items-center text-center">
          {/* Logo */}
          <div className="mb-5 animate-scale-in">
            <img
              src={brunaLogo}
              alt="Bruna Perfumaria"
              className="h-28 md:h-40 w-auto object-contain"
            />
          </div>

          {/* Tagline */}
          <h1 className="font-display italic text-2xl md:text-4xl font-bold text-primary-foreground mb-2 animate-fade-in">
            Beleza, fragrância e cuidado
          </h1>
          <p className="text-primary-foreground/75 text-sm md:text-base mb-6 max-w-md animate-fade-in">
            Perfumes importados, maquiagem e skincare com entrega rápida por motoboy 🛵
          </p>

          {/* Gold shimmer divider */}
          <div className="w-20 h-0.5 animate-shimmer rounded-full mb-6" />

          {/* Search bar glassmorphism */}
          <div className="w-full max-w-sm animate-slide-up">
            <div className="backdrop-blur-xl bg-white/20 border border-white/25 shadow-lg rounded-2xl flex items-center gap-3 px-4 py-3 hover:bg-white/30 transition-colors">
              <Search className="h-4 w-4 text-white/70 shrink-0" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                className="bg-transparent outline-none text-sm text-white placeholder:text-white/60 w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
