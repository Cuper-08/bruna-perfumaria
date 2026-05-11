import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { useProductSearch } from '@/hooks/useProductSearch';
import { optimizedImage } from '@/lib/image';

interface HeaderSearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const RECENT_KEY = 'bruna-recent-searches';

const HeaderSearchOverlay = ({ open, onClose }: HeaderSearchOverlayProps) => {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [recent, setRecent] = useState<string[]>([]);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      try {
        const raw = localStorage.getItem(RECENT_KEY);
        if (raw) setRecent(JSON.parse(raw));
      } catch { /* noop */ }
    } else {
      setQuery('');
      setDebounced('');
    }
  }, [open]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  const { data: results, isLoading } = useProductSearch(debounced);

  const persistRecent = useCallback((q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 2) return;
    const next = [trimmed, ...recent.filter((r) => r !== trimmed)].slice(0, 5);
    setRecent(next);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* noop */ }
  }, [recent]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    persistRecent(trimmed);
    onClose();
    navigate(`/busca?q=${encodeURIComponent(trimmed)}`);
  };

  const selectProduct = (slug: string) => {
    persistRecent(query);
    onClose();
    navigate(`/produto/${slug}`);
  };

  // Esc closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] animate-fade-in">
      <div className="absolute inset-0 glass-soft" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-3xl mx-auto pt-20 px-6">
        <form onSubmit={submit} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" strokeWidth={1.5} />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="O que você procura?"
            className="w-full pl-12 pr-14 py-5 bg-card border border-border/50 rounded-full shadow-xl text-lg font-display focus:outline-none focus:border-accent transition-colors"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar busca"
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5 text-foreground/60" strokeWidth={1.5} />
          </button>
        </form>

        <div className="mt-6 bg-card rounded-2xl shadow-xl border border-border/40 max-h-[60vh] overflow-y-auto">
          {debounced.length < 2 ? (
            <div className="p-6">
              {recent.length > 0 ? (
                <>
                  <p className="eyebrow mb-3">Buscas recentes</p>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => { setQuery(r); }}
                        className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-accent/10 hover:text-accent transition-colors"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Comece a digitar para buscar produtos
                </p>
              )}
            </div>
          ) : isLoading ? (
            <div className="p-6 flex items-center justify-center">
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : results && results.length > 0 ? (
            <ul className="divide-y divide-border/40">
              {results.slice(0, 8).map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => selectProduct(p.slug)}
                    className="w-full flex items-center gap-4 px-4 py-3 hover:bg-muted/40 transition-colors text-left"
                  >
                    <img
                      src={optimizedImage(p.images?.[0], { width: 120 })}
                      alt=""
                      loading="lazy"
                      className="w-14 h-14 rounded-lg object-cover bg-muted shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm font-medium truncate">{p.title}</p>
                      <p className="text-xs text-primary font-bold mt-0.5">
                        R$ {Number(p.price).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => submit()}
                  className="w-full px-4 py-3 text-center text-sm font-medium text-accent hover:bg-accent/5 transition-colors"
                >
                  Ver todos os resultados para "{query}"
                </button>
              </li>
            </ul>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">Nenhum produto encontrado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderSearchOverlay;
