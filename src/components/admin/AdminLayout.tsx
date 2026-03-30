import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { AdminRoute } from '@/contexts/AdminAuthContext';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <AdminRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-muted/30">
          <AdminSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-14 flex items-center border-b bg-background px-4 gap-3 sticky top-0 z-30">
              <SidebarTrigger />
              <h1 className="text-sm font-semibold text-foreground">Bruna Perfumaria — Admin</h1>
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
