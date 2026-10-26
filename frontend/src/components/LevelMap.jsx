import React from 'react';
import sounds from '../utils/soundEffects';
import { getAllLevelsWithStatus, getLevelProgression } from '../utils/levelProgression';

const LevelMap = ({ onSelectLevel, currentActiveLevel = 1 }) => {
  const levels = getAllLevelsWithStatus();
  const progress = getLevelProgression();

  const handleLevelClick = (lvl) => {
    if (!lvl.isUnlocked) {
      sounds.playClick();
      return;
    }
    sounds.playClick();
    if (onSelectLevel) {
      onSelectLevel(lvl.level);
    }
  };

  return (
    <div className="level-map-container my-3">
      {/* Level Progress Stats Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 px-2">
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-warning text-dark px-3 py-1.5 rounded-pill fw-bold font-monospace fs-6 shadow-xs">
            ⭐ {progress.totalStars} Stars Earned
          </span>
          <span className="text-secondary small fw-semibold">
            Level {progress.unlockedLevel} of {levels.length} Unlocked
          </span>
        </div>
        <div className="text-muted small">
          Tap any unlocked level to play!
        </div>
      </div>

      {/* Grid of Level Nodes */}
      <div className="row g-3 justify-content-center">
        {levels.map((lvl) => {
          const isCompleted = lvl.status === 'COMPLETED';
          const isCurrent = lvl.status === 'CURRENT' || lvl.level === currentActiveLevel;
          const isLocked = lvl.status === 'LOCKED';

          return (
            <div key={lvl.level} className="col-6 col-sm-4 col-md-3">
              <div
                onClick={() => handleLevelClick(lvl)}
                className={`card h-100 rounded-4 text-center p-3 transition-all level-node-card ${
                  isLocked
                    ? 'bg-body-secondary text-secondary opacity-60 pe-none border-secondary-subtle'
                    : isCurrent
                    ? 'border-primary bg-primary-subtle shadow-md ring-4 ring-primary cursor-pointer hover-scale'
                    : 'border-success-subtle bg-body shadow-sm cursor-pointer hover-lift'
                }`}
                style={{
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  borderWidth: isCurrent ? '2px' : '1px',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {/* Node Status Badge */}
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="badge bg-body-tertiary text-body border rounded-pill small font-monospace">
                    Lvl {lvl.level}
                  </span>
                  {isCompleted ? (
                    <span className="badge bg-success-subtle text-success rounded-pill px-2 py-0.5 small">
                      <i className="bi bi-check-circle-fill me-1"></i> Won
                    </span>
                  ) : isCurrent ? (
                    <span className="badge bg-primary text-white rounded-pill px-2 py-0.5 small animate-pulse">
                      ▶ Play
                    </span>
                  ) : (
                    <span className="badge bg-secondary-subtle text-secondary rounded-pill px-2 py-0.5 small">
                      <i className="bi bi-lock-fill"></i>
                    </span>
                  )}
                </div>

                {/* Level Circle Icon */}
                <div className="my-2">
                  <div
                    className={`rounded-circle mx-auto d-flex align-items-center justify-content-center shadow-xs ${
                      isLocked
                        ? 'bg-secondary-subtle text-secondary'
                        : isCurrent
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-success text-white'
                    }`}
                    style={{ width: '48px', height: '48px', fontSize: '1.25rem' }}
                  >
                    {isLocked ? (
                      <i className="bi bi-lock-fill"></i>
                    ) : isCurrent ? (
                      <i className="bi bi-play-fill fs-3"></i>
                    ) : (
                      <i className="bi bi-star-fill text-warning"></i>
                    )}
                  </div>
                </div>

                {/* Level Range & Attempts */}
                <div className="fw-black text-body fs-5 font-monospace mb-0">
                  {lvl.min} – {lvl.max}
                </div>
                <div className="text-muted small mb-2" style={{ fontSize: '0.75rem' }}>
                  {lvl.attempts} attempts
                </div>

                {/* Stars earned for this level */}
                <div className="mt-auto pt-1">
                  {isCompleted ? (
                    <div className="text-warning small" title={`${lvl.stars} Stars`}>
                      {lvl.stars === 3 ? '⭐⭐⭐' : lvl.stars === 2 ? '⭐⭐' : '⭐'}
                    </div>
                  ) : isCurrent ? (
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill small w-100 py-1">
                      Ready!
                    </span>
                  ) : (
                    <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                      Locked
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LevelMap;
