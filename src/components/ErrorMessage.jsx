import React from 'react';

const ErrorMessage = ({
  message,
  title = 'Something went wrong',
  onRetry,
  onDismiss,
  className = ''
}) => {
  if (!message) return null;

  return (
    <div className={`alert-banner alert-banner-error ${className}`} role="alert">
      <div className="alert-banner-icon" aria-hidden="true">⚠️</div>
      <div className="alert-banner-body">
        {title && <h4 className="alert-banner-title">{title}</h4>}
        <p className="alert-banner-text">{message}</p>
      </div>
      <div className="alert-banner-actions">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="btn btn-xs btn-outline-danger"
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="alert-close-btn"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
