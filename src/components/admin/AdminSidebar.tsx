import { LayoutDashboard, ShoppingBag, Package, Settings, LogOut, Palette, Tag } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import brunaLogo from '@/assets/bruna-logo.webp';

const items = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Pedidos', url: '/admin/pedidos', icon: ShoppingBag },
  { title: 'Produtos', url: '/admin/produtos', icon: Package },
  { title: 'Categorias', url: '/admin/categorias', icon: Tag },
  { title: 'Aparência', url: '/admin/aparencia', icon: Palette },
  { title: 'Configurações', url: '/admin/config', icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { signOut } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 mb-2">
            {!collapsed && (
              <img src={brunaLogo} alt="Bruna" className="h-8 object-contain" />
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/admin'}
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted/50 transition-colors"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'default'}
          onClick={handleLogout}
          className="w-full justify-start text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="ml-2">Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
