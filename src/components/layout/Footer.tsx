import { MapPin, Phone, Clock } from 'lucide-react';
import brunaLogo from '@/assets/bruna-logo.png';

const Footer = () => {
  return (
    <footer className="bg-bruna-dark text-white/80 mt-auto pb-20 md:pb-0">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="flex flex-col items-start gap-4">
            <img
              src={brunaLogo}
              alt="Bruna Perfumaria"
              className="h-10 w-auto object-contain brightness-0 invert opacity-80"
            />
            <p className="text-sm text-white/40 leading-relaxed">
              Os melhores produtos de beleza, perfumes e cosméticos com entrega rápida.
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[10px] uppercase tracking-[0.2em] text-accent/60">Contato</h4>
            <div className="flex items-start gap-2.5 text-sm text-white/50">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-accent/50" strokeWidth={1.5} />
              <span>Av. Olavo Egídio, 1570 — Tucuruvi, São Paulo - SP</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-white/50">
              <Phone className="h-4 w-4 shrink-0 text-accent/50" strokeWidth={1.5} />
              <span>(11) 94577-8994</span>
            </div>
          </div>

          {/* Hours */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[10px] uppercase tracking-[0.2em] text-accent/60">Horários</h4>
            <div className="flex items-start gap-2.5 text-sm text-white/50">
              <Clock className="h-4 w-4 mt-0.5 shrink-0 text-accent/50" strokeWidth={1.5} />
              <div>
                <p>Segunda a Sexta: 8h às 20h</p>
                <p>Sábado: 8h às 18h</p>
                <p>Domingo: Fechado</p>
              </div>
            </div>
          </div>
        </div>

        <div className="premium-divider mt-8 mb-6" />

        <p className="text-center text-[10px] text-white/25 tracking-widest uppercase">
          © {new Date().getFullYear()} Bruna Perfumaria. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
