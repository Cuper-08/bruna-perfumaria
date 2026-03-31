import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import StoreLayout from '@/components/layout/StoreLayout';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
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
        <div className="container mx-auto px-4 py-10">
          <div className="grid md:grid-cols-2 gap-10">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-5">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-14 w-full rounded-full" />
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
      <div className="container mx-auto px-4 py-8 md:py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8 tracking-wide">
          <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
          <ChevronRight className="h-3 w-3" />
          {category && (
            <>
              <Link to={`/categoria/${category.slug}`} className="hover:text-foreground transition-colors">
                {category.name}
              </Link>
              <ChevronRight className="h-3 w-3" />
            </>
          )}
          <span className="text-foreground/60 truncate max-w-[200px]">{product.title}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="aspect-square bg-card rounded-2xl overflow-hidden shadow-sm border border-border/30">
              <img
                src={images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto scrollbar-hide">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 shrink-0 ${
                      i === selectedImage ? 'border-accent shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6 md:space-y-8">
            <div>
              {category && (
                <Link
                  to={`/categoria/${category.slug}`}
                  className="text-[10px] uppercase tracking-[0.2em] text-accent font-semibold hover:text-accent/80 transition-colors"
                >
                  {category.name}
                </Link>
              )}
              <h1 className="font-display text-2xl md:text-3xl font-bold mt-1 leading-tight">{product.title}</h1>
            </div>

            <div>
              <p className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
                R$ {Number(product.price).toFixed(2).replace('.', ',')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ou 3x de R$ {(Number(product.price) / 3).toFixed(2).replace('.', ',')} sem juros
              </p>
            </div>

            {product.description && (
              <div className="prose prose-sm text-muted-foreground leading-relaxed">
                <p>{product.description}</p>
              </div>
            )}

            <Button
              onClick={handleAdd}
              size="lg"
              className="w-full rounded-full font-semibold text-base gap-3 h-14 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              Adicionar ao Carrinho
            </Button>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
};

export default ProductPage;
