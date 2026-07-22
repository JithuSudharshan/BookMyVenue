import { Bell, CircleHelp, Search } from 'lucide-react';

function Topbar() {
  return (
    <header className="flex flex-col sm:flex-row items-stretch sm:items-center gap-[18px] h-auto sm:h-[62px] px-[18px] sm:px-[34px] bg-white border-b border-line py-3 sm:py-0">
      <div className="flex-1"></div>
      <nav className="flex gap-6 ml-0 sm:ml-auto text-[#6b5555] text-xs font-bold" aria-label="Admin quick links">
        <a href="/admin/users" className="hover:text-admin-red transition-colors">Reports</a>
      </nav>
      <button className="grid place-items-center w-[34px] h-[34px] text-[#6b5555] bg-white border border-transparent rounded-full hover:bg-admin-red-soft hover:text-admin-red transition-all self-start sm:self-auto" type="button" aria-label="Notifications">
        <Bell size={17} />
      </button>
    </header>
  );
}

export default Topbar;
