import React, { useState } from 'react';
import sounds from '../utils/soundEffects';

const CluesPanel = ({
  clues = [],
  onUnlockClue,
  loading = false,
  disabled = false,
  usedClueTypes = {},
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const availableClueButtons = [
    {
      id: 'parity',
      label: 'Parity Intel',
      icon: '🧩',
      desc: 'Reveals Even or Odd',
      badgeColor: 'primary',
    },
    {
      id: 'divisibility',
      label: 'Divisibility',
      icon: '🔢',
      desc: 'Factors & Prime check',
      badgeColor: 'info',
    },
    {
      id: 'digitsum',
      label: 'Digit Sum',
      icon: '🧮',
      desc: 'Sum of all digits',
      badgeColor: 'warning',
    },
    {
      id: 'lastdigit',
      label: 'Unit Digit',
      icon: '🎯',
      desc: 'The last number digit',
      badgeColor: 'success',
    },
    {
      id: 'rangebracket',
      label: 'Range Bracket',
      icon: '📐',
      desc: 'Lower or Upper half',
      badgeColor: 'danger',
    },
  ];

  const handleRequest = (type) => {
    if (disabled || loading || usedClueTypes[type]) return;
    sounds.playHint ? sounds.playHint() : sounds.playClick();
    if (onUnlockClue) {
      onUnlockClue(type);
    }
  };

  return (
    <div
      className="clues-intel-panel card border-0 rounded-4 shadow-sm mb-3 text-start overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.85), rgba(15, 23, 42, 0.9))',
        border: '1px solid rgba(139, 92, 246, 0.35)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Header Bar */}
      <div
        className="d-flex justify-content-between align-items-center px-3 py-2.5 border-bottom"
        style={{ borderColor: 'rgba(139, 92, 246, 0.25)' }}
      >
        <div className="d-flex align-items-center gap-2">
          <span className="fs-5">🕵️</span>
          <div>
            <span className="fw-black text-white small text-uppercase tracking-wider">
              Tactical Clues & Intel Dossier
            </span>
            <span className="badge rounded-pill bg-primary ms-2 px-2 py-0.5" style={{ fontSize: '0.65rem' }}>
              {clues.length} Intel Discovered
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="btn btn-sm btn-link text-white-50 text-decoration-none p-0"
        >
          {isOpen ? '▲ Minimize' : '▼ Expand'}
        </button>
      </div>

      {isOpen && (
        <div className="p-3">
          {/* Discovered Clues Feed */}
          {clues && clues.length > 0 ? (
            <div className="d-flex flex-column gap-2 mb-3">
              {clues.map((clueItem, idx) => {
                const text = typeof clueItem === 'string' ? clueItem : clueItem.text || clueItem.clue;
                const icon = typeof clueItem === 'object' && clueItem.icon ? clueItem.icon : '💡';
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-3 d-flex align-items-center gap-2.5 animate-pop-in"
                    style={{
                      background: 'rgba(139, 92, 246, 0.15)',
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                    }}
                  >
                    <span className="fs-5">{icon}</span>
                    <div className="flex-grow-1">
                      <div className="fw-bold text-white small font-monospace">{text}</div>
                    </div>
                    <span className="badge bg-purple bg-opacity-75 text-light small px-2 py-0.5" style={{ fontSize: '0.65rem' }}>
                      Verified
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-3 rounded-3 text-center mb-3 text-white-50 small" style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
              <span>🔍 No clues revealed yet. Submit guesses to unlock intel automatically, or request a clue below!</span>
            </div>
          )}

          {/* On-Demand Intel Action Buttons */}
          <div className="border-top pt-2.5" style={{ borderColor: 'rgba(139, 92, 246, 0.2)' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-white-50 fw-bold" style={{ fontSize: '0.72rem' }}>
                REQUEST SPECIFIC INTEL:
              </span>
              <span className="text-warning small" style={{ fontSize: '0.68rem' }}>
                Instant Deduction Assistance
              </span>
            </div>

            <div className="row g-1.5">
              {availableClueButtons.map((btn) => {
                const isUsed = Boolean(usedClueTypes[btn.id]);
                return (
                  <div key={btn.id} className="col-6 col-md">
                    <button
                      type="button"
                      onClick={() => handleRequest(btn.id)}
                      disabled={disabled || loading || isUsed}
                      className={`btn w-100 py-1.5 px-2 rounded-3 text-start d-flex flex-column transition-all ${
                        isUsed
                          ? 'btn-outline-secondary opacity-40 cursor-not-allowed'
                          : `btn-outline-${btn.badgeColor} bg-dark bg-opacity-25`
                      }`}
                      style={{ fontSize: '0.75rem' }}
                      title={btn.desc}
                    >
                      <div className="d-flex justify-content-between align-items-center w-100 mb-0.5">
                        <span>{btn.icon}</span>
                        <span
                          className={`badge rounded-pill px-1.5 py-0.2 ${
                            isUsed ? 'bg-secondary' : `bg-${btn.badgeColor}`
                          }`}
                          style={{ fontSize: '0.55rem' }}
                        >
                          {isUsed ? 'REVEALED' : 'ASK'}
                        </span>
                      </div>
                      <div className="fw-bold text-white text-truncate">{btn.label}</div>
                      <div className="text-white-50 text-truncate" style={{ fontSize: '0.62rem' }}>
                        {btn.desc}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CluesPanel;
