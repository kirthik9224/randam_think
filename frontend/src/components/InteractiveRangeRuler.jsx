import React, { useRef } from 'react';
import sounds from '../utils/soundEffects';

const InteractiveRangeRuler = ({
  minNumber = 1,
  maxNumber = 100,
  currentMin = 1,
  currentMax = 100,
  guesses = [],
  currentGuess = '',
  onSelectNumber,
  disabled = false,
}) => {
  const rulerRef = useRef(null);

  const safeMin = Number(minNumber) || 1;
  const safeMax = Number(maxNumber) || 100;
  const safeCurrMin = Math.max(safeMin, Number(currentMin) || safeMin);
  const safeCurrMax = Math.min(safeMax, Number(currentMax) || safeMax);
  const totalSpan = Math.max(1, safeMax - safeMin);

  const leftPercent = Math.max(0, Math.min(100, ((safeCurrMin - safeMin) / totalSpan) * 100));
  const rightPercent = Math.max(0, Math.min(100, ((safeMax - safeCurrMax) / totalSpan) * 100));
  const activeWidth = Math.max(0, 100 - leftPercent - rightPercent);

  const handleBarClick = (e) => {
    if (disabled || !onSelectNumber || !rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const ratio = clickX / rect.width;
    const selected = Math.round(safeMin + ratio * totalSpan);
    sounds.playTick();
    onSelectNumber(Math.max(safeMin, Math.min(safeMax, selected)));
  };

  return (
    <div className="range-ruler-container my-3">
      {/* Friendly summary header */}
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span className="small text-muted fw-semibold">
          <i className="bi bi-bullseye text-primary me-1"></i>
          Remaining window: <strong className="text-body fw-bold">{safeCurrMin} to {safeCurrMax}</strong>
        </span>
        <span className="badge bg-secondary-subtle text-secondary small font-monospace">
          {safeCurrMax - safeCurrMin + 1} possible numbers
        </span>
      </div>

      {/* Simplified visual track */}
      <div
        ref={rulerRef}
        className="position-relative rounded-pill shadow-inner overflow-hidden cursor-pointer"
        style={{
          height: '22px',
          background: 'rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.12)',
        }}
        onClick={handleBarClick}
        title="Tap to pick a number"
      >
        {/* Greyed out eliminated left section */}
        {leftPercent > 0 && (
          <div
            className="position-absolute h-100 bg-secondary opacity-25"
            style={{ left: 0, width: `${leftPercent}%` }}
          />
        )}

        {/* Active colored candidate window */}
        <div
          className="position-absolute h-100 bg-primary opacity-75 transition-all"
          style={{
            left: `${leftPercent}%`,
            width: `${activeWidth}%`,
            background: 'linear-gradient(90deg, #3b82f6, #10b981)',
          }}
        />

        {/* Greyed out eliminated right section */}
        {rightPercent > 0 && (
          <div
            className="position-absolute h-100 bg-secondary opacity-25"
            style={{ right: 0, width: `${rightPercent}%` }}
          />
        )}

        {/* Current guess pointer */}
        {currentGuess !== '' && !isNaN(Number(currentGuess)) && (
          <div
            className="position-absolute top-50 translate-middle-y d-flex align-items-center justify-content-center"
            style={{
              left: `${Math.max(0, Math.min(100, ((Number(currentGuess) - safeMin) / totalSpan) * 100))}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 3,
            }}
          >
            <span className="badge bg-dark text-white rounded-pill shadow-sm" style={{ fontSize: '0.75rem' }}>
              📍 {currentGuess}
            </span>
          </div>
        )}
      </div>

      {/* Min and Max limits */}
      <div className="d-flex justify-content-between text-muted small mt-1 font-monospace fw-bold">
        <span>{safeMin}</span>
        <span>{safeMax}</span>
      </div>
    </div>
  );
};

export default InteractiveRangeRuler;
