import { Truck, CreditCard, BadgeCheck, RefreshCw } from 'lucide-react';

const items = [
  { icon: Truck, label: 'Frete grátis', desc: 'Acima de R$ 50,00' },
  { icon: CreditCard, label: 'Parcele em 6x', desc: 'Sem juros no cartão' },
  { icon: BadgeCheck, label: 'Produtos originais', desc: '100% autênticos' },
  { icon: RefreshCw, label: 'Troca facilitada', desc: 'Até 7 dias úteis' },
];

const TrustBanner = () => {
  return (
    <section className="py-16 md:py-20 bg-bruna-cream border-y border-border/40">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {items.map((i, idx) => (
            <div
              key={i.label}
              className="flex flex-col items-center text-center gap-3 animate-slide-up"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <i.icon className="h-7 w-7 text-accent" strokeWidth={1.25} />
              <div>
                <p className="font-display text-base md:text-lg font-semibold text-foreground">{i.label}</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">{i.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBanner;
