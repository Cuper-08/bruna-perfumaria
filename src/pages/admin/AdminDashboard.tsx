import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, DollarSign, Clock, Package, TrendingUp, ArrowUpRight } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Badge } from '@/components/ui/badge';

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

interface ChartData {
  date: string;
  revenue: number;
  orders: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({ ordersToday: 0, revenueToday: 0, pendingOrders: 0, totalProducts: 0 });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const sevenDaysAgo = subDays(todayStart, 6);

      const [ordersRes, pendingRes, productsRes, recentRes, weekOrdersRes] = await Promise.all([
        supabase.from('orders').select('total').gte('created_at', todayStart.toISOString()),
        supabase.from('orders').select('id', { count: 'exact' }).in('order_status', ['received', 'preparing']),
        supabase.from('products').select('id', { count: 'exact' }).eq('active', true),
        supabase.from('orders').select('id, order_number, customer_name, total, order_status, created_at').order('created_at', { ascending: false }).limit(6),
        supabase.from('orders').select('created_at, total').gte('created_at', sevenDaysAgo.toISOString()),
      ]);

      const orders = ordersRes.data || [];
      setStats({
        ordersToday: orders.length,
        revenueToday: orders.reduce((sum, o) => sum + Number(o.total), 0),
        pendingOrders: pendingRes.count || 0,
        totalProducts: productsRes.count || 0,
      });
      setRecentOrders((recentRes.data as RecentOrder[]) || []);

      // Calculate chart data
      const weekOrders = weekOrdersRes.data || [];
      const dataMap = new Map<string, ChartData>();
      
      // Initialize 7 days
      for (let i = 6; i >= 0; i--) {
        const date = subDays(todayStart, i);
        const formatStr = format(date, 'dd MMM', { locale: ptBR });
        dataMap.set(startOfDay(date).toISOString(), { date: formatStr, revenue: 0, orders: 0 });
      }

      weekOrders.forEach(order => {
        const orderDate = startOfDay(new Date(order.created_at)).toISOString();
        if (dataMap.has(orderDate)) {
          const item = dataMap.get(orderDate)!;
          item.revenue += Number(order.total);
          item.orders += 1;
        }
      });

      setChartData(Array.from(dataMap.values()));
      setLoading(false);
    };

    fetchStats();
  }, []);

  const cards = [
    { label: 'Receita Hoje', value: `R$ ${stats.revenueToday.toFixed(2)}`, icon: DollarSign, 
      color: 'text-emerald-600', bgColor: 'bg-emerald-100/50 dark:bg-emerald-900/20', trend: '+12%' },
    { label: 'Pedidos Hoje', value: stats.ordersToday, icon: ShoppingBag, 
      color: 'text-bruna-gold', bgColor: 'bg-[#D4AF37]/10 dark:bg-[#D4AF37]/20', trend: '+4%' },
    { label: 'Pendentes', value: stats.pendingOrders, icon: Clock, 
      color: 'text-amber-500', bgColor: 'bg-amber-100/50 dark:bg-amber-900/20' },
    { label: 'Produtos Ativos', value: stats.totalProducts, icon: Package, 
      color: 'text-indigo-500', bgColor: 'bg-indigo-100/50 dark:bg-indigo-900/20' },
  ];

  const statusConfig: Record<string, { label: string, color: string }> = {
    received: { label: 'Novo', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
    preparing: { label: 'Preparando', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    out_for_delivery: { label: 'Em Entrega', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
    delivered: { label: 'Entregue', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    cancelled: { label: 'Cancelado', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
  };

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <div>
        <h2 className="text-3xl font-display font-bold tracking-tight text-bruna-dark dark:text-bruna-cream">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Bem-vindo de volta! Aqui está o resumo das suas vendas.</p>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {cards.map((c, i) => (
          <Card key={c.label} className={`border-border/40 shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-sm bg-background/95 overflow-hidden relative group`} style={{ animationDelay: `${i * 100}ms` }}>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <c.icon className="w-16 h-16 transform translate-x-4 -translate-y-4" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <div className={`p-2 rounded-xl transition-colors ${c.bgColor}`}>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-sans tracking-tight">{c.value}</div>
              {c.trend && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {c.trend} desde ontem
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 border-border/40 shadow-sm backdrop-blur-sm bg-background/95">
          <CardHeader>
            <CardTitle className="text-lg font-display">Receita dos últimos 7 dias</CardTitle>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            <div className="h-[300px] w-full">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="animate-pulse flex space-x-2">
                    {[1, 2, 3, 4, 5, 6, 7].map(i => (
                      <div key={i} className="w-12 bg-muted rounded-t-md" style={{ height: `${Math.random() * 80 + 20}%`, alignSelf: 'flex-end' }}></div>
                    ))}
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(val) => `R$${val}`} dx={-10} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']}
                      labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-border/40 shadow-sm backdrop-blur-sm bg-background/95 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-display">Últimos Pedidos</CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><ArrowUpRight className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {recentOrders.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                <Package className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">Nenhum pedido recente.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(loading ? Array(5).fill(0) : recentOrders).map((order, i) => (
                  loading ? (
                    <div key={`skel-${i}`} className="flex items-center justify-between py-1">
                      <div className="space-y-2">
                        <div className="h-4 w-12 bg-muted animate-pulse rounded"></div>
                        <div className="h-3 w-24 bg-muted animate-pulse rounded"></div>
                      </div>
                      <div className="h-6 w-16 bg-muted animate-pulse rounded-full"></div>
                    </div>
                  ) : (
                    <div key={order.id} className="flex items-center justify-between group cursor-pointer rounded-lg p-2 -mx-2 hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-sm group-hover:text-bruna-gold transition-colors">#{order.order_number}</span>
                        <span className="text-muted-foreground text-xs">{order.customer_name}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-sm font-medium">R$ {Number(order.total).toFixed(2)}</span>
                        <Badge variant="secondary" className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold border-none ${statusConfig[order.order_status]?.color || 'bg-muted'}`}>
                          {statusConfig[order.order_status]?.label || order.order_status}
                        </Badge>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
