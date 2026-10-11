import React from 'react';

const ErrorMessage = ({ message, onRetry, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center justify-content-between shadow-sm my-3 rounded-3" role="alert">
      <div className="d-flex align-items-center gap-2">
        <i className="bi bi-exclamation-triangle-fill text-danger fs-5"></i>
        <div>{message}</div>
      </div>
      <div className="d-flex align-items-center gap-2">
        {onRetry && (
          <button onClick={onRetry} className="btn btn-sm btn-outline-danger">
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
