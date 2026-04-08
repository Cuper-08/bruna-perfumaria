import { useEffect, useState } from 'react';
import { LayoutDashboard, ShoppingBag, Package, Settings, LogOut, Palette, Tag } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, SidebarSeparator, useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import brunaLogo from '@/assets/bruna-logo.webp';

const mainItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Pedidos', url: '/admin/pedidos', icon: ShoppingBag, badgeKey: 'orders' as const },
  { title: 'Produtos', url: '/admin/produtos', icon: Package },
  { title: 'Categorias', url: '/admin/categorias', icon: Tag },
];

const configItems = [
  { title: 'Aparência', url: '/admin/aparencia', icon: Palette },
  { title: 'Configurações', url: '/admin/config', icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { signOut } = useAdminAuth();
  const navigate = useNavigate();
  const [pendingOrders, setPendingOrders] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      const { count } = await supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .in('order_status', ['received', 'preparing']);
      setPendingOrders(count || 0);
    };
    fetch();

    const channel = supabase
      .channel('sidebar-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetch())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const badges: Record<string, number> = { orders: pendingOrders };

  const renderItem = (item: { title: string; url: string; icon: React.ElementType; badgeKey?: string }) => (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild>
        <NavLink
          to={item.url}
          end={item.url === '/admin'}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-muted/60 transition-all duration-200 group"
          activeClassName="bg-primary/10 text-primary font-semibold shadow-sm"
        >
          <item.icon className="h-4 w-4 shrink-0 transition-colors" />
          {!collapsed && (
            <span className="flex-1">{item.title}</span>
          )}
          {!collapsed && item.badgeKey && badges[item.badgeKey] > 0 && (
            <Badge className="bg-bruna-red text-white text-[10px] px-1.5 py-0 h-5 min-w-[20px] flex items-center justify-center animate-pulse">
              {badges[item.badgeKey]}
            </Badge>
          )}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Logo */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 mb-1 px-2">
            {!collapsed ? (
              <div className="flex items-center gap-2 py-1">
                <img src={brunaLogo} alt="Bruna" className="h-9 object-contain" />
              </div>
            ) : (
              <img src={brunaLogo} alt="Bruna" className="h-7 object-contain" />
            )}
          </SidebarGroupLabel>
        </SidebarGroup>

        {/* Main Navigation */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold px-3">
              Navegação
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {mainItems.map(renderItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Config */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold px-3">
              Sistema
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {configItems.map(renderItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50">
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'default'}
          onClick={handleLogout}
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="ml-2">Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
