import React, { useState } from 'react';
import {
  THEMES,
  PIN_ICONS,
  getSelectedTheme,
  setSelectedTheme,
  getSelectedPin,
  setSelectedPin,
  getThemeAvailability,
  getPinAvailability,
} from '../utils/themeHelper';
import sounds from '../utils/soundEffects';

const ThemeSelectorPill = ({ onThemeChange }) => {
  const [currentTheme, setCurrentTheme] = useState(() => getSelectedTheme());
  const [currentPin, setCurrentPin] = useState(() => getSelectedPin());
  const [showModal, setShowModal] = useState(false);

  const availableThemes = getThemeAvailability();
  const availablePins = getPinAvailability();

  const handleSelectTheme = (theme) => {
    if (!theme.isUnlocked) {
      sounds.playTooHigh();
      return;
    }
    sounds.playClick();
    setCurrentTheme(theme.id);
    setSelectedTheme(theme.id);
    if (onThemeChange) onThemeChange(theme.id);
  };

  const handleSelectPin = (pin) => {
    if (!pin.isUnlocked) {
      sounds.playTooHigh();
      return;
    }
    sounds.playClick();
    setCurrentPin(pin.icon);
    setSelectedPin(pin.icon);
  };

  const activeThemeObj = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  return (
    <>
      <button
        type="button"
        onClick={() => {
          sounds.playClick();
          setShowModal(true);
        }}
        className="btn btn-sm btn-outline-secondary rounded-pill d-inline-flex align-items-center gap-1.5 px-2.5 py-1 text-nowrap"
        title={`Board Theme: ${activeThemeObj.name} • Ruler Pin: ${currentPin} (Click to customize)`}
      >
        <i className={`bi ${activeThemeObj.icon} text-primary`}></i>
        <span className="small fw-semibold text-nowrap">{activeThemeObj.name}</span>
        <span className="ms-0.5">{currentPin}</span>
      </button>

      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 1070 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg bg-body">
              <div className="modal-header border-0 pb-0">
                <div className="d-flex align-items-center gap-2">
                  <span className="fs-3">🎨</span>
                  <div>
                    <h5 className="modal-title fw-bold">Board Themes & Pin Customizer</h5>
                    <p className="text-muted small mb-0">Unlock unique visual themes and pins as your player level rises</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <div className="modal-body p-4">
                {/* 1. Theme Selection */}
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-palette text-primary"></i>
                  <span>Visual Board Themes</span>
                </h6>

                <div className="row g-3 mb-4">
                  {availableThemes.map((t) => {
                    const isSelected = currentTheme === t.id;
                    return (
                      <div key={t.id} className="col-12 col-md-6">
                        <div
                          onClick={() => handleSelectTheme(t)}
                          className={`card p-3 rounded-4 border-2 transition-all cursor-pointer h-100 ${
                            isSelected
                              ? 'border-primary bg-primary-subtle shadow-sm'
                              : t.isUnlocked
                              ? 'border bg-body-tertiary hover-scale'
                              : 'border opacity-60 bg-body-tertiary'
                          }`}
                          style={{ cursor: t.isUnlocked ? 'pointer' : 'not-allowed' }}
                        >
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="d-flex align-items-center gap-2">
                              <span className="fs-4 text-primary">
                                <i className={`bi ${t.icon}`}></i>
                              </span>
                              <h6 className="fw-bold mb-0">{t.name}</h6>
                            </div>
                            {isSelected ? (
                              <span className="badge bg-primary text-white rounded-pill">Active</span>
                            ) : t.isUnlocked ? (
                              <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill">
                                Unlocked
                              </span>
                            ) : (
                              <span className="badge bg-secondary rounded-pill font-monospace">
                                <i className="bi bi-lock-fill me-1"></i> Lvl {t.minLevel}
                              </span>
                            )}
                          </div>
                          <p className="small text-muted mb-0">{t.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <hr className="my-4 opacity-25" />

                {/* 2. Custom Ruler Pins */}
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-geo-alt-fill text-danger"></i>
                  <span>Interactive Range Ruler Pin Emoji</span>
                </h6>

                <div className="d-flex flex-wrap gap-2">
                  {availablePins.map((p) => {
                    const isSelected = currentPin === p.icon;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPin(p)}
                        className={`btn d-flex align-items-center gap-2 px-3 py-2 rounded-pill font-monospace ${
                          isSelected
                            ? 'btn-primary text-white shadow-sm'
                            : p.isUnlocked
                            ? 'btn-outline-secondary'
                            : 'btn-outline-secondary opacity-50'
                        }`}
                        disabled={!p.isUnlocked}
                        title={p.isUnlocked ? p.label : `Requires Player Level ${p.minLevel}`}
                      >
                        <span className="fs-5">{p.icon}</span>
                        <span className="small fw-semibold">{p.label}</span>
                        {!p.isUnlocked && (
                          <span className="badge bg-secondary ms-1 small" style={{ fontSize: '0.65rem' }}>
                            Lvl {p.minLevel}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4"
                  onClick={() => setShowModal(false)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ThemeSelectorPill;
