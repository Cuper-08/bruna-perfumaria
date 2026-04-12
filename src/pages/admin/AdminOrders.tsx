import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Phone, MapPin, Printer, Truck, CheckCircle, Clock, XCircle, AlertTriangle,
  MessageCircle, Pencil, ShoppingBag, Sparkles, ChevronDown, PackageCheck,
  Bell, X, CreditCard, Banknote, Smartphone, Wallet,
} from 'lucide-react';
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
  { value: 'received', label: 'Novos', icon: AlertTriangle },
  { value: 'preparing', label: 'Preparando', icon: Sparkles },
  { value: 'out_for_delivery', label: 'Em Entrega', icon: Truck },
  { value: 'delivered', label: 'Entregues', icon: CheckCircle },
  { value: 'cancelled', label: 'Cancelados', icon: XCircle },
  { value: 'all', label: 'Todos', icon: Clock },
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
  { key: 'received' },
  { key: 'preparing' },
  { key: 'out_for_delivery' },
  { key: 'delivered' },
];

const timelineDotBg: Record<string, string> = {
  completed: 'bg-emerald-500',
  current: 'bg-accent animate-pulse',
  future: 'bg-muted-foreground/20',
};

const paymentLabels: Record<string, string> = {
  pix: 'PIX',
  cartao_online: 'Cartão Online',
  dinheiro_entrega: 'Dinheiro',
  cartao_entrega: 'Cartão Entrega',
};

const isOnlinePayment = (method: string) => method === 'pix' || method === 'cartao_online';
const isDeliveryPayment = (method: string) => method === 'dinheiro_entrega' || method === 'cartao_entrega';

// Payment method icon
const PaymentIcon = ({ method, className = 'h-3 w-3' }: { method: string; className?: string }) => {
  if (method === 'pix') return <Smartphone className={className} />;
  if (method === 'cartao_online') return <CreditCard className={className} />;
  if (method === 'dinheiro_entrega') return <Banknote className={className} />;
  return <Wallet className={className} />;
};

// Payment badge: online vs entrega
const PaymentTypeBadge = ({ method }: { method: string }) => {
  if (isOnlinePayment(method)) {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
        <PaymentIcon method={method} className="h-2.5 w-2.5" />
        {paymentLabels[method]}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-700">
      <PaymentIcon method={method} className="h-2.5 w-2.5" />
      COBRAR NA ENTREGA
    </span>
  );
};

const paymentStatusBadge = (status: string) => {
  if (status === 'paid') return <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 border-none text-[9px] px-1.5 py-0 h-4">PAGO</Badge>;
  if (status === 'delivery_payment') return <Badge className="bg-orange-500 text-white hover:bg-orange-600 border-none text-[9px] px-1.5 py-0 h-4">ENTREGA</Badge>;
  if (status === 'failed') return <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4">FALHOU</Badge>;
  return <Badge className="bg-red-500 text-white hover:bg-red-600 border-none text-[9px] px-1.5 py-0 h-4">PENDENTE</Badge>;
};

const nextStatus: Record<string, { label: string; next: string; icon: React.ElementType }> = {
  received: { label: 'Aceitar', next: 'preparing', icon: PackageCheck },
  preparing: { label: 'Enviar', next: 'out_for_delivery', icon: Truck },
  out_for_delivery: { label: 'Entregue', next: 'delivered', icon: CheckCircle },
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

const MiniTimeline = ({ status }: { status: string }) => {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-0.5">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-rose-400" />
        ))}
      </div>
    );
  }
  const currentIndex = timelineSteps.findIndex(s => s.key === status);
  return (
    <div className="flex items-center gap-0.5">
      {timelineSteps.map((step, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;
        const state = isCompleted ? 'completed' : isCurrent ? 'current' : 'future';
        return (
          <div key={step.key} className={`w-2 h-2 rounded-full transition-all ${timelineDotBg[state]}`} />
        );
      })}
    </div>
  );
};

const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const notes = [
      { freq: 830, start: 0, dur: 0.15 },
      { freq: 1050, start: 0.15, dur: 0.15 },
      { freq: 1320, start: 0.3, dur: 0.15 },
      { freq: 1580, start: 0.5, dur: 0.3 },
    ];
    notes.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.25, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur);
    });
  } catch {}
};

interface NewOrderBanner {
  order: Order;
  visible: boolean;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState('received');
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [showListPrint, setShowListPrint] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [newOrderBanner, setNewOrderBanner] = useState<NewOrderBanner | null>(null);
  const { toast } = useToast();
  const bannerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setOrders(data);
  }, []);

  const showNewOrderBanner = useCallback((order: Order) => {
    if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current);
    setNewOrderBanner({ order, visible: true });
    playNotificationSound();
    bannerTimeoutRef.current = setTimeout(() => {
      setNewOrderBanner(prev => prev ? { ...prev, visible: false } : null);
      setTimeout(() => setNewOrderBanner(null), 500);
    }, 8000);
  }, []);

  const dismissBanner = useCallback(() => {
    if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current);
    setNewOrderBanner(prev => prev ? { ...prev, visible: false } : null);
    setTimeout(() => setNewOrderBanner(null), 500);
  }, []);

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('admin-orders-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const newOrder = payload.new as Order;
        setOrders((prev) => {
          if (prev.some(o => o.id === newOrder.id)) return prev;
          return [newOrder, ...prev];
        });
        showNewOrderBanner(newOrder);
        toast({ title: '🔔 Novo Pedido!', description: `Pedido #${newOrder.order_number} recebido` });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
        const updatedOrder = payload.new as Order;
        setOrders((prev) => prev.map((o) => {
          if (o.id === updatedOrder.id) {
            if (o.payment_status !== 'paid' && updatedOrder.payment_status === 'paid') {
              toast({ title: '✅ Pagamento Confirmado!', description: `Pedido #${updatedOrder.order_number} foi pago` });
            }
            return updatedOrder;
          }
          return o;
        }));
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn('[AdminOrders] Realtime channel error, polling fallback active');
        }
      });

    const pollInterval = setInterval(fetchOrders, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
      if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current);
    };
  }, [fetchOrders, toast, showNewOrderBanner]);

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

  const toggleExpanded = (orderId: string) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const filtered = activeTab === 'all' ? orders : orders.filter((o) => o.order_status === activeTab);

  // Stats
  const onlineOrders = orders.filter(o => isOnlinePayment(o.payment_method));
  const deliveryOrders = orders.filter(o => isDeliveryPayment(o.payment_method));
  const paidOnline = onlineOrders.filter(o => o.payment_status === 'paid');
  const pendingOnline = onlineOrders.filter(o => o.payment_status === 'pending');

  return (
    <TooltipProvider>
      <div className="space-y-4 animate-fade-in">

        {/* New Order Banner */}
        {newOrderBanner && (
          <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-lg transition-all duration-500 ${newOrderBanner.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <div className="relative bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white rounded-2xl shadow-2xl shadow-emerald-500/30 p-4 flex items-center gap-3 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 animate-pulse" />
              <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm shrink-0">
                <Bell className="h-6 w-6 animate-bounce" />
              </div>
              <div className="relative flex-1 min-w-0">
                <p className="font-display font-bold text-base">🔔 Novo Pedido!</p>
                <p className="text-sm text-white/90 truncate">
                  #{newOrderBanner.order.order_number} • {newOrderBanner.order.customer_name} • R$ {Number(newOrderBanner.order.total).toFixed(2)}
                </p>
              </div>
              <button type="button" aria-label="Fechar" onClick={dismissBanner} className="relative p-1.5 rounded-lg hover:bg-white/20 transition-colors shrink-0">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-display font-bold tracking-tight text-foreground">Pedidos</h2>
              <Badge className="bg-accent/10 text-accent border-accent/20 font-display text-xs px-2 py-0">
                {orders.length}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              Tempo real
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handlePrintList} className="rounded-xl border-border/50 hover:shadow-md hover:border-accent/30 transition-all gap-1.5 h-8 text-xs">
            <Printer className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Imprimir</span>
            <Badge className="bg-muted text-muted-foreground text-[9px] px-1 py-0 h-4">{filtered.length}</Badge>
          </Button>
        </div>

        {/* Financial Summary: Online vs Entrega */}
        <div className="grid grid-cols-2 gap-2">
          {/* Online */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 dark:from-blue-950/40 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="p-1 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                <Smartphone className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Pagamento Online</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-xl font-bold font-display text-blue-700 dark:text-blue-300">{onlineOrders.length}</p>
                <p className="text-[9px] text-blue-500 uppercase">Total</p>
              </div>
              <div className="h-8 w-px bg-blue-200 dark:bg-blue-700" />
              <div className="text-center">
                <p className="text-xl font-bold font-display text-emerald-600">{paidOnline.length}</p>
                <p className="text-[9px] text-emerald-500 uppercase">Pagos</p>
              </div>
              <div className="h-8 w-px bg-blue-200 dark:bg-blue-700" />
              <div className="text-center">
                <p className="text-xl font-bold font-display text-red-500">{pendingOnline.length}</p>
                <p className="text-[9px] text-red-400 uppercase">Pendentes</p>
              </div>
            </div>
          </div>

          {/* Entrega */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100/30 dark:from-orange-950/40 dark:to-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="p-1 rounded-lg bg-orange-100 dark:bg-orange-900/40">
                <Banknote className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-[11px] font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider">Pagar na Entrega</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-xl font-bold font-display text-orange-700 dark:text-orange-300">{deliveryOrders.length}</p>
                <p className="text-[9px] text-orange-500 uppercase">Pedidos</p>
              </div>
              <div className="h-8 w-px bg-orange-200 dark:bg-orange-700" />
              <div className="text-center">
                <p className="text-lg font-bold font-display text-orange-700 dark:text-orange-300">
                  R${deliveryOrders.reduce((s, o) => s + Number(o.total), 0).toFixed(0)}
                </p>
                <p className="text-[9px] text-orange-500 uppercase">A cobrar</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status summary cards */}
        <div className="grid grid-cols-5 gap-1.5">
          {statusTabs.filter(t => t.value !== 'all').map(tab => {
            const count = orders.filter(o => o.order_status === tab.value).length;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(prev => prev === tab.value ? 'all' : tab.value)}
                className={`relative flex flex-col items-center gap-1 p-2.5 rounded-xl border-b-2 transition-all duration-200 ${
                  isActive
                    ? `bg-gradient-to-br ${statusCardGradients[tab.value]} ${statusBottomBorder[tab.value]} shadow-md scale-[1.02] ring-1 ring-border/50`
                    : `border-b-transparent bg-card border border-border/30 hover:shadow-sm hover:border-border`
                }`}
              >
                <div className={`p-1 rounded-lg ${statusColors[tab.value]}`}>
                  <tab.icon className="h-3 w-3" />
                </div>
                <span className="text-xl font-bold font-display leading-none">{count}</span>
                <span className="text-[8px] text-muted-foreground font-semibold uppercase tracking-wider">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick filter pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          {statusTabs.map(tab => {
            const count = tab.value === 'all' ? orders.length : orders.filter(o => o.order_status === tab.value).length;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.value
                    ? 'bg-foreground text-background shadow-sm'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                <tab.icon className="h-2.5 w-2.5" />
                {tab.label}
                <span className={`text-[9px] px-1 rounded-full font-bold ${activeTab === tab.value ? 'bg-background/20' : 'bg-background/50'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Orders list */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value={activeTab} className="mt-0">
            {filtered.length === 0 ? (
              <Card className="rounded-2xl border-border/30 border-dashed">
                <CardContent className="py-16 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                  <p className="text-base font-display font-semibold text-muted-foreground">Nenhum pedido</p>
                  <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs mx-auto">Novos pedidos aparecerão automaticamente.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filtered.map((order, index) => {
                  const items = (Array.isArray(order.items) ? order.items : []) as unknown as OrderItem[];
                  const addr = (order.address || {}) as unknown as OrderAddress;
                  const action = nextStatus[order.order_status];
                  const initials = getInitials(order.customer_name);
                  const avatarColor = getAvatarColor(order.customer_name);
                  const isExpanded = expandedOrders.has(order.id);
                  const totalItems = items.reduce((sum, it) => sum + it.quantity, 0);
                  const isOnline = isOnlinePayment(order.payment_method);
                  const isDelivery = isDeliveryPayment(order.payment_method);

                  return (
                    <Collapsible key={order.id} open={isExpanded} onOpenChange={() => toggleExpanded(order.id)}>
                      <Card
                        className={`overflow-hidden rounded-xl border border-border/30 border-l-[3px] ${statusBorderColors[order.order_status] || ''} shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in ${
                          isDelivery ? 'border-r-2 border-r-orange-300 dark:border-r-orange-700' : ''
                        }`}
                        style={{ animationDelay: `${index * 40}ms` }}
                      >
                        {/* Compact header */}
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center gap-2 p-3 cursor-pointer hover:bg-muted/20 transition-colors">
                            <MiniTimeline status={order.order_status} />

                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${avatarColor} text-white font-bold text-[10px] shrink-0`}>
                              {initials}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-sm font-bold font-display">#{order.order_number}</span>
                                <span className={`text-[8px] px-1.5 py-0 rounded-full font-bold uppercase tracking-wider ${statusColors[order.order_status]}`}>
                                  {statusLabels[order.order_status]}
                                </span>
                                {isOnline && paymentStatusBadge(order.payment_status)}
                                <PaymentTypeBadge method={order.payment_method} />
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                                <span>{order.customer_name.split(' ')[0]}</span>
                                <span>•</span>
                                <span>{totalItems} {totalItems === 1 ? 'item' : 'itens'}</span>
                                {addr.neighborhood && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate max-w-[80px]">{addr.neighborhood}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-sm font-bold font-display text-accent">
                                R$ {Number(order.total).toFixed(2)}
                              </span>
                              <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </div>
                        </CollapsibleTrigger>

                        {/* Date + quick actions */}
                        <div className="px-3 pb-2 -mt-1 flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">
                            {format(new Date(order.created_at!), "dd/MM 'às' HH:mm", { locale: ptBR })}
                          </span>
                          <div className="flex items-center gap-0.5">
                            {action && (
                              <Button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); updateStatus(order.id, action.next); }}
                                size="sm"
                                className="h-6 text-[10px] px-2 rounded-lg bg-gradient-to-r from-bruna-dark to-bruna-dark/90 hover:from-bruna-red hover:to-bruna-red/90 text-white font-semibold gap-1"
                              >
                                <action.icon className="h-3 w-3" />
                                {action.label}
                              </Button>
                            )}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6 rounded-lg text-green-600" onClick={(e) => { e.stopPropagation(); openWhatsApp(order); }}>
                                  <MessageCircle className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>WhatsApp</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6 rounded-lg" onClick={(e) => { e.stopPropagation(); openEdit(order); }}>
                                  <Pencil className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Editar</TooltipContent>
                            </Tooltip>
                          </div>
                        </div>

                        {/* Expanded content */}
                        <CollapsibleContent>
                          <CardContent className="space-y-3 pt-0 pb-3 border-t border-border/20">

                            {/* Client Info */}
                            <div className="flex items-center gap-2 pt-3 text-xs">
                              <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                              <a href={`tel:${order.customer_phone}`} className="text-primary hover:underline">{order.customer_phone}</a>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground truncate">{order.customer_name}</span>
                            </div>

                            {addr.street && (
                              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                                <span>
                                  {addr.street}, {addr.number}
                                  {addr.complement ? ` - ${addr.complement}` : ''}
                                  {addr.neighborhood ? `, ${addr.neighborhood}` : ''}
                                  {addr.city ? ` - ${addr.city}` : ''}
                                  {addr.cep ? ` (${addr.cep})` : ''}
                                </span>
                              </div>
                            )}

                            {/* Items table */}
                            <div className="border border-border/30 rounded-lg overflow-hidden">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="bg-muted/30">
                                    <th className="text-left p-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Produto</th>
                                    <th className="text-center p-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider w-10">Qtd</th>
                                    <th className="text-right p-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Valor</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {items.map((item, i) => (
                                    <tr key={i} className={`border-t border-border/15 ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                                      <td className="p-2 font-medium">{item.title}</td>
                                      <td className="p-2 text-center">
                                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted/40 font-bold text-[10px]">{item.quantity}</span>
                                      </td>
                                      <td className="p-2 text-right font-semibold">R$ {(item.price * item.quantity).toFixed(2)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Totals + Payment status */}
                            <div className="rounded-lg overflow-hidden border border-border/20">
                              <div className="bg-muted/20 p-3 space-y-1">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>Subtotal</span>
                                  <span>R$ {Number(order.subtotal).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>Entrega</span>
                                  <span>R$ {Number(order.delivery_fee).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center font-bold text-base pt-1.5 border-t border-border/20">
                                  <span className="font-display">Total</span>
                                  <span className="text-accent font-display">R$ {Number(order.total).toFixed(2)}</span>
                                </div>
                              </div>
                              {/* Payment status banner */}
                              {isOnline && (
                                <div className={`px-3 py-2 flex items-center justify-between text-xs font-medium ${
                                  order.payment_status === 'paid'
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                                    : order.payment_status === 'failed'
                                    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                                    : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                                }`}>
                                  <span>
                                    {order.payment_status === 'paid' && '✅ Pagamento confirmado'}
                                    {order.payment_status === 'pending' && '⏳ Aguardando pagamento'}
                                    {order.payment_status === 'failed' && '❌ Pagamento falhou'}
                                  </span>
                                  {paymentStatusBadge(order.payment_status)}
                                </div>
                              )}
                              {isDelivery && (
                                <div className="px-3 py-2 flex items-center justify-between text-xs font-medium bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300">
                                  <span>
                                    💵 Cobrar na entrega — {paymentLabels[order.payment_method]}
                                    {order.payment_method === 'dinheiro_entrega' && order.needs_change && order.change_for
                                      ? ` (troco p/ R$ ${Number(order.change_for).toFixed(2)})`
                                      : ''}
                                  </span>
                                </div>
                              )}
                            </div>

                            {order.notes && (
                              <div className="bg-muted/20 rounded-lg p-2 text-xs text-muted-foreground flex items-start gap-1.5">
                                📝 <span>{order.notes}</span>
                              </div>
                            )}

                            {/* Expanded actions */}
                            <div className="flex items-center gap-1 pt-1">
                              <Button type="button" variant="outline" size="sm" className="h-7 rounded-lg text-[10px] gap-1" onClick={() => handlePrint(order)}>
                                <Printer className="h-3 w-3" />
                                Imprimir
                              </Button>
                              {order.order_status === 'received' && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 rounded-lg text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                                  onClick={() => updateStatus(order.id, 'cancelled')}
                                >
                                  <XCircle className="h-3 w-3" />
                                  Cancelar
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
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

        {showListPrint && <OrderListPrint orders={filtered} />}
      </div>
    </TooltipProvider>
  );
};

export default AdminOrders;
