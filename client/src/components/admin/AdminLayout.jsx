import { Navigate, Outlet } from 'react-router-dom';
import { getAdminToken } from '../../services/httpService';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

function AdminLayout() {
  if (!getAdminToken()) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)] min-h-screen">
      <Sidebar />
      <div className="min-w-0">
        <Topbar />
        <main className="p-6 lg:p-[36px_42px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
