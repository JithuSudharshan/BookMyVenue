import { Route, Routes, Navigate } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminLogin from '../pages/admin/AdminLogin';
import ClientManagement from '../pages/admin/ClientManagement';
import UserDetails from '../pages/admin/UserDetails';
import VendorDetails from '../pages/admin/VendorDetails';
import VendorManagement from '../pages/admin/VendorManagement';
import CategoryManagement from '../pages/admin/CategoryManagement';
import VenueManagement from '../pages/admin/VenueManagement';
import VenueDetails from '../pages/admin/VenueDetails';
import BookingManagement from '../pages/admin/BookingManagement';
import BookingDetails from '../pages/admin/BookingDetails';

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<ClientManagement />} />
        <Route path="users/:id" element={<UserDetails />} />
        <Route path="vendors" element={<VendorManagement />} />
        <Route path="vendor-approvals" element={<Navigate to="/admin/vendors?tab=review" replace />} />
        <Route path="vendors/:id" element={<VendorDetails />} />
        <Route path="vendorDetail/:id" element={<VendorDetails />} />
        <Route path="/categories" element={<CategoryManagement />} />
        <Route path="venues" element={<VenueManagement />} />
        <Route path="venues/:id" element={<VenueDetails />} />
        <Route path="bookings" element={<BookingManagement />} />
        <Route path="bookings/:id" element={<BookingDetails />} />
      </Route>
    </Routes>
  );
}
