import React from 'react';

/**
 * Reusable DetailItem component for rendering key-value layout details.
 * Uses CSS classes from Profile.css scoped under .profile-theme-scope.
 * 
 * @param {Object} props
 * @param {string} props.label
 * @param {React.ReactNode} [props.value]
 */
function DetailItem({ label, value }) {
  return (
    <div className="detail-item">
      <span className="label-sm detail-label">{label}</span>
      <span className="body-md detail-value">{value || '—'}</span>
    </div>
  );
}

export default DetailItem;
