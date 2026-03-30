import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

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
    <div className="space-y-4 max-w-lg">
      <h2 className="text-2xl font-bold font-sans">Configurações</h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Loja</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Loja Aberta</Label>
            <Switch
              checked={settings.store_open}
              onCheckedChange={(v) => setSettings((s) => ({ ...s, store_open: v }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Taxa de Entrega (R$)</Label>
            <Input
              type="number"
              step="0.50"
              value={settings.delivery_fee}
              onChange={(e) => setSettings((s) => ({ ...s, delivery_fee: Number(e.target.value) }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input
              value={settings.store_phone}
              onChange={(e) => setSettings((s) => ({ ...s, store_phone: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Endereço</Label>
            <Input
              value={settings.store_address}
              onChange={(e) => setSettings((s) => ({ ...s, store_address: e.target.value }))}
            />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
