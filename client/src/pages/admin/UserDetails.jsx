import { ShieldOff, ShieldCheck, User, Mail, Phone, Calendar, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/admin/ConfirmModal';
import StateBlock from '../../components/admin/StateBlock';
import StatusBadge from '../../components/admin/StatusBadge';
import Toast from '../../components/admin/Toast';
import { updateUserBlockStatus, getUserById } from '../../services/adminService';
import { formatDate } from '../../utils/formatters';

function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const [toast, setToast] = useState(null);

  const loadUser = async () => {
    setLoading(true);
    try {
      const data = await getUserById(id);
      setSelectedUser(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [id]);

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
      await loadUser();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  if (loading) {
    return <StateBlock title="Loading client" message="Fetching user profile." />;
  }

  if (error || !selectedUser) {
    return <StateBlock title="Unable to load client" message={error || "User not found."} />;
  }

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
          onClick={() => navigate(-1)}
        >
          &larr; Back
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

export default UserDetails;
