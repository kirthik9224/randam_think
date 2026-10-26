import React from 'react';

const ErrorMessage = ({ message, onRetry, onDismiss }) => {
  if (!message) return null;

  const isServerNotice = message.includes('Could not reach backend server') || message.includes('offline');
  const isValidationNotice = message.includes('already guessed') || message.includes('between') || message.includes('valid number');

  const alertClass = isServerNotice
    ? 'alert-warning border-warning'
    : isValidationNotice
    ? 'alert-warning border-warning'
    : 'alert-danger border-danger';

  const iconClass = isServerNotice
    ? 'bi-wifi-off text-warning'
    : isValidationNotice
    ? 'bi-info-circle-fill text-warning'
    : 'bi-exclamation-triangle-fill text-danger';

  return (
    <div className={`alert ${alertClass} alert-dismissible fade show d-flex align-items-center justify-content-between shadow-sm my-3 rounded-4 px-3 py-2.5`} role="alert">
      <div className="d-flex align-items-center gap-2.5">
        <i className={`bi ${iconClass} fs-5`}></i>
        <div className="fw-medium text-break">{message}</div>
      </div>
      <div className="d-flex align-items-center gap-2 ms-2">
        {onRetry && (
          <button onClick={onRetry} className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1">
            <i className="bi bi-arrow-clockwise me-1"></i> Retry
          </button>
        )}
        {onDismiss && (
          <button type="button" className="btn-close" aria-label="Close" onClick={onDismiss}></button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
