import React from 'react';

export const BOOKING_STATUS_STYLES = {
  confirmed:  { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  pending:    { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400' },
  completed:  { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-400' },
  cancelled:  { bg: 'bg-red-50',     text: 'text-red-600',     dot: 'bg-red-400' },
  refunded:   { bg: 'bg-gray-100',   text: 'text-gray-600',    dot: 'bg-gray-400' },
  refund_pending: { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-400' },
};

export const PAYMENT_STATUS_STYLES = {
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  partial:   { bg: 'bg-amber-50',   text: 'text-amber-700' },
  pending:   { bg: 'bg-gray-100',   text: 'text-gray-600' },
  refunded:  { bg: 'bg-blue-50',    text: 'text-blue-600' },
};

export const StatusBadge = ({ status, styleMap, label }) => {
  const normalizedStatus = (status || '').toLowerCase();
  const style = styleMap[normalizedStatus] || { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.dot && <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />}
      {label || status}
    </span>
  );
};
