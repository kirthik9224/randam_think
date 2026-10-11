import React from 'react';
import sounds from '../utils/soundEffects';

const PowerUpsBar = ({
  powerUps = { slice50: true, oracle: true, shield: true, empFreeze: true },
  onUsePowerUp,
  disabled = false,
  isAiMatch = false,
  oracleClue = null,
  onDismissOracle,
}) => {
  const handleTrigger = (type) => {
    if (disabled || !powerUps[type]) return;
    if (type === 'slice50') sounds.playLaserSlice();
    else if (type === 'oracle') sounds.playPowerUp();
    else if (type === 'shield') sounds.playShield();
    else if (type === 'empFreeze') sounds.playEmpGlitch();
    else sounds.playClick();

    if (onUsePowerUp) {
      onUsePowerUp(type);
    }
  };

  const powerUpConfigs = [
    {
      id: 'slice50',
      title: '50/50 Slicer',
      icon: '⚡',
      badge: 'Quantum Cut',
      color: 'warning',
      description: 'Obliterates half of the remaining false candidate numbers.',
      available: powerUps.slice50,
      visible: true,
    },
    {
      id: 'oracle',
      title: "Oracle's Whisper",
      icon: '🔮',
      badge: 'Math Clue',
      color: 'info',
      description: 'Reveals mathematical parity, divisibility, or digit properties.',
      available: powerUps.oracle,
      visible: true,
    },
    {
      id: 'shield',
      title: 'Second Chance',
      icon: '🛡️',
      badge: '+1 Attempt',
      color: 'success',
      description: 'Grants 1 extra emergency attempt to keep your run alive.',
      available: powerUps.shield,
      visible: true,
    },
    {
      id: 'empFreeze',
      title: 'Turn Freeze',
      icon: '⏸️',
      badge: 'Skip Rival Turn',
      color: 'danger',
      description: "Freezes the opponent's turn, forcing them to forfeit their next move.",
      available: powerUps.empFreeze,
      visible: isAiMatch,
    },
  ];

  return (
    <div className="thinkers-toolbox card border-0 shadow-sm rounded-4 p-3 mb-4 bg-body">
      <div className="d-flex justify-content-between align-items-center mb-2.5">
        <div className="d-flex align-items-center gap-2">
          <span className="fs-5">🧰</span>
          <div>
            <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
              <span>Thinker's Tactical Toolbox</span>
              <span className="badge bg-primary text-white rounded-pill px-2 py-0.5 small" style={{ fontSize: '0.68rem' }}>
                Single-use per match
              </span>
            </h6>
            <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
              Deploy tactical power-ups to alter game probabilities
            </div>
          </div>
        </div>
      </div>

      {/* Power-Up Action Buttons */}
      <div className="row g-2">
        {powerUpConfigs
          .filter((p) => p.visible)
          .map((item) => {
            const isReady = item.available && !disabled;
            return (
              <div key={item.id} className="col-6 col-md-3">
                <button
                  type="button"
                  onClick={() => handleTrigger(item.id)}
                  disabled={!isReady}
                  className={`btn w-100 p-2.5 rounded-4 text-start position-relative transition-all border ${
                    isReady
                      ? `btn-outline-${item.color} power-up-btn-active bg-body`
                      : 'btn-outline-secondary opacity-50 bg-body-tertiary cursor-not-allowed'
                  }`}
                  style={{ minHeight: '82px' }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <span className="fs-5">{item.icon}</span>
                    <span
                      className={`badge rounded-pill px-2 py-0.5 font-monospace ${
                        isReady ? `bg-${item.color} text-white` : 'bg-secondary text-white'
                      }`}
                      style={{ fontSize: '0.62rem' }}
                    >
                      {isReady ? item.badge : 'DEPLETED'}
                    </span>
                  </div>

                  <div className="fw-bold small text-truncate" style={{ fontSize: '0.82rem' }}>
                    {item.title}
                  </div>
                  <div
                    className="text-muted text-truncate"
                    style={{ fontSize: '0.68rem' }}
                    title={item.description}
                  >
                    {item.description}
                  </div>
                </button>
              </div>
            );
          })}
      </div>

      {/* Floating Oracle Clue Alert */}
      {oracleClue && (
        <div className="alert alert-info border-info-subtle rounded-4 p-3 mt-3 mb-0 d-flex align-items-center justify-content-between shadow-sm animate-pop-in">
          <div className="d-flex align-items-center gap-2">
            <span className="fs-4">🔮</span>
            <div>
              <strong className="d-block small text-info-emphasis">ORACLE'S WHISPER REVEALED:</strong>
              <span className="fw-bold text-dark font-monospace">{oracleClue}</span>
            </div>
          </div>
          {onDismissOracle && (
            <button
              type="button"
              className="btn-close btn-sm"
              onClick={onDismissOracle}
              aria-label="Close"
            ></button>
          )}
        </div>
      )}
    </div>
  );
};

export default PowerUpsBar;
