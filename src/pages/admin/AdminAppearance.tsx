import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Save, Palette, MessageCircle, Type, MapPin, Loader2, Clock } from 'lucide-react';

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
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <div>
        <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-foreground">Aparência</h2>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Personalize os textos e visuais da sua loja.</p>
      </div>

      {/* Hero */}
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <Type className="h-5 w-5 text-primary" />
            </div>
            Hero Banner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Título</Label>
            <Input value={data.hero_title} onChange={e => update('hero_title', e.target.value)} className="rounded-xl" />
          </div>
          <div>
            <Label>Subtítulo</Label>
            <Input value={data.hero_subtitle} onChange={e => update('hero_subtitle', e.target.value)} className="rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Texto do Botão</Label>
              <Input value={data.hero_cta_text} onChange={e => update('hero_cta_text', e.target.value)} className="rounded-xl" />
            </div>
            <div>
              <Label>Link do Botão</Label>
              <Input value={data.hero_cta_link} onChange={e => update('hero_cta_link', e.target.value)} placeholder="/categoria/perfumes" className="rounded-xl" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promo Bar */}
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <div className="p-2 rounded-xl bg-accent/20">
              <Palette className="h-5 w-5 text-accent" />
            </div>
            Barra Promocional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label>Texto (repete em carrossel)</Label>
          <Textarea value={data.promo_bar_text} onChange={e => update('promo_bar_text', e.target.value)} rows={2} className="rounded-xl mt-1" />
        </CardContent>
      </Card>

      {/* WhatsApp */}
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <div className="p-2 rounded-xl bg-green-100/50 dark:bg-green-900/20">
              <MessageCircle className="h-5 w-5 text-green-500" />
            </div>
            WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Número (com DDI, ex: 5511999999999)</Label>
            <Input value={data.whatsapp_number} onChange={e => update('whatsapp_number', e.target.value)} className="rounded-xl" />
          </div>
          <div>
            <Label>Mensagem padrão</Label>
            <Textarea value={data.whatsapp_message} onChange={e => update('whatsapp_message', e.target.value)} rows={2} className="rounded-xl" />
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            Rodapé
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Endereço</Label>
            <div className="relative mt-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={data.footer_address} onChange={e => update('footer_address', e.target.value)} className="pl-10 rounded-xl" />
            </div>
          </div>
          <div>
            <Label>Telefone</Label>
            <Input value={data.footer_phone} onChange={e => update('footer_phone', e.target.value)} className="rounded-xl" />
          </div>
          <div>
            <Label className="flex items-center gap-1"><Clock className="h-3 w-3" /> Horário (dias úteis)</Label>
            <Input value={data.footer_hours_weekdays} onChange={e => update('footer_hours_weekdays', e.target.value)} className="rounded-xl" />
          </div>
          <div>
            <Label>Horário (sábado)</Label>
            <Input value={data.footer_hours_saturday} onChange={e => update('footer_hours_saturday', e.target.value)} className="rounded-xl" />
          </div>
          <div>
            <Label>Horário (domingo)</Label>
            <Input value={data.footer_hours_sunday} onChange={e => update('footer_hours_sunday', e.target.value)} className="rounded-xl" />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full bg-bruna-dark hover:bg-bruna-red text-white rounded-xl shadow-md hover:shadow-lg transition-all" size="lg">
        <Save className="h-4 w-4 mr-2" />
        {saving ? 'Salvando...' : 'Salvar Aparência'}
      </Button>
    </div>
  );
};

export default AdminAppearance;
