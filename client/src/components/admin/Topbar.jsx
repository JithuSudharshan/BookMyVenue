import { CircleHelp, Search } from 'lucide-react';
import { NotificationDropdown } from '../common/NotificationDropdown';

function Topbar() {
  return (
    <header className="flex flex-col sm:flex-row items-stretch sm:items-center gap-[18px] h-auto sm:h-[62px] px-[18px] sm:px-[34px] bg-white border-b border-line py-3 sm:py-0">
      <div className="flex-1"></div>
      <nav className="flex gap-6 ml-0 sm:ml-auto text-[#6b5555] text-xs font-bold" aria-label="Admin quick links">
        <a href="/admin/users" className="hover:text-admin-red transition-colors mt-2">Reports</a>
      </nav>
      <div className="self-start sm:self-auto -mt-1 sm:mt-0">
        <NotificationDropdown />
      </div>
    </header>
  );
}

export default Topbar;
