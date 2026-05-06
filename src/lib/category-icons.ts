import perfumes from '@/assets/categories/perfumes.webp';
import maquiagem from '@/assets/categories/maquiagem.webp';
import cabelo from '@/assets/categories/cabelo.webp';
import corpo from '@/assets/categories/corpo.webp';
import skincare from '@/assets/categories/skincare.webp';
import higiene from '@/assets/categories/higiene.webp';

export const categoryImages: Record<string, string> = {
  perfumes,
  perfume: perfumes,
  maquiagem,
  makeup: maquiagem,
  cabelo,
  cabelos: cabelo,
  corpo,
  body: corpo,
  skincare,
  'skin-care': skincare,
  higiene,
  'higiene-pessoal': higiene,
};

export const getCategoryImage = (slug?: string | null): string | undefined => {
  if (!slug) return undefined;
  return categoryImages[slug.toLowerCase()];
};
