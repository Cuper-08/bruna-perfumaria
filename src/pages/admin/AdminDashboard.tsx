import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ShoppingBag, DollarSign, Clock, Package, TrendingUp, TrendingDown, ArrowUpRight,
  Receipt, Users, ShoppingCart, Crown,
} from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Badge } from '@/components/ui/badge';
import SplitPaymentWidget from '@/components/admin/SplitPaymentWidget';

interface DashboardStats {
  ordersToday: number;
  revenueToday: number;
  splitRevenueToday: number;
  pendingOrders: number;
  totalProducts: number;
  ordersYesterday: number;
  revenueYesterday: number;
  averageTicket: number;
  totalCustomers: number;
}

interface RecentOrder {
  id: string;
  order_number: number;
  customer_name: string;
  total: number;
  order_status: string;
  payment_status: string;
  created_at: string;
}

interface TopProduct {
  title: string;
  quantity: number;
  revenue: number;
}

interface ChartData {
  date: string;
  revenue: number;
  orders: number;
}

type Period = '7' | '30' | '90';

const calcDelta = (today: number, yesterday: number) => {
  if (yesterday === 0) return today > 0 ? 100 : 0;
  return ((today - yesterday) / yesterday) * 100;
};

const AdminDashboard = () => {
  const [period, setPeriod] = useState<Period>('7');
  const [stats, setStats] = useState<DashboardStats>({
    ordersToday: 0, revenueToday: 0, splitRevenueToday: 0, pendingOrders: 0, totalProducts: 0,
    ordersYesterday: 0, revenueYesterday: 0, averageTicket: 0, totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const yesterdayStart = subDays(todayStart, 1);
    const periodDays = parseInt(period);
    const periodStart = subDays(todayStart, periodDays - 1);

    const [todayOrdersRes, yesterdayOrdersRes, pendingRes, productsRes, recentRes, periodOrdersRes, customersRes] = await Promise.all([
      supabase.from('orders').select('total, items').gte('created_at', todayStart.toISOString()),
      supabase.from('orders').select('total').gte('created_at', yesterdayStart.toISOString()).lt('created_at', todayStart.toISOString()),
      supabase.from('orders').select('id', { count: 'exact', head: true }).in('order_status', ['received', 'preparing']),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('active', true),
      supabase.from('orders').select('id, order_number, customer_name, total, order_status, payment_status, created_at').order('created_at', { ascending: false }).limit(8),
      supabase.from('orders').select('created_at, total, items').gte('created_at', periodStart.toISOString()),
      supabase.from('orders').select('customer_phone'),
    ]);

    const todayOrders = todayOrdersRes.data || [];
    const yesterdayOrders = yesterdayOrdersRes.data || [];
    const periodOrders = periodOrdersRes.data || [];
    const customers = customersRes.data || [];

    const totalRevenueToday = todayOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const totalRevenueYesterday = yesterdayOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const periodRevenue = periodOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const averageTicket = periodOrders.length > 0 ? periodRevenue / periodOrders.length : 0;
    const uniqueCustomers = new Set(customers.map(c => c.customer_phone)).size;

    setStats({
      ordersToday: todayOrders.length,
      revenueToday: totalRevenueToday,
      splitRevenueToday: totalRevenueToday * 0.02,
      pendingOrders: pendingRes.count || 0,
      totalProducts: productsRes.count || 0,
      ordersYesterday: yesterdayOrders.length,
      revenueYesterday: totalRevenueYesterday,
      averageTicket,
      totalCustomers: uniqueCustomers,
    });
    setRecentOrders((recentRes.data as RecentOrder[]) || []);

    // Top products from period
    const productMap = new Map<string, TopProduct>();
    periodOrders.forEach(o => {
      const items = (Array.isArray(o.items) ? o.items : []) as Array<{ title: string; quantity: number; price: number }>;
      items.forEach(it => {
        const existing = productMap.get(it.title);
        if (existing) {
          existing.quantity += it.quantity;
          existing.revenue += it.quantity * it.price;
        } else {
          productMap.set(it.title, { title: it.title, quantity: it.quantity, revenue: it.quantity * it.price });
        }
      });
    });
    setTopProducts(Array.from(productMap.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 5));

    // Chart data
    const dataMap = new Map<string, ChartData>();
    for (let i = periodDays - 1; i >= 0; i--) {
      const date = subDays(todayStart, i);
      const formatStr = format(date, 'dd MMM', { locale: ptBR });
      dataMap.set(startOfDay(date).toISOString(), { date: formatStr, revenue: 0, orders: 0 });
    }
    periodOrders.forEach(order => {
      const orderDate = startOfDay(new Date(order.created_at)).toISOString();
      if (dataMap.has(orderDate)) {
        const item = dataMap.get(orderDate)!;
        item.revenue += Number(order.total);
        item.orders += 1;
      }
    });
    setChartData(Array.from(dataMap.values()));
    setLoading(false);
  }, [period]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const revenueDelta = calcDelta(stats.revenueToday, stats.revenueYesterday);
  const ordersDelta = calcDelta(stats.ordersToday, stats.ordersYesterday);

  const cards = [
    {
      label: 'Receita Hoje',
      value: `R$ ${stats.revenueToday.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100/50 dark:bg-emerald-900/20',
      delta: revenueDelta,
    },
    {
      label: 'Pedidos Hoje',
      value: stats.ordersToday.toString(),
      icon: ShoppingBag,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-100/50 dark:bg-indigo-900/20',
      delta: ordersDelta,
    },
    {
      label: 'Ticket Médio',
      value: `R$ ${stats.averageTicket.toFixed(2)}`,
      icon: Receipt,
      color: 'text-bruna-gold',
      bgColor: 'bg-[#D4AF37]/10 dark:bg-[#D4AF37]/20',
      delta: null,
      sub: `últimos ${period}d`,
    },
    {
      label: 'Pendentes',
      value: stats.pendingOrders.toString(),
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-100/50 dark:bg-amber-900/20',
      delta: null,
    },
  ];

  const secondaryCards = [
    { label: 'Clientes únicos', value: stats.totalCustomers, icon: Users },
    { label: 'Produtos ativos', value: stats.totalProducts, icon: Package },
    { label: 'Lucro split (2%)', value: `R$ ${stats.splitRevenueToday.toFixed(2)}`, icon: ArrowUpRight },
  ];

  const statusConfig: Record<string, { label: string, color: string }> = {
    received: { label: 'Novo', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
    preparing: { label: 'Preparando', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    out_for_delivery: { label: 'Em Entrega', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
    delivered: { label: 'Entregue', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    cancelled: { label: 'Cancelado', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-bruna-dark dark:text-bruna-cream">Dashboard</h2>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Resumo das suas vendas em tempo real</p>
        </div>
        <div className="flex items-center gap-1 bg-muted/40 rounded-xl p-1 self-start">
          {(['7', '30', '90'] as Period[]).map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === p ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p}d
            </button>
          ))}
        </div>
      </div>

      {/* Primary metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {cards.map((c, i) => (
          <Card key={c.label} className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300 bg-card overflow-hidden relative group rounded-2xl" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <c.icon className="w-12 h-12 transform translate-x-2 -translate-y-2" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-1.5 space-y-0 px-4 pt-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">{c.label}</CardTitle>
              <div className={`p-1.5 rounded-lg ${c.bgColor}`}>
                <c.icon className={`h-3.5 w-3.5 ${c.color}`} />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xl md:text-2xl font-bold font-sans tracking-tight">{c.value}</div>
              {c.delta !== null && c.delta !== undefined ? (
                <p className={`text-[11px] mt-1 flex items-center font-medium ${c.delta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                  {c.delta >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {c.delta >= 0 ? '+' : ''}{c.delta.toFixed(1)}% vs ontem
                </p>
              ) : c.sub ? (
                <p className="text-[11px] text-muted-foreground mt-1">{c.sub}</p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-3 gap-3">
        {secondaryCards.map((c) => (
          <Card key={c.label} className="border-border/30 bg-card/50 rounded-xl">
            <CardContent className="p-3 flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-muted/60">
                <c.icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold truncate">{c.label}</p>
                <p className="text-base font-bold font-display">{c.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="col-span-1 lg:col-span-2 border-border/50 shadow-sm bg-card rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-display">Receita dos últimos {period} dias</CardTitle>
          </CardHeader>
          <CardContent className="px-0 sm:px-4">
            <div className="h-[260px] w-full">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
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
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(val) => `R$${val}`} dx={-6} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                      formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']}
                      labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm bg-card rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-display flex items-center gap-2"><Crown className="h-4 w-4 text-amber-500" /> Top Produtos</CardTitle>
            <Badge variant="secondary" className="text-[10px]">{period}d</Badge>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 bg-muted animate-pulse rounded-lg" />)}
              </div>
            ) : topProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <ShoppingCart className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-muted-foreground text-xs">Sem vendas no período.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {topProducts.map((p, i) => (
                  <div key={p.title} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/40 transition-colors">
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${
                      i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-zinc-100 text-zinc-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-muted text-muted-foreground'
                    }`}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{p.title}</p>
                      <p className="text-[10px] text-muted-foreground">{p.quantity} un · R$ {p.revenue.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      <Card className="border-border/50 shadow-sm bg-card rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-display">Últimos Pedidos</CardTitle>
          <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1" asChild>
            <a href="/admin/pedidos">Ver todos <ArrowUpRight className="h-3 w-3" /></a>
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Package className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">Nenhum pedido recente.</p>
            </div>
          ) : (
            <div className="grid gap-2 md:grid-cols-2">
              {(loading ? Array(6).fill(0) : recentOrders).map((order, i) => (
                loading ? (
                  <div key={`skel-${i}`} className="h-12 bg-muted animate-pulse rounded-lg" />
                ) : (
                  <div key={order.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/40 transition-colors border border-border/30">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-sm">#{order.order_number}</span>
                      <span className="text-muted-foreground text-[11px] truncate max-w-[160px]">{order.customer_name}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-medium">R$ {Number(order.total).toFixed(2)}</span>
                      <Badge variant="secondary" className={`px-1.5 py-0 text-[9px] uppercase tracking-wider font-bold border-none ${statusConfig[order.order_status]?.color || 'bg-muted'}`}>
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

      <SplitPaymentWidget
        totalRevenue={stats.revenueToday}
        splitPercentage={2}
        recentTransactionsCount={stats.ordersToday}
      />
    </div>
  );
};

export default AdminDashboard;
