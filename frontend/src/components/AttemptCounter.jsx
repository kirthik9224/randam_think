import React from 'react';

const AttemptCounter = ({ attemptsUsed = 0, attemptsAllowed = 7 }) => {
  const attemptsRemaining = Math.max(0, attemptsAllowed - attemptsUsed);
  const percentage = Math.round(((attemptsAllowed - attemptsUsed) / attemptsAllowed) * 100);

  const getProgressBarColor = () => {
    if (percentage > 50) return 'bg-success';
    if (percentage > 25) return 'bg-warning';
    return 'bg-danger';
  };

  return (
    <div className="card shadow-sm border-0 bg-body-tertiary">
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="small text-muted fw-semibold">Attempts Remaining</span>
          <span className={`badge ${attemptsRemaining <= 2 ? 'bg-danger animate-bounce' : 'bg-primary'} rounded-pill px-3 py-1.5`}>
            {attemptsRemaining} / {attemptsAllowed}
          </span>
        </div>

        <div className="progress" style={{ height: '10px' }} role="progressbar" aria-valuenow={percentage} aria-valuemin="0" aria-valuemax="100">
          <div
            className={`progress-bar progress-bar-striped progress-bar-animated ${getProgressBarColor()}`}
            style={{ width: `${percentage}%`, transition: 'width 0.4s ease' }}
          ></div>
        </div>

        <div className="d-flex justify-content-between mt-2 pt-1">
          {Array.from({ length: attemptsAllowed }).map((_, i) => {
            const isUsed = i < attemptsUsed;
            return (
              <span
                key={i}
                className={`attempt-dot rounded-circle ${isUsed ? 'bg-secondary-subtle border' : 'bg-success'}`}
                style={{ width: '10px', height: '10px', display: 'inline-block' }}
                title={`Attempt ${i + 1}: ${isUsed ? 'Used' : 'Available'}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AttemptCounter;
