import StoreLayout from '@/components/layout/StoreLayout';
import HeroBanner from '@/components/home/HeroBanner';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import BrandStrip from '@/components/home/BrandStrip';
import TrustBanner from '@/components/home/TrustBanner';
import NewsletterCTA from '@/components/home/NewsletterCTA';

const Index = () => {
  return (
    <StoreLayout>
      <HeroBanner />
      <CategoryGrid />
      <FeaturedProducts />
      <BrandStrip />
      <TrustBanner />
      <NewsletterCTA />
    </StoreLayout>
  );
};

export default Index;
