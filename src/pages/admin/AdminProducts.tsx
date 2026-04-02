import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Plus, Pencil, Trash2, Search, AlertCircle, FileSpreadsheet, ArrowUpDown, Filter } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import ProductFormDialog from '@/components/admin/ProductFormDialog';
import BulkProductUpload from '@/components/admin/BulkProductUpload';
import type { Tables } from '@/integrations/supabase/types';
import { Badge } from '@/components/ui/badge';

type Product = Tables<'products'>;
type Category = Tables<'categories'>;

const ProductSkeleton = () => (
  <Card className="border-border/40 mb-3 shadow-sm">
    <CardContent className="py-3 px-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-pulse">
      <div className="h-16 w-16 rounded-xl bg-muted shrink-0"></div>
      <div className="flex-1 space-y-3 w-full">
        <div className="h-5 w-1/3 bg-muted rounded"></div>
        <div className="h-4 w-1/4 bg-muted rounded"></div>
      </div>
      <div className="flex gap-4 w-full sm:w-auto mt-4 sm:mt-0">
        <div className="h-10 w-20 bg-muted rounded-full"></div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-md bg-muted"></div>
          <div className="h-9 w-9 rounded-md bg-muted"></div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
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
    if (error) { toast.error('Erro ao alterar status'); setProducts(prev); }
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    const prev = products;
    setProducts((p) => p.map((x) => (x.id === id ? { ...x, featured: !featured } : x)));
    const { error } = await supabase.from('products').update({ featured: !featured }).eq('id', id);
    if (error) { toast.error('Erro ao alterar destaque'); setProducts(prev); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('products').delete().eq('id', deleteId);
    if (error) { toast.error('Erro ao excluir produto'); }
    else { toast.success('Produto excluído'); setProducts((prev) => prev.filter((p) => p.id !== deleteId)); }
    setDeleteId(null);
  };

  const openEdit = (product: Product) => { setEditingProduct(product); setFormOpen(true); };
  const openCreate = () => { setEditingProduct(null); setFormOpen(true); };

  const filtered = products.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'all' || p.category_id === filterCategory;
    return matchSearch && matchCategory;
  });

  const getCategoryName = (id: string | null) => categories.find((c) => c.id === id)?.name || 'Sem Categoria';

  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 max-w-md mx-auto text-center">
        <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold font-display">Oops! Algo deu errado</h3>
          <p className="text-muted-foreground">{errorMsg}</p>
        </div>
        <Button onClick={fetchProducts} size="lg" className="w-full sm:w-auto bg-bruna-dark hover:bg-bruna-red text-white transition-colors shadow-md hover:shadow-lg">
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-border/40">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-bruna-dark dark:text-bruna-cream">Produtos</h2>
          <p className="text-muted-foreground mt-1">Gerencie seu catálogo, estoque e preços.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setBulkOpen(true)} variant="outline" className="h-10 border-border/50 bg-background/50 backdrop-blur-sm hover:bg-muted shadow-sm hover:shadow transition-all">
            <FileSpreadsheet className="h-4 w-4 mr-2" /> 
            <span className="hidden sm:inline">Importar</span>
          </Button>
          <Button onClick={openCreate} className="h-10 bg-bruna-dark hover:bg-bruna-red text-white shadow-md hover:shadow-lg transition-all">
            <Plus className="h-4 w-4 mr-0 sm:mr-2" /> 
            <span className="hidden sm:inline">Novo Produto</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 backdrop-blur-sm shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/70" />
          <Input 
            placeholder="Buscar por nome ou SKU..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-10 h-11 bg-background/80 border-border/60 focus-visible:ring-bruna-gold/30 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-background/80 rounded-md border border-border/60 p-1 flex items-center h-11 shrink-0">
            <Filter className="h-5 w-5 mx-2 text-muted-foreground/70" />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full md:w-[200px] h-11 bg-background/80 border-border/60 focus:ring-bruna-gold/30">
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
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
        <span>Mostrando <span className="font-medium text-foreground">{!loadingProducts ? filtered.length : '-'}</span> produtos</span>
        <Button variant="ghost" size="sm" className="h-8 gap-1"><ArrowUpDown className="h-3.5 w-3.5" /> Ordenar</Button>
      </div>

      {loadingProducts ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <ProductSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 flex flex-col items-center bg-background/30 rounded-2xl border border-dashed border-border/60">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold font-display text-foreground">Catálogo vazio</h3>
          <p className="text-muted-foreground max-w-[300px] mx-auto mt-2 mb-6">Nenhum produto encontrado para estes filtros ou seu catálogo ainda está vazio.</p>
          <Button onClick={openCreate} className="bg-bruna-dark hover:bg-bruna-red text-white shadow hover:shadow-md">
            Adicionar Primeiro Produto
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((product) => (
             <Card 
              key={product.id} 
              className="group border-border/40 shadow-sm hover:shadow overflow-hidden transition-all duration-300 backdrop-blur-sm bg-background/95 hover:border-bruna-gold/30"
            >
              <CardContent className="py-0 px-0 flex flex-col sm:flex-row items-stretch min-h-[5rem]">
                <div className="h-48 sm:h-auto sm:w-32 bg-muted flex items-center justify-center overflow-hidden shrink-0 relative">
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <Package className="h-8 w-8 text-muted-foreground/40" />
                  )}
                  {product.featured && (
                    <div className="absolute top-2 left-2 bg-bruna-gold text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                      Destaque
                    </div>
                  )}
                </div>
                
                <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-semibold text-base sm:text-lg mb-1 truncate leading-tight group-hover:text-bruna-gold transition-colors">{product.title}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="bg-background font-normal text-xs border-border/60 text-muted-foreground">
                          {getCategoryName(product.category_id)}
                        </Badge>
                        <span className="text-primary font-bold text-lg tabular-nums">R$ {Number(product.price).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t sm:border-t-0 sm:border-l border-border/40 p-4 bg-muted/10 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 shrink-0 sm:w-48">
                  <div className="flex flex-row sm:flex-col gap-4 sm:gap-2 w-full sm:w-auto">
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full">
                      <span className="text-xs font-medium text-muted-foreground">Ativo</span>
                      <Switch 
                        checked={product.active ?? false} 
                        onCheckedChange={() => toggleActive(product.id, product.active ?? false)} 
                        className="data-[state=checked]:bg-emerald-500"
                      />
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full">
                      <span className="text-xs font-medium text-muted-foreground">Destacar</span>
                      <Switch 
                        checked={product.featured ?? false} 
                        onCheckedChange={() => toggleFeatured(product.id, product.featured ?? false)} 
                        className="data-[state=checked]:bg-bruna-gold"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-0 sm:mt-2">
                    <Button variant="outline" size="icon" onClick={() => openEdit(product)} className="h-8 w-8 rounded-full border-border/60 bg-background hover:bg-muted hover:border-border transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setDeleteId(product.id)} className="h-8 w-8 rounded-full border-border/60 bg-background hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editingProduct} onSaved={fetchProducts} />
      <BulkProductUpload open={bulkOpen} onOpenChange={setBulkOpen} onImported={fetchProducts} />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl border-border/40 shadow-xl overflow-hidden p-0">
          <div className="h-2 w-full bg-destructive"></div>
          <div className="p-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl">Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                Esta ação <span className="font-bold text-foreground">não pode ser desfeita</span>. O produto será removido permanentemente de nossa base de dados e desaparecerá do catálogo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-8 gap-2 sm:gap-0">
              <AlertDialogCancel className="border-border/60 hover:bg-muted font-medium h-10 px-6">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium h-10 px-6 shadow-md">
                Sim, Excluir Produto
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProducts;

