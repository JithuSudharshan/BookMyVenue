import React from 'react';
import ProfileHero from './ProfileHero';
import '../../user/Profile/Profile.css';

const BaseProfilePage = ({
  loading,
  loadingMessage = 'Loading profile...',
  error,
  errorMessage = 'Could not load profile details. Please try reloading.',
  onRetry,
  toasts = [],
  pageTitle,
  pageSubtitle,
  avatarComponent,
  heroTitle,
  heroSubtitle,
  badges = [],
  chips = [],
  completionPct = 0,
  completionHints = '',
  accountStatus,
  children
}) => {
  if (loading) {
    return (
      <div className="pf-scope">
        <div className="pf-state-center">
          <div className="pf-loader" />
          <p className="pf-state-msg">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pf-scope">
        <div className="pf-state-center">
          <p className="pf-state-title">Something went wrong</p>
          <p className="pf-state-msg">{errorMessage}</p>
          {onRetry && (
            <button className="pf-edit-primary" onClick={onRetry}>
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pf-scope">
      {/* Toast Notifications */}
      {toasts && toasts.length > 0 && (
        <div className="pf-toast-container">
          {toasts.map((t) => (
            <div key={t.id} className={`pf-toast ${t.type}`}>
              {t.type === 'success' ? '✓' : '✕'} {t.message}
            </div>
          ))}
        </div>
      )}

      <div className="pf-page">
        {/* Page Header */}
        <div className="pf-page-header">
          <div>
            <h1 className="pf-page-title">{pageTitle}</h1>
            <p className="pf-page-subtitle">{pageSubtitle}</p>
          </div>
        </div>

        {/* Hero card */}
        <ProfileHero
          avatarComponent={avatarComponent}
          title={heroTitle}
          subtitle={heroSubtitle}
          badges={badges}
          chips={chips}
          completionPct={completionPct}
          completionHints={completionHints}
          accountStatus={accountStatus}
        />

        {/* Section-level view/edit */}
        {children}
      </div>
    </div>
  );
};

export default BaseProfilePage;
