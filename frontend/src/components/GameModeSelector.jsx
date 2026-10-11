import React from 'react';
import sounds from '../utils/soundEffects';

export const GAME_MODES = [
  {
    id: 'CLASSIC',
    title: 'Classic Guess',
    tag: 'Standard',
    icon: 'bi-bullseye',
    colorClass: 'text-primary',
    bgBadge: 'bg-primary-subtle text-primary border-primary-subtle',
    cardBorder: 'border-primary',
    description: 'Traditional deduction with precise Higher and Lower directional clues.',
    highlight: 'Balanced gameplay & classic rules',
    multiplier: '1.0x',
  },
  {
    id: 'HOT_COLD',
    title: 'Hot or Cold',
    tag: 'Heat Radar',
    icon: 'bi-fire',
    colorClass: 'text-danger',
    bgBadge: 'bg-danger-subtle text-danger border-danger-subtle',
    cardBorder: 'border-danger',
    description: 'Dynamic temperature feedback! Boiling 🔥 when close, Freezing 🧊 when far.',
    highlight: 'Animated proximity heat gauge',
    multiplier: '1.0x',
  },
  {
    id: 'TIME_ATTACK',
    title: 'Blitz Time Attack',
    tag: 'Speed Run',
    icon: 'bi-lightning-charge-fill',
    colorClass: 'text-warning',
    bgBadge: 'bg-warning-subtle text-warning-emphasis border-warning-subtle',
    cardBorder: 'border-warning',
    description: '45-second high-speed blitz! Quick deduction earns massive speed bonuses.',
    highlight: '45s countdown clock & +50% score bonus',
    multiplier: '1.5x',
  },
  {
    id: 'DETECTIVE',
    title: 'Number Detective',
    tag: 'Math Secrets',
    icon: 'bi-search-heart-fill',
    colorClass: 'text-info',
    bgBadge: 'bg-info-subtle text-info-emphasis border-info-subtle',
    cardBorder: 'border-info',
    description: 'Unlocks secret math dossiers: Odd/Even, divisibility, digit sums, and primes.',
    highlight: 'Deductive clues dossier & +30% bonus',
    multiplier: '1.3x',
  },
  {
    id: 'HARDCORE',
    title: 'Sudden Death',
    tag: 'High Stakes',
    icon: 'bi-skull-fill',
    colorClass: 'text-danger',
    bgBadge: 'bg-dark text-white border-dark',
    cardBorder: 'border-danger',
    description: 'Extremely limited attempts (only 1-3 tries). One wrong move and you are out.',
    highlight: 'Ruthless attempts & 3.0x Jackpot Multiplier',
    multiplier: '3.0x',
  },
];

const GameModeSelector = ({ selectedMode = 'CLASSIC', onSelectMode, disabled = false }) => {
  return (
    <div className="row g-3">
      {GAME_MODES.map((mode) => {
        const isSelected = selectedMode === mode.id;
        return (
          <div key={mode.id} className="col-12 col-md-6 col-lg">
            <div
              className={`card h-100 cursor-pointer mode-card transition-all ${
                isSelected
                  ? `${mode.cardBorder} shadow-lg border-2 selected-mode-glow`
                  : 'border-secondary-subtle'
              } ${disabled ? 'opacity-50 pe-none' : ''}`}
              onClick={() => {
                if (!disabled) {
                  sounds.playClick();
                  onSelectMode(mode.id);
                }
              }}
              style={{
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: isSelected ? 'translateY(-4px)' : 'none',
              }}
            >
              <div className="card-body d-flex flex-column p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className={`badge border rounded-pill px-2.5 py-1 ${mode.bgBadge}`}>
                    <i className={`bi ${mode.icon} me-1`}></i> {mode.tag}
                  </span>
                  <span className="badge bg-secondary-subtle text-body-secondary font-monospace small">
                    {mode.multiplier}
                  </span>
                </div>

                <div className="d-flex align-items-center gap-2 my-2">
                  <i className={`bi ${mode.icon} fs-4 ${mode.colorClass}`}></i>
                  <h6 className="fw-bold mb-0 text-truncate">{mode.title}</h6>
                </div>

                <p className="card-text small text-secondary mb-2" style={{ minHeight: '40px' }}>
                  {mode.description}
                </p>

                <div className="small fw-semibold text-primary mb-3 mt-auto">
                  <i className="bi bi-stars me-1 text-warning"></i>
                  {mode.highlight}
                </div>

                <button
                  type="button"
                  className={`btn btn-sm w-100 rounded-pill ${
                    isSelected ? 'btn-primary shadow-sm' : 'btn-outline-secondary'
                  }`}
                  disabled={disabled}
                >
                  {isSelected ? (
                    <span>
                      <i className="bi bi-check-circle-fill me-1"></i> Mode Active
                    </span>
                  ) : (
                    'Choose Mode'
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GameModeSelector;
