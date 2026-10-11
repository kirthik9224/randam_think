import React, { useState, useEffect } from 'react';

const Timer = ({ isRunning, initialSeconds = 0, onTick }) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  const onTickRef = React.useRef(onTick);
  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          setTimeout(() => {
            if (onTickRef.current) onTickRef.current(next);
          }, 0);
          return next;
        });
      }, 1000);
    } else if (!isRunning && interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill bg-dark text-warning border border-warning shadow-sm font-monospace">
      <i className={`bi bi-stopwatch-fill ${isRunning ? 'animate-pulse' : ''}`}></i>
      <span className="fw-bold fs-6">{formatTime(seconds)}</span>
    </div>
  );
};

export default Timer;
