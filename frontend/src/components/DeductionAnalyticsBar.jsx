import React from 'react';

const DeductionAnalyticsBar = ({
  minNumber = 1,
  maxNumber = 100,
  currentMin = 1,
  currentMax = 100,
  guesses = [],
  comboCount = 1,
}) => {
  const totalPool = Math.max(1, maxNumber - minNumber + 1);
  const remainingPool = Math.max(1, currentMax - currentMin + 1);
  const eliminatedPool = Math.max(0, totalPool - remainingPool);
  const percentEliminated = Math.min(100, Math.max(0, (eliminatedPool / totalPool) * 100)).toFixed(1);

  // Compute efficiency rating of latest move
  const getEfficiencyRating = () => {
    if (guesses.length === 0) return { label: 'Awaiting First Move', color: 'text-muted', badge: 'bg-secondary' };
    const latest = guesses[0];
    if (latest.result === 'CORRECT') {
      return { label: 'CRITICAL BULLSEYE! 🎯', color: 'text-success', badge: 'bg-success' };
    }
    if (comboCount >= 3) {
      return { label: `GODLIKE DEDUCTION! 🔥 (x${comboCount} Combo)`, color: 'text-warning', badge: 'bg-warning text-dark' };
    }
    if (comboCount === 2) {
      return { label: 'PRECISION SPLIT! ⚡ (x2 Combo)', color: 'text-primary', badge: 'bg-primary' };
    }
    return { label: 'TACTICAL PROBE 🔍', color: 'text-info', badge: 'bg-info text-dark' };
  };

  const rating = getEfficiencyRating();

  return (
    <div className="deduction-analytics-card card border-0 shadow-sm rounded-4 p-3 mb-4 bg-body">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
        <div className="d-flex align-items-center gap-2">
          <span className="fs-5">🧠</span>
          <div>
            <div className="fw-bold small mb-0 d-flex align-items-center gap-2">
              <span>Deduction Analytics</span>
              <span className={`badge rounded-pill px-2 py-0.5 font-monospace ${rating.badge}`} style={{ fontSize: '0.68rem' }}>
                {rating.label}
              </span>
            </div>
            <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
              Elimination speed & uncertainty reduction
            </div>
          </div>
        </div>

        {/* Combo Multiplier Flame Pill */}
        {comboCount > 1 && (
          <div className="badge bg-warning text-dark border border-warning shadow-sm rounded-pill px-3 py-1 font-monospace fw-bold animate-pulse d-flex align-items-center gap-1">
            <span>🔥</span>
            <span>{comboCount}x DEDUCTION COMBO!</span>
          </div>
        )}
      </div>

      {/* Visual Elimination Meter */}
      <div className="mb-2">
        <div className="d-flex justify-content-between align-items-center small font-monospace mb-1">
          <span className="text-muted">
            Possibilities Eliminated: <strong className="text-primary">{eliminatedPool}</strong> / {totalPool}
          </span>
          <span className="fw-bold text-success font-monospace fs-6">
            {percentEliminated}% CLEARED
          </span>
        </div>
        <div className="progress rounded-pill overflow-hidden" style={{ height: '8px', background: '#e2e8f0' }}>
          <div
            className="progress-bar progress-bar-striped progress-bar-animated bg-success"
            style={{
              width: `${percentEliminated}%`,
              transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          ></div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="row g-2 text-center pt-1">
        <div className="col-4">
          <div className="p-1.5 rounded-3 bg-body-tertiary border">
            <div className="text-muted font-monospace" style={{ fontSize: '0.65rem' }}>UNCERTAINTY POOL</div>
            <div className="fw-bold text-dark font-monospace" style={{ fontSize: '0.9rem' }}>
              {remainingPool} numbers
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="p-1.5 rounded-3 bg-body-tertiary border">
            <div className="text-muted font-monospace" style={{ fontSize: '0.65rem' }}>ICE WALL LOCK</div>
            <div className="fw-bold text-info font-monospace" style={{ fontSize: '0.9rem' }}>
              ≥ {currentMin}
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="p-1.5 rounded-3 bg-body-tertiary border">
            <div className="text-muted font-monospace" style={{ fontSize: '0.65rem' }}>FIRE WALL CEILING</div>
            <div className="fw-bold text-danger font-monospace" style={{ fontSize: '0.9rem' }}>
              ≤ {currentMax}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeductionAnalyticsBar;
