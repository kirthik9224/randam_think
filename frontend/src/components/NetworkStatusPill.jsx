import React, { useState, useEffect } from 'react';
import sounds from '../utils/soundEffects';
import { isOnline, toggleOnlineOffline, onNetworkChange, getNetworkMode } from '../utils/networkHelper';

const NetworkStatusPill = ({ showLabel = true, className = '' }) => {
  const [online, setOnline] = useState(isOnline);
  const [mode, setMode] = useState(getNetworkMode);

  useEffect(() => {
    const unsubscribe = onNetworkChange((currentOnline) => {
      setOnline(currentOnline);
      setMode(getNetworkMode());
    });
    return unsubscribe;
  }, []);

  const handleToggle = () => {
    sounds.playClick();
    const newOnline = toggleOnlineOffline();
    setOnline(newOnline);
    setMode(getNetworkMode());
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`btn btn-sm rounded-pill d-inline-flex align-items-center gap-1.5 px-2.5 py-1 transition-all ${
        online
          ? 'btn-outline-success border-success-subtle bg-success-subtle text-success-emphasis'
          : 'btn-outline-warning border-warning-subtle bg-warning-subtle text-warning-emphasis'
      } ${className}`}
      title={
        online
          ? 'Online Mode: Synced with server & leaderboard (Tap to play Offline)'
          : 'Offline Mode: 100% Local Game Engine (Tap to switch Online)'
      }
      style={{ fontSize: '0.78rem' }}
    >
      <span
        className={`rounded-circle d-inline-block ${
          online ? 'bg-success animate-pulse' : 'bg-warning'
        }`}
        style={{
          width: '8px',
          height: '8px',
          boxShadow: online ? '0 0 6px #10b981' : '0 0 6px #f59e0b',
        }}
      ></span>
      {showLabel && (
        <span className="font-monospace fw-bold">
          {online ? 'Online' : 'Offline Play'}
        </span>
      )}
    </button>
  );
};

export default NetworkStatusPill;
