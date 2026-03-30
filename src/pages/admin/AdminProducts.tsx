import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Plus, Pencil, Trash2, Search, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import ProductFormDialog from '@/components/admin/ProductFormDialog';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;
type Category = Tables<'categories'>;

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase.from('products').select('*').order('title');
      if (error) throw error;
      setProducts(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar produtos';
      setErrorMsg(msg);
      console.error('fetchProducts error:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  const toggleActive = async (id: string, active: boolean) => {
    const prev = products;
    setProducts((p) => p.map((x) => (x.id === id ? { ...x, active: !active } : x)));
    const { error } = await supabase.from('products').update({ active: !active }).eq('id', id);
    if (error) {
      toast.error('Erro ao alterar status');
      setProducts(prev); // rollback
    }
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    const prev = products;
    setProducts((p) => p.map((x) => (x.id === id ? { ...x, featured: !featured } : x)));
    const { error } = await supabase.from('products').update({ featured: !featured }).eq('id', id);
    if (error) {
      toast.error('Erro ao alterar destaque');
      setProducts(prev);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('products').delete().eq('id', deleteId);
    if (error) {
      toast.error('Erro ao excluir produto');
    } else {
      toast.success('Produto excluído');
      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
    }
    setDeleteId(null);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const openCreate = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const filtered = products.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'all' || p.category_id === filterCategory;
    return matchSearch && matchCategory;
  });

  const getCategoryName = (id: string | null) => categories.find((c) => c.id === id)?.name || '—';

  // Loading state
  if (loadingProducts) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Carregando produtos...</span>
      </div>
    );
  }

  // Error state
  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-destructive font-medium">{errorMsg}</p>
        <Button onClick={fetchProducts} variant="outline">Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Produtos</h2>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Novo Produto
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} produto(s)</p>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>Nenhum produto encontrado</p>
        </div>
      )}

      {/* Product List */}
      <div className="space-y-2">
        {filtered.map((product) => (
          <Card key={product.id}>
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {product.images && product.images.length > 0 ? (
                  <img src={product.images[0]} alt={product.title} className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-6 w-6 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{product.title}</p>
                <p className="text-xs text-muted-foreground">{getCategoryName(product.category_id)}</p>
                <p className="text-primary font-bold text-sm">R$ {Number(product.price).toFixed(2)}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[10px] text-muted-foreground">Ativo</span>
                  <Switch
                    checked={product.active ?? false}
                    onCheckedChange={() => toggleActive(product.id, product.active ?? false)}
                  />
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[10px] text-muted-foreground">Destaque</span>
                  <Switch
                    checked={product.featured ?? false}
                    onCheckedChange={() => toggleFeatured(product.id, product.featured ?? false)}
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(product.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Dialog */}
      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editingProduct}
        onSaved={fetchProducts}
      />

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O produto será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProducts;
