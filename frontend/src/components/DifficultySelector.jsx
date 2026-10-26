import React, { useState } from 'react';
import sounds from '../utils/soundEffects';
import { CASUAL_DIFFICULTIES, GAME_DIFFICULTIES } from '../utils/gameConfig';

const DifficultySelector = ({ selectedDifficulty, onSelectDifficulty, disabled = false }) => {
  const [showMoreDifficulties, setShowMoreDifficulties] = useState(false);

  const displayList = showMoreDifficulties
    ? [...CASUAL_DIFFICULTIES, GAME_DIFFICULTIES.EXPERT]
    : CASUAL_DIFFICULTIES;

  return (
    <div>
      <div className="row g-3 justify-content-center">
        {displayList.map((d) => {
          const isSelected = selectedDifficulty === d.id;
          return (
            <div key={d.id} className="col-12 col-md-4">
              <div
                className={`card h-100 cursor-pointer difficulty-card border-2 transition-all rounded-4 shadow-sm ${
                  isSelected
                    ? 'border-primary bg-primary-subtle shadow-md ring-2 ring-primary'
                    : 'border-secondary-subtle bg-body hover-lift'
                } ${disabled ? 'opacity-50 pe-none' : ''}`}
                onClick={() => {
                  if (!disabled) {
                    sounds.playClick();
                    onSelectDifficulty(d.id);
                  }
                }}
                style={{
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  borderWidth: isSelected ? '2px' : '1px'
                }}
              >
                <div className="card-body d-flex flex-column text-center p-3 p-xl-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className={`badge ${d.badgeClass} rounded-pill px-3 py-1.5 fw-bold`}>
                      <i className={`bi ${d.icon} me-1`}></i> {d.name}
                    </span>
                    <span className="badge bg-secondary-subtle text-secondary font-monospace">
                      {d.tag}
                    </span>
                  </div>

                  <div className="my-3 py-2 bg-body-tertiary rounded-3 border border-secondary-subtle">
                    <span className="text-muted small d-block fw-semibold text-uppercase">Guess Range</span>
                    <div className="display-6 fw-black text-primary font-monospace">
                      {d.min} – {d.max}
                    </div>
                    <span className="badge bg-dark-subtle text-body rounded-pill px-3 py-1 mt-1 small">
                      <i className="bi bi-heart-fill text-danger me-1"></i> {d.attempts} Attempts
                    </span>
                  </div>

                  <p className="card-text small text-secondary mt-auto mb-3">
                    {d.description}
                  </p>

                  <button
                    type="button"
                    className={`btn btn-sm w-100 rounded-pill fw-bold py-2 ${
                      isSelected ? 'btn-primary shadow-sm' : 'btn-outline-primary'
                    }`}
                  >
                    {isSelected ? '✓ Selected' : `Play ${d.name}`}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-3">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setShowMoreDifficulties(!showMoreDifficulties);
          }}
          className="btn btn-link btn-sm text-decoration-none text-muted"
        >
          {showMoreDifficulties ? '▲ Show standard 3 casual options' : '▼ Need a bigger challenge? Show Expert (1–1000)'}
        </button>
      </div>
    </div>
  );
};

export const difficulties = CASUAL_DIFFICULTIES;
export default DifficultySelector;
