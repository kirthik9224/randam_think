import React from 'react';
import sounds from '../utils/soundEffects';

const difficulties = [
  {
    id: 'EASY',
    name: 'Easy',
    range: '1 – 50',
    attempts: 10,
    multiplier: '1x',
    baseScore: 1000,
    badgeClass: 'bg-success',
    cardBorder: 'border-success',
    icon: 'bi-emoji-smile',
    description: 'Perfect for beginners & casual warmups.'
  },
  {
    id: 'MEDIUM',
    name: 'Medium',
    range: '1 – 100',
    attempts: 7,
    multiplier: '2x',
    baseScore: 2500,
    badgeClass: 'bg-primary',
    cardBorder: 'border-primary',
    icon: 'bi-lightning-charge',
    description: 'The standard classic number challenge.'
  },
  {
    id: 'HARD',
    name: 'Hard',
    range: '1 – 500',
    attempts: 5,
    multiplier: '4x',
    baseScore: 5000,
    badgeClass: 'bg-warning text-dark',
    cardBorder: 'border-warning',
    icon: 'bi-fire',
    description: 'Wide range, narrow attempts. For thinkers.'
  },
  {
    id: 'EXPERT',
    name: 'Expert',
    range: '1 – 1000',
    attempts: 3,
    multiplier: '8x',
    baseScore: 10000,
    badgeClass: 'bg-danger',
    cardBorder: 'border-danger',
    icon: 'bi-stars',
    description: '3 shots for 1,000 possibilities. High stakes.'
  },
];

const DifficultySelector = ({ selectedDifficulty, onSelectDifficulty, disabled = false }) => {
  return (
    <div className="row g-3">
      {difficulties.map((d) => {
        const isSelected = selectedDifficulty === d.id;
        return (
          <div key={d.id} className="col-12 col-sm-6 col-lg-3">
            <div
              className={`card h-100 cursor-pointer difficulty-card transition-all ${
                isSelected ? `${d.cardBorder} shadow-lg border-2 selected-glow` : 'border-secondary-subtle'
              } ${disabled ? 'opacity-50 pe-none' : ''}`}
              onClick={() => {
                if (!disabled) {
                  sounds.playClick();
                  onSelectDifficulty(d.id);
                }
              }}
              style={{ cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.25s ease' }}
            >
              <div className="card-body d-flex flex-column text-center p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className={`badge ${d.badgeClass} rounded-pill px-2.5 py-1`}>
                    <i className={`bi ${d.icon} me-1`}></i> {d.name}
                  </span>
                  <span className="badge bg-secondary-subtle text-body-secondary font-monospace">
                    {d.multiplier}
                  </span>
                </div>

                <div className="my-3 py-1">
                  <div className="display-6 fw-bold text-primary font-monospace mb-1">
                    {d.attempts}
                  </div>
                  <span className="badge bg-secondary-subtle text-body-secondary rounded-pill px-3 py-1">
                    <i className="bi bi-bullseye text-danger me-1"></i> Max Attempts
                  </span>
                </div>

                <p className="card-text small text-secondary mt-auto mb-3">
                  {d.description}
                </p>

                <button
                  type="button"
                  className={`btn btn-sm w-100 rounded-pill ${
                    isSelected ? 'btn-primary shadow-sm' : 'btn-outline-secondary'
                  }`}
                  disabled={disabled}
                >
                  {isSelected ? (
                    <span><i className="bi bi-check-circle-fill me-1"></i> Selected</span>
                  ) : (
                    'Select'
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

export { difficulties };
export default DifficultySelector;
