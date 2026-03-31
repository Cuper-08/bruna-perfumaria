import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProductSearch } from '@/hooks/useProductSearch';

const HeroSearchBar = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isLoading } = useProductSearch(debouncedQuery);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim().length >= 2) {
      setIsOpen(false);
      navigate(`/busca?q=${encodeURIComponent(query.trim())}`);
    }
  }, [query, navigate]);

  const handleSelect = useCallback((slug: string) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/produto/${slug}`);
  }, [navigate]);

  const showDropdown = isOpen && debouncedQuery.length >= 2;

  return (
    <div ref={wrapperRef} className="w-full max-w-md mx-auto relative">
      <form onSubmit={handleSubmit}>
        <div className="relative group">
          <div className="absolute inset-0 bg-white/10 rounded-full blur-md group-hover:bg-white/15 transition-all duration-300" />
          <div className="relative flex items-center bg-white/[0.12] backdrop-blur-md border border-white/20 rounded-full overflow-hidden transition-all duration-300 focus-within:bg-white/[0.18] focus-within:border-white/30 focus-within:shadow-lg focus-within:shadow-white/5">
            <Search className="ml-4 h-4 w-4 text-primary-foreground/60 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Buscar perfumes, maquiagem..."
              className="flex-1 bg-transparent text-primary-foreground placeholder:text-primary-foreground/40 text-sm px-3 py-3 outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setDebouncedQuery(''); inputRef.current?.focus(); }}
                className="mr-2 p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="h-3.5 w-3.5 text-primary-foreground/50" />
              </button>
            )}
            <button
              type="submit"
              className="mr-1.5 p-2 rounded-full bg-accent/90 hover:bg-accent text-accent-foreground transition-all duration-200 hover:scale-105"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </form>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-lg bg-muted" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-muted rounded w-3/4" />
                      <div className="h-2.5 bg-muted rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : results && results.length > 0 ? (
              <div className="py-2">
                {results.slice(0, 6).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSelect(product.slug)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
                      {product.images && product.images[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{product.title}</p>
                      <p className="text-xs font-semibold text-primary">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </button>
                ))}
                {results.length > 6 && (
                  <button
                    onClick={() => handleSubmit()}
                    className="w-full px-4 py-2.5 text-xs font-medium text-primary hover:bg-muted/50 transition-colors text-center border-t border-border/30"
                  >
                    Ver todos os {results.length} resultados →
                  </button>
                )}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm text-muted-foreground">Nenhum produto encontrado</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeroSearchBar;
