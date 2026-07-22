const statusClasses = {
  active: 'text-[#047857] bg-[#d1fae5]',
  approved: 'text-[#047857] bg-[#d1fae5]',
  verified: 'text-[#047857] bg-[#d1fae5]',
  confirmed: 'text-[#047857] bg-[#d1fae5]',
  completed: 'text-[#047857] bg-[#d1fae5]',
  paid: 'text-[#047857] bg-[#d1fae5]',
  refunded: 'text-[#047857] bg-[#d1fae5]',

  pending: 'text-[#b45309] bg-[#fef3c7]',
  under_review: 'text-[#b45309] bg-[#fef3c7]',
  submitted: 'text-[#b45309] bg-[#fef3c7]',
  'pending.review': 'text-[#b45309] bg-[#fef3c7]',
  partially_paid: 'text-[#b45309] bg-[#fef3c7]',

  rejected: 'text-admin-red bg-[#fee2e2]',
  suspended: 'text-admin-red bg-[#fee2e2]',
  unverified: 'text-admin-red bg-[#fee2e2]',
  cancelled: 'text-admin-red bg-[#fee2e2]',
  no_show: 'text-admin-red bg-[#fee2e2]',
  unpaid: 'text-admin-red bg-[#fee2e2]',
  failed: 'text-admin-red bg-[#fee2e2]',
};

function StatusBadge({ status }) {
  const normalized = String(status || 'unknown').toLowerCase();
  const stateColor = statusClasses[normalized] || 'text-[#6b5555] bg-[#f4f4f5]';

  return <span className={`inline-flex items-center min-h-[24px] px-2.5 text-[12px] font-extrabold rounded-full capitalize ${stateColor}`}>{status || 'Unknown'}</span>;
}

export default StatusBadge;
