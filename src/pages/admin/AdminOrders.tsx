import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, MapPin, Printer, ChefHat, Truck, CheckCircle, Clock, XCircle, AlertTriangle, MessageCircle, Pencil, List, ShoppingBag } from 'lucide-react';
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

const statusBorderColors: Record<string, string> = {
  received: 'border-l-sky-500',
  preparing: 'border-l-amber-500',
  out_for_delivery: 'border-l-indigo-500',
  delivered: 'border-l-emerald-500',
  cancelled: 'border-l-rose-400',
};

const paymentLabels: Record<string, string> = {
  pix: 'PIX',
  cartao_online: 'Cartão Online',
  dinheiro_entrega: 'Dinheiro na Entrega',
  cartao_entrega: 'Cartão na Entrega',
};

const paymentStatusBadge = (status: string) => {
  if (status === 'paid') return <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 border-none">PAGO</Badge>;
  if (status === 'delivery_payment') return <Badge className="bg-amber-500 text-white hover:bg-amber-600 border-none">PGTO NA ENTREGA</Badge>;
  if (status === 'failed') return <Badge variant="destructive">FALHOU</Badge>;
  return <Badge className="bg-red-500 text-white hover:bg-red-600 border-none">PENDENTE</Badge>;
};

const nextStatus: Record<string, { label: string; next: string; icon: React.ElementType }> = {
  received: { label: 'Aceitar Pedido', next: 'preparing', icon: ChefHat },
  preparing: { label: 'Saiu para Entrega', next: 'out_for_delivery', icon: Truck },
  out_for_delivery: { label: 'Marcar Entregue', next: 'delivered', icon: CheckCircle },
};

const formatWhatsAppNumber = (phone: string) => phone.replace(/\D/g, '');

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
    <div className="space-y-6 animate-fade-in">
      <audio ref={audioRef} preload="auto" src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgipuzq49hO0FZcYyltaV2TDQ+WXOKnquggGhNQlRtgpOfoJuJdmZbX2t7ipWYlY+IgX15dn2DhoeHhYF8d3V1d3t/g4WFg4B8eXh4eXt9f4GCgoF/fXx7e3x9fn+AgIB/fn19fX1+fn9/f39/fn5+fn5+fn5/f39/f39/fn5+fn5+fn5/f39/f39/fn5+fn5+fn9/f39/f39+fn5+fn5+f39/f39/f35+fn5+fn5/f39/f39/fn5+fn5+fn9/f39/f39+fn5+fn5+f39/f39/f35+fn5+fn5/f39/f39+fn5+fn5+fn9/f39/f39+fn4=" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-foreground">Pedidos</h2>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Gerencie os pedidos da sua loja em tempo real.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrintList} className="rounded-xl border-border/50 hover:shadow-sm">
            <List className="h-4 w-4 mr-1" /> Imprimir
          </Button>
        </div>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
        {statusTabs.filter(t => t.value !== 'all').map(tab => {
          const count = orders.filter(o => o.order_status === tab.value).length;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all duration-200 ${
                activeTab === tab.value 
                  ? 'border-primary/30 bg-primary/5 shadow-md scale-[1.02]' 
                  : 'border-border/50 bg-card hover:shadow-sm hover:border-border'
              }`}
            >
              <div className={`p-2 rounded-xl ${statusColors[tab.value]}`}>
                <tab.icon className="h-4 w-4" />
              </div>
              <span className="text-2xl font-bold font-display">{count}</span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex overflow-x-auto bg-card border border-border/50 rounded-2xl p-1.5 shadow-sm">
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-1.5 text-xs rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold transition-all">
              <tab.icon className="h-3 w-3" />
              {tab.label}
              {tab.value !== 'all' && (
                <span className="ml-0.5 text-[10px] bg-muted/60 rounded-full px-1.5 py-0.5 font-bold">
                  {orders.filter((o) => o.order_status === tab.value).length}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filtered.length === 0 ? (
            <Card className="rounded-2xl border-border/50">
              <CardContent className="py-16 text-center">
                <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground font-medium">Nenhum pedido nesta categoria.</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Os pedidos aparecerão aqui em tempo real.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filtered.map((order, index) => {
                const items = (Array.isArray(order.items) ? order.items : []) as unknown as OrderItem[];
                const addr = (order.address || {}) as unknown as OrderAddress;
                const action = nextStatus[order.order_status];

                return (
                  <Card 
                    key={order.id} 
                    className={`overflow-hidden rounded-2xl border-border/50 border-l-4 ${statusBorderColors[order.order_status] || ''} shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardHeader className="pb-3 flex flex-row items-start justify-between gap-2 flex-wrap bg-gradient-to-r from-muted/30 to-transparent">
                      <div>
                        <div className="flex items-center gap-2.5 mb-1">
                          <span className="text-xl font-bold font-display tracking-tight">#{order.order_number}</span>
                          <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${statusColors[order.order_status]}`}>
                            {statusLabels[order.order_status]}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(order.created_at!), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {paymentStatusBadge(order.payment_status)}
                        <Badge variant="outline" className="text-xs rounded-lg">{paymentLabels[order.payment_method]}</Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3 pt-0">
                      <div className="flex items-start gap-3 text-sm">
                        <div className="flex-1">
                          <p className="font-semibold">{order.customer_name}</p>
                          <a href={`tel:${order.customer_phone}`} className="text-primary flex items-center gap-1 text-xs hover:underline">
                            <Phone className="h-3 w-3" /> {order.customer_phone}
                          </a>
                        </div>
                        {addr.street && (
                          <div className="flex-1 text-xs text-muted-foreground">
                            <div className="flex items-start gap-1">
                              <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                              <span>
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

                      <div className="border border-border/50 rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/30">
                            <tr>
                              <th className="text-left p-2.5 text-xs font-medium text-muted-foreground">Produto</th>
                              <th className="text-center p-2.5 text-xs font-medium text-muted-foreground">Qtd</th>
                              <th className="text-right p-2.5 text-xs font-medium text-muted-foreground">Valor</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, i) => (
                              <tr key={i} className="border-t border-border/30">
                                <td className="p-2.5 text-xs">{item.title}</td>
                                <td className="p-2.5 text-xs text-center">{item.quantity}</td>
                                <td className="p-2.5 text-xs text-right font-medium">R$ {(item.price * item.quantity).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="text-sm space-y-1 bg-muted/20 rounded-xl p-3">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Subtotal</span>
                          <span>R$ {Number(order.subtotal).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Entrega</span>
                          <span>R$ {Number(order.delivery_fee).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-base pt-1 border-t border-border/30">
                          <span>Total</span>
                          <span className="text-primary">R$ {Number(order.total).toFixed(2)}</span>
                        </div>
                      </div>

                      {order.payment_method === 'dinheiro_entrega' && order.needs_change && order.change_for && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-sm text-amber-800 dark:text-amber-300">
                          💵 Troco para: <strong>R$ {Number(order.change_for).toFixed(2)}</strong>
                        </div>
                      )}

                      {order.notes && (
                        <div className="bg-muted/40 rounded-xl p-3 text-sm text-muted-foreground">
                          📝 {order.notes}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 flex-wrap">
                        {action && (
                          <Button
                            onClick={() => updateStatus(order.id, action.next)}
                            className="flex-1 bg-bruna-dark hover:bg-bruna-red text-white rounded-xl shadow-sm hover:shadow-md transition-all"
                            size="sm"
                          >
                            <action.icon className="h-4 w-4 mr-1" />
                            {action.label}
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => openWhatsApp(order)} className="text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEdit(order)} className="rounded-xl">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handlePrint(order)} className="rounded-xl">
                          <Printer className="h-4 w-4" />
                        </Button>
                        {order.order_status === 'received' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                            onClick={() => updateStatus(order.id, 'cancelled')}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
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
  );
};

export default AdminOrders;
