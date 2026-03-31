import StoreLayout from '@/components/layout/StoreLayout';
import HeroBanner from '@/components/home/HeroBanner';
import CategoryGrid from '@/components/home/CategoryGrid';
import TrustBanner from '@/components/home/TrustBanner';
import FeaturedProducts from '@/components/home/FeaturedProducts';

const Index = () => {
  return (
    <StoreLayout>
      <HeroBanner />
      <CategoryGrid />
      <TrustBanner />
      <FeaturedProducts />
    </StoreLayout>
  );
};

export default Index;
