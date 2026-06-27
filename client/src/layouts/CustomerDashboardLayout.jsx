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
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import './CustomerDashboardLayout.css';



const NAV_ITEMS = [
  { path: '/customer/profile', icon: User, label: 'Profile' },
  { path: '/customer/bookings', icon: CalendarDays, label: 'Bookings' },
  { path: '/customer/wishlist', icon: Heart, label: 'Wishlist' },
  { path: '/customer/wallet', icon: Wallet, label: 'Wallet' },
];

function CustomerDashboardLayout() {
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
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <div className="cdl-root">
      {/* ── Header ── */}
      <header className="cdl-header">
        <div className="cdl-header-left">
          <button
            className="cdl-hamburger"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <a href="/home" className="cdl-brand">
            <span className="cdl-brand-icon">📍</span>
            <span className="cdl-brand-text">BookMyVenue</span>
          </a>
        </div>

        <div className="cdl-header-right">
          {/* Notification Bell */}
          <button className="cdl-icon-btn" aria-label="Notifications">
            <Bell size={20} />
            <span className="cdl-notif-dot" />
          </button>

          {/* Profile Dropdown */}
          <div className="cdl-profile-menu-wrapper">
            <button
              className="cdl-profile-trigger"
              onClick={() => setProfileMenuOpen((v) => !v)}
              aria-expanded={profileMenuOpen}
              aria-label="User menu"
            >
              <div className="cdl-avatar">
                {user?.profile?.profileImage ? (
                  <img src={user.profile.profileImage} alt="avatar" className="cdl-avatar-img" />
                ) : (
                  <span className="cdl-avatar-initials">{getInitials()}</span>
                )}
              </div>
              <span className="cdl-profile-name">{user?.profile?.firstName || 'Account'}</span>
              <ChevronDown size={16} className={`cdl-chevron ${profileMenuOpen ? 'open' : ''}`} />
            </button>

            {profileMenuOpen && (
              <>
                <div className="cdl-backdrop" onClick={() => setProfileMenuOpen(false)} />
                <div className="cdl-dropdown">
                  <div className="cdl-dropdown-header">
                    <p className="cdl-dropdown-name">
                      {user?.profile?.firstName} {user?.profile?.lastName}
                    </p>
                    <p className="cdl-dropdown-email">{user?.email}</p>
                  </div>
                  <div className="cdl-dropdown-divider" />
                  <NavLink
                    to="/customer/profile"
                    className="cdl-dropdown-item"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <Settings size={15} />
                    Account settings
                  </NavLink>
                  <button className="cdl-dropdown-item cdl-dropdown-logout" onClick={handleLogout}>
                    <LogOut size={15} />
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="cdl-body">
        {/* ── Sidebar Overlay for Mobile ── */}
        {sidebarOpen && (
          <div className="cdl-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── Sidebar ── */}
        <aside className={`cdl-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="cdl-sidebar-user">
            <div className="cdl-sidebar-avatar">
              {user?.profile?.profileImage ? (
                <img src={user.profile.profileImage} alt="avatar" className="cdl-avatar-img" />
              ) : (
                <span className="cdl-avatar-initials">{getInitials()}</span>
              )}
            </div>
            <div>
              <p className="cdl-sidebar-uname">
                {user?.profile?.firstName} {user?.profile?.lastName}
              </p>
              <p className="cdl-sidebar-uemail">{user?.email}</p>
            </div>
          </div>

          <nav className="cdl-nav">
            <p className="cdl-nav-section-label">My Account</p>
            {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `cdl-nav-item ${isActive ? 'active' : ''}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} className="cdl-nav-icon" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <button className="cdl-sidebar-logout" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Log out</span>
          </button>
        </aside>

        {/* ── Main Content ── */}
        <main className="cdl-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default CustomerDashboardLayout;
