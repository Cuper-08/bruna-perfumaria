import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import StoreLayout from '@/components/layout/StoreLayout';
import PageHeader from '@/components/layout/PageHeader';
import ProductCard from '@/components/product/ProductCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('relevance');

  const { data: category } = useQuery({
    queryKey: ['category', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', slug, sort],
    queryFn: async () => {
      let query = supabase.from('products').select('id, title, slug, price, images, featured').eq('active', true);

      if (category?.id) {
        query = query.eq('category_id', category.id);
      }

      if (sort === 'price_asc') query = query.order('price', { ascending: true });
      else if (sort === 'price_desc') query = query.order('price', { ascending: false });
      else query = query.order('created_at', { ascending: false });

      const { data, error } = await query.limit(60);
      if (error) throw error;
      return data;
    },
    enabled: !!category,
  });

  const filtered = products?.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <StoreLayout>
      <PageHeader title={category?.name || 'Produtos'} />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 tracking-wide">
          <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground/60">{category?.name || 'Produtos'}</span>
        </div>

        {/* Category header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-wide">
            {category?.name || 'Produtos'}
          </h1>
          <div className="w-12 h-0.5 bg-accent/50 rounded-full mt-2" />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <Input
              placeholder="Buscar produtos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 rounded-xl border-border/50 bg-card focus:border-accent/40"
            />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full sm:w-48 rounded-xl border-border/50 bg-card">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevância</SelectItem>
              <SelectItem value="price_asc">Menor preço</SelectItem>
              <SelectItem value="price_desc">Maior preço</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : filtered?.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-display">Nenhum produto encontrado</p>
            <p className="text-sm mt-2">Em breve teremos novidades! 🌸</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
            {filtered?.map(p => (
              <ProductCard
                key={p.id}
                id={p.id}
                title={p.title}
                slug={p.slug}
                price={Number(p.price)}
                image={p.images?.[0]}
              />
            ))}
          </div>
        )}
      </div>
    </StoreLayout>
  );
};

export default CategoryPage;
