import React from 'react';
import '../../user/Profile/Profile.css';

function ProfileHero({
  avatarComponent,
  title,
  subtitle,
  badges = [],
  contactRows = [],
  chips = [],
  completionPct = 100,
  completionHints = '',
  accountStatus,
}) {
  return (
    <div className="pf-hero">
      <div className="pf-hero-main">
        {/* Avatar */}
        <div className="pf-hero-avatar-wrap">
          {avatarComponent}
        </div>

        {/* Info */}
        <div className="pf-hero-info">
          <div className="pf-hero-name-row">
            <h2 className="pf-hero-name">{title}</h2>
            {badges.map((badge, idx) => (
              <React.Fragment key={idx}>{badge}</React.Fragment>
            ))}
          </div>

          {subtitle && (
            <div className="pf-hero-contact-row">
              <span className="pf-hero-contact-text">{subtitle}</span>
            </div>
          )}

          {contactRows.map((row, idx) => (
            <div className="pf-hero-contact-row" key={idx}>
              {row}
            </div>
          ))}

          {chips.length > 0 && (
            <div className="pf-hero-chips">
              {chips.map((chip, idx) => (
                <span key={idx} className="pf-chip">{chip}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pf-hero-stats">
        <div className="pf-stat-card">
          <div className="pf-stat-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div className="pf-stat-text">
            <div className="pf-stat-value">{accountStatus || 'Loading...'}</div>
            <div className="pf-stat-label">Account Status</div>
          </div>
        </div>
        
        <div className="pf-stat-card">
          <div className="pf-stat-icon-wrap pf-stat-progress">
             <svg viewBox="0 0 36 36" className="pf-circular-chart pf-red">
               <path className="pf-circle-bg"
                 d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
               />
               <path className="pf-circle"
                 strokeDasharray={`${completionPct}, 100`}
                 d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
               />
             </svg>
             <span className="pf-progress-text">{completionPct}%</span>
          </div>
          <div className="pf-stat-text">
            <div className="pf-stat-value">Completion</div>
            <div className="pf-stat-label">
               {completionHints ? completionHints : 'Profile updated'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileHero;
