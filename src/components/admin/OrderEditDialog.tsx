import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Trash2, Loader2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Order = Tables<'orders'>;

interface OrderItem {
  title: string;
  quantity: number;
  price: number;
}

interface OrderEditDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const OrderEditDialog = ({ order, open, onOpenChange, onSaved }: OrderEditDialogProps) => {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order) {
      const parsed = (Array.isArray(order.items) ? order.items : []) as unknown as OrderItem[];
      setItems(parsed.map(i => ({ ...i })));
    }
  }, [order]);

  if (!order) return null;

  const updateQty = (index: number, qty: number) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, quantity: Math.max(1, qty) } : item));
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + Number(order.delivery_fee);

  const handleSave = async () => {
    if (items.length === 0) { toast.error('Pedido precisa de pelo menos 1 item'); return; }
    setSaving(true);
    const { error } = await supabase.from('orders').update({
      items: items as unknown as Order['items'],
      subtotal,
      total,
      updated_at: new Date().toISOString(),
    }).eq('id', order.id);
    setSaving(false);
    if (error) {
      toast.error('Erro ao salvar pedido');
    } else {
      toast.success('Pedido atualizado!');
      onSaved();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Pedido #{order.order_number}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 border rounded-lg p-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground">R$ {item.price.toFixed(2)} un.</p>
              </div>
              <Input
                type="number"
                min={1}
                value={item.quantity}
                onChange={e => updateQty(i, Number(e.target.value))}
                className="w-16 text-center"
              />
              <Button variant="ghost" size="icon" onClick={() => removeItem(i)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}

          {items.length === 0 && (
            <p className="text-center text-muted-foreground py-4">Nenhum item</p>
          )}

          <div className="border-t pt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>R$ {subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Entrega</span><span>R$ {Number(order.delivery_fee).toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-base"><span>Total</span><span>R$ {total.toFixed(2)}</span></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderEditDialog;
