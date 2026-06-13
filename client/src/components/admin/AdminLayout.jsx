import { Navigate, Outlet } from 'react-router-dom';
import { getAdminToken } from '../../services/httpService';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

function AdminLayout() {
  if (!getAdminToken()) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-shell">
      <Sidebar />
      <div className="admin-main">
        <Topbar />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
