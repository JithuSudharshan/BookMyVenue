import { Route, Routes } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminLogin from '../pages/admin/AdminLogin';
import ClientManagement from '../pages/admin/ClientManagement';
import UserDetails from '../pages/admin/UserDetails';
import VendorDetails from '../pages/admin/VendorDetails';
import VendorManagement from '../pages/admin/VendorManagement';
import VendorApprovalCenter from '../pages/admin/VendorApprovalCenter';
import VenueManagement from '../pages/admin/VenueManagement';
import VenueDetails from '../pages/admin/VenueDetails';

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<ClientManagement />} />
        <Route path="users/:id" element={<UserDetails />} />
        <Route path="vendors" element={<VendorManagement />} />
        <Route path="vendor-approvals" element={<VendorApprovalCenter />} />
        <Route path="vendors/:id" element={<VendorDetails />} />
        <Route path="venues" element={<VenueManagement />} />
        <Route path="venues/:id" element={<VenueDetails />} />
      </Route>
    </Routes>
  );
}
