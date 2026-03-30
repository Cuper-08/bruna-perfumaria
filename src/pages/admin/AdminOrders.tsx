import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, MapPin, Printer, ChefHat, Truck, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import OrderReceiptPrint from '@/components/admin/OrderReceiptPrint';
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
  received: 'bg-blue-100 text-blue-700',
  preparing: 'bg-amber-100 text-amber-700',
  out_for_delivery: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const paymentLabels: Record<string, string> = {
  pix: 'PIX',
  cartao_online: 'Cartão Online',
  dinheiro_entrega: 'Dinheiro na Entrega',
  cartao_entrega: 'Cartão na Entrega',
};

const paymentStatusBadge = (status: string) => {
  if (status === 'paid') return <Badge className="bg-green-500 text-white hover:bg-green-600">PAGO</Badge>;
  if (status === 'delivery_payment') return <Badge className="bg-amber-500 text-white hover:bg-amber-600">PGTO NA ENTREGA</Badge>;
  if (status === 'failed') return <Badge variant="destructive">FALHOU</Badge>;
  return <Badge className="bg-red-500 text-white hover:bg-red-600">PENDENTE</Badge>;
};

const nextStatus: Record<string, { label: string; next: string; icon: React.ElementType }> = {
  received: { label: 'Aceitar Pedido', next: 'preparing', icon: ChefHat },
  preparing: { label: 'Saiu para Entrega', next: 'out_for_delivery', icon: Truck },
  out_for_delivery: { label: 'Marcar Entregue', next: 'delivered', icon: CheckCircle },
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
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
        // Play notification sound
        try {
          audioRef.current?.play();
        } catch {}
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
    setTimeout(() => window.print(), 200);
  };

  const filtered = activeTab === 'all' ? orders : orders.filter((o) => o.order_status === activeTab);

  return (
    <div className="space-y-4">
      {/* Notification sound - short beep data URI */}
      <audio ref={audioRef} preload="auto" src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgipuzq49hO0FZcYyltaV2TDQ+WXOKnquggGhNQlRtgpOfoJuJdmZbX2t7ipWYlY+IgX15dn2DhoeHhYF8d3V1d3t/g4WFg4B8eXh4eXt9f4GCgoF/fXx7e3x9fn+AgIB/fn19fX1+fn9/f39/fn5+fn5+fn5/f39/f39/fn5+fn5+fn5/f39/f39/fn5+fn5+fn9/f39/f39+fn5+fn5+f39/f39/f35+fn5+fn5/f39/f39/fn5+fn5+fn9/f39/f39+fn5+fn5+f39/f39/f35+fn5+fn5/f39/f39+fn5+fn5+fn9/f39/f39+fn4=" />

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-sans">Pedidos</h2>
        <span className="text-sm text-muted-foreground">{orders.length} pedidos</span>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex overflow-x-auto">
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-1 text-xs">
              <tab.icon className="h-3 w-3" />
              {tab.label}
              {tab.value !== 'all' && (
                <span className="ml-1 text-[10px] bg-muted rounded-full px-1.5">
                  {orders.filter((o) => o.order_status === tab.value).length}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Nenhum pedido nesta categoria.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filtered.map((order) => {
                const items = (Array.isArray(order.items) ? order.items : []) as unknown as OrderItem[];
                const addr = (order.address || {}) as unknown as OrderAddress;
                const action = nextStatus[order.order_status];

                return (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader className="pb-3 flex flex-row items-start justify-between gap-2 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-bold">#{order.order_number}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.order_status]}`}>
                            {statusLabels[order.order_status]}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(order.created_at!), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {paymentStatusBadge(order.payment_status)}
                        <Badge variant="outline" className="text-xs">{paymentLabels[order.payment_method]}</Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3 pt-0">
                      {/* Customer */}
                      <div className="flex items-start gap-3 text-sm">
                        <div className="flex-1">
                          <p className="font-semibold">{order.customer_name}</p>
                          <a href={`tel:${order.customer_phone}`} className="text-primary flex items-center gap-1 text-xs">
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

                      {/* Items */}
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left p-2 text-xs font-medium">Produto</th>
                              <th className="text-center p-2 text-xs font-medium">Qtd</th>
                              <th className="text-right p-2 text-xs font-medium">Valor</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, i) => (
                              <tr key={i} className="border-t">
                                <td className="p-2 text-xs">{item.title}</td>
                                <td className="p-2 text-xs text-center">{item.quantity}</td>
                                <td className="p-2 text-xs text-right">R$ {(item.price * item.quantity).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Totals */}
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Subtotal</span>
                          <span>R$ {Number(order.subtotal).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Entrega</span>
                          <span>R$ {Number(order.delivery_fee).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-base">
                          <span>Total</span>
                          <span>R$ {Number(order.total).toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Change info */}
                      {order.payment_method === 'dinheiro_entrega' && order.needs_change && order.change_for && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-sm text-amber-800">
                          💵 Troco para: <strong>R$ {Number(order.change_for).toFixed(2)}</strong>
                        </div>
                      )}

                      {/* Notes */}
                      {order.notes && (
                        <div className="bg-muted rounded-lg p-2 text-sm text-muted-foreground">
                          📝 {order.notes}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        {action && (
                          <Button
                            onClick={() => updateStatus(order.id, action.next)}
                            className="flex-1"
                            size="sm"
                          >
                            <action.icon className="h-4 w-4 mr-1" />
                            {action.label}
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handlePrint(order)}>
                          <Printer className="h-4 w-4" />
                        </Button>
                        {order.order_status === 'received' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
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
    </div>
  );
};

export default AdminOrders;
