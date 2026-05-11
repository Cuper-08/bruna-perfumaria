import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import CartDrawer from '@/components/cart/CartDrawer';
import { useStoreCustomization } from '@/hooks/useStoreCustomization';

interface StoreLayoutProps {
  children: ReactNode;
}

const StoreLayout = ({ children }: StoreLayoutProps) => {
  const { data: customization } = useStoreCustomization();
  const promoText = customization?.promo_bar_text || 'Frete grátis acima de R$ 50,00 · Parcele em até 6x sem juros';

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Promo bar — static, editorial */}
      <div className="bg-bruna-dark text-bruna-cream/90 text-center px-4 py-2 text-[10px] tracking-[0.25em] uppercase">
        {promoText}
      </div>

      <Header />

      <main className="flex-1">{children}</main>

      <Footer />
      <WhatsAppButton />
      <CartDrawer />
    </div>
  );
};

export default StoreLayout;
