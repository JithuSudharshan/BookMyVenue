import { ShieldOff, ShieldCheck, User, Mail, Phone, Calendar, MapPin } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ConfirmModal from '../../components/admin/ConfirmModal';
import Pagination from '../../components/admin/Pagination';
import SearchBox from '../../components/admin/SearchBox';
import StateBlock from '../../components/admin/StateBlock';
import StatusBadge from '../../components/admin/StatusBadge';
import Toast from '../../components/admin/Toast';
import usePagination from '../../hooks/usePagination';
import { blockUser, getUsers, unblockUser } from '../../services/adminService';
import { formatDate } from '../../utils/formatters';

function ClientManagement() {
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const [toast, setToast] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      setUsers(await getUsers());
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return users.filter((user) => {
      const searchString = `${user.email} ${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.toLowerCase();
      const matchesSearch = searchString.includes(normalized);
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Active' && !user.isBlocked) ||
        (statusFilter === 'Suspended' && user.isBlocked);
      return matchesSearch && matchesStatus;
    });
  }, [query, users, statusFilter]);

  const { currentPage, totalPages, paginatedItems: pagedUsers, goToPage, resetPage, totalItems, itemsPerPage } = usePagination(filteredUsers);

  const selectedUser = useMemo(
    () => users.find((user) => user._id === selectedId),
    [selectedId, users]
  );

  useEffect(() => {
    resetPage();
  }, [query, statusFilter]);

  const handleConfirm = async () => {
    try {
      if (pendingAction.type === 'block') {
        await blockUser(pendingAction.user._id);
        setToast({ type: 'success', message: 'User suspended successfully.' });
      } else {
        await unblockUser(pendingAction.user._id);
        setToast({ type: 'success', message: 'User restored successfully.' });
      }
      setPendingAction(null);
      await loadUsers();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  if (selectedId && selectedUser) {
    return (
      <div className="page-stack">
        <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
        <div className="page-heading with-actions">
          <div>
            <span className="page-kicker">Client Management</span>
            <h1>Client Profile</h1>
            <p>Detailed view of client information and activity.</p>
          </div>
          <button
            className="secondary-button"
            type="button"
            onClick={() => setSelectedId('')}
          >
            &larr; Back to Client List
          </button>
        </div>

        <section className="approval-detail">
          <div className="approval-detail-header">
            <div>
              <h1>{selectedUser.profile ? `${selectedUser.profile.firstName} ${selectedUser.profile.lastName || ''}`.trim() : 'No Profile Set'}</h1>
              <p>Account Type: Client</p>
            </div>
            <StatusBadge status={selectedUser.isBlocked ? 'Suspended' : 'Active'} />
          </div>

          <div className="detail-grid">
            <article className="detail-card">
              <h2><User size={18} /> Personal Information</h2>
              <dl>
                <dt>Full Name</dt>
                <dd>{selectedUser.profile ? `${selectedUser.profile.firstName} ${selectedUser.profile.lastName || ''}`.trim() : 'N/A'}</dd>
                <dt>Email Address</dt>
                <dd><Mail size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} />{selectedUser.email}</dd>
                <dt>Phone Number</dt>
                <dd><Phone size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} />{selectedUser.profile?.phone || 'Not provided'}</dd>
                <dt>Location</dt>
                <dd><MapPin size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} />{selectedUser.profile?.address ? `${selectedUser.profile.address.city || ''}, ${selectedUser.profile.address.state || ''}`.replace(/^,\s/, '') || 'Not provided' : 'Not provided'}</dd>
              </dl>
            </article>

            <article className="detail-card">
              <h2><Calendar size={18} /> Account Activity</h2>
              <dl>
                <dt>Account Created</dt>
                <dd>{formatDate(selectedUser.createdAt)}</dd>
                <dt>Last Login Date</dt>
                <dd>{formatDate(selectedUser.lastLogin)}</dd>
                <dt>Account Status</dt>
                <dd>{selectedUser.isBlocked ? 'Suspended by Admin' : 'Active and Verified'}</dd>
              </dl>
            </article>
          </div>
          
          <div className="approval-actions" style={{ justifyContent: 'flex-start', marginTop: '1rem' }}>
            <button
              className={selectedUser.isBlocked ? 'primary-button' : 'secondary-danger-button'}
              type="button"
              onClick={() => setPendingAction({ type: selectedUser.isBlocked ? 'unblock' : 'block', user: selectedUser })}
            >
              {selectedUser.isBlocked ? 'Restore User Account' : 'Suspend User Account'}
            </button>
          </div>
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

  return (
    <div className="page-stack">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <div className="page-heading with-actions">
        <div>
          <h1>Client Management</h1>
          <p>Directory of all registered clients and event planners.</p>
        </div>
        <button className="secondary-button" type="button">Export CSV</button>
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
                {pagedUsers.map((user) => (
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
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                          className="secondary-button"
                          type="button"
                          onClick={() => setSelectedId(user._id)}
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
                        >
                          View Profile
                        </button>
                        <button
                          className={user.isBlocked ? 'icon-text-button approve' : 'icon-text-button danger'}
                          type="button"
                          onClick={() => setPendingAction({ type: user.isBlocked ? 'unblock' : 'block', user })}
                        >
                          {user.isBlocked ? <ShieldCheck size={15} /> : <ShieldOff size={15} />}
                          <span>{user.isBlocked ? 'Restore' : 'Suspend'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredUsers.length ? <StateBlock title="No clients found" message="Try a different email search." /> : null}
            <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={goToPage} />
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
