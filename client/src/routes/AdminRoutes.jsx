import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import CategoryManagement from '../pages/admin/CategoryManagement';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        {/* Replace with a real Dashboard later */}
        <Route path="/" element={<div className="text-xl font-bold">Admin Dashboard Coming Soon</div>} />
        <Route path="/categories" element={<CategoryManagement />} />
        {/* Placeholder for other routes */}
        <Route path="/users" element={<div className="text-xl font-bold">User Management Coming Soon</div>} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
