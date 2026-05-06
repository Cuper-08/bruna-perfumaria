import { Truck, CreditCard, BadgeCheck, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const items = [
  { icon: Truck, label: 'Frete Grátis', desc: 'Acima de R$ 50,00' },
  { icon: CreditCard, label: 'Parcele em 3x', desc: 'Sem juros' },
  { icon: BadgeCheck, label: 'Originais', desc: '100% autênticos' },
  { icon: RefreshCw, label: 'Troca Fácil', desc: 'Até 7 dias' },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const TrustBanner = () => {
  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <div className="premium-divider mb-6" />
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
        >
          {items.map(i => (
            <motion.div key={i.label} variants={item} className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <i.icon className="h-4 w-4 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground/80 tracking-wide">{i.label}</p>
                <p className="text-[10px] text-muted-foreground">{i.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
        <div className="premium-divider mt-6" />
      </div>
    </section>
  );
};

export default TrustBanner;
