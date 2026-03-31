import { ReactNode } from 'react';

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
      <Header />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <Footer />
      <WhatsAppButton />
      <FloatingCart />
      <BottomNavBar />
    </div>
  );
};

export default StoreLayout;
