import { Route, Routes } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminLogin from '../pages/admin/AdminLogin';
import ClientManagement from '../pages/admin/ClientManagement';
import VendorApprovalCenter from '../pages/admin/VendorApprovalCenter';
import VendorManagement from '../pages/admin/VendorManagement';

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<ClientManagement />} />
        <Route path="vendors" element={<VendorManagement />} />
        <Route path="vendor-approvals" element={<VendorApprovalCenter />} />
      </Route>
    </Routes>
  );
}
