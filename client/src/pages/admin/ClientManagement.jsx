import { ShieldOff, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import ConfirmModal from '../../components/admin/ConfirmModal';
import Pagination from '../../components/admin/Pagination';
import SearchBox from '../../components/admin/SearchBox';
import StateBlock from '../../components/admin/StateBlock';
import StatusBadge from '../../components/admin/StatusBadge';
import Toast from '../../components/admin/Toast';
import { updateUserBlockStatus, getUsers } from '../../api/admin-api/adminApi';
import { formatDate } from '../../utils/formatters';

function ClientManagement() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const [toast, setToast] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 5;

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch,
        status: statusFilter
      });
      setUsers(res.data || []);
      setTotalItems(res.pagination?.totalItems || 0);
      setTotalPages(res.pagination?.totalPages || 1);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(query);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // Load data when page, search query, or status filter changes
  useEffect(() => {
    loadUsers();
  }, [currentPage, debouncedSearch, statusFilter]);

  const handleConfirm = async () => {
    try {
      if (pendingAction.type === 'block') {
        await updateUserBlockStatus(pendingAction.user._id, true);
        setToast({ type: 'success', message: 'User suspended successfully.' });
      } else {
        await updateUserBlockStatus(pendingAction.user._id, false);
        setToast({ type: 'success', message: 'User restored successfully.' });
      }
      setPendingAction(null);
      await loadUsers();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="grid gap-[26px]">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-[18px]">
        <div>
          <h1 className="m-0 text-3xl sm:text-4xl font-extrabold leading-none text-ink">Client Management</h1>
          <p className="block text-muted text-[12px] mt-1">Directory of all registered clients and event planners.</p>
        </div>
      </div>

      <section className="bg-surface border border-line rounded-lg shadow-admin p-[22px]">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-[18px] justify-between">
          <SearchBox
            value={query}
            onChange={setQuery}
            placeholder="Search clients by email..."
          />
          <div className="flex flex-wrap gap-1.5">
            <button
              className={`min-h-[36px] px-3.5 rounded-[7px] text-[13px] font-extrabold transition-all border ${
                statusFilter === 'All'
                  ? 'text-white bg-admin-red border-admin-red'
                  : 'text-[#6b5555] bg-white border-line hover:bg-admin-red-soft hover:text-admin-red'
              }`}
              type="button"
              onClick={() => setStatusFilter('All')}
            >
              All Clients
            </button>
            <button
              className={`min-h-[36px] px-3.5 rounded-[7px] text-[13px] font-extrabold transition-all border ${
                statusFilter === 'Active'
                  ? 'text-white bg-admin-red border-admin-red'
                  : 'text-[#6b5555] bg-white border-line hover:bg-admin-red-soft hover:text-admin-red'
              }`}
              type="button"
              onClick={() => setStatusFilter('Active')}
            >
              Active
            </button>
            <button
              className={`min-h-[36px] px-3.5 rounded-[7px] text-[13px] font-extrabold transition-all border ${
                statusFilter === 'Inactive'
                  ? 'text-white bg-admin-red border-admin-red'
                  : 'text-[#6b5555] bg-white border-line hover:bg-admin-red-soft hover:text-admin-red'
              }`}
              type="button"
              onClick={() => setStatusFilter('Inactive')}
            >
              Inactive
            </button>
          </div>
        </div>

        {loading ? <StateBlock title="Loading clients" message="Fetching registered users." /> : null}
        {error ? <StateBlock title="Unable to load clients" message={error} /> : null}
        {!loading && !error ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="border-b border-line">
                  <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Name</th>
                  <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Email</th>
                  <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Status</th>
                  <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Created Date</th>
                  <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Last Login</th>
                  <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-panel transition-colors border-b border-line">
                    <td className="p-[16px_12px] text-sm text-ink font-bold">
                      {user.profile ? `${user.profile.firstName} ${user.profile.lastName || ''}`.trim() : <span className="text-xs text-muted block">No profile</span>}
                    </td>
                    <td className="p-[16px_12px] text-sm text-ink">
                      {user.email}
                    </td>
                    <td className="p-[16px_12px]"><StatusBadge status={user.isBlocked ? 'Inactive' : 'Active'} /></td>
                    <td className="p-[16px_12px] text-sm text-ink">{formatDate(user.createdAt)}</td>
                    <td className="p-[16px_12px] text-sm text-ink">{formatDate(user.lastLogin)}</td>
                    <td className="p-[16px_12px]">
                      <button
                        className={`inline-flex items-center gap-1.5 min-h-[32px] px-2.5 border rounded-[7px] text-[12px] font-extrabold bg-white transition-all ${
                          user.isBlocked
                            ? 'text-[#047857] border-line hover:border-green-200 hover:bg-green-50'
                            : 'text-admin-red border-line hover:border-[#fecaca] hover:bg-admin-red-soft'
                        }`}
                        type="button"
                        onClick={() => setPendingAction({ type: user.isBlocked ? 'unblock' : 'block', user })}
                      >
                        {user.isBlocked ? <ShieldCheck size={15} /> : <ShieldOff size={15} />}
                        <span>{user.isBlocked ? 'Restore' : 'Suspend'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!users.length ? <StateBlock title="No clients found" message="Try a different email search." /> : null}
            <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
          </div>
        ) : null}
      </section>

      {pendingAction ? (
        <ConfirmModal
          title={pendingAction.type === 'block' ? 'Suspend user?' : 'Restore user?'}
          message={`Are you sure you want to ${pendingAction.type === 'block' ? 'suspend' : 'restore'} ${pendingAction.user.email}?`}
          confirmLabel={pendingAction.type === 'block' ? 'Suspend' : 'Restore'}
          danger={pendingAction.type === 'block'}
          onCancel={() => setPendingAction(null)}
          onConfirm={handleConfirm}
        />
      ) : null}
    </div>
  );
}

export default ClientManagement;




