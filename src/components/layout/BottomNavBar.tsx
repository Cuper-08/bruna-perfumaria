import { Home, Grid3X3, Flame, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const tabs = [
  { label: 'Início', icon: Home, href: '/' },
  { label: 'Categorias', icon: Grid3X3, href: '/categorias' },
  { label: 'Em Alta', icon: Flame, href: '/destaques' },
  { label: 'Perfil', icon: User, href: '/perfil' },
];

const BottomNavBar = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden">
      <div className="backdrop-blur-2xl bg-white/80 border-t border-accent/15 px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16">
          {tabs.map(tab => {
            const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
            return (
              <Link
                key={tab.href}
                to={tab.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/8' : ''}`}>
                  <tab.icon className={`h-5 w-5 transition-all duration-300 ${isActive ? 'stroke-[2]' : 'stroke-[1.5]'}`} />
                  {isActive && (
                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                  )}
                </div>
                <span className={`text-[10px] tracking-wide ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavBar;
