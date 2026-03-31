import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import BottomNavBar from './BottomNavBar';
import FloatingCart from './FloatingCart';

interface StoreLayoutProps {
  children: ReactNode;
}

const StoreLayout = ({ children }: StoreLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Promo bar marquee */}
      <div className="bg-bruna-dark text-center py-1.5 px-4 overflow-hidden">
        <motion.p
          className="text-[11px] tracking-widest uppercase text-accent/90 font-medium whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          ✨ Frete grátis acima de R$199 • Parcele em até 3x &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ✨ Frete grátis acima de R$199 • Parcele em até 3x
        </motion.p>
      </div>

      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <Footer />
      <WhatsAppButton />
      <FloatingCart />
      <BottomNavBar />
    </div>
  );
};

export default StoreLayout;
