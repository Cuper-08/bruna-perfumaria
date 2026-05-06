import { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const STORAGE_KEY = 'bruna-pwa-prompt';
const DAYS_TO_REPROMPT = 14;

const PWAInstallPrompt = () => {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Already installed?
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Already dismissed recently?
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { dismissedAt } = JSON.parse(raw);
        if (dismissedAt && Date.now() - dismissedAt < DAYS_TO_REPROMPT * 24 * 60 * 60 * 1000) return;
      }
    } catch {}

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setTimeout(() => setVisible(true), 3000);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
      setDeferred(null);
    }
  };

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ dismissedAt: Date.now() }));
    setVisible(false);
  };

  if (!visible || !deferred) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-md animate-fade-in">
      <div className="bg-gradient-to-br from-primary via-primary to-bruna-dark text-primary-foreground rounded-2xl shadow-2xl shadow-primary/30 p-4 flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-sm shrink-0">
          <Smartphone className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-sm">Instale o app</p>
          <p className="text-xs text-primary-foreground/80 leading-tight mt-0.5">
            Acesso rápido na tela inicial. Sem app store.
          </p>
        </div>
        <Button onClick={install} size="sm" className="h-8 rounded-lg gap-1 bg-accent text-bruna-dark hover:bg-accent/90 shrink-0">
          <Download className="h-3.5 w-3.5" />
          Instalar
        </Button>
        <button type="button" aria-label="Fechar" onClick={dismiss} className="p-1.5 rounded-lg hover:bg-white/10 shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
