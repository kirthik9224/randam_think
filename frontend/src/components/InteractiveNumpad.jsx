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
  const [isOpen, setIsOpen] = useState(false);

  const handleDigit = (digit) => {
    if (disabled) return;
    sounds.playTick();
    const currentStr = String(currentGuess || '');
    if (currentStr.length >= 6) return;
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

  const handleSetHalfway = () => {
    if (disabled) return;
    sounds.playClick();
    const mid = Math.floor((currentMin + currentMax) / 2);
    if (onUpdateGuess) {
      onUpdateGuess(String(mid));
    }
  };

  return (
    <div className="interactive-numpad my-3">
      {/* Friendly toggle button */}
      <div className="text-center mb-2">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1 font-monospace"
          onClick={() => {
            sounds.playClick();
            setIsOpen((prev) => !prev);
          }}
        >
          <i className="bi bi-calculator me-1"></i>
          {isOpen ? '▲ Hide Number Keypad' : '▼ Show Number Keypad'}
        </button>
      </div>

      {isOpen && (
        <div className="card border-0 shadow-sm rounded-4 p-3 bg-body-tertiary mx-auto" style={{ maxWidth: '320px' }}>
          {/* Halfway Quick Button */}
          <div className="mb-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary w-100 rounded-pill py-1.5 fw-semibold"
              onClick={handleSetHalfway}
              disabled={disabled}
            >
              💡 Suggest Halfway: <strong>{Math.floor((currentMin + currentMax) / 2)}</strong>
            </button>
          </div>

          {/* Keypad Grid 1-9 */}
          <div className="row g-2 mb-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <div key={digit} className="col-4">
                <button
                  type="button"
                  className="btn btn-light border w-100 py-2.5 fs-4 fw-bold rounded-3 shadow-xs hover-scale"
                  onClick={() => handleDigit(digit)}
                  disabled={disabled}
                >
                  {digit}
                </button>
              </div>
            ))}
          </div>

          {/* Keypad Bottom Row: Clear, 0, Backspace */}
          <div className="row g-2">
            <div className="col-4">
              <button
                type="button"
                className="btn btn-outline-danger w-100 py-2.5 fw-bold rounded-3"
                onClick={handleClear}
                disabled={disabled}
                title="Clear input"
              >
                Clear
              </button>
            </div>
            <div className="col-4">
              <button
                type="button"
                className="btn btn-light border w-100 py-2.5 fs-4 fw-bold rounded-3"
                onClick={() => handleDigit(0)}
                disabled={disabled}
              >
                0
              </button>
            </div>
            <div className="col-4">
              <button
                type="button"
                className="btn btn-outline-secondary w-100 py-2.5 fs-5 rounded-3"
                onClick={handleBackspace}
                disabled={disabled}
                title="Backspace"
              >
                ⌫
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveNumpad;
