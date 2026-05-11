import { useState, FormEvent } from 'react';
import { Mail, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const NewsletterCTA = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error('Informe um e-mail válido');
      return;
    }
    // TODO wire to newsletter table / external provider; persisting locally for now
    try {
      const raw = localStorage.getItem('bruna-newsletter') || '[]';
      const list: string[] = JSON.parse(raw);
      if (!list.includes(trimmed)) list.push(trimmed);
      localStorage.setItem('bruna-newsletter', JSON.stringify(list));
    } catch { /* noop */ }
    setSubmitted(true);
    toast.success('Pronto! Em breve você recebe nossas novidades.');
  };

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="eyebrow mb-4">Bruna no seu inbox</p>
          <h2 className="display-lg text-foreground mb-5 text-balance">
            Lançamentos, ofertas e descobertas <span className="italic">em primeira mão</span>.
          </h2>
          <p className="text-foreground/65 text-base md:text-lg mb-8 max-w-lg mx-auto text-balance">
            Sem spam. Apenas o que importa, no ritmo certo.
          </p>

          {submitted ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Check className="h-4 w-4" strokeWidth={2} />
              <span className="text-sm font-medium">Você está na lista</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-11 h-12 rounded-full bg-card border-border/50"
                />
              </div>
              <Button type="submit" size="lg" className="rounded-full h-12 px-7 font-semibold tracking-wide">
                Inscrever
              </Button>
            </form>
          )}

          <p className="text-[11px] text-muted-foreground mt-4">
            Ao se inscrever você concorda com nossa{' '}
            <a href="/privacidade" className="underline hover:text-foreground">Política de Privacidade</a>.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterCTA;
