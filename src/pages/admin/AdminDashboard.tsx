import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, DollarSign, Clock, Package } from 'lucide-react';
import { format } from 'date-fns';

interface DashboardStats {
  ordersToday: number;
  revenueToday: number;
  pendingOrders: number;
  totalProducts: number;
}

interface RecentOrder {
  id: string;
  order_number: number;
  customer_name: string;
  total: number;
  order_status: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({ ordersToday: 0, revenueToday: 0, pendingOrders: 0, totalProducts: 0 });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [ordersRes, pendingRes, productsRes, recentRes] = await Promise.all([
        supabase.from('orders').select('total').gte('created_at', todayStart.toISOString()),
        supabase.from('orders').select('id', { count: 'exact' }).in('order_status', ['received', 'preparing']),
        supabase.from('products').select('id', { count: 'exact' }).eq('active', true),
        supabase.from('orders').select('id, order_number, customer_name, total, order_status, created_at').order('created_at', { ascending: false }).limit(5),
      ]);

      const orders = ordersRes.data || [];
      setStats({
        ordersToday: orders.length,
        revenueToday: orders.reduce((sum, o) => sum + Number(o.total), 0),
        pendingOrders: pendingRes.count || 0,
        totalProducts: productsRes.count || 0,
      });
      setRecentOrders((recentRes.data as RecentOrder[]) || []);
    };

    fetchStats();
  }, []);

  const cards = [
    { label: 'Pedidos Hoje', value: stats.ordersToday, icon: ShoppingBag, color: 'text-primary' },
    { label: 'Receita Hoje', value: `R$ ${stats.revenueToday.toFixed(2)}`, icon: DollarSign, color: 'text-green-600' },
    { label: 'Pendentes', value: stats.pendingOrders, icon: Clock, color: 'text-amber-500' },
    { label: 'Produtos Ativos', value: stats.totalProducts, icon: Package, color: 'text-blue-500' },
  ];

  const statusLabels: Record<string, string> = {
    received: 'Novo',
    preparing: 'Preparando',
    out_for_delivery: 'Em Entrega',
    delivered: 'Entregue',
    cancelled: 'Cancelado',
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-sans">Dashboard</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Últimos Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum pedido ainda.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <span className="font-semibold text-sm">#{order.order_number}</span>
                    <span className="text-muted-foreground text-sm ml-2">{order.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      {statusLabels[order.order_status] || order.order_status}
                    </span>
                    <span className="text-sm font-medium">R$ {Number(order.total).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
