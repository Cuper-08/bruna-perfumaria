import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Instagram } from 'lucide-react';
import brunaLogo from '@/assets/bruna-logo.webp';
import { useStoreCustomization } from '@/hooks/useStoreCustomization';

const Footer = () => {
  const { data: customization } = useStoreCustomization();

  const address = customization?.footer_address || 'Rua Pastoril de Itapetininga, 541, Jardim Danfer, São Paulo — SP';
  const phone = customization?.footer_phone || '(11) 94577-8994';
  const hours = customization?.footer_hours || {
    weekdays: 'Segunda a Sexta: 9h às 19h',
    saturday: 'Sábado: 9h às 14h',
    sunday: 'Domingo: Fechado',
  };

  return (
    <footer className="bg-bruna-dark text-bruna-cream/75 mt-auto">
      <div className="container mx-auto px-4 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12">
          {/* Brand column */}
          <div className="md:col-span-4">
            <img src={brunaLogo} alt="Bruna Perfumaria" className="h-12 w-auto mb-6 opacity-95" />
            <p className="text-sm leading-relaxed text-bruna-cream/50 max-w-xs">
              Perfumaria curada com carinho. Beleza, fragrância e cuidado entregues no mesmo dia em São Paulo.
            </p>
            <a
              href="https://instagram.com/brunaperfumaria"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex items-center gap-2 mt-6 text-xs uppercase tracking-[0.2em] text-bruna-cream/60 hover:text-bruna-cream transition-colors"
            >
              <Instagram className="h-4 w-4" strokeWidth={1.5} />
              @brunaperfumaria
            </a>
          </div>

          {/* Explorar */}
          <div className="md:col-span-2">
            <h4 className="eyebrow mb-5 text-accent/80">Explorar</h4>
            <ul className="space-y-2.5 text-sm text-bruna-cream/60">
              <li><Link to="/" className="hover:text-bruna-cream transition-colors">Início</Link></li>
              <li><Link to="/categorias" className="hover:text-bruna-cream transition-colors">Categorias</Link></li>
              <li><Link to="/destaques" className="hover:text-bruna-cream transition-colors">Em alta</Link></li>
              <li><Link to="/busca" className="hover:text-bruna-cream transition-colors">Buscar</Link></li>
            </ul>
          </div>

          {/* Contato */}
          <div className="md:col-span-3">
            <h4 className="eyebrow mb-5 text-accent/80">Contato</h4>
            <ul className="space-y-3 text-sm text-bruna-cream/60">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-accent/60" strokeWidth={1.5} />
                <span className="leading-relaxed">{address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-accent/60" strokeWidth={1.5} />
                <a href={`tel:+55${phone.replace(/\D/g, '')}`} className="hover:text-bruna-cream transition-colors">{phone}</a>
              </li>
            </ul>
          </div>

          {/* Horários */}
          <div className="md:col-span-3">
            <h4 className="eyebrow mb-5 text-accent/80">Horários</h4>
            <ul className="space-y-2 text-sm text-bruna-cream/60">
              <li className="flex items-start gap-2.5">
                <Clock className="h-4 w-4 mt-0.5 shrink-0 text-accent/60" strokeWidth={1.5} />
                <div className="space-y-1">
                  <p>{hours.weekdays}</p>
                  <p>{hours.saturday}</p>
                  <p>{hours.sunday}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="premium-divider mt-14 mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-bruna-cream/35">
          <div className="flex items-center gap-3 uppercase tracking-[0.25em]">
            <Link to="/privacidade" className="hover:text-bruna-cream/70 transition-colors">Privacidade</Link>
            <span className="text-bruna-cream/20">·</span>
            <Link to="/termos" className="hover:text-bruna-cream/70 transition-colors">Termos</Link>
          </div>
          <p className="uppercase tracking-[0.25em] text-center md:text-right">
            © {new Date().getFullYear()} Bruna Perfumaria · CNPJ 10.474.012/0001-01
          </p>
        </div>

        <a
          href="https://www.hsbmarketing.com.br/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex items-center justify-center gap-2 opacity-50 hover:opacity-100 transition-opacity duration-300"
          aria-label="Desenvolvido por HSB Marketing"
        >
          <span className="text-[10px] tracking-[0.25em] uppercase text-bruna-cream/40">Desenvolvido por</span>
          <svg width="22" height="22" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="50" cy="50" r="46" stroke="#3B82F6" strokeWidth="4" fill="none" />
            <line x1="20" y1="32" x2="20" y2="68" stroke="#3B82F6" strokeWidth="5" strokeLinecap="round" />
            <line x1="20" y1="50" x2="34" y2="50" stroke="#3B82F6" strokeWidth="5" strokeLinecap="round" />
            <line x1="34" y1="32" x2="34" y2="68" stroke="#3B82F6" strokeWidth="5" strokeLinecap="round" />
            <path d="M44 40 Q44 32 52 32 Q60 32 60 40 Q60 50 52 50 Q44 50 44 60 Q44 68 52 68 Q60 68 60 60" stroke="#3B82F6" strokeWidth="5" strokeLinecap="round" fill="none" />
            <line x1="68" y1="32" x2="68" y2="68" stroke="#3B82F6" strokeWidth="5" strokeLinecap="round" />
            <path d="M68 32 Q82 32 82 41 Q82 50 68 50" stroke="#3B82F6" strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M68 50 Q84 50 84 59 Q84 68 68 68" stroke="#3B82F6" strokeWidth="5" strokeLinecap="round" fill="none" />
          </svg>
          <span className="text-[11px] font-semibold tracking-wide text-bruna-cream/60">HSB Marketing</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
