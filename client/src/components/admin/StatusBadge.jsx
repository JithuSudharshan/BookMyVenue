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
  requested: 'text-[#b45309] bg-[#fef3c7]',
  changes_requested: 'text-[#b45309] bg-[#fef3c7]',
  incomplete: 'text-[#6b5555] bg-[#f4f4f5]',

  rejected: 'text-admin-red bg-[#fee2e2]',
  suspended: 'text-admin-red bg-[#fee2e2]',
  unverified: 'text-admin-red bg-[#fee2e2]',
  cancelled: 'text-admin-red bg-[#fee2e2]',
  no_show: 'text-admin-red bg-[#fee2e2]',
  unpaid: 'text-admin-red bg-[#fee2e2]',
  failed: 'text-admin-red bg-[#fee2e2]',
};

const statusLabels = {
  requested: 'New Application',
  changes_requested: 'Awaiting Changes',
  under_review: 'Under Review',
  incomplete: 'Incomplete',
  submitted: 'New Submission',
};

function StatusBadge({ status }) {
  const normalized = String(status || 'unknown').toLowerCase();
  const stateColor = statusClasses[normalized] || 'text-[#6b5555] bg-[#f4f4f5]';
  const displayLabel = statusLabels[normalized] || status || 'Unknown';

  return <span className={`inline-flex items-center min-h-[24px] px-2.5 text-[12px] font-extrabold rounded-full capitalize ${stateColor}`}>{displayLabel}</span>;
}

export default StatusBadge;
