import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const slides = [
  {
    title: 'Fragrâncias que Encantam',
    subtitle: 'Descubra perfumes importados e nacionais com os melhores preços',
    cta: 'Ver Perfumes',
    href: '/categoria/perfumes',
    gradient: 'from-primary to-primary/70',
  },
  {
    title: 'Beleza que Inspira',
    subtitle: 'Maquiagem, skincare e cuidados para realçar sua beleza natural',
    cta: 'Ver Maquiagem',
    href: '/categoria/maquiagem',
    gradient: 'from-accent to-accent/70',
  },
  {
    title: 'Entrega Rápida',
    subtitle: 'Receba seus produtos favoritos na porta da sua casa por motoboy',
    cta: 'Comprar Agora',
    href: '/categoria/corpo',
    gradient: 'from-bruna-rose to-bruna-pink',
  },
];

const HeroBanner = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <section className="relative overflow-hidden">
      <div
        className={`bg-gradient-to-br ${slide.gradient} transition-all duration-700 ease-in-out`}
      >
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-xl animate-fade-in" key={current}>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {slide.title}
            </h1>
            <p className="text-white/90 text-base md:text-lg mb-6">
              {slide.subtitle}
            </p>
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold rounded-full px-8">
              <Link to={slide.href}>{slide.cta}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
          />
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={() => setCurrent(prev => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition hidden md:block"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => setCurrent(prev => (prev + 1) % slides.length)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition hidden md:block"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </section>
  );
};

export default HeroBanner;
