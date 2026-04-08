import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, DollarSign, Wallet, Percent } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';

interface SplitPaymentWidgetProps {
  totalRevenue: number;
  splitPercentage: number;
  recentTransactionsCount: number;
}

const SplitPaymentWidget = ({ totalRevenue, splitPercentage, recentTransactionsCount }: SplitPaymentWidgetProps) => {
  const splitAmount = totalRevenue * (splitPercentage / 100);
  
  // Fake historical data for the chart showing split growth
  const data = [
    { name: 'Seg', split: splitAmount * 0.4 },
    { name: 'Ter', split: splitAmount * 0.7 },
    { name: 'Qua', split: splitAmount * 0.5 },
    { name: 'Qui', split: splitAmount * 0.8 },
    { name: 'Sex', split: splitAmount * 0.9 },
    { name: 'Sáb', split: splitAmount * 1.1 },
    { name: 'Dom', split: splitAmount },
  ];

  return (
    <Card className="border-border/50 shadow-md bg-card rounded-2xl overflow-hidden relative group">
      {/* Subtle gold gradient background effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      
      <CardHeader className="relative z-10 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#D4AF37]/10 rounded-xl">
              <Wallet className="h-5 w-5 text-bruna-gold" />
            </div>
            <div>
              <CardTitle className="text-lg font-display">Hub de Pagamentos</CardTitle>
              <CardDescription>Repasse Asaas & Split</CardDescription>
            </div>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-none px-3 font-semibold">
            Ativo
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10 space-y-6 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" />
              Volume Bruto (GMV)
            </p>
            <p className="text-2xl font-bold font-sans tracking-tight">R$ {totalRevenue.toFixed(2)}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Percent className="h-3.5 w-3.5" />
              Seu Repasse ({splitPercentage}%)
            </p>
            <p className="text-2xl font-bold font-sans tracking-tight text-bruna-gold flex items-center gap-2">
               R$ {splitAmount.toFixed(2)}
               <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            </p>
          </div>
        </div>

        <div className="h-[120px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="splitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Seu Lucro']}
                labelStyle={{ display: 'none' }}
              />
              <Area type="monotone" dataKey="split" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#splitGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
          <span>{recentTransactionsCount} transações aprovadas hoje</span>
          <a href="#" className="flex items-center gap-1 text-bruna-gold font-medium hover:underline">
            Ver extrato
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

export default SplitPaymentWidget;
