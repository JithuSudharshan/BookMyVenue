import { ShieldOff, ShieldCheck, User, Mail, Phone, Calendar, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/admin/ConfirmModal';
import StateBlock from '../../components/admin/StateBlock';
import StatusBadge from '../../components/admin/StatusBadge';
import Toast from '../../components/admin/Toast';
import { updateUserBlockStatus, getUserById } from '../../api/admin-api/adminApi';
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
    <div className="grid gap-[26px]">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-[18px]">
        <div>
          <span className="text-admin-red text-[14px] font-extrabold">Client Management</span>
          <h1 className="m-0 text-3xl sm:text-4xl font-extrabold leading-none text-ink mt-1">Client Profile</h1>
          <p className="block text-muted text-[12px] mt-1">Detailed view of client information and activity.</p>
        </div>
        <button
          className="min-h-[36px] px-3.5 rounded-[7px] text-[13px] font-extrabold text-[#6b5555] bg-white border border-line hover:bg-admin-red-soft hover:text-admin-red transition-all self-start sm:self-auto"
          type="button"
          onClick={() => navigate(-1)}
        >
          &larr; Back
        </button>
      </div>

      <section className="bg-surface border border-line rounded-lg shadow-admin p-[22px]">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-5 border-b border-line mb-6">
          <div>
            <h1 className="m-0 text-2xl font-bold text-ink">{selectedUser.profile ? `${selectedUser.profile.firstName} ${selectedUser.profile.lastName || ''}`.trim() : 'No Profile Set'}</h1>
            <p className="block text-muted text-xs mt-1">Account Type: Client</p>
          </div>
          <StatusBadge status={selectedUser.isBlocked ? 'Suspended' : 'Active'} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px] items-start">
          <article className="p-[18px_20px] bg-surface border border-line rounded-lg shadow-admin">
            <h2 className="m-0 text-lg font-bold flex items-center gap-2 text-ink"><User size={18} className="text-admin-red" /> Personal Information</h2>
            <dl className="grid grid-cols-[max-content_1fr] gap-[10px_20px] mt-3.5">
              <dt className="text-muted text-xs">Full Name</dt>
              <dd className="m-0 font-extrabold text-ink text-sm">{selectedUser.profile ? `${selectedUser.profile.firstName} ${selectedUser.profile.lastName || ''}`.trim() : 'N/A'}</dd>
              <dt className="text-muted text-xs">Email Address</dt>
              <dd className="m-0 font-extrabold text-ink text-sm"><Mail size={14} className="inline align-text-bottom mr-1 text-[#6b5555]" />{selectedUser.email}</dd>
              <dt className="text-muted text-xs">Phone Number</dt>
              <dd className="m-0 font-extrabold text-ink text-sm"><Phone size={14} className="inline align-text-bottom mr-1 text-[#6b5555]" />{selectedUser.profile?.phone || 'Not provided'}</dd>
              <dt className="text-muted text-xs">Location</dt>
              <dd className="m-0 font-extrabold text-ink text-sm"><MapPin size={14} className="inline align-text-bottom mr-1 text-[#6b5555]" />{selectedUser.profile?.address ? `${selectedUser.profile.address.city || ''}, ${selectedUser.profile.address.state || ''}`.replace(/^,\s/, '') || 'Not provided' : 'Not provided'}</dd>
            </dl>
          </article>

          <article className="p-[18px_20px] bg-surface border border-line rounded-lg shadow-admin">
            <h2 className="m-0 text-lg font-bold flex items-center gap-2 text-ink"><Calendar size={18} className="text-admin-red" /> Account Activity</h2>
            <dl className="grid grid-cols-[max-content_1fr] gap-[10px_20px] mt-3.5">
              <dt className="text-muted text-xs">Account Created</dt>
              <dd className="m-0 font-extrabold text-ink text-sm">{formatDate(selectedUser.createdAt)}</dd>
              <dt className="text-muted text-xs">Last Login Date</dt>
              <dd className="m-0 font-extrabold text-ink text-sm">{formatDate(selectedUser.lastLogin)}</dd>
              <dt className="text-muted text-xs">Account Status</dt>
              <dd className="m-0 font-extrabold text-ink text-sm">{selectedUser.isBlocked ? 'Suspended by Admin' : 'Active and Verified'}</dd>
            </dl>
          </article>
        </div>
        
        <div className="flex items-center justify-start gap-[14px] mt-6">
          <button
            className={`min-h-[36px] px-3.5 rounded-[7px] text-[13px] font-extrabold border transition-all ${
              selectedUser.isBlocked 
                ? 'text-white bg-admin-red border-admin-red hover:bg-admin-red-dark hover:border-admin-red-dark' 
                : 'text-admin-red bg-white border-[#fecaca] hover:bg-admin-red-soft hover:text-admin-red-dark'
            }`}
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
