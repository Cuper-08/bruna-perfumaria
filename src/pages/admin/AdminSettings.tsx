import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Save, Store, Phone, MapPin, DollarSign, Navigation, CreditCard } from 'lucide-react';

const AdminSettings = () => {
  const [id, setId] = useState('');
  const [storeOpen, setStoreOpen] = useState(true);
  const [storePhone, setStorePhone] = useState('');
  const [storeAddress, setStoreAddress] = useState('');

  // Delivery by distance
  const [storeLat, setStoreLat] = useState('-23.5033454');
  const [storeLng, setStoreLng] = useState('-46.5035209');
  const [deliveryFeeBase, setDeliveryFeeBase] = useState('5.00');
  const [deliveryFeePerKm, setDeliveryFeePerKm] = useState('1.50');
  const [deliveryBaseRadiusKm, setDeliveryBaseRadiusKm] = useState('5');
  const [deliveryMaxRadiusKm, setDeliveryMaxRadiusKm] = useState('10');

  // Installments
  const [installmentMax, setInstallmentMax] = useState('6');
  const [installmentMinValue, setInstallmentMinValue] = useState('50.00');

  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('admin_settings').select('*').limit(1).single();
      if (data) {
        const d = data as Record<string, unknown>;
        setId(String(d.id ?? ''));
        setStoreOpen(Boolean(d.store_open ?? true));
        setStorePhone(String(d.store_phone ?? ''));
        setStoreAddress(String(d.store_address ?? ''));
        if (d.store_lat != null) setStoreLat(String(d.store_lat));
        if (d.store_lng != null) setStoreLng(String(d.store_lng));
        if (d.delivery_fee_base != null) setDeliveryFeeBase(String(d.delivery_fee_base));
        if (d.delivery_fee_per_km != null) setDeliveryFeePerKm(String(d.delivery_fee_per_km));
        if (d.delivery_base_radius_km != null) setDeliveryBaseRadiusKm(String(d.delivery_base_radius_km));
        if (d.delivery_max_radius_km != null) setDeliveryMaxRadiusKm(String(d.delivery_max_radius_km));
        if (d.installment_max != null) setInstallmentMax(String(d.installment_max));
        if (d.installment_min_value != null) setInstallmentMinValue(String(d.installment_min_value));
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('admin_settings')
      .update({
        store_open: storeOpen,
        store_phone: storePhone,
        store_address: storeAddress,
        store_lat: parseFloat(storeLat) || null,
        store_lng: parseFloat(storeLng) || null,
        delivery_fee_base: parseFloat(deliveryFeeBase) || 5,
        delivery_fee_per_km: parseFloat(deliveryFeePerKm) || 1.5,
        delivery_base_radius_km: parseInt(deliveryBaseRadiusKm) || 5,
        delivery_max_radius_km: parseInt(deliveryMaxRadiusKm) || 10,
        installment_max: parseInt(installmentMax) || 6,
        installment_min_value: parseFloat(installmentMinValue) || 50,
      } as Record<string, unknown>)
      .eq('id', id);
    setSaving(false);
    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Configurações salvas!' });
    }
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
            <Switch checked={storeOpen} onCheckedChange={setStoreOpen} />
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
                value={storePhone}
                onChange={e => setStorePhone(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
          </div>
          <div>
            <Label>Endereço</Label>
            <div className="relative mt-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={storeAddress}
                onChange={e => setStoreAddress(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery by distance */}
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100/50 dark:bg-amber-900/20">
              <DollarSign className="h-5 w-5 text-amber-600" />
            </div>
            Taxa de Entrega por Distância
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Latitude da Loja</Label>
              <div className="relative">
                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="number"
                  step="any"
                  value={storeLat}
                  onChange={e => setStoreLat(e.target.value)}
                  placeholder="-23.5033454"
                  className="pl-9 rounded-xl text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Longitude da Loja</Label>
              <div className="relative">
                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="number"
                  step="any"
                  value={storeLng}
                  onChange={e => setStoreLng(e.target.value)}
                  placeholder="-46.5035209"
                  className="pl-9 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Taxa Base (R$)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="number"
                  step="0.50"
                  min="0"
                  value={deliveryFeeBase}
                  onChange={e => setDeliveryFeeBase(e.target.value)}
                  placeholder="5.00"
                  className="pl-9 rounded-xl text-sm"
                />
              </div>
              <p className="text-xs text-muted-foreground">Cobrado até o raio base</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Taxa por KM extra (R$)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="number"
                  step="0.10"
                  min="0"
                  value={deliveryFeePerKm}
                  onChange={e => setDeliveryFeePerKm(e.target.value)}
                  placeholder="1.50"
                  className="pl-9 rounded-xl text-sm"
                />
              </div>
              <p className="text-xs text-muted-foreground">Acima do raio base</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Raio Base (km)</Label>
              <Input
                type="number"
                step="1"
                min="1"
                value={deliveryBaseRadiusKm}
                onChange={e => setDeliveryBaseRadiusKm(e.target.value)}
                placeholder="5"
                className="rounded-xl text-sm"
              />
              <p className="text-xs text-muted-foreground">Sem custo extra até aqui</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Raio Máximo (km)</Label>
              <Input
                type="number"
                step="1"
                min="1"
                value={deliveryMaxRadiusKm}
                onChange={e => setDeliveryMaxRadiusKm(e.target.value)}
                placeholder="10"
                className="rounded-xl text-sm"
              />
              <p className="text-xs text-muted-foreground">Sem entrega além disso</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Installments */}
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100/50 dark:bg-blue-900/20">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            Parcelamento no Cartão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Parcelas máximas</Label>
              <Input
                type="number"
                step="1"
                min="1"
                max="12"
                value={installmentMax}
                onChange={e => setInstallmentMax(e.target.value)}
                placeholder="6"
                className="rounded-xl text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Valor mínimo (R$)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="number"
                  step="1"
                  min="0"
                  value={installmentMinValue}
                  onChange={e => setInstallmentMinValue(e.target.value)}
                  placeholder="50.00"
                  className="pl-9 rounded-xl text-sm"
                />
              </div>
              <p className="text-xs text-muted-foreground">Habilita parcelamento acima deste valor</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-bruna-dark hover:bg-bruna-red text-white rounded-xl shadow-md hover:shadow-lg transition-all"
        size="lg"
      >
        <Save className="h-4 w-4 mr-2" />
        {saving ? 'Salvando...' : 'Salvar Configurações'}
      </Button>
    </div>
  );
};

export default AdminSettings;
