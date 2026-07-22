import { Bell, CircleHelp, Search } from 'lucide-react';

function Topbar() {
  return (
    <header className="admin-topbar">
      <div className="topbar-spacer"></div>
      <nav className="topbar-links" aria-label="Admin quick links">
        <a href="/admin/users">Reports</a>
      </nav>
      <button className="icon-button" type="button" aria-label="Notifications">
        <Bell size={17} />
      </button>
    </header>
  );
}

export default Topbar;
