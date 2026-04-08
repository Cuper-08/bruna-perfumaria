import { useEffect, useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { AdminRoute } from '@/contexts/AdminAuthContext';
import { Outlet } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Bell, Store } from 'lucide-react';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
};

const AdminLayout = () => {
  const [storeOpen, setStoreOpen] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      const [settingsRes, pendingRes] = await Promise.all([
        supabase.from('admin_settings').select('store_open').limit(1).single(),
        supabase.from('orders').select('id', { count: 'exact' }).in('order_status', ['received', 'preparing']),
      ]);
      if (settingsRes.data) setStoreOpen(settingsRes.data.store_open ?? true);
      setPendingCount(pendingRes.count || 0);
    };
    fetch();

    const channel = supabase
      .channel('admin-header-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => {
        setPendingCount(prev => prev + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <AdminRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-muted/30">
          <AdminSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-16 flex items-center border-b border-border/50 bg-card px-4 md:px-6 gap-3 sticky top-0 z-30 shadow-sm">
              <SidebarTrigger />
              
              <div className="flex-1 min-w-0">
                <h1 className="text-sm font-display font-semibold text-foreground truncate">
                  {getGreeting()}, Admin 👋
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Bruna Perfumaria — Painel</p>
              </div>

              <div className="flex items-center gap-2">
                {/* Store status */}
                <Badge 
                  variant="outline" 
                  className={`text-xs gap-1.5 px-2.5 py-1 border-none ${
                    storeOpen 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${storeOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                  <Store className="h-3 w-3" />
                  <span className="hidden sm:inline">{storeOpen ? 'Aberta' : 'Fechada'}</span>
                </Badge>

                {/* Pending orders */}
                {pendingCount > 0 && (
                  <Badge className="bg-bruna-red text-white gap-1.5 px-2.5 py-1 animate-pulse">
                    <Bell className="h-3 w-3" />
                    {pendingCount}
                  </Badge>
                )}
              </div>
            </header>
            <main className="flex-1 p-4 md:p-6 overflow-auto">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AdminRoute>
  );
};

export default AdminLayout;
