import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, GripVertical, Loader2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Category = Tables<'categories'>;

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', icon: 'Package', sort_order: 0 });

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    if (data) setCategories(data);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const generateSlug = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', slug: '', icon: 'Package', sort_order: categories.length });
    setFormOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon || 'Package', sort_order: cat.sort_order || 0 });
    setFormOpen(true);
  };

  const handleSave = async () => {
    const slug = form.slug || generateSlug(form.name);
    if (!form.name.trim()) { toast.error('Nome é obrigatório'); return; }

    if (editing) {
      const { error } = await supabase.from('categories').update({ name: form.name, slug, icon: form.icon, sort_order: form.sort_order }).eq('id', editing.id);
      if (error) toast.error('Erro ao atualizar');
      else toast.success('Categoria atualizada');
    } else {
      const { error } = await supabase.from('categories').insert({ name: form.name, slug, icon: form.icon, sort_order: form.sort_order });
      if (error) toast.error('Erro ao criar');
      else toast.success('Categoria criada');
    }
    setFormOpen(false);
    fetchCategories();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('categories').delete().eq('id', deleteId);
    if (error) toast.error('Erro ao excluir');
    else { toast.success('Categoria excluída'); setCategories(prev => prev.filter(c => c.id !== deleteId)); }
    setDeleteId(null);
  };

  const toggleActive = async (id: string, active: boolean) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, active: !active } : c));
    const { error } = await supabase.from('categories').update({ active: !active }).eq('id', id);
    if (error) { toast.error('Erro'); fetchCategories(); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Categorias</h2>
        <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-1" /> Nova Categoria</Button>
      </div>

      <p className="text-sm text-muted-foreground">{categories.length} categoria(s)</p>

      <div className="space-y-2">
        {categories.map(cat => (
          <Card key={cat.id}>
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <GripVertical className="h-4 w-4 text-muted-foreground/40" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{cat.name}</p>
                <p className="text-xs text-muted-foreground">/{cat.slug} • Ícone: {cat.icon}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[10px] text-muted-foreground">Ativa</span>
                  <Switch checked={cat.active ?? true} onCheckedChange={() => toggleActive(cat.id, cat.active ?? true)} />
                </div>
                <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(cat.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nome</Label>
              <Input value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value, slug: generateSlug(e.target.value) })); }} />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
            </div>
            <div>
              <Label>Ícone (nome Lucide)</Label>
              <Input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="Package, Sparkles, etc." />
            </div>
            <div>
              <Label>Ordem</Label>
              <Input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>{editing ? 'Atualizar' : 'Criar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCategories;
