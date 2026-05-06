import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import BottomNavBar from './BottomNavBar';

import { useStoreCustomization } from '@/hooks/useStoreCustomization';

interface StoreLayoutProps {
  children: ReactNode;
}

const StoreLayout = ({ children }: StoreLayoutProps) => {
  const { data: customization } = useStoreCustomization();
  const promoText = customization?.promo_bar_text || '✨ Frete grátis acima de R$ 50,00 • Parcele em até 3x';

  return (
    <div className="flex flex-col min-h-screen">
      {/* Promo bar marquee */}
      <div className="bg-bruna-dark text-center py-1.5 px-4 overflow-hidden">
        <motion.p
          className="text-[11px] tracking-widest uppercase text-accent/90 font-medium whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          {promoText} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {promoText}
        </motion.p>
      </div>

      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <Footer />
      <WhatsAppButton />
      
      <BottomNavBar />
    </div>
  );
};

export default StoreLayout;
