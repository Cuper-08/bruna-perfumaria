import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import brunaLogo from '@/assets/bruna-logo.png';

const HeroBanner = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/80">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/[0.03]" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/[0.03]" />
        <div className="absolute top-1/3 right-1/5 w-32 h-32 rounded-full bg-accent/[0.06] animate-pulse-soft" />
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        <div className="flex flex-col items-center text-center max-w-lg mx-auto">
          {/* Logo */}
          <div className="mb-6 animate-scale-in">
            <img
              src={brunaLogo}
              alt="Bruna Perfumaria"
              className="h-24 md:h-36 w-auto object-contain drop-shadow-lg"
            />
          </div>

          {/* Gold shimmer divider */}
          <div className="w-24 h-px animate-shimmer rounded-full mb-6" />

          {/* Tagline */}
          <h1 className="font-display italic text-2xl md:text-4xl font-bold text-primary-foreground mb-3 tracking-wide animate-fade-in">
            Beleza, fragrância e cuidado
          </h1>
          <p className="text-primary-foreground/65 text-sm md:text-base mb-8 tracking-wide animate-fade-in">
            Qualidade e beleza em um só lugar.
          </p>

          {/* CTA */}
          <Link
            to="/categoria/perfumes"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded-full text-sm font-semibold tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 animate-slide-up"
          >
            Ver Coleção
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
