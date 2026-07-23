import {
  Building2,
  CalendarCheck,
  CircleHelp,
  Gauge,
  LogOut,
  UserRoundCog,
  Users,
  Receipt,
  LayoutGrid
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { clearAdminSession, getSavedAdmin } from '../../services/httpService';
import { getInitials } from '../../utils/formatters';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: Gauge, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/vendors', label: 'Vendors', icon: Building2 },
  { to: '/admin/venues', label: 'Venues', icon: CalendarCheck },
  { to: '/admin/categories', label: 'Categories', icon: LayoutGrid },
  { to: '/admin/bookings', label: 'Bookings', icon: Receipt },
];

function Sidebar() {
  const navigate = useNavigate();
  const admin = getSavedAdmin();

  const handleLogout = () => {
    clearAdminSession();
    navigate('/admin/login', { replace: true });
  };

  return (
    <aside className="sticky top-0 flex flex-col justify-between h-auto lg:h-screen p-[22px_18px] bg-white border-b lg:border-b-0 lg:border-r border-line lg:sticky static">
      <div>
        <div className="flex items-center gap-2.5 mb-7">
          <div className="grid place-items-center w-[38px] h-[38px] rounded-[7px] text-white font-extrabold bg-admin-red">B</div>
          <div>
            <strong className="block text-admin-red text-[15px] font-bold">BookMyVenue</strong>
            <span className="block text-muted text-[12px]">Admin Control Panel</span>
          </div>
        </div>

        <nav className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-1" aria-label="Admin navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                end={item.end}
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 min-h-[38px] px-3 text-sm font-bold rounded-md transition-all ${isActive
                    ? 'text-white bg-admin-red'
                    : 'text-[#6b5555] hover:bg-admin-red-soft hover:text-admin-red'
                  }`
                }
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="grid gap-3 pt-[18px] border-t border-line mt-4 lg:mt-0">
        <button className="flex items-center gap-2 text-gray-500 bg-transparent border-0 text-sm font-bold hover:text-admin-red transition-colors" type="button">
          <CircleHelp size={16} />
          <span>Help Center</span>
        </button>
        <div className="flex items-center gap-2.5">
          <div className="grid place-items-center w-[34px] h-[34px] rounded-full text-white text-xs font-extrabold bg-gradient-to-br from-[#0f2f3a] to-[#45656b]">{getInitials(admin?.name || 'Admin')}</div>
          <div>
            <strong className="block text-admin-red text-[15px] font-bold">{admin?.name || 'Admin User'}</strong>
            <span className="block text-muted text-[12px]">{admin?.role || 'System Admin'}</span>
          </div>
        </div>
        <button className="flex items-center gap-2 text-admin-red bg-transparent border-0 text-sm font-bold hover:text-admin-red-dark transition-colors" type="button" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
