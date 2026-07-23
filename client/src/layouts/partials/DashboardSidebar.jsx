import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { User, CalendarDays, Heart, Wallet, LayoutDashboard, Building2, FileText, LogOut, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const CUSTOMER_NAV_ITEMS = [
  { path: '/customer/profile', icon: User, label: 'Profile' },
  { path: '/customer/bookings', icon: CalendarDays, label: 'Bookings' },
  { path: '/customer/wishlist', icon: Heart, label: 'Wishlist' },
  { path: '/customer/wallet', icon: Wallet, label: 'Wallet' },
];

const VENDOR_NAV_ITEMS = [
  { path: '/vendor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/vendor/profile', icon: User, label: 'Profile' },
  { path: '/vendor/venues', icon: Building2, label: 'My Venues' },
  { path: '/vendor/bookings', icon: CalendarDays, label: 'Bookings' },
  { path: '/vendor/wallet', icon: Wallet, label: 'Wallet' },
];

export const DashboardSidebar = ({ sidebarOpen, setSidebarOpen, isVendor }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = () => {
    const profile = user?.profile;
    const first = profile?.firstName?.[0] || '';
    const last = profile?.lastName?.[0] || '';
    return (first + last).toUpperCase() || (isVendor ? 'V' : 'U');
  };

  const isVendorApproved = user?.profile?.onboardingStatus === 'approved';
  
  const NAV_ITEMS = isVendor 
    ? (!isVendorApproved 
        ? [{ path: '/vendor/application-status', icon: FileText, label: 'App Status' }, ...VENDOR_NAV_ITEMS]
        : VENDOR_NAV_ITEMS)
    : CUSTOMER_NAV_ITEMS;

  const sectionLabel = isVendor ? 'Vendor Portal' : 'My Account';

  return (
    <>
      {sidebarOpen && (
        <div className="dl-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`dl-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="dl-sidebar-user">
          <div className="dl-sidebar-avatar">
            {user?.profile?.profileImage && user.profile.profileImage !== 'default.jpg' ? (
              <img src={user.profile.profileImage} alt="avatar" className="dl-avatar-img" />
            ) : (
              <span className="dl-avatar-initials">{getInitials()}</span>
            )}
          </div>
          <div className="dl-sidebar-uname-wrapper">
            <p className="dl-sidebar-uname">
              {user?.profile?.firstName} {user?.profile?.lastName}
            </p>
            {isVendor && <p className="dl-sidebar-uemail">{user?.email}</p>}
          </div>
        </div>

        <nav className="dl-nav">
          <p className="dl-nav-section-label">{sectionLabel}</p>
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const isLocked = isVendor && !isVendorApproved && ['Dashboard', 'Profile', 'My Venues', 'Bookings', 'Wallet'].includes(label);

            return isLocked ? (
              <div
                key={path}
                className="dl-nav-item opacity-50 cursor-not-allowed flex items-center"
                title="Complete onboarding to unlock this feature"
              >
                <Icon size={18} className="dl-nav-icon text-gray-400" />
                <span className="flex-1 text-gray-500">{label}</span>
                <Lock size={14} className="text-gray-400" />
              </div>
            ) : (
              <NavLink
                key={path}
                to={path}
                end={path === '/vendor/dashboard'}
                className={({ isActive }) =>
                  `dl-nav-item ${isActive ? 'active' : ''}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} className="dl-nav-icon" />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button className="dl-sidebar-logout" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Log out</span>
        </button>
      </aside>
    </>
  );
};
