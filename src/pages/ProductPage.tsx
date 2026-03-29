import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import StoreLayout from '@/components/layout/StoreLayout';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ChevronLeft } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .eq('slug', slug!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const handleAdd = () => {
    if (!product) return;
    addItem({
      id: product.id,
      title: product.title,
      price: Number(product.price),
      image: product.images?.[0] || '/placeholder.svg',
    });
    toast.success(`${product.title} adicionado ao carrinho!`);
  };

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (!product) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-lg text-muted-foreground">Produto não encontrado</p>
          <Button asChild variant="link" className="mt-4">
            <Link to="/">Voltar ao início</Link>
          </Button>
        </div>
      </StoreLayout>
    );
  }

  const images = product.images?.length ? product.images : ['/placeholder.svg'];
  const category = product.categories as { name: string; slug: string } | null;

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Início</Link>
          <span>/</span>
          {category && (
            <>
              <Link to={`/categoria/${category.slug}`} className="hover:text-primary transition-colors">
                {category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground">{product.title}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="aspect-square bg-muted rounded-xl overflow-hidden">
              <img
                src={images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors shrink-0 ${
                      i === selectedImage ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">{product.title}</h1>
              {category && (
                <Link
                  to={`/categoria/${category.slug}`}
                  className="text-sm text-muted-foreground hover:text-primary mt-1 inline-block"
                >
                  {category.name}
                </Link>
              )}
            </div>

            <p className="text-3xl font-bold text-primary">
              R$ {Number(product.price).toFixed(2).replace('.', ',')}
            </p>

            {product.description && (
              <div className="prose prose-sm text-muted-foreground">
                <p>{product.description}</p>
              </div>
            )}

            <Button
              onClick={handleAdd}
              size="lg"
              className="w-full rounded-full font-semibold text-base gap-3"
            >
              <ShoppingBag className="h-5 w-5" />
              Adicionar ao Carrinho
            </Button>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
};

export default ProductPage;
