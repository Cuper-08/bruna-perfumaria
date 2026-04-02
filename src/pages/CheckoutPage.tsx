import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, User, MapPin, CreditCard, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/contexts/CartContext';
import { useViaCep } from '@/hooks/useViaCep';
import { supabase } from '@/integrations/supabase/client';

const STEPS = [
  { id: 1, label: 'Dados', icon: User },
  { id: 2, label: 'Endereço', icon: MapPin },
  { id: 3, label: 'Pagamento', icon: CreditCard },
];

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

type PaymentMethod = 'pix' | 'cartao_online' | 'dinheiro_entrega' | 'cartao_entrega';

const paymentLabels: Record<PaymentMethod, string> = {
  pix: 'PIX',
  cartao_online: 'Cartão Online',
  dinheiro_entrega: 'Dinheiro na Entrega',
  cartao_entrega: 'Cartão na Entrega',
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart, itemCount } = useCart();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [notes, setNotes] = useState('');

  // Step 2
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(5);

  // Step 3
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [needsChange, setNeedsChange] = useState(false);
  const [changeFor, setChangeFor] = useState('');

  const { address: viaCepAddress, loading: cepLoading } = useViaCep(cep);

  // Redirect if cart empty
  useEffect(() => {
    if (itemCount === 0) navigate('/carrinho');
  }, [itemCount, navigate]);

  // Load delivery fee
  useEffect(() => {
    supabase.from('admin_settings').select('delivery_fee').limit(1).single()
      .then(({ data }) => {
        if (data?.delivery_fee) setDeliveryFee(Number(data.delivery_fee));
      });
  }, []);

  // Auto-fill from ViaCEP
  useEffect(() => {
    if (viaCepAddress) {
      setStreet(viaCepAddress.street);
      setNeighborhood(viaCepAddress.neighborhood);
      setCity(`${viaCepAddress.city} - ${viaCepAddress.state}`);
    }
  }, [viaCepAddress]);

  const total = subtotal + deliveryFee;

  const canAdvance = () => {
    if (step === 1) return name.trim().length >= 3 && phone.replace(/\D/g, '').length >= 10;
    if (step === 2) return cep.replace(/\D/g, '').length === 8 && street.trim() && number.trim() && neighborhood.trim() && city.trim();
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const paymentStatus = ['pix', 'cartao_online'].includes(paymentMethod) ? 'pending' : 'delivery_payment';
      const { data, error } = await supabase.from('orders').insert({
        customer_name: name.trim(),
        customer_phone: phone.replace(/\D/g, ''),
        customer_cpf: cpf.replace(/\D/g, '') || null,
        notes: notes.trim() || null,
        address: { cep: cep.replace(/\D/g, ''), street, number, complement, neighborhood, city },
        items: items.map(i => ({ id: i.id, title: i.title, price: i.price, quantity: i.quantity, image: i.image })),
        subtotal,
        delivery_fee: deliveryFee,
        total,
        payment_method: paymentMethod,
        payment_status: paymentStatus as 'pending' | 'delivery_payment',
        needs_change: needsChange,
        change_for: needsChange ? parseFloat(changeFor) || null : null,
      }).select('id, order_number').single();

      if (error) throw error;
      clearCart();
      navigate(`/pedido/${data.id}`);
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Erro ao finalizar pedido. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  const [direction, setDirection] = useState(1);

  const goNext = () => { setDirection(1); setStep(s => Math.min(s + 1, 3)); };
  const goBack = () => { setDirection(-1); setStep(s => Math.max(s - 1, 1)); };

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
                  {step === 1 && (
                    <div className="space-y-5">
                      <h2 className="text-xl font-semibold text-foreground">Dados Pessoais</h2>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Nome completo *</Label>
                          <Input id="name" className="mt-1.5 rounded-xl" placeholder="Seu nome completo"
                            value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div>
                          <Label htmlFor="phone">Telefone *</Label>
                          <Input id="phone" className="mt-1.5 rounded-xl" placeholder="(11) 99999-9999"
                            value={phone} onChange={e => setPhone(maskPhone(e.target.value))} />
                        </div>
                        <div>
                          <Label htmlFor="cpf">CPF <span className="text-muted-foreground text-xs">(necessário para PIX)</span></Label>
                          <Input id="cpf" className="mt-1.5 rounded-xl" placeholder="000.000.000-00"
                            value={cpf} onChange={e => setCpf(maskCpf(e.target.value))} />
                        </div>
                        <div>
                          <Label htmlFor="notes">Observações</Label>
                          <Textarea id="notes" className="mt-1.5 rounded-xl" placeholder="Alguma observação sobre o pedido?"
                            value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-5">
                      <h2 className="text-xl font-semibold text-foreground">Endereço de Entrega</h2>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="cep">CEP *</Label>
                          <div className="relative">
                            <Input id="cep" className="mt-1.5 rounded-xl" placeholder="00000-000"
                              value={cep} onChange={e => setCep(maskCep(e.target.value))} />
                            {cepLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 h-4 w-4 animate-spin text-muted-foreground" />}
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="street">Rua *</Label>
                          <Input id="street" className="mt-1.5 rounded-xl" placeholder="Nome da rua"
                            value={street} onChange={e => setStreet(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label htmlFor="number">Número *</Label>
                            <Input id="number" className="mt-1.5 rounded-xl" placeholder="Nº"
                              value={number} onChange={e => setNumber(e.target.value)} />
                          </div>
                          <div className="col-span-2">
                            <Label htmlFor="complement">Complemento</Label>
                            <Input id="complement" className="mt-1.5 rounded-xl" placeholder="Apto, bloco..."
                              value={complement} onChange={e => setComplement(e.target.value)} />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="neighborhood">Bairro *</Label>
                          <Input id="neighborhood" className="mt-1.5 rounded-xl" placeholder="Bairro"
                            value={neighborhood} onChange={e => setNeighborhood(e.target.value)} />
                        </div>
                        <div>
                          <Label htmlFor="city">Cidade *</Label>
                          <Input id="city" className="mt-1.5 rounded-xl" placeholder="Cidade - UF"
                            value={city} onChange={e => setCity(e.target.value)} />
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-5">
                      <h2 className="text-xl font-semibold text-foreground">Forma de Pagamento</h2>
                      <RadioGroup value={paymentMethod} onValueChange={(v) => {
                        setPaymentMethod(v as PaymentMethod);
                        setNeedsChange(false);
                      }}>
                        {(Object.entries(paymentLabels) as [PaymentMethod, string][]).map(([key, label]) => (
                          <div key={key} className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                            paymentMethod === key ? 'border-primary bg-primary/5' : 'border-border'
                          }`} onClick={() => { setPaymentMethod(key); setNeedsChange(false); }}>
                            <RadioGroupItem value={key} id={key} />
                            <Label htmlFor={key} className="cursor-pointer font-medium flex-1">{label}</Label>
                          </div>
                        ))}
                      </RadioGroup>

                      {paymentMethod === 'dinheiro_entrega' && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-3 overflow-hidden">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="needsChange" checked={needsChange}
                              onChange={e => setNeedsChange(e.target.checked)}
                              className="rounded border-border" />
                            <Label htmlFor="needsChange">Precisa de troco?</Label>
                          </div>
                          {needsChange && (
                            <div>
                              <Label htmlFor="changeFor">Troco para quanto?</Label>
                              <Input id="changeFor" className="mt-1.5 rounded-xl" placeholder="R$ 100,00"
                                type="number" value={changeFor} onChange={e => setChangeFor(e.target.value)} />
                            </div>
                          )}
                        </motion.div>
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
                    <Button onClick={handleSubmit} disabled={submitting || !canAdvance()} className="rounded-xl gap-2 min-w-[160px]">
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar Pedido'}
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
                  <span className="text-foreground">R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
