import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Save, Palette, MessageCircle, Type, MapPin, Loader2 } from 'lucide-react';

const AdminAppearance = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    id: '',
    hero_title: '',
    hero_subtitle: '',
    hero_cta_text: '',
    hero_cta_link: '',
    promo_bar_text: '',
    whatsapp_number: '',
    whatsapp_message: '',
    footer_address: '',
    footer_phone: '',
    footer_hours_weekdays: '',
    footer_hours_saturday: '',
    footer_hours_sunday: '',
  });

  useEffect(() => {
    const fetch = async () => {
      const { data: row } = await supabase.from('store_customization').select('*').limit(1).single();
      if (row) {
        const hours = (row.footer_hours as { weekdays?: string; saturday?: string; sunday?: string }) || {};
        setData({
          id: row.id,
          hero_title: row.hero_title || '',
          hero_subtitle: row.hero_subtitle || '',
          hero_cta_text: row.hero_cta_text || '',
          hero_cta_link: row.hero_cta_link || '',
          promo_bar_text: row.promo_bar_text || '',
          whatsapp_number: row.whatsapp_number || '',
          whatsapp_message: row.whatsapp_message || '',
          footer_address: row.footer_address || '',
          footer_phone: row.footer_phone || '',
          footer_hours_weekdays: hours.weekdays || '',
          footer_hours_saturday: hours.saturday || '',
          footer_hours_sunday: hours.sunday || '',
        });
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('store_customization').update({
      hero_title: data.hero_title,
      hero_subtitle: data.hero_subtitle,
      hero_cta_text: data.hero_cta_text,
      hero_cta_link: data.hero_cta_link,
      promo_bar_text: data.promo_bar_text,
      whatsapp_number: data.whatsapp_number,
      whatsapp_message: data.whatsapp_message,
      footer_address: data.footer_address,
      footer_phone: data.footer_phone,
      footer_hours: {
        weekdays: data.footer_hours_weekdays,
        saturday: data.footer_hours_saturday,
        sunday: data.footer_hours_sunday,
      },
    }).eq('id', data.id);
    setSaving(false);
    if (error) {
      toast.error('Erro ao salvar');
    } else {
      toast.success('Aparência atualizada!');
    }
  };

  const update = (field: string, value: string) => setData(prev => ({ ...prev, [field]: value }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold">Aparência</h2>

      {/* Hero */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Type className="h-5 w-5 text-primary" /> Hero Banner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Título</Label>
            <Input value={data.hero_title} onChange={e => update('hero_title', e.target.value)} />
          </div>
          <div>
            <Label>Subtítulo</Label>
            <Input value={data.hero_subtitle} onChange={e => update('hero_subtitle', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Texto do Botão</Label>
              <Input value={data.hero_cta_text} onChange={e => update('hero_cta_text', e.target.value)} />
            </div>
            <div>
              <Label>Link do Botão</Label>
              <Input value={data.hero_cta_link} onChange={e => update('hero_cta_link', e.target.value)} placeholder="/categoria/perfumes" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promo Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" /> Barra Promocional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label>Texto (repete em carrossel)</Label>
          <Textarea value={data.promo_bar_text} onChange={e => update('promo_bar_text', e.target.value)} rows={2} />
        </CardContent>
      </Card>

      {/* WhatsApp */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-500" /> WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Número (com DDI, ex: 5511999999999)</Label>
            <Input value={data.whatsapp_number} onChange={e => update('whatsapp_number', e.target.value)} />
          </div>
          <div>
            <Label>Mensagem padrão</Label>
            <Textarea value={data.whatsapp_message} onChange={e => update('whatsapp_message', e.target.value)} rows={2} />
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" /> Rodapé
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Endereço</Label>
            <Input value={data.footer_address} onChange={e => update('footer_address', e.target.value)} />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input value={data.footer_phone} onChange={e => update('footer_phone', e.target.value)} />
          </div>
          <div>
            <Label>Horário (dias úteis)</Label>
            <Input value={data.footer_hours_weekdays} onChange={e => update('footer_hours_weekdays', e.target.value)} />
          </div>
          <div>
            <Label>Horário (sábado)</Label>
            <Input value={data.footer_hours_saturday} onChange={e => update('footer_hours_saturday', e.target.value)} />
          </div>
          <div>
            <Label>Horário (domingo)</Label>
            <Input value={data.footer_hours_sunday} onChange={e => update('footer_hours_sunday', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full" size="lg">
        <Save className="h-4 w-4 mr-2" />
        {saving ? 'Salvando...' : 'Salvar Aparência'}
      </Button>
    </div>
  );
};

export default AdminAppearance;
