import { MapPin, Phone, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-foreground text-background/90 mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-display italic text-2xl font-semibold text-primary-foreground mb-3">
              Bruna <span className="text-bruna-gold">Perfumaria</span>
            </h3>
            <p className="text-sm text-background/60">
              Os melhores produtos de beleza, perfumes e cosméticos com entrega rápida na sua porta.
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-background/80">Contato</h4>
            <div className="flex items-start gap-2 text-sm text-background/60">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Av. Olavo Egídio, 1570 — Tucuruvi, São Paulo - SP</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-background/60">
              <Phone className="h-4 w-4 shrink-0" />
              <span>(11) 94577-8994</span>
            </div>
          </div>

          {/* Hours */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-background/80">Horários</h4>
            <div className="flex items-start gap-2 text-sm text-background/60">
              <Clock className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p>Segunda a Sexta: 8h às 20h</p>
                <p>Sábado: 8h às 18h</p>
                <p>Domingo: Fechado</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-6 text-center text-xs text-background/40">
          © {new Date().getFullYear()} Bruna Perfumaria. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
