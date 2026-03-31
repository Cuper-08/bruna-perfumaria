import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import brunaLogo from '@/assets/bruna-logo.png';
import { useStoreCustomization } from '@/hooks/useStoreCustomization';

const floatingBlobs = [
  { size: 'w-72 h-72', pos: '-top-20 -right-20', bg: 'bg-white/[0.04]', duration: 7, delay: 0 },
  { size: 'w-56 h-56', pos: '-bottom-16 -left-16', bg: 'bg-white/[0.03]', duration: 9, delay: 1 },
  { size: 'w-40 h-40', pos: 'top-1/4 right-1/4', bg: 'bg-accent/[0.08]', duration: 6, delay: 0.5 },
  { size: 'w-28 h-28', pos: 'bottom-1/3 left-1/5', bg: 'bg-white/[0.05]', duration: 8, delay: 2 },
];

const HeroBanner = () => {
  const { data: customization } = useStoreCustomization();

  const heroTitle = customization?.hero_title || 'Beleza, fragrância e cuidado';
  const heroSubtitle = customization?.hero_subtitle || 'Qualidade e beleza em um só lugar.';
  const ctaText = customization?.hero_cta_text || 'Ver Coleção';
  const ctaLink = customization?.hero_cta_link || '/categoria/perfumes';

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/85">
      {/* Floating blobs */}
      {floatingBlobs.map((blob, i) => (
        <motion.div
          key={i}
          className={`absolute ${blob.pos} ${blob.size} ${blob.bg} rounded-full pointer-events-none blur-xl`}
          animate={{
            y: [0, -20, 0, 15, 0],
            x: [0, 10, -10, 5, 0],
            scale: [1, 1.08, 0.95, 1.05, 1],
          }}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            delay: blob.delay,
            ease: 'easeInOut' as const,
          }}
        />
      ))}

      {/* Sparkle particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute w-1 h-1 bg-accent/40 rounded-full"
            style={{
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 2 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.7,
              ease: 'easeInOut' as const,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-16 md:py-28 relative z-10">
        <motion.div
          className="flex flex-col items-center text-center max-w-lg mx-auto px-6 py-10 md:px-10 md:py-14"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' as const }}
        >
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' as const }}
          >
            <img
              src={brunaLogo}
              alt="Bruna Perfumaria"
              className="h-32 md:h-44 w-auto object-contain drop-shadow-lg"
            />
          </motion.div>

          <motion.div
            className="w-32 h-px animate-shimmer rounded-full mb-6"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />

          <motion.h1
            className="font-display italic text-2xl md:text-4xl font-bold text-primary-foreground mb-3 tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {heroTitle}
          </motion.h1>
          <motion.p
            className="text-primary-foreground/65 text-sm md:text-base mb-8 tracking-wide"
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
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded-full text-sm font-semibold tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              {ctaText}
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroBanner;
