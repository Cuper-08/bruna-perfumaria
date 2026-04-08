import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import brunaLogo from '@/assets/bruna-logo.png';
import heroBg from '@/assets/hero_bg.png';
import { useStoreCustomization } from '@/hooks/useStoreCustomization';
import HeroSearchBar from '@/components/home/HeroSearchBar';

const HeroBanner = () => {
  const { data: customization } = useStoreCustomization();

  const heroTitle = customization?.hero_title || 'A essência do luxo, agora sua.';
  const heroSubtitle = customization?.hero_subtitle || 'Descubra coleções exclusivas desenhadas para revelar o seu melhor.';
  const ctaText = customization?.hero_cta_text || 'Ver Coleções';
  const ctaLink = customization?.hero_cta_link || '/categoria/perfumes';

  return (
    <section className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center justify-start overflow-hidden bg-black group">
      {/* Imagem de Fundo Premium - Gerada */}
      <motion.div 
        className="absolute inset-0 z-0"
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Degrade cinematográfico para garantir a leitura do texto */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t md:bg-gradient-to-r from-black/95 via-black/70 to-transparent" />

      <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10 w-full h-full">
        <motion.div
          className="flex flex-col items-start text-left max-w-xl py-12"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          >
            <img
              src={brunaLogo}
              alt="Bruna Perfumaria"
              className="h-16 md:h-24 w-auto object-contain drop-shadow-2xl brightness-200"
            />
          </motion.div>

          <motion.div
            className="w-16 h-px bg-bruna-gold mb-6"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            style={{ originX: 0 }}
          />

          <motion.h1
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {heroTitle}
          </motion.h1>
          <motion.p
            className="text-white/70 text-lg md:text-xl mb-10 tracking-wide font-light max-w-md"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            {heroSubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Link
              to={ctaLink}
              className="inline-flex items-center justify-center gap-3 bg-bruna-gold hover:bg-[#b0922f] text-white px-8 py-4 text-sm font-semibold tracking-[0.2em] uppercase transition-all duration-500 hover:tracking-[0.25em]"
            >
              {ctaText}
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroBanner;
