// Checkout page - smart multi-step
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, User, MapPin, CreditCard, Check, Loader2, LocateFixed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/contexts/CartContext';
import { useViaCep } from '@/hooks/useViaCep';
import { useDeliveryCalculation, DeliverySettings, GpsCoords } from '@/hooks/useDeliveryCalculation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, label: 'Dados', icon: User },
  { id: 2, label: 'Endereço', icon: MapPin },
  { id: 3, label: 'Pagamento', icon: CreditCard },
];

// ─── Masks ────────────────────────────────────────────────
function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function maskCpf(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function maskCep(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

// ─── Validations ──────────────────────────────────────────
function isValidCpf(cpf: string): boolean {
  const c = cpf.replace(/\D/g, '');
  if (c.length !== 11) return false;
  if (/^(\d)\1+$/.test(c)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(c[i]) * (10 - i);
  let d1 = (sum * 10) % 11;
  if (d1 >= 10) d1 = 0;
  if (d1 !== parseInt(c[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(c[i]) * (11 - i);
  let d2 = (sum * 10) % 11;
  if (d2 >= 10) d2 = 0;
  return d2 === parseInt(c[10]);
}

function hasFullName(name: string): boolean {
  const parts = name.trim().split(/\s+/).filter(p => p.length >= 2);
  return parts.length >= 2;
}

// ─── Types ────────────────────────────────────────────────
type PaymentMethod = 'pix' | 'cartao_online' | 'dinheiro_entrega' | 'cartao_entrega';

const paymentLabels: Record<PaymentMethod, string> = {
  pix: 'PIX',
  cartao_online: 'Cartão Online',
  dinheiro_entrega: 'Dinheiro na Entrega',
  cartao_entrega: 'Cartão na Entrega',
};

// ─── Component ────────────────────────────────────────────
export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart, itemCount } = useCart();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<GpsCoords | null>(null);

  // Step 1
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [notes, setNotes] = useState('');

  // Step 1 errors
  const [nameError, setNameError] = useState('');
  const [cpfError, setCpfError] = useState('');

  // Step 2
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [uf, setUf] = useState('');

  // Step 3
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [needsChange, setNeedsChange] = useState(false);
  const [changeFor, setChangeFor] = useState('');
  const [installments, setInstallments] = useState(1);

  // Delivery settings — start with correct defaults so checkout never blocks if DB is slow
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>({
    store_lat: -23.5035602,
    store_lng: -46.5044407,
    delivery_fee_base: 5,
    delivery_fee_per_km: 1,
    delivery_base_radius_km: 5,
    delivery_max_radius_km: 10,
  });
  const [installmentMax, setInstallmentMax] = useState(6);
  const [installmentMinValue, setInstallmentMinValue] = useState(50);

  const { address: viaCepAddress, loading: cepLoading, error: cepError } = useViaCep(cep);
  const {
    distanceKm,
    deliveryFee: calcDeliveryFee,
    usingFallback,
    outOfRange,
    loading: deliveryLoading,
    error: deliveryError,
  } = useDeliveryCalculation(cep, deliverySettings, gpsCoords);

  // deliveryFee is always a number or null (null only when outOfRange or no CEP yet)
  const deliveryFee = calcDeliveryFee;
  const effectiveDeliveryFee = deliveryFee ?? 0;
  const total = subtotal + effectiveDeliveryFee;

  const isOnlinePayment = paymentMethod === 'pix' || paymentMethod === 'cartao_online';
  const showInstallments =
    paymentMethod === 'cartao_online' && total >= installmentMinValue && installmentMax > 1;

  useEffect(() => {
    if (itemCount === 0) navigate('/carrinho');
  }, [itemCount, navigate]);

  useEffect(() => {
    supabase
      .from('admin_settings')
      .select('*')
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) {
          const d = data as Record<string, unknown>;
          setDeliverySettings({
            store_lat: Number(d.store_lat) || -23.5035602,
            store_lng: Number(d.store_lng) || -46.5044407,
            delivery_fee_base: Number(d.delivery_fee_base) || 5,
            delivery_fee_per_km: Number(d.delivery_fee_per_km) || 1,
            delivery_base_radius_km: Number(d.delivery_base_radius_km) || 5,
            delivery_max_radius_km: Number(d.delivery_max_radius_km) || 10,
          });
          setInstallmentMax(Number(d.installment_max) || 6);
          setInstallmentMinValue(Number(d.installment_min_value) || 50);
        }
      });
  }, []);

  // Auto-fill from ViaCEP
  useEffect(() => {
    if (viaCepAddress) {
      setStreet(viaCepAddress.street);
      setNeighborhood(viaCepAddress.neighborhood);
      setCity(viaCepAddress.city);
      setUf(viaCepAddress.state);
    }
  }, [viaCepAddress]);

  // Validate CPF in real time when fully typed
  useEffect(() => {
    const digits = cpf.replace(/\D/g, '');
    if (digits.length === 0) { setCpfError(''); return; }
    if (digits.length < 11) { setCpfError(''); return; }
    setCpfError(isValidCpf(cpf) ? '' : 'CPF inválido');
  }, [cpf]);

  // Validate name in real time
  useEffect(() => {
    if (!name) { setNameError(''); return; }
    setNameError(hasFullName(name) ? '' : 'Informe nome e sobrenome');
  }, [name]);

  // Reset installments when payment method changes
  useEffect(() => {
    setInstallments(1);
  }, [paymentMethod]);

  // ─── GPS ──────────────────────────────────────────────
  const getAddressFromGps = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização não suportada pelo navegador.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Store exact GPS coordinates — the hook uses these directly,
          // bypassing unreliable CEP geocoding for distance calculation
          setGpsCoords({ lat: latitude, lon: longitude });
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'pt-BR', 'User-Agent': 'BrunaPerfumaria/1.0' } }
          );
          const data = await res.json();
          if (data?.address) {
            const a = data.address;
            setStreet(a.road || a.pedestrian || a.path || '');
            setNeighborhood(a.suburb || a.neighbourhood || a.district || a.quarter || '');
            setCity(a.city || a.town || a.municipality || a.village || '');
            setUf(a.state_code || a.ISO3166_2_lvl4?.replace('BR-', '') || '');
            if (a.postcode) setCep(maskCep(a.postcode.replace(/\D/g, '')));
            toast.success('Endereço preenchido via GPS!');
          } else {
            toast.error('Não foi possível identificar o endereço.');
          }
        } catch {
          toast.error('Erro ao buscar endereço pelo GPS.');
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === 1) toast.error('Permissão de localização negada.');
        else toast.error('Não foi possível obter sua localização.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // ─── Advance validation ───────────────────────────────
  const canAdvance = () => {
    if (step === 1) {
      return (
        hasFullName(name) &&
        phone.replace(/\D/g, '').length >= 10 &&
        !cpfError
      );
    }
    if (step === 2) {
      const hasAddress =
        cep.replace(/\D/g, '').length === 8 &&
        street.trim() !== '' &&
        number.trim() !== '' &&
        neighborhood.trim() !== '' &&
        city.trim() !== '';
      const feeReady = !deliveryLoading && deliveryFee !== null;
      return hasAddress && !outOfRange && feeReady;
    }
    return true;
  };

  // ─── Submit ───────────────────────────────────────────
  const handleSubmit = async () => {
    if (isOnlinePayment) {
      const digits = cpf.replace(/\D/g, '');
      if (!digits) {
        toast.error('CPF é obrigatório para pagamentos via PIX ou Cartão Online.');
        return;
      }
      if (!isValidCpf(cpf)) {
        toast.error('CPF inválido. Verifique e tente novamente.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const address = {
        cep: cep.replace(/\D/g, ''),
        street,
        number,
        complement,
        neighborhood,
        city,
        state: uf,
      };
      const orderItems = items.map(i => ({
        id: i.id,
        title: i.title,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
      }));

      if (isOnlinePayment) {
        const { data, error } = await supabase.functions.invoke('create-payment', {
          body: {
            customer_name: name.trim(),
            customer_phone: phone.replace(/\D/g, ''),
            customer_cpf: cpf.replace(/\D/g, ''),
            address,
            items: orderItems,
            payment_method: paymentMethod,
            installments: paymentMethod === 'cartao_online' ? installments : 1,
            needs_change: false,
            change_for: null,
            notes: notes.trim() || null,
            subtotal,
            delivery_fee: effectiveDeliveryFee,
            total,
          },
        });

        if (error || data?.error) {
          throw new Error(data?.error || 'Erro ao processar pagamento. Tente novamente.');
        }

        clearCart();
        navigate(`/pedido/${data.order_id}`);
      } else {
        const { data, error } = await supabase
          .from('orders')
          .insert({
            customer_name: name.trim(),
            customer_phone: phone.replace(/\D/g, ''),
            customer_cpf: cpf.replace(/\D/g, '') || null,
            notes: notes.trim() || null,
            address,
            items: orderItems,
            subtotal,
            delivery_fee: effectiveDeliveryFee,
            total,
            payment_method: paymentMethod,
            payment_status: 'delivery_payment',
            needs_change: needsChange,
            change_for: needsChange ? parseFloat(changeFor) || null : null,
          })
          .select('id')
          .single();

        if (error) throw error;
        clearCart();
        navigate(`/pedido/${data.id}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao finalizar pedido. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Animation variants ───────────────────────────────
  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  const goNext = () => { setDirection(1); setStep(s => Math.min(s + 1, 3)); };
  const goBack = () => { setDirection(-1); setStep(s => Math.max(s - 1, 1)); };

  // ─── Delivery display helpers ─────────────────────────
  const deliveryDisplay = () => {
    if (!gpsCoords && cep.replace(/\D/g, '').length < 8) return { text: 'A calcular', color: 'text-muted-foreground' };
    if (deliveryLoading) return { text: 'Calculando...', color: 'text-muted-foreground' };
    if (outOfRange) return { text: 'Fora do raio de entrega', color: 'text-destructive' };
    if (deliveryError) return { text: deliveryError, color: 'text-destructive' };
    if (deliveryFee !== null) {
      const label = usingFallback ? `R$ ${deliveryFee.toFixed(2).replace('.', ',')} (taxa base)` : `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`;
      return { text: label, color: usingFallback ? 'text-amber-700' : 'text-foreground' };
    }
    return { text: 'A calcular', color: 'text-muted-foreground' };
  };

  const { text: deliveryText, color: deliveryColor } = deliveryDisplay();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/carrinho')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Checkout</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Stepper */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  step >= s.id
                    ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.4)]'
                    : 'border-border text-muted-foreground'
                }`}>
                  {step > s.id ? <Check className="h-5 w-5" /> : <s.icon className="h-4 w-4" />}
                </div>
                <span className={`text-xs font-medium ${step >= s.id ? 'text-primary' : 'text-muted-foreground'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-12 md:w-20 mx-2 mt-[-20px] transition-colors duration-300 ${
                  step > s.id ? 'bg-primary' : 'bg-border'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Area */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">

                  {/* ── Step 1: Dados Pessoais ── */}
                  {step === 1 && (
                    <div className="space-y-5">
                      <h2 className="text-xl font-semibold text-foreground">Dados Pessoais</h2>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Nome completo *</Label>
                          <Input
                            id="name"
                            className={`mt-1.5 rounded-xl ${nameError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            placeholder="Seu nome completo"
                            value={name}
                            onChange={e => setName(e.target.value)}
                          />
                          {nameError && <p className="text-xs text-destructive mt-1">{nameError}</p>}
                        </div>
                        <div>
                          <Label htmlFor="phone">Telefone *</Label>
                          <Input
                            id="phone"
                            className="mt-1.5 rounded-xl"
                            placeholder="(11) 99999-9999"
                            value={phone}
                            onChange={e => setPhone(maskPhone(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cpf">
                            CPF{' '}
                            <span className="text-muted-foreground text-xs">
                              {isOnlinePayment ? '(obrigatório para PIX/Cartão)' : '(opcional)'}
                            </span>
                          </Label>
                          <Input
                            id="cpf"
                            className={`mt-1.5 rounded-xl ${cpfError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            placeholder="000.000.000-00"
                            value={cpf}
                            onChange={e => setCpf(maskCpf(e.target.value))}
                          />
                          {cpfError && <p className="text-xs text-destructive mt-1">{cpfError}</p>}
                          {!cpfError && cpf.replace(/\D/g, '').length === 11 && (
                            <p className="text-xs text-green-600 mt-1">✓ CPF válido</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="notes">Observações</Label>
                          <Textarea
                            id="notes"
                            className="mt-1.5 rounded-xl"
                            placeholder="Alguma observação sobre o pedido?"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Step 2: Endereço ── */}
                  {step === 2 && (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-foreground">Endereço de Entrega</h2>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-xl gap-2 text-xs"
                          onClick={getAddressFromGps}
                          disabled={gpsLoading}
                        >
                          {gpsLoading
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <LocateFixed className="h-3.5 w-3.5" />
                          }
                          Usar minha localização
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="cep">CEP *</Label>
                          <div className="relative">
                            <Input
                              id="cep"
                              className="mt-1.5 rounded-xl pr-8"
                              placeholder="00000-000"
                              value={cep}
                              onChange={e => { setCep(maskCep(e.target.value)); setGpsCoords(null); }}
                            />
                            {(cepLoading || deliveryLoading) && (
                              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                          </div>
                          {cepError && <p className="text-xs text-destructive mt-1">{cepError}</p>}
                          {/* Delivery distance info */}
                          {(gpsCoords || cep.replace(/\D/g, '').length === 8) && !deliveryLoading && (
                            <div className={`mt-2 text-xs rounded-lg px-3 py-2 ${
                              outOfRange
                                ? 'bg-red-50 border border-red-200 text-red-700'
                                : deliveryError
                                ? 'bg-red-50 border border-red-200 text-red-700'
                                : usingFallback
                                ? 'bg-amber-50 border border-amber-200 text-amber-800'
                                : 'bg-green-50 border border-green-200 text-green-700'
                            }`}>
                              {outOfRange
                                ? `Fora do raio de entrega (${distanceKm?.toFixed(1)} km da loja). Raio máximo: ${deliverySettings.delivery_max_radius_km} km.`
                                : deliveryError
                                ? deliveryError
                                : usingFallback
                                ? `CEP não localizado com precisão — taxa base aplicada: R$ ${deliveryFee?.toFixed(2).replace('.', ',')}. Use "Usar minha localização" para cálculo exato.`
                                : distanceKm !== null
                                ? `${gpsCoords ? '📍 GPS — ' : ''}${distanceKm.toFixed(1)} km da loja — Taxa: R$ ${deliveryFee!.toFixed(2).replace('.', ',')}`
                                : `Calculando...`
                              }
                            </div>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="street">Rua *</Label>
                          <Input
                            id="street"
                            className="mt-1.5 rounded-xl"
                            placeholder="Nome da rua"
                            value={street}
                            onChange={e => setStreet(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label htmlFor="number">Número *</Label>
                            <Input
                              id="number"
                              className="mt-1.5 rounded-xl"
                              placeholder="Nº"
                              value={number}
                              onChange={e => setNumber(e.target.value)}
                            />
                          </div>
                          <div className="col-span-2">
                            <Label htmlFor="complement">Complemento</Label>
                            <Input
                              id="complement"
                              className="mt-1.5 rounded-xl"
                              placeholder="Apto, bloco..."
                              value={complement}
                              onChange={e => setComplement(e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="neighborhood">Bairro *</Label>
                          <Input
                            id="neighborhood"
                            className="mt-1.5 rounded-xl"
                            placeholder="Bairro"
                            value={neighborhood}
                            onChange={e => setNeighborhood(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-2">
                            <Label htmlFor="city">Cidade *</Label>
                            <Input
                              id="city"
                              className="mt-1.5 rounded-xl"
                              placeholder="Cidade"
                              value={city}
                              onChange={e => setCity(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="uf">UF *</Label>
                            <Input
                              id="uf"
                              className="mt-1.5 rounded-xl"
                              placeholder="SP"
                              maxLength={2}
                              value={uf}
                              onChange={e => setUf(e.target.value.toUpperCase())}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Step 3: Pagamento ── */}
                  {step === 3 && (
                    <div className="space-y-5">
                      <h2 className="text-xl font-semibold text-foreground">Forma de Pagamento</h2>
                      <RadioGroup
                        value={paymentMethod}
                        onValueChange={(v) => {
                          setPaymentMethod(v as PaymentMethod);
                          setNeedsChange(false);
                        }}
                      >
                        {(Object.entries(paymentLabels) as [PaymentMethod, string][]).map(([key, label]) => (
                          <div
                            key={key}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                              paymentMethod === key ? 'border-primary bg-primary/5' : 'border-border'
                            }`}
                            onClick={() => { setPaymentMethod(key); setNeedsChange(false); }}
                          >
                            <RadioGroupItem value={key} id={key} />
                            <Label htmlFor={key} className="cursor-pointer font-medium flex-1">{label}</Label>
                          </div>
                        ))}
                      </RadioGroup>

                      {/* Installment selector */}
                      {showInstallments && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="space-y-2 overflow-hidden"
                        >
                          <Label>Parcelamento</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {Array.from({ length: installmentMax }, (_, i) => i + 1).map(n => {
                              const installmentValue = total / n;
                              return (
                                <button
                                  key={n}
                                  type="button"
                                  onClick={() => setInstallments(n)}
                                  className={`p-2.5 rounded-xl border text-sm transition-all ${
                                    installments === n
                                      ? 'border-primary bg-primary/5 text-primary font-semibold'
                                      : 'border-border text-foreground hover:border-primary/50'
                                  }`}
                                >
                                  <span className="block font-medium">{n}x</span>
                                  <span className="block text-xs text-muted-foreground">
                                    R$ {installmentValue.toFixed(2).replace('.', ',')}
                                  </span>
                                  {n === 1 && <span className="block text-xs text-green-600">à vista</span>}
                                  {n > 1 && <span className="block text-xs text-green-600">sem juros</span>}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}

                      {paymentMethod === 'dinheiro_entrega' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="space-y-3 overflow-hidden"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="needsChange"
                              title="Precisa de troco?"
                              checked={needsChange}
                              onChange={e => setNeedsChange(e.target.checked)}
                              className="rounded border-border"
                            />
                            <Label htmlFor="needsChange">Precisa de troco?</Label>
                          </div>
                          {needsChange && (
                            <div>
                              <Label htmlFor="changeFor">Troco para quanto?</Label>
                              <Input
                                id="changeFor"
                                className="mt-1.5 rounded-xl"
                                placeholder="R$ 100,00"
                                type="number"
                                value={changeFor}
                                onChange={e => setChangeFor(e.target.value)}
                              />
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* CPF warning for online payments */}
                      {isOnlinePayment && !cpf.replace(/\D/g, '') && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                          ⚠️ Volte ao passo 1 e informe seu CPF para pagar via {paymentMethod === 'pix' ? 'PIX' : 'Cartão'}.
                        </div>
                      )}
                      {isOnlinePayment && cpfError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-800">
                          ⚠️ CPF inválido. Volte ao passo 1 e corrija.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-5">
                  {step > 1 ? (
                    <Button variant="outline" onClick={goBack} className="rounded-xl gap-2">
                      <ArrowLeft className="h-4 w-4" /> Voltar
                    </Button>
                  ) : <div />}

                  {step < 3 ? (
                    <Button onClick={goNext} disabled={!canAdvance()} className="rounded-xl gap-2">
                      Próximo <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting || (isOnlinePayment && (!cpf.replace(/\D/g, '') || !!cpfError))}
                      className="rounded-xl gap-2 min-w-[160px]"
                    >
                      {submitting
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : paymentMethod === 'cartao_online' ? 'Ir para Pagamento' : 'Confirmar Pedido'
                      }
                    </Button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm sticky top-20">
              <h3 className="font-semibold text-foreground mb-4">Resumo do Pedido</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img src={item.image} alt={item.title} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-foreground whitespace-nowrap">
                      R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Entrega</span>
                  <span className={deliveryColor}>{deliveryText}</span>
                </div>
                {showInstallments && installments > 1 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Parcelamento</span>
                    <span className="text-foreground">{installments}x sem juros</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">
                    {outOfRange
                      ? `R$ ${subtotal.toFixed(2).replace('.', ',')} + entrega`
                      : deliveryFee !== null
                      ? `R$ ${total.toFixed(2).replace('.', ',')}`
                      : deliveryLoading
                      ? `R$ ${subtotal.toFixed(2).replace('.', ',')} + ...`
                      : `R$ ${subtotal.toFixed(2).replace('.', ',')} + entrega`
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
