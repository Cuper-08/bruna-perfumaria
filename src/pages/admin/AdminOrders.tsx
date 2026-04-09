import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Phone, MapPin, Printer, ChefHat, Truck, CheckCircle, Clock, XCircle, AlertTriangle, MessageCircle, Pencil, List, ShoppingBag, User, Package, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import OrderReceiptPrint from '@/components/admin/OrderReceiptPrint';
import OrderEditDialog from '@/components/admin/OrderEditDialog';
import OrderListPrint from '@/components/admin/OrderListPrint';
import type { Tables } from '@/integrations/supabase/types';

type Order = Tables<'orders'>;

interface OrderItem {
  title: string;
  quantity: number;
  price: number;
}

interface OrderAddress {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  cep?: string;
}

const statusTabs = [
  { value: 'all', label: 'Todos', icon: Clock },
  { value: 'received', label: 'Novos', icon: AlertTriangle },
  { value: 'preparing', label: 'Preparando', icon: ChefHat },
  { value: 'out_for_delivery', label: 'Em Entrega', icon: Truck },
  { value: 'delivered', label: 'Entregues', icon: CheckCircle },
  { value: 'cancelled', label: 'Cancelados', icon: XCircle },
];

const statusLabels: Record<string, string> = {
  received: 'Novo',
  preparing: 'Preparando',
  out_for_delivery: 'Em Entrega',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

const statusColors: Record<string, string> = {
  received: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  preparing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  out_for_delivery: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

const statusCardGradients: Record<string, string> = {
  received: 'from-sky-50 to-sky-100/30 dark:from-sky-950/40 dark:to-sky-900/20',
  preparing: 'from-amber-50 to-amber-100/30 dark:from-amber-950/40 dark:to-amber-900/20',
  out_for_delivery: 'from-indigo-50 to-indigo-100/30 dark:from-indigo-950/40 dark:to-indigo-900/20',
  delivered: 'from-emerald-50 to-emerald-100/30 dark:from-emerald-950/40 dark:to-emerald-900/20',
  cancelled: 'from-rose-50 to-rose-100/30 dark:from-rose-950/40 dark:to-rose-900/20',
};

const statusBottomBorder: Record<string, string> = {
  received: 'border-b-sky-400',
  preparing: 'border-b-amber-400',
  out_for_delivery: 'border-b-indigo-400',
  delivered: 'border-b-emerald-400',
  cancelled: 'border-b-rose-400',
};

const statusBorderColors: Record<string, string> = {
  received: 'border-l-sky-500',
  preparing: 'border-l-amber-500',
  out_for_delivery: 'border-l-indigo-500',
  delivered: 'border-l-emerald-500',
  cancelled: 'border-l-rose-400',
};

const timelineSteps = [
  { key: 'received', label: 'Novo', icon: Package },
  { key: 'preparing', label: 'Preparando', icon: ChefHat },
  { key: 'out_for_delivery', label: 'Entrega', icon: Truck },
  { key: 'delivered', label: 'Entregue', icon: CheckCircle },
];

const timelineDotColors: Record<string, string> = {
  completed: 'bg-emerald-500 text-white',
  current: 'bg-accent text-white ring-4 ring-accent/20',
  future: 'bg-muted text-muted-foreground',
};

const paymentLabels: Record<string, string> = {
  pix: 'PIX',
  cartao_online: 'Cartão Online',
  dinheiro_entrega: 'Dinheiro na Entrega',
  cartao_entrega: 'Cartão na Entrega',
};

const paymentStatusBadge = (status: string) => {
  if (status === 'paid') return <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 border-none shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30">PAGO</Badge>;
  if (status === 'delivery_payment') return <Badge className="bg-amber-500 text-white hover:bg-amber-600 border-none shadow-sm shadow-amber-200 dark:shadow-amber-900/30">PGTO NA ENTREGA</Badge>;
  if (status === 'failed') return <Badge variant="destructive" className="shadow-sm">FALHOU</Badge>;
  return <Badge className="bg-red-500 text-white hover:bg-red-600 border-none shadow-sm shadow-red-200 dark:shadow-red-900/30">PENDENTE</Badge>;
};

const nextStatus: Record<string, { label: string; next: string; icon: React.ElementType }> = {
  received: { label: 'Aceitar Pedido', next: 'preparing', icon: ChefHat },
  preparing: { label: 'Saiu para Entrega', next: 'out_for_delivery', icon: Truck },
  out_for_delivery: { label: 'Marcar Entregue', next: 'delivered', icon: CheckCircle },
};

const formatWhatsAppNumber = (phone: string) => phone.replace(/\D/g, '');

const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const avatarColors = [
  'bg-sky-500', 'bg-amber-500', 'bg-emerald-500', 'bg-indigo-500',
  'bg-rose-500', 'bg-violet-500', 'bg-teal-500', 'bg-orange-500',
];

const getAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

// Timeline component
const OrderTimeline = ({ status }: { status: string }) => {
  const isCancelled = status === 'cancelled';
  const currentIndex = timelineSteps.findIndex(s => s.key === status);

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 py-3 px-1">
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-rose-500 text-white">
          <XCircle className="h-4 w-4" />
        </div>
        <div className="flex-1 h-0.5 bg-rose-200 dark:bg-rose-800 rounded-full" />
        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Cancelado</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0 py-3 px-1">
      {timelineSteps.map((step, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;
        const dotState = isCompleted ? 'completed' : isCurrent ? 'current' : 'future';
        const StepIcon = step.icon;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-initial">
            <div className="flex flex-col items-center gap-1">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full transition-all duration-300 ${timelineDotColors[dotState]} ${isCurrent ? 'animate-pulse' : ''}`}>
                <StepIcon className="h-3.5 w-3.5" />
              </div>
              <span className={`text-[9px] font-semibold tracking-wider uppercase ${isCurrent ? 'text-accent' : isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground/50'}`}>
                {step.label}
              </span>
            </div>
            {i < timelineSteps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1.5 rounded-full transition-all duration-300 ${isCompleted ? 'bg-emerald-400 dark:bg-emerald-600' : 'bg-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [showListPrint, setShowListPrint] = useState(false);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        setOrders((prev) => [payload.new as Order, ...prev]);
        try { audioRef.current?.play(); } catch {}
        toast({
          title: '🔔 Novo Pedido!',
          description: `Pedido #${(payload.new as Order).order_number} recebido`,
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
        setOrders((prev) => prev.map((o) => (o.id === (payload.new as Order).id ? (payload.new as Order) : o)));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    await supabase.from('orders').update({ order_status: newStatus as Order['order_status'], updated_at: new Date().toISOString() }).eq('id', orderId);
  };

  const handlePrint = (order: Order) => {
    setPrintOrder(order);
    setShowListPrint(false);
    setTimeout(() => window.print(), 200);
  };

  const handlePrintList = () => {
    setPrintOrder(null);
    setShowListPrint(true);
    setTimeout(() => window.print(), 200);
  };

  const openWhatsApp = (order: Order) => {
    const phone = formatWhatsAppNumber(order.customer_phone);
    const msg = encodeURIComponent(`Olá ${order.customer_name}! Sobre seu pedido #${order.order_number} na Bruna Perfumaria 🌸`);
    window.open(`https://wa.me/55${phone}?text=${msg}`, '_blank');
  };

  const openEdit = (order: Order) => {
    setEditOrder(order);
    setEditOpen(true);
  };

  const filtered = activeTab === 'all' ? orders : orders.filter((o) => o.order_status === activeTab);

  return (
    <TooltipProvider>
      <div className="space-y-6 animate-fade-in">
        <audio ref={audioRef} preload="auto" src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgipuzq49hO0FZcYyltaV2TDQ+WXOKnquggGhNQlRtgpOfoJuJdmZbX2t7ipWYlY+IgX15dn2DhoeHhYF8d3V1d3t/g4WFg4B8eXh4eXt9f4GCgoF/fXx7e3x9fn+AgIB/fn19fX1+fn9/f39/fn5+fn5+fn5/f39/f39/fn5+fn5+fn5/f39/f39/fn5+fn5+fn9/f39/f39+fn5+fn5+f39/f39/f35+fn5+fn5/f39/f39/fn5+fn5+fn9/f39/f39+fn5+fn5+f39/f39/f35+fn5+fn5/f39/f39+fn5+fn5+fn9/f39/f39+fn4=" />

        {/* Header Premium */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-foreground">Pedidos</h2>
              <Badge className="bg-accent/10 text-accent border-accent/20 font-display text-sm px-3 py-0.5">
                {orders.length}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1.5 text-sm md:text-base flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Atualizações em tempo real
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrintList} className="rounded-xl border-border/50 hover:shadow-md hover:border-accent/30 transition-all gap-2">
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Imprimir</span>
              <Badge className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0 h-5">{filtered.length}</Badge>
            </Button>
          </div>
        </div>

        {/* Summary Cards Premium */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {statusTabs.filter(t => t.value !== 'all').map(tab => {
            const count = orders.filter(o => o.order_status === tab.value).length;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(prev => prev === tab.value ? 'all' : tab.value)}
                className={`relative flex flex-col items-center gap-1.5 p-4 rounded-2xl border-b-[3px] transition-all duration-300 ${
                  isActive
                    ? `bg-gradient-to-br ${statusCardGradients[tab.value]} ${statusBottomBorder[tab.value]} shadow-lg scale-[1.03] ring-1 ring-border/50`
                    : `border-b-transparent bg-card border border-border/40 hover:shadow-md hover:scale-[1.01] hover:border-border`
                }`}
              >
                <div className={`p-2 rounded-xl ${statusColors[tab.value]} transition-transform ${isActive ? 'scale-110' : ''}`}>
                  <tab.icon className="h-4 w-4" />
                </div>
                <span className="text-3xl font-bold font-display leading-none">{count}</span>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">{tab.label}</span>
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent shadow-md shadow-accent/30 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Compact tab pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {statusTabs.map(tab => {
            const count = tab.value === 'all' ? orders.length : orders.filter(o => o.order_status === tab.value).length;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.value
                    ? 'bg-foreground text-background shadow-md'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                }`}
              >
                <tab.icon className="h-3 w-3" />
                {tab.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.value ? 'bg-background/20' : 'bg-background/60'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value={activeTab} className="mt-0">
            {filtered.length === 0 ? (
              <Card className="rounded-2xl border-border/30 border-dashed">
                <CardContent className="py-20 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-5">
                    <ShoppingBag className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                  <p className="text-lg font-display font-semibold text-muted-foreground">Nenhum pedido aqui</p>
                  <p className="text-sm text-muted-foreground/60 mt-1 max-w-xs mx-auto">Os pedidos aparecerão automaticamente em tempo real quando seus clientes comprarem.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filtered.map((order, index) => {
                  const items = (Array.isArray(order.items) ? order.items : []) as unknown as OrderItem[];
                  const addr = (order.address || {}) as unknown as OrderAddress;
                  const action = nextStatus[order.order_status];
                  const initials = getInitials(order.customer_name);
                  const avatarColor = getAvatarColor(order.customer_name);

                  return (
                    <Card
                      key={order.id}
                      className={`group overflow-hidden rounded-2xl border border-border/40 border-l-4 ${statusBorderColors[order.order_status] || ''} shadow-sm hover:shadow-xl hover:border-accent/20 transition-all duration-300 animate-fade-in`}
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      {/* Card Header — 2 columns */}
                      <div className="flex items-start justify-between gap-3 p-4 pb-2 bg-gradient-to-r from-muted/40 via-muted/20 to-transparent">
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${avatarColor} text-white font-bold text-sm shadow-md`}>
                            {initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold font-display tracking-tight">#{order.order_number}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${statusColors[order.order_status]}`}>
                                {statusLabels[order.order_status]}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(order.created_at!), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          {paymentStatusBadge(order.payment_status)}
                          <Badge variant="outline" className="text-[10px] rounded-lg border-border/50 font-medium">{paymentLabels[order.payment_method]}</Badge>
                        </div>
                      </div>

                      <CardContent className="space-y-3 pt-2 pb-4">
                        {/* Timeline Progress */}
                        <OrderTimeline status={order.order_status} />

                        {/* Client Info */}
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/30">
                          <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{order.customer_name}</p>
                            <a href={`tel:${order.customer_phone}`} className="text-primary flex items-center gap-1 text-xs hover:underline mt-0.5">
                              <Phone className="h-3 w-3" /> {order.customer_phone}
                            </a>
                          </div>
                          {addr.street && (
                            <div className="flex-1 min-w-0 text-xs text-muted-foreground">
                              <div className="flex items-start gap-1">
                                <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                                <span className="truncate">
                                  {addr.street}, {addr.number}
                                  {addr.complement ? ` - ${addr.complement}` : ''}
                                  {addr.neighborhood ? `, ${addr.neighborhood}` : ''}
                                  {addr.city ? ` - ${addr.city}` : ''}
                                  {addr.cep ? ` (${addr.cep})` : ''}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Items Table — Zebra striping */}
                        <div className="border border-border/40 rounded-xl overflow-hidden">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gradient-to-r from-muted/50 to-muted/20">
                                <th className="text-left p-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Produto</th>
                                <th className="text-center p-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Qtd</th>
                                <th className="text-right p-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Valor</th>
                              </tr>
                            </thead>
                            <tbody>
                              {items.map((item, i) => (
                                <tr key={i} className={`border-t border-border/20 ${i % 2 === 0 ? 'bg-transparent' : 'bg-muted/10'}`}>
                                  <td className="p-2.5 text-xs font-medium">{item.title}</td>
                                  <td className="p-2.5 text-xs text-center">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted/40 font-bold text-[11px]">{item.quantity}</span>
                                  </td>
                                  <td className="p-2.5 text-xs text-right font-semibold">R$ {(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Totals — Premium */}
                        <div className="bg-gradient-to-r from-muted/30 via-muted/15 to-transparent rounded-xl p-3.5 space-y-1.5">
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Subtotal</span>
                            <span>R$ {Number(order.subtotal).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Entrega</span>
                            <span>R$ {Number(order.delivery_fee).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center font-bold text-lg pt-2 border-t border-border/30">
                            <span className="font-display">Total</span>
                            <span className="text-accent font-display">R$ {Number(order.total).toFixed(2)}</span>
                          </div>
                        </div>

                        {order.payment_method === 'dinheiro_entrega' && order.needs_change && order.change_for && (
                          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2">
                            <span className="text-lg">💵</span>
                            <span>Troco para: <strong>R$ {Number(order.change_for).toFixed(2)}</strong></span>
                          </div>
                        )}

                        {order.notes && (
                          <div className="bg-muted/30 rounded-xl p-3 text-sm text-muted-foreground flex items-start gap-2">
                            <span className="mt-0.5">📝</span>
                            <span>{order.notes}</span>
                          </div>
                        )}

                        {/* Actions — Premium */}
                        <div className="flex items-center gap-2 pt-2 border-t border-border/20">
                          {action && (
                            <Button
                              onClick={() => updateStatus(order.id, action.next)}
                              className="flex-1 bg-gradient-to-r from-bruna-dark to-bruna-dark/90 hover:from-bruna-red hover:to-bruna-red/90 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 font-semibold"
                              size="sm"
                            >
                              <action.icon className="h-4 w-4 mr-1.5" />
                              {action.label}
                            </Button>
                          )}

                          <div className="flex items-center gap-1 ml-auto">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20" onClick={() => openWhatsApp(order)}>
                                  <MessageCircle className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>WhatsApp</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl" onClick={() => openEdit(order)}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Editar</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl" onClick={() => handlePrint(order)}>
                                  <Printer className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Imprimir</TooltipContent>
                            </Tooltip>
                            {order.order_status === 'received' && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => updateStatus(order.id, 'cancelled')}
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Cancelar</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <OrderEditDialog
          order={editOrder}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSaved={fetchOrders}
        />

        {/* Hidden print receipt */}
        {printOrder && (
          <OrderReceiptPrint
            order={{
              order_number: printOrder.order_number,
              customer_name: printOrder.customer_name,
              customer_phone: printOrder.customer_phone,
              items: (Array.isArray(printOrder.items) ? printOrder.items : []) as unknown as { title: string; quantity: number; price: number }[],
              subtotal: Number(printOrder.subtotal),
              delivery_fee: Number(printOrder.delivery_fee),
              total: Number(printOrder.total),
              payment_method: printOrder.payment_method,
              payment_status: printOrder.payment_status,
              needs_change: printOrder.needs_change ?? false,
              change_for: printOrder.change_for ? Number(printOrder.change_for) : undefined,
              address: (printOrder.address || {}) as { street?: string; number?: string; complement?: string; neighborhood?: string; city?: string; state?: string; cep?: string },
              notes: printOrder.notes ?? undefined,
              created_at: printOrder.created_at!,
            }}
          />
        )}

        {/* Hidden print list */}
        {showListPrint && <OrderListPrint orders={filtered} />}
      </div>
    </TooltipProvider>
  );
};

export default AdminOrders;
