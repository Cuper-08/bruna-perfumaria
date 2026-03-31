import { Truck, CreditCard, BadgeCheck, RefreshCw } from 'lucide-react';

const items = [
  { icon: Truck, label: 'Frete Grátis', desc: 'Acima de R$199' },
  { icon: CreditCard, label: 'Parcele em 3x', desc: 'Sem juros' },
  { icon: BadgeCheck, label: 'Originais', desc: '100% autênticos' },
  { icon: RefreshCw, label: 'Troca Fácil', desc: 'Até 7 dias' },
];

const TrustBanner = () => {
  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <div className="premium-divider mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map(item => (
            <div key={item.label} className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <item.icon className="h-4 w-4 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground/80 tracking-wide">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="premium-divider mt-6" />
      </div>
    </section>
  );
};

export default TrustBanner;
