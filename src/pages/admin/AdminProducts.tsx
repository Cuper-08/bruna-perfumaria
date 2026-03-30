import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Plus, Pencil, Trash2, Search } from 'lucide-react';
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

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('title');
    if (data) setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from('products').update({ active: !active }).eq('id', id);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active: !active } : p)));
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    await supabase.from('products').update({ featured: !featured }).eq('id', id);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, featured: !featured } : p)));
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
