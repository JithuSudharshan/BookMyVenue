import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Settings, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { NotificationDropdown } from '../../components/common/NotificationDropdown';

export const DashboardHeader = ({ sidebarOpen, setSidebarOpen, isVendor }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

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

  const brandLink = isVendor ? '/vendor/dashboard' : '/';
  const profileLink = isVendor ? '/vendor/profile' : '/customer/profile';

  return (
    <header className="dl-header">
      <div className="dl-header-left">
        <button
          className="dl-hamburger"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <a href={brandLink} className="text-primary font-extrabold text-2xl tracking-tight flex-shrink-0" style={{ textDecoration: 'none', marginLeft: '16px' }}>
          BookMyVenue
        </a>
      </div>

      <div className="dl-header-right">
        {/* Notification Bell */}
        <NotificationDropdown />

        {/* Profile Dropdown */}
        <div className="dl-profile-menu-wrapper">
          <button
            className="dl-profile-trigger"
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            aria-expanded={profileMenuOpen}
            aria-label="User menu"
          >
            <div className="dl-avatar">
              {user?.profile?.profileImage && user.profile.profileImage !== 'default.jpg' ? (
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
  );
};
