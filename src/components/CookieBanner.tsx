import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'bruna-cookies-consent';

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: true, ts: Date.now() }));
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: false, ts: Date.now() }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl animate-fade-in">
      <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-4 flex flex-col sm:flex-row items-start gap-3">
        <div className="flex items-center gap-2 sm:items-start sm:gap-3">
          <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30 shrink-0">
            <Cookie className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground mb-1">Usamos cookies essenciais</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Utilizamos apenas cookies necessários para o funcionamento do site (carrinho, sessão e
            preferências). Saiba mais na nossa{' '}
            <Link to="/privacidade" className="underline hover:text-foreground">Política de Privacidade</Link>.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <Button variant="ghost" size="sm" onClick={decline} className="h-8 text-xs rounded-lg">
            Recusar
          </Button>
          <Button size="sm" onClick={accept} className="h-8 text-xs rounded-lg">
            Aceitar
          </Button>
          <button type="button" aria-label="Fechar" onClick={decline} className="p-1 hover:bg-muted rounded-md">
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
