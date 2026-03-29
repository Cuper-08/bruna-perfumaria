import StoreLayout from '@/components/layout/StoreLayout';
import HeroBanner from '@/components/home/HeroBanner';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedProducts from '@/components/home/FeaturedProducts';

const Index = () => {
  return (
    <StoreLayout>
      <HeroBanner />
      <CategoryGrid />
      <FeaturedProducts />
    </StoreLayout>
  );
};

export default Index;
