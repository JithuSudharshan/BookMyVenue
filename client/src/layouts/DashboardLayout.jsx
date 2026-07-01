import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  User,
  CalendarDays,
  Heart,
  Wallet,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  Menu,
  X,
  LayoutDashboard,
  Building2,
  FileText
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import VendorLockOverlay from '../components/vendor/VendorLockOverlay';
import './DashboardLayout.css';

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

function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const isVendor = user?.role === 'vendor';
  const isVendorAppStatusVisible = isVendor && 
    (user?.profile?.onboardingStatus === 'requested' || 
     user?.profile?.onboardingStatus === 'under_review' || 
     user?.profile?.onboardingStatus === 'rejected');

  const NAV_ITEMS = isVendor 
    ? (isVendorAppStatusVisible 
        ? [{ path: '/vendor/application-status', icon: FileText, label: 'App Status' }, ...VENDOR_NAV_ITEMS] 
        : VENDOR_NAV_ITEMS)
    : CUSTOMER_NAV_ITEMS;

  const brandText = isVendor ? 'BookMyVenue Vendor' : 'BookMyVenue';
  const brandLink = isVendor ? '/vendor/dashboard' : '/home';
  const profileLink = isVendor ? '/vendor/profile' : '/customer/profile';
  const sectionLabel = isVendor ? 'Vendor Portal' : 'My Account';

  return (
    <div className="dl-root">
      {/* ── Header ── */}
      <header className="dl-header">
        <div className="dl-header-left">
          <button
            className="dl-hamburger"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <a href={brandLink} className="dl-brand">
            <span className="dl-brand-icon">📍</span>
            <span className="dl-brand-text">{brandText}</span>
          </a>
        </div>

        <div className="dl-header-right">
          {/* Notification Bell */}
          <button className="dl-icon-btn" aria-label="Notifications">
            <Bell size={20} />
            <span className="dl-notif-dot" />
          </button>

          {/* Profile Dropdown */}
          <div className="dl-profile-menu-wrapper">
            <button
              className="dl-profile-trigger"
              onClick={() => setProfileMenuOpen((v) => !v)}
              aria-expanded={profileMenuOpen}
              aria-label="User menu"
            >
              <div className="dl-avatar">
                {user?.profile?.profileImage ? (
                  <img src={user.profile.profileImage} alt="avatar" className="dl-avatar-img" />
                ) : (
                  <span className="dl-avatar-initials">{getInitials()}</span>
                )}
              </div>
              <span className="dl-profile-name">{user?.profile?.firstName || 'Account'}</span>
              <ChevronDown size={16} className={`dl-chevron ${profileMenuOpen ? 'open' : ''}`} />
            </button>

            {profileMenuOpen && (
              <>
                <div className="dl-backdrop" onClick={() => setProfileMenuOpen(false)} />
                <div className="dl-dropdown">
                  <div className="dl-dropdown-header">
                    <p className="dl-dropdown-name">
                      {user?.profile?.firstName} {user?.profile?.lastName}
                    </p>
                    <p className="dl-dropdown-email">{user?.email}</p>
                  </div>
                  <div className="dl-dropdown-divider" />
                  <NavLink
                    to={profileLink}
                    className="dl-dropdown-item"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <Settings size={15} />
                    Account settings
                  </NavLink>
                  <button className="dl-dropdown-item dl-dropdown-logout" onClick={handleLogout}>
                    <LogOut size={15} />
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="dl-body">
        {/* ── Sidebar Overlay for Mobile ── */}
        {sidebarOpen && (
          <div className="dl-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── Sidebar ── */}
        <aside className={`dl-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="dl-sidebar-user">
            <div className="dl-sidebar-avatar">
              {user?.profile?.profileImage ? (
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
            {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
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
            ))}
          </nav>

          <button className="dl-sidebar-logout" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Log out</span>
          </button>
        </aside>

        {/* ── Main Content ── */}
        <main className="dl-main" style={{ position: 'relative' }}>
          {isVendor && <VendorLockOverlay />}
          {isVendor ? (
            <Outlet />
          ) : (
            <div className="dl-main-content">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
