import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import StoreLayout from '@/components/layout/StoreLayout';
import PageHeader from '@/components/layout/PageHeader';
import ProductCard from '@/components/product/ProductCard';
import { useProductSearch } from '@/hooks/useProductSearch';
import { Skeleton } from '@/components/ui/skeleton';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { data: products, isLoading } = useProductSearch(query);

  return (
    <StoreLayout>
      <PageHeader title="Buscar" />
      <div className="container mx-auto px-4 py-8 min-h-[60vh]">
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Resultados para "<span className="text-primary">{query}</span>"
          </h1>
          {products && (
            <p className="text-sm text-muted-foreground mt-1">
              {products.length} {products.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                slug={product.slug}
                price={product.price}
                image={product.images?.[0]}
                featured={product.featured ?? false}
              />
            ))}
          </div>
        ) : query.length >= 2 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-7 w-7 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Nenhum produto encontrado</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Não encontramos resultados para "{query}". Tente buscar com outros termos.
            </p>
          </div>
        ) : null}
      </div>
    </StoreLayout>
  );
};

export default SearchPage;
