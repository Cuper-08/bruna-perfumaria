import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { X, Mail, Phone } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import brunaLogo from '@/assets/bruna-logo.webp';

interface HeaderMobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HeaderMobileMenu = ({ open, onOpenChange }: HeaderMobileMenuProps) => {
  const { data: categories } = useQuery({
    queryKey: ['header-mobile-categories'],
    queryFn: async () => {
      const { data } = await supabase
        .from('categories')
        .select('name, slug')
        .eq('active', true)
        .order('sort_order', { ascending: true });
      return data ?? [];
    },
  });

  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[88%] sm:w-[400px] p-0 bg-bruna-cream border-r border-border/40">
        <SheetHeader className="px-6 pt-6 pb-4 flex flex-row items-center justify-between space-y-0">
          <SheetTitle asChild>
            <Link to="/" onClick={close} className="flex items-center">
              <img src={brunaLogo} alt="Bruna Perfumaria" className="h-10 w-auto" />
            </Link>
          </SheetTitle>
          <button type="button" onClick={close} aria-label="Fechar menu" className="p-2 -mr-2 rounded-full hover:bg-foreground/5 transition-colors">
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </SheetHeader>

        <div className="px-6 py-2">
          <p className="eyebrow mb-4">Coleções</p>
          <nav className="flex flex-col">
            {categories?.map((c) => (
              <Link
                key={c.slug}
                to={`/categoria/${c.slug}`}
                onClick={close}
                className="font-display text-2xl py-3 text-foreground hover:text-primary transition-colors border-b border-border/40 last:border-b-0"
              >
                {c.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="px-6 py-6 mt-2 border-t border-border/40">
          <p className="eyebrow mb-3">Institucional</p>
          <nav className="flex flex-col gap-2 text-sm text-foreground/70">
            <Link to="/categorias" onClick={close} className="hover:text-foreground">Todas as categorias</Link>
            <Link to="/destaques" onClick={close} className="hover:text-foreground">Em alta</Link>
            <Link to="/privacidade" onClick={close} className="hover:text-foreground">Privacidade</Link>
            <Link to="/termos" onClick={close} className="hover:text-foreground">Termos de Uso</Link>
          </nav>
        </div>

        <div className="px-6 py-6 mt-auto absolute bottom-0 left-0 right-0 border-t border-border/40 bg-bruna-cream/80 backdrop-blur-sm">
          <p className="eyebrow mb-3">Contato</p>
          <div className="flex flex-col gap-2 text-xs text-foreground/70">
            <a href="https://wa.me/5511945778994" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-foreground">
              <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
              (11) 94577-8994
            </a>
            <span className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
              Rua Pastoril de Itapetininga, 541
            </span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default HeaderMobileMenu;
