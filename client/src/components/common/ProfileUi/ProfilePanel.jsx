import React from 'react';
import './Profile.css';

/* ── Edit button (reusable) ── */
function EditButton({ onClick, label = 'Edit' }) {
  return (
    <button className="pf-edit-btn" onClick={onClick} aria-label={label}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
      {label}
    </button>
  );
}

function ProfilePanel({ icon, title, onEdit, isEditing, showEditButton = true, children }) {
  return (
    <div className="pf-panel">
      <div className="pf-panel-head">
        <div className="pf-panel-title-row">
          <div className="pf-panel-icon">
            {icon}
          </div>
          <h3 className="pf-panel-title">{title}</h3>
        </div>
        {!isEditing && showEditButton && onEdit && (
          <EditButton onClick={onEdit} label="Edit" />
        )}
      </div>
      {children}
    </div>
  );
}

export default ProfilePanel;
