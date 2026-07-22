import React from 'react';
import './Profile.css';

function InfoRow({ label, value }) {
  return (
    <div className="pf-info-row">
      <span className="pf-info-label">{label}</span>
      <span className={`pf-info-value${!value ? ' empty' : ''}`}>
        {value || <span className="pf-info-dash">—</span>}
      </span>
    </div>
  );
}

export default InfoRow;
