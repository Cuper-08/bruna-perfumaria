import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useStoreCustomization } from '@/hooks/useStoreCustomization';
import { optimizedImage } from '@/lib/image';

const DEFAULT_HERO_IMAGE = 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80';

const HeroBanner = () => {
  const { data: customization } = useStoreCustomization();

  const eyebrow = customization?.hero_eyebrow || 'Coleção 2026';
  const heroTitle = customization?.hero_title || 'Beleza, fragrância\ne cuidado.';
  const heroSubtitle = customization?.hero_subtitle || 'Selecionamos os melhores produtos de perfumaria e cosmética para você.';
  const ctaText = customization?.hero_cta_text || 'Ver coleção';
  const ctaLink = customization?.hero_cta_link || '/categorias';
  const heroImage = customization?.hero_image_url || DEFAULT_HERO_IMAGE;

  return (
    <section className="relative bg-bruna-cream overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 py-16 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Text */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <p className="eyebrow mb-5 animate-slide-up" style={{ animationDelay: '0ms' }}>
              {eyebrow}
            </p>
            <h1 className="display-xl text-foreground mb-6 animate-slide-up whitespace-pre-line" style={{ animationDelay: '80ms' }}>
              {heroTitle}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8 animate-slide-up" style={{ animationDelay: '180ms' }}>
              {heroSubtitle}
            </p>
            <div className="animate-slide-up" style={{ animationDelay: '280ms' }}>
              <Link
                to={ctaLink}
                className="inline-flex items-center gap-3 group"
              >
                <span className="text-sm uppercase tracking-[0.2em] font-semibold text-foreground border-b border-foreground/30 pb-1 group-hover:border-foreground transition-colors">
                  {ctaText}
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2 animate-slide-up" style={{ animationDelay: '120ms' }}>
            <div className="relative aspect-[4/5] w-full max-w-md mx-auto lg:max-w-none rounded-2xl overflow-hidden shadow-2xl shadow-primary/10">
              <img
                src={optimizedImage(heroImage, { width: 1200, quality: 85 })}
                alt="Bruna Perfumaria"
                className="w-full h-full object-cover"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                width={800}
                height={1000}
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-foreground/5 rounded-2xl pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Subtle decorative element */}
      <div className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-accent/[0.05] blur-3xl pointer-events-none" />
      <div className="absolute -top-32 -right-24 w-96 h-96 rounded-full bg-primary/[0.04] blur-3xl pointer-events-none" />
    </section>
  );
};

export default HeroBanner;
