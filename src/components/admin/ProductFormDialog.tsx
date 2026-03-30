import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;
type Category = Tables<'categories'>;

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSaved: () => void;
}

const generateSlug = (title: string) =>
  title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const ProductFormDialog = ({ open, onOpenChange, product, onSaved }: ProductFormDialogProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<string>('none');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setSlug(product.slug);
      setPrice(String(product.price));
      setCategoryId(product.category_id || 'none');
      setDescription(product.description || '');
      setImages(product.images || []);
      setActive(product.active ?? true);
      setFeatured(product.featured ?? false);
    } else {
      setTitle('');
      setSlug('');
      setPrice('');
      setCategoryId('none');
      setDescription('');
      setImages([]);
      setActive(true);
      setFeatured(false);
    }
  }, [product, open]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!product) setSlug(generateSlug(val));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop();
      const path = `${product?.id || 'new'}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file);
      if (error) {
        toast.error(`Erro ao enviar ${file.name}`);
        continue;
      }
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
      newUrls.push(urlData.publicUrl);
    }

    setImages((prev) => [...prev, ...newUrls]);
    setUploading(false);
    e.target.value = '';
  };

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((u) => u !== url));
  };

  const handleSave = async () => {
    if (!title.trim()) return toast.error('Título é obrigatório');
    if (!price || Number(price) <= 0) return toast.error('Preço é obrigatório');

    setSaving(true);
    const payload = {
      title: title.trim(),
      slug: slug || generateSlug(title),
      price: Number(price),
      category_id: categoryId === 'none' ? null : categoryId,
      description: description.trim() || null,
      images,
      active,
      featured,
    };

    if (product) {
      const { error } = await supabase.from('products').update(payload).eq('id', product.id);
      if (error) {
        toast.error('Erro ao atualizar produto');
        setSaving(false);
        return;
      }
      toast.success('Produto atualizado!');
    } else {
      const { error } = await supabase.from('products').insert(payload);
      if (error) {
        toast.error('Erro ao criar produto');
        setSaving(false);
        return;
      }
      toast.success('Produto criado!');
    }

    setSaving(false);
    onOpenChange(false);
    onSaved();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{product ? 'Editar Produto' : 'Novo Produto'}</SheetTitle>
          <SheetDescription>
            {product ? 'Atualize os dados do produto' : 'Preencha os dados para cadastrar'}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          {/* Title */}
          <div className="space-y-1.5">
            <Label>Título *</Label>
            <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Nome do produto" />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label>Slug</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug-do-produto" />
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <Label>Preço (R$) *</Label>
            <Input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem categoria</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição do produto" rows={3} />
          </div>

          {/* Images */}
          <div className="space-y-1.5">
            <Label>Imagens</Label>
            <div className="flex flex-wrap gap-2">
              {images.map((url) => (
                <div key={url} className="relative h-20 w-20 rounded-lg overflow-hidden border">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    onClick={() => removeImage(url)}
                    className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="h-20 w-20 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                {uploading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : <Upload className="h-5 w-5 text-muted-foreground" />}
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={active} onCheckedChange={setActive} />
              <Label>Ativo</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={featured} onCheckedChange={setFeatured} />
              <Label>Destaque</Label>
            </div>
          </div>

          {/* Save */}
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {product ? 'Salvar Alterações' : 'Cadastrar Produto'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProductFormDialog;
