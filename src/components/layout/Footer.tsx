import { MapPin, Phone, Clock } from 'lucide-react';
import brunaLogo from '@/assets/bruna-logo.png';
import { useStoreCustomization } from '@/hooks/useStoreCustomization';

const Footer = () => {
  const { data: customization } = useStoreCustomization();

  const address = customization?.footer_address || 'Av. Olavo Egídio, 1570 - Tucuruvi, São Paulo - SP';
  const phone = customization?.footer_phone || '(11) 94577-8994';
  const hours = customization?.footer_hours || { weekdays: 'Segunda a Sexta: 8h às 20h', saturday: 'Sábado: 8h às 18h', sunday: 'Domingo: Fechado' };

  return (
    <footer className="bg-bruna-dark text-white/80 mt-auto pb-20 md:pb-0">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-start gap-4">
            <img src={brunaLogo} alt="Bruna Perfumaria" className="h-14 md:h-16 w-auto object-contain opacity-90" />
            <p className="text-sm text-white/40 leading-relaxed">
              Os melhores produtos de beleza, perfumes e cosméticos com entrega rápida.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-[10px] uppercase tracking-[0.2em] text-accent/60">Contato</h4>
            <div className="flex items-start gap-2.5 text-sm text-white/50">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-accent/50" strokeWidth={1.5} />
              <span>{address}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-white/50">
              <Phone className="h-4 w-4 shrink-0 text-accent/50" strokeWidth={1.5} />
              <span>{phone}</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-[10px] uppercase tracking-[0.2em] text-accent/60">Horários</h4>
            <div className="flex items-start gap-2.5 text-sm text-white/50">
              <Clock className="h-4 w-4 mt-0.5 shrink-0 text-accent/50" strokeWidth={1.5} />
              <div>
                <p>{hours.weekdays}</p>
                <p>{hours.saturday}</p>
                <p>{hours.sunday}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="premium-divider mt-8 mb-6" />

        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-[10px] text-white/25 tracking-widest uppercase">
            © {new Date().getFullYear()} Bruna Perfumaria. Todos os direitos reservados.
          </p>
          <a
            href="https://www.hsbmarketing.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-300 group"
            aria-label="Desenvolvido por HSB Marketing"
          >
            <span className="text-[10px] tracking-widest uppercase text-white/30 group-hover:text-white/50 transition-colors">
              Desenvolvido por
            </span>
            <svg
              width="28"
              height="28"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="group-hover:drop-shadow-[0_0_6px_rgba(59,130,246,0.6)] transition-all duration-300"
              aria-hidden="true"
            >
              <circle cx="50" cy="50" r="46" stroke="#3B82F6" strokeWidth="4" fill="none" />
              <line x1="20" y1="32" x2="20" y2="68" stroke="#3B82F6" strokeWidth="5" strokeLinecap="round" />
              <line x1="20" y1="50" x2="34" y2="50" stroke="#3B82F6" strokeWidth="5" strokeLinecap="round" />
              <line x1="34" y1="32" x2="34" y2="68" stroke="#3B82F6" strokeWidth="5" strokeLinecap="round" />
              <path d="M44 40 Q44 32 52 32 Q60 32 60 40 Q60 50 52 50 Q44 50 44 60 Q44 68 52 68 Q60 68 60 60" stroke="#3B82F6" strokeWidth="5" strokeLinecap="round" fill="none" />
              <line x1="68" y1="32" x2="68" y2="68" stroke="#3B82F6" strokeWidth="5" strokeLinecap="round" />
              <path d="M68 32 Q82 32 82 41 Q82 50 68 50" stroke="#3B82F6" strokeWidth="5" strokeLinecap="round" fill="none" />
              <path d="M68 50 Q84 50 84 59 Q84 68 68 68" stroke="#3B82F6" strokeWidth="5" strokeLinecap="round" fill="none" />
            </svg>
            <span className="text-[11px] font-semibold tracking-wide text-white/40 group-hover:text-[hsl(214,84%,65%)] transition-colors">
              HSB Marketing
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
