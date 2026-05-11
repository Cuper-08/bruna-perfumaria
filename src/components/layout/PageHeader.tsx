import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title?: string;
  /** Optional slot rendered on the right side. */
  rightSlot?: ReactNode;
  /** When provided, shows a discreet back link. Use '/' or another specific path. */
  backTo?: string;
  /** Optional breadcrumb chips (label + href). */
  breadcrumbs?: Array<{ label: string; href?: string }>;
  className?: string;
}

const PageHeader = ({ title, rightSlot, backTo, breadcrumbs, className }: PageHeaderProps) => {
  const navigate = useNavigate();

  const renderBack = () => {
    if (!backTo) return null;
    return (
      <button
        type="button"
        onClick={() => navigate(backTo)}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Voltar
      </button>
    );
  };

  const renderBreadcrumbs = () => {
    if (!breadcrumbs?.length) return null;
    return (
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {breadcrumbs.map((b, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {b.href ? (
              <Link to={b.href} className="hover:text-foreground transition-colors">{b.label}</Link>
            ) : (
              <span className="text-foreground/80">{b.label}</span>
            )}
            {i < breadcrumbs.length - 1 && <span className="text-foreground/30">/</span>}
          </span>
        ))}
      </nav>
    );
  };

  if (!title && !breadcrumbs?.length && !backTo && !rightSlot) return null;

  return (
    <section className={cn('bg-background border-b border-border/40', className)}>
      <div className="container mx-auto px-4 lg:px-8 py-6 md:py-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              {renderBack()}
              {renderBack() && breadcrumbs?.length ? <span className="text-foreground/30 text-xs">·</span> : null}
              {renderBreadcrumbs()}
            </div>
            {title && (
              <h1 className="display-md text-foreground">{title}</h1>
            )}
          </div>
          {rightSlot && (
            <div className="flex items-center gap-2 shrink-0">
              {rightSlot}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PageHeader;
