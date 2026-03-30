import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Package } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('products').select('*').order('title');
      if (data) setProducts(data);
    };
    fetch();
  }, []);

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from('products').update({ active: !active }).eq('id', id);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active: !active } : p)));
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    await supabase.from('products').update({ featured: !featured }).eq('id', id);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, featured: !featured } : p)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-sans">Produtos</h2>
        <span className="text-sm text-muted-foreground">{products.length} produtos</span>
      </div>

      <div className="space-y-3">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="py-4 flex items-center gap-4">
              <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {product.images && product.images.length > 0 ? (
                  <img src={product.images[0]} alt={product.title} className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{product.title}</p>
                <p className="text-primary font-bold text-sm">R$ {Number(product.price).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">Ativo</span>
                  <Switch checked={product.active ?? false} onCheckedChange={() => toggleActive(product.id, product.active ?? false)} />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">Destaque</span>
                  <Switch checked={product.featured ?? false} onCheckedChange={() => toggleFeatured(product.id, product.featured ?? false)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminProducts;
