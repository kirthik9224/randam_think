import React, { useState } from 'react';
import sounds from '../utils/soundEffects';

const InteractiveNumpad = ({
  currentGuess = '',
  onUpdateGuess,
  onSubmitGuess,
  currentMin = 1,
  currentMax = 100,
  minNumber = 1,
  maxNumber = 100,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleDigit = (digit) => {
    if (disabled) return;
    sounds.playTick();
    const currentStr = String(currentGuess || '');
    if (currentStr.length >= 7) return; // limit length
    const nextVal = currentStr + String(digit);
    if (onUpdateGuess) {
      onUpdateGuess(nextVal);
    }
  };

  const handleBackspace = () => {
    if (disabled) return;
    sounds.playTick();
    const currentStr = String(currentGuess || '');
    const nextVal = currentStr.slice(0, -1);
    if (onUpdateGuess) {
      onUpdateGuess(nextVal);
    }
  };

  const handleClear = () => {
    if (disabled) return;
    sounds.playClick();
    if (onUpdateGuess) {
      onUpdateGuess('');
    }
  };

  const handleSetExact = (val) => {
    if (disabled) return;
    sounds.playClick();
    const clamped = Math.max(minNumber, Math.min(maxNumber, Math.round(val)));
    if (onUpdateGuess) {
      onUpdateGuess(String(clamped));
    }
  };

  const handleRandomProbe = () => {
    if (disabled) return;
    sounds.playPowerUp();
    const span = Math.max(1, currentMax - currentMin);
    const randomVal = Math.floor(currentMin + Math.random() * (span + 1));
    handleSetExact(randomVal);
  };

  return (
    <div className="interactive-numpad card border-0 shadow-sm rounded-4 p-3 mb-3 bg-body-tertiary">
      {/* Header bar with toggle */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="d-flex align-items-center gap-2">
          <span className="fs-5">🎛️</span>
          <div>
            <span className="fw-bold small text-body font-monospace d-flex align-items-center gap-1.5">
              <span>Thinking Matrix Keypad</span>
              <span className="badge bg-primary-subtle text-primary border small" style={{ fontSize: '0.65rem' }}>
                Tactile Touch
              </span>
            </span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-sm btn-link text-decoration-none text-muted p-0 small font-monospace"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? '▲ Collapse' : '▼ Expand Keypad'}
        </button>
      </div>

      {isOpen && (
        <div className="animate-pop-in">
          {/* Tactical Probe Shortcut Row */}
          <div className="d-flex gap-1.5 mb-2 justify-content-center flex-wrap">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary rounded-pill px-2.5 py-1 font-monospace fw-bold small flex-fill"
              onClick={() => handleSetExact(Math.floor((currentMin + currentMax) / 2))}
              disabled={disabled}
              title="Set binary search midpoint"
            >
              🎯 Mid: {Math.floor((currentMin + currentMax) / 2)}
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-info rounded-pill px-2.5 py-1 font-monospace small flex-fill"
              onClick={() => handleSetExact(Math.floor(currentMin + 0.25 * (currentMax - currentMin)))}
              disabled={disabled}
              title="25% Quartile Scout"
            >
              ¼ Probe: {Math.floor(currentMin + 0.25 * (currentMax - currentMin))}
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-info rounded-pill px-2.5 py-1 font-monospace small flex-fill"
              onClick={() => handleSetExact(Math.floor(currentMin + 0.75 * (currentMax - currentMin)))}
              disabled={disabled}
              title="75% Quartile Scout"
            >
              ¾ Probe: {Math.floor(currentMin + 0.75 * (currentMax - currentMin))}
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-warning rounded-pill px-2.5 py-1 font-monospace small flex-fill"
              onClick={handleRandomProbe}
              disabled={disabled}
              title="Pick a random number inside active boundary"
            >
              🎲 Random Probe
            </button>
          </div>

          {/* Tactical 10-Key Digit Grid */}
          <div className="numpad-grid mx-auto" style={{ maxWidth: '300px' }}>
            <div className="row g-1.5 mb-1.5">
              {[1, 2, 3].map((n) => (
                <div key={n} className="col-4">
                  <button
                    type="button"
                    onClick={() => handleDigit(n)}
                    disabled={disabled}
                    className="btn btn-outline-secondary w-100 py-2.5 rounded-3 fw-bold fs-5 font-monospace numpad-key shadow-sm"
                  >
                    {n}
                  </button>
                </div>
              ))}
            </div>

            <div className="row g-1.5 mb-1.5">
              {[4, 5, 6].map((n) => (
                <div key={n} className="col-4">
                  <button
                    type="button"
                    onClick={() => handleDigit(n)}
                    disabled={disabled}
                    className="btn btn-outline-secondary w-100 py-2.5 rounded-3 fw-bold fs-5 font-monospace numpad-key shadow-sm"
                  >
                    {n}
                  </button>
                </div>
              ))}
            </div>

            <div className="row g-1.5 mb-1.5">
              {[7, 8, 9].map((n) => (
                <div key={n} className="col-4">
                  <button
                    type="button"
                    onClick={() => handleDigit(n)}
                    disabled={disabled}
                    className="btn btn-outline-secondary w-100 py-2.5 rounded-3 fw-bold fs-5 font-monospace numpad-key shadow-sm"
                  >
                    {n}
                  </button>
                </div>
              ))}
            </div>

            <div className="row g-1.5">
              <div className="col-4">
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={disabled || !currentGuess}
                  className="btn btn-outline-danger w-100 py-2.5 rounded-3 fw-bold small font-monospace numpad-key shadow-sm"
                  title="Clear guess input"
                >
                  ✕ Clear
                </button>
              </div>
              <div className="col-4">
                <button
                  type="button"
                  onClick={() => handleDigit(0)}
                  disabled={disabled}
                  className="btn btn-outline-secondary w-100 py-2.5 rounded-3 fw-bold fs-5 font-monospace numpad-key shadow-sm"
                >
                  0
                </button>
              </div>
              <div className="col-4">
                <button
                  type="button"
                  onClick={handleBackspace}
                  disabled={disabled || !currentGuess}
                  className="btn btn-outline-warning w-100 py-2.5 rounded-3 fw-bold small font-monospace numpad-key shadow-sm"
                  title="Backspace"
                >
                  ⌫ Del
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveNumpad;
