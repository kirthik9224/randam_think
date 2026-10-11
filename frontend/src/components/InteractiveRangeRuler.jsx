import React, { useRef, useState, useEffect, useCallback } from 'react';
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
  gameMode = 'CLASSIC',
  proximity = null,
  customPin = '🎯',
}) => {
  const rulerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredPin, setHoveredPin] = useState(null);

  const totalSpan = Math.max(1, maxNumber - minNumber);

  const getPercent = useCallback(
    (val) => {
      if (val === null || val === undefined || isNaN(val)) return 50;
      const clamped = Math.max(minNumber, Math.min(maxNumber, Number(val)));
      return ((clamped - minNumber) / totalSpan) * 100;
    },
    [minNumber, maxNumber, totalSpan]
  );

  const getNumberFromClientX = useCallback(
    (clientX) => {
      if (!rulerRef.current) return currentMin;
      const rect = rulerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const ratio = x / rect.width;
      const rawVal = Math.round(minNumber + ratio * totalSpan);
      return Math.max(minNumber, Math.min(maxNumber, rawVal));
    },
    [minNumber, maxNumber, totalSpan, currentMin]
  );

  const handlePointerDown = (e) => {
    if (disabled) return;
    setIsDragging(true);
    const newNum = getNumberFromClientX(e.clientX);
    if (onSelectNumber) {
      onSelectNumber(newNum);
      sounds.playTick();
    }
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDragging || disabled) return;
      const newNum = getNumberFromClientX(e.clientX);
      if (onSelectNumber) {
        onSelectNumber(newNum);
      }
    };

    const handlePointerUp = () => {
      if (isDragging) {
        setIsDragging(false);
        sounds.playTick();
      }
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, disabled, getNumberFromClientX, onSelectNumber]);

  const minPercent = getPercent(currentMin);
  const maxPercent = getPercent(currentMax);
  const activeWidth = Math.max(0, maxPercent - minPercent);

  const parsedCurrent = parseInt(currentGuess, 10);
  const thumbPercent = !isNaN(parsedCurrent) ? getPercent(parsedCurrent) : null;

  // Determine heat level for pulse styling
  const isHotOrCold = gameMode === 'HOT_COLD';
  const isBoiling = isHotOrCold && proximity === 'BOILING_HOT';
  const isWarm = isHotOrCold && (proximity === 'WARM' || proximity === 'HOT');
  const isFreezing = isHotOrCold && (proximity === 'FREEZING' || proximity === 'COLD');
  const isTightRange = (currentMax - currentMin) <= Math.max(10, Math.round(totalSpan * 0.08));

  return (
    <div className="range-ruler-container card border-0 shadow-sm rounded-4 p-3 mb-4 bg-body position-relative">
      {/* Header Info */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
        <div className="d-flex align-items-center gap-2">
          <span className="fs-5">📏</span>
          <div>
            <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
              <span>Interactive Range Ruler</span>
              <span className="badge bg-primary-subtle text-primary border small font-monospace">
                Span: {currentMax - currentMin + 1} candidates
              </span>
            </h6>
            <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
              Drag the needle or tap any position to set your guess
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 font-monospace small">
          <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle px-2 py-1">
            🧊 Low Wall: <strong>{currentMin}</strong>
          </span>
          <span className="text-muted">➔</span>
          <span className="badge bg-danger-subtle text-danger-emphasis border border-danger-subtle px-2 py-1">
            🔥 High Wall: <strong>{currentMax}</strong>
          </span>
        </div>
      </div>

      {/* Main Ruler Track Area */}
      <div
        ref={rulerRef}
        className={`ruler-track position-relative my-3 rounded-pill select-none ${
          disabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
        } ${isBoiling ? 'ruler-boiling-pulse' : isTightRange ? 'ruler-tight-glow' : ''}`}
        style={{
          height: '24px',
          background: '#1e293b',
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)',
          overflow: 'visible',
          touchAction: 'none',
        }}
        onPointerDown={handlePointerDown}
      >
        {/* Ice / Eliminated Low Zone */}
        <div
          className="ruler-ice-zone position-absolute h-100 start-0 rounded-start-pill d-flex align-items-center justify-content-center overflow-hidden"
          style={{
            width: `${minPercent}%`,
            background: 'linear-gradient(90deg, #0f172a 0%, #1e3a8a 70%, #0284c7 100%)',
            opacity: 0.9,
            transition: 'width 0.3s ease',
            borderRight: '2px solid #38bdf8',
          }}
          title={`Eliminated Too Low (Below ${currentMin})`}
        >
          {minPercent > 12 && (
            <span className="small text-white-50 font-monospace d-flex align-items-center gap-1" style={{ fontSize: '0.65rem' }}>
              <span>🧊</span> FROST
            </span>
          )}
        </div>

        {/* Active Deduction Zone */}
        <div
          className={`ruler-active-zone position-absolute h-100 ${
            isBoiling
              ? 'bg-danger animate-pulse'
              : isWarm
              ? 'bg-warning'
              : isFreezing
              ? 'bg-info'
              : 'ruler-active-gradient'
          }`}
          style={{
            left: `${minPercent}%`,
            width: `${activeWidth}%`,
            transition: 'left 0.3s ease, width 0.3s ease',
            boxShadow: isBoiling
              ? '0 0 16px rgba(239, 68, 68, 0.9)'
              : '0 0 10px rgba(14, 165, 233, 0.5)',
          }}
          title={`Active Deduction Window: ${currentMin} to ${currentMax}`}
        >
          {activeWidth > 15 && (
            <div className="h-100 d-flex align-items-center justify-content-center text-white small font-monospace fw-bold opacity-75" style={{ fontSize: '0.65rem' }}>
              🎯 TARGET ZONE
            </div>
          )}
        </div>

        {/* Fire / Eliminated High Zone */}
        <div
          className="ruler-fire-zone position-absolute h-100 end-0 rounded-end-pill d-flex align-items-center justify-content-center overflow-hidden"
          style={{
            width: `${100 - maxPercent}%`,
            background: 'linear-gradient(90deg, #ea580c 0%, #b91c1c 40%, #450a0a 100%)',
            opacity: 0.9,
            transition: 'width 0.3s ease',
            borderLeft: '2px solid #f97316',
          }}
          title={`Eliminated Too High (Above ${currentMax})`}
        >
          {100 - maxPercent > 12 && (
            <span className="small text-white-50 font-monospace d-flex align-items-center gap-1" style={{ fontSize: '0.65rem' }}>
              SCORCH <span>🔥</span>
            </span>
          )}
        </div>

        {/* Ice Wall Marker (currentMin pin) */}
        {minPercent > 0 && minPercent < 100 && (
          <div
            className="position-absolute d-flex flex-column align-items-center"
            style={{
              left: `${minPercent}%`,
              top: '-12px',
              transform: 'translateX(-50%)',
              zIndex: 8,
              pointerEvents: 'none',
              transition: 'left 0.3s ease',
            }}
          >
            <span className="badge bg-info text-dark shadow-sm px-1.5 py-0.5 rounded-pill font-monospace" style={{ fontSize: '0.65rem' }}>
              🧊 {currentMin}
            </span>
            <div style={{ width: '2px', height: '14px', background: '#38bdf8' }}></div>
          </div>
        )}

        {/* Fire Wall Marker (currentMax pin) */}
        {maxPercent > 0 && maxPercent < 100 && (
          <div
            className="position-absolute d-flex flex-column align-items-center"
            style={{
              left: `${maxPercent}%`,
              top: '-12px',
              transform: 'translateX(-50%)',
              zIndex: 8,
              pointerEvents: 'none',
              transition: 'left 0.3s ease',
            }}
          >
            <span className="badge bg-danger text-white shadow-sm px-1.5 py-0.5 rounded-pill font-monospace" style={{ fontSize: '0.65rem' }}>
              🔥 {currentMax}
            </span>
            <div style={{ width: '2px', height: '14px', background: '#f97316' }}></div>
          </div>
        )}

        {/* Ice & Fire Historical Guess Pins */}
        {guesses.map((g, idx) => {
          const pinPercent = getPercent(g.guessNumber);
          const isTooLow = g.result === 'TOO_LOW';
          const isTooHigh = g.result === 'TOO_HIGH';
          const isCorrect = g.result === 'CORRECT';

          return (
            <div
              key={g.id || `${g.guessNumber}-${idx}`}
              className="position-absolute ruler-pin-drop"
              style={{
                left: `${pinPercent}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHoveredPin(g)}
              onMouseLeave={() => setHoveredPin(null)}
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectNumber && !disabled) {
                  onSelectNumber(g.guessNumber);
                  sounds.playClick();
                }
              }}
            >
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center shadow-sm ${
                  isTooLow
                    ? 'ruler-pin-ice'
                    : isTooHigh
                    ? 'ruler-pin-fire'
                    : 'ruler-pin-win'
                }`}
                style={{
                  width: '18px',
                  height: '18px',
                  fontSize: '0.65rem',
                }}
                title={`#${g.attemptNumber}: ${g.guessNumber} (${g.guesserName || 'Player'})`}
              >
                {isTooLow ? '❄️' : isTooHigh ? '🔥' : '🎯'}
              </div>
            </div>
          );
        })}

        {/* Draggable Slider Thumb Needle */}
        {thumbPercent !== null && (
          <div
            className="position-absolute ruler-thumb d-flex flex-column align-items-center"
            style={{
              left: `${thumbPercent}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 20,
              pointerEvents: 'none',
              transition: isDragging ? 'none' : 'left 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Value Bubble floating above */}
            <div
              className="badge bg-warning text-dark shadow fw-black rounded-pill font-monospace px-2 py-1 mb-1 ruler-thumb-bubble"
              style={{
                fontSize: '0.8rem',
                border: '2px solid #ffffff',
                transform: 'translateY(-18px)',
              }}
            >
              {parsedCurrent}
            </div>
            {/* Glowing Pointer Thumb */}
            <div
              className="rounded-circle shadow-lg d-flex align-items-center justify-content-center ruler-thumb-knob"
              style={{
                width: '28px',
                height: '28px',
                background: '#ffffff',
                border: '3px solid #ffc107',
                boxShadow: '0 0 12px rgba(255, 193, 7, 0.8)',
                fontSize: '0.9rem',
              }}
            >
              <span>{customPin || '🎯'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Pin Hover Detail Tooltip */}
      {hoveredPin && (
        <div
          className="position-absolute start-50 translate-middle-x card shadow-lg border-0 rounded-3 p-2 bg-dark text-white text-center font-monospace small"
          style={{ bottom: '-42px', zIndex: 30, minWidth: '180px' }}
        >
          <div className="fw-bold">
            Guess {hoveredPin.guessNumber} — {hoveredPin.result}
          </div>
          <div className="text-white-50" style={{ fontSize: '0.7rem' }}>
            Attempt #{hoveredPin.attemptNumber} by {hoveredPin.guesserName}
          </div>
        </div>
      )}

      {/* Bottom Range Labels & Midpoint Shortcut */}
      <div className="d-flex justify-content-between align-items-center font-monospace text-muted small mt-1">
        <span className="fw-semibold">{minNumber}</span>
        <button
          type="button"
          className="btn btn-link btn-sm text-decoration-none p-0 text-primary fw-semibold"
          onClick={() => {
            if (!disabled && onSelectNumber) {
              const mid = Math.floor((currentMin + currentMax) / 2);
              onSelectNumber(mid);
              sounds.playClick();
            }
          }}
          disabled={disabled}
          title="Jump to optimal deduction midpoint"
        >
          🎯 Midpoint: {Math.floor((currentMin + currentMax) / 2)}
        </button>
        <span className="fw-semibold">{maxNumber}</span>
      </div>
    </div>
  );
};

export default InteractiveRangeRuler;
