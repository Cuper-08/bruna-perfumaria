import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title?: string;
  /** Optional slot rendered on the right side (e.g. cart icon, share button). */
  rightSlot?: ReactNode;
  /** Force a specific destination instead of history.back(). */
  backTo?: string;
  className?: string;
}

const PageHeader = ({ title, rightSlot, backTo, className }: PageHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
      return;
    }
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full backdrop-blur-xl bg-white/85 border-b border-accent/15 shadow-[0_1px_0_0_hsl(var(--accent)/0.08)]',
        className,
      )}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="container mx-auto px-3 h-14 flex items-center gap-2">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Voltar"
          className="h-10 w-10 rounded-full flex items-center justify-center bg-background/80 border border-border/60 text-foreground hover:bg-muted active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {title && (
          <h1 className="font-display text-base md:text-lg font-semibold text-foreground truncate flex-1 text-center px-2">
            {title}
          </h1>
        )}
        {!title && <div className="flex-1" />}

        <div className="h-10 min-w-10 flex items-center justify-end shrink-0">
          {rightSlot}
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
