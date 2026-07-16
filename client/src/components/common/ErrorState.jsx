import React from 'react';

/**
 * Reusable ErrorState component for displaying a stylized error view.
 * Uses CSS classes from Profile.css scoped under .profile-theme-scope.
 * 
 * @param {Object} props
 * @param {string} [props.message="Could not load details. Please try reloading."]
 * @param {Function} [props.onRetry]
 */
function ErrorState({ message = 'Could not load details. Please try reloading.', onRetry }) {
  return (
    <div className="profile-page-error">
      <p className="body-lg">{message}</p>
      {onRetry && (
        <button className="cta-button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export default ErrorState;
