import React from 'react';

/**
 * Reusable LoadingState component for displaying a stylized loading spinner.
 * Uses CSS classes from Profile.css scoped under .profile-theme-scope.
 * 
 * @param {Object} props
 * @param {string} [props.message="Loading..."]
 */
function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="profile-page-loading">
      <div className="loading-spinner"></div>
      <p className="body-md">{message}</p>
    </div>
  );
}

export default LoadingState;
