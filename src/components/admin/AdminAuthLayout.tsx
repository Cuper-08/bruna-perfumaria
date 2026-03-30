import { Outlet } from 'react-router-dom';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';

const AdminAuthLayout = () => (
  <AdminAuthProvider>
    <Outlet />
  </AdminAuthProvider>
);

export default AdminAuthLayout;
