import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FiGrid, FiSettings, FiUsers, FiLogOut } from 'react-icons/fi';

const AdminLayout = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Categories', href: '/admin/categories', icon: FiSettings },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col flex-shrink-0 min-h-screen">
        <div className="h-16 flex items-center px-6 font-bold text-xl border-b border-gray-200 text-primary">
          Admin Portal
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-red-50 text-primary font-semibold' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-dark'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
