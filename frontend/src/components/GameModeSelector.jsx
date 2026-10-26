import React, { useState } from 'react';
import sounds from '../utils/soundEffects';

export const GAME_MODES = [
  {
    id: 'CLASSIC',
    title: 'Classic Guess',
    tag: 'Default Casual',
    icon: 'bi-bullseye',
    colorClass: 'text-primary',
    bgBadge: 'bg-primary-subtle text-primary border-primary-subtle',
    cardBorder: 'border-primary',
    description: 'Traditional number guessing with friendly Higher & Lower clues. Clean, simple & fun!',
  },
  {
    id: 'HOT_COLD',
    title: 'Hot or Cold',
    tag: 'Fun Radar',
    icon: 'bi-fire',
    colorClass: 'text-danger',
    bgBadge: 'bg-danger-subtle text-danger border-danger-subtle',
    cardBorder: 'border-danger',
    description: 'Tells you if you are getting warmer 🔥 or colder 🧊 relative to the number!',
  },
  {
    id: 'TIME_ATTACK',
    title: 'Time Attack',
    tag: 'Speed Challenge',
    icon: 'bi-lightning-charge-fill',
    colorClass: 'text-warning',
    bgBadge: 'bg-warning-subtle text-warning-emphasis border-warning-subtle',
    cardBorder: 'border-warning',
    description: '45-second timer for fast thinkers! Extra points for quick guesses.',
  },
  {
    id: 'DETECTIVE',
    title: 'Number Detective',
    tag: 'Math Clues',
    icon: 'bi-search',
    colorClass: 'text-info',
    bgBadge: 'bg-info-subtle text-info-emphasis border-info-subtle',
    cardBorder: 'border-info',
    description: 'Reveals extra hints like even/odd and sum of digits after each guess.',
  },
  {
    id: 'HARDCORE',
    title: 'Sudden Death',
    tag: 'Expert Only',
    icon: 'bi-skull-fill',
    colorClass: 'text-danger',
    bgBadge: 'bg-danger text-white',
    cardBorder: 'border-danger',
    description: 'Only 3 attempts allowed with strict scoring penalties.',
  },
];

const GameModeSelector = ({ selectedMode = 'CLASSIC', onSelectMode, disabled = false }) => {
  const [showMoreModes, setShowMoreModes] = useState(selectedMode !== 'CLASSIC');

  const classicMode = GAME_MODES[0];
  const moreModes = GAME_MODES.slice(1);

  return (
    <div>
      {/* Primary Classic Mode Card */}
      <div
        className={`card cursor-pointer rounded-4 shadow-sm transition-all mb-2 ${
          selectedMode === 'CLASSIC'
            ? 'border-primary border-2 bg-primary-subtle'
            : 'border-secondary-subtle bg-body'
        } ${disabled ? 'opacity-50 pe-none' : ''}`}
        onClick={() => {
          if (!disabled) {
            sounds.playClick();
            onSelectMode('CLASSIC');
          }
        }}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer', borderWidth: selectedMode === 'CLASSIC' ? '2px' : '1px' }}
      >
        <div className="card-body p-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle bg-primary text-white p-2.5 d-flex align-items-center justify-content-center" style={{ width: '44px', height: '44px' }}>
              <i className="bi bi-bullseye fs-5"></i>
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h6 className="fw-bold mb-0">{classicMode.title}</h6>
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill small">
                  Recommended for everyone
                </span>
              </div>
              <p className="text-secondary small mb-0 mt-0.5">{classicMode.description}</p>
            </div>
          </div>
          <span className={`badge rounded-pill px-3 py-1.5 fw-semibold ${selectedMode === 'CLASSIC' ? 'bg-primary text-white' : 'bg-secondary-subtle text-secondary'}`}>
            {selectedMode === 'CLASSIC' ? '✓ Selected' : 'Select'}
          </span>
        </div>
      </div>

      {/* More Game Modes Accordion / Toggle */}
      <div className="text-center mt-2">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setShowMoreModes(!showMoreModes);
          }}
          className="btn btn-link btn-sm text-decoration-none text-muted"
        >
          {showMoreModes ? '▲ Hide Extra Game Variations' : '▼ More Modes: Hot & Cold, Time Attack, Detective'}
        </button>

        {showMoreModes && (
          <div className="row g-2 mt-2 pt-2 border-top text-start">
            {moreModes.map((m) => {
              const isSelected = selectedMode === m.id;
              return (
                <div key={m.id} className="col-12 col-sm-6">
                  <div
                    className={`card h-100 p-2.5 rounded-3 cursor-pointer ${
                      isSelected ? 'border-primary bg-primary-subtle border-2' : 'border-secondary-subtle bg-body'
                    }`}
                    onClick={() => {
                      if (!disabled) {
                        sounds.playClick();
                        onSelectMode(m.id);
                      }
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="fw-bold small">
                        <i className={`bi ${m.icon} me-1 ${m.colorClass}`}></i> {m.title}
                      </span>
                      <span className="badge bg-secondary-subtle text-secondary small font-monospace" style={{ fontSize: '0.7rem' }}>
                        {m.tag}
                      </span>
                    </div>
                    <p className="text-muted small mb-0 mt-1" style={{ fontSize: '0.78rem' }}>
                      {m.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameModeSelector;
