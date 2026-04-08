import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Save, Store, Phone, MapPin, DollarSign } from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    id: '',
    store_open: true,
    delivery_fee: 5,
    store_phone: '',
    store_address: '',
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('admin_settings').select('*').limit(1).single();
      if (data) {
        setSettings({
          id: data.id,
          store_open: data.store_open ?? true,
          delivery_fee: Number(data.delivery_fee) || 5,
          store_phone: data.store_phone || '',
          store_address: data.store_address || '',
        });
      }
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await supabase.from('admin_settings').update({
      store_open: settings.store_open,
      delivery_fee: settings.delivery_fee,
      store_phone: settings.store_phone,
      store_address: settings.store_address,
    }).eq('id', settings.id);
    setSaving(false);
    toast({ title: 'Configurações salvas!' });
  };

  return (
    <div className="space-y-6 max-w-lg animate-fade-in">
      <div>
        <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-foreground">Configurações</h2>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Ajuste as configurações gerais da loja.</p>
      </div>

      {/* Store status */}
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100/50 dark:bg-emerald-900/20">
              <Store className="h-5 w-5 text-emerald-600" />
            </div>
            Status da Loja
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
            <div>
              <Label className="font-medium">Loja Aberta</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Quando desativada, clientes não poderão fazer pedidos.</p>
            </div>
            <Switch
              checked={settings.store_open}
              onCheckedChange={(v) => setSettings((s) => ({ ...s, store_open: v }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Delivery */}
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100/50 dark:bg-amber-900/20">
              <DollarSign className="h-5 w-5 text-amber-600" />
            </div>
            Entrega
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label>Taxa de Entrega (R$)</Label>
          <div className="relative mt-1">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              step="0.50"
              value={settings.delivery_fee}
              onChange={(e) => setSettings((s) => ({ ...s, delivery_fee: Number(e.target.value) }))}
              className="pl-10 rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            Contato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Telefone</Label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={settings.store_phone}
                onChange={(e) => setSettings((s) => ({ ...s, store_phone: e.target.value }))}
                className="pl-10 rounded-xl"
              />
            </div>
          </div>
          <div>
            <Label>Endereço</Label>
            <div className="relative mt-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={settings.store_address}
                onChange={(e) => setSettings((s) => ({ ...s, store_address: e.target.value }))}
                className="pl-10 rounded-xl"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full bg-bruna-dark hover:bg-bruna-red text-white rounded-xl shadow-md hover:shadow-lg transition-all" size="lg">
        <Save className="h-4 w-4 mr-2" />
        {saving ? 'Salvando...' : 'Salvar Configurações'}
      </Button>
    </div>
  );
};

export default AdminSettings;
