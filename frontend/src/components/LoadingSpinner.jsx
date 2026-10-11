import React from 'react';

const LoadingSpinner = ({ message = 'Loading...', fullScreen = false }) => {
  const content = (
    <div className="d-flex flex-column align-items-center justify-content-center p-4">
      <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3 text-muted fw-semibold">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-body">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
