import {
  Building2,
  CircleHelp,
  Gauge,
  LogOut,
  ShieldCheck,
  UserRoundCog,
  Users,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { clearAdminSession, getSavedAdmin } from '../../services/httpService';
import { getInitials } from '../../utils/formatters';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: Gauge, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/vendors', label: 'Vendors', icon: Building2 },
  { to: '/admin/vendor-approvals', label: 'Vendor Verification', icon: ShieldCheck },
];

function Sidebar() {
  const navigate = useNavigate();
  const admin = getSavedAdmin();

  const handleLogout = () => {
    clearAdminSession();
    navigate('/admin/login', { replace: true });
  };

  return (
    <aside className="admin-sidebar">
      <div>
        <div className="brand-block">
          <div className="brand-mark">B</div>
          <div>
            <strong>BookMyVenue</strong>
            <span>Admin Control Panel</span>
          </div>
        </div>

        <nav className="side-nav" aria-label="Admin navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                end={item.end}
                key={item.to}
                to={item.to}
                className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <button className="ghost-row" type="button">
          <CircleHelp size={16} />
          <span>Help Center</span>
        </button>
        <div className="admin-mini">
          <div className="avatar">{getInitials(admin?.name || 'Admin')}</div>
          <div>
            <strong>{admin?.name || 'Admin User'}</strong>
            <span>{admin?.role || 'System Admin'}</span>
          </div>
        </div>
        <button className="logout-button" type="button" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
