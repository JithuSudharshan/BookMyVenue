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
    <div className="page-stack">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <div className="page-heading with-actions">
        <div>
          <h1>Client Management</h1>
          <p>Directory of all registered clients and event planners.</p>
        </div>
      </div>

      <section className="table-card">
        <div className="table-toolbar">
          <SearchBox
            value={query}
            onChange={setQuery}
            placeholder="Search clients by email..."
          />
          <div className="segmented-control">
            <button
              className={statusFilter === 'All' ? 'active' : ''}
              type="button"
              onClick={() => setStatusFilter('All')}
            >
              All Clients
            </button>
            <button
              className={statusFilter === 'Active' ? 'active' : ''}
              type="button"
              onClick={() => setStatusFilter('Active')}
            >
              Active
            </button>
            <button
              className={statusFilter === 'Suspended' ? 'active' : ''}
              type="button"
              onClick={() => setStatusFilter('Suspended')}
            >
              Suspended
            </button>
          </div>
        </div>

        {loading ? <StateBlock title="Loading clients" message="Fetching registered users." /> : null}
        {error ? <StateBlock title="Unable to load clients" message={error} /> : null}
        {!loading && !error ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <strong>{user.profile ? `${user.profile.firstName} ${user.profile.lastName || ''}`.trim() : <span className="table-subtext">No profile</span>}</strong>
                    </td>
                    <td>
                      {user.email}
                    </td>
                    <td><StatusBadge status={user.isBlocked ? 'Suspended' : 'Active'} /></td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>{formatDate(user.lastLogin)}</td>
                    <td>
                      <button
                        className={user.isBlocked ? 'icon-text-button approve' : 'icon-text-button danger'}
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




