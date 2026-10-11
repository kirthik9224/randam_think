import React from 'react';
import sounds from '../utils/soundEffects';

export const PLAYER_MODES = [
  {
    id: '1_VS_CPU',
    title: '1 vs Computer',
    tag: 'Player vs Computer',
    icon: 'bi-cpu-fill',
    colorClass: 'text-danger',
    bgBadge: 'bg-danger-subtle text-danger border-danger-subtle',
    cardBorder: 'border-danger',
    description: 'Duel a computer opponent in turn-based number deduction. Outsmart the CPU!',
    rosterSummary: '1 Player vs 1 Computer CPU',
    badgeText: 'PvE Duel',
  },
  {
    id: '1P_VS_1P',
    title: '1 Player vs 1 Player',
    tag: '1v1 Local Duel',
    icon: 'bi-people-fill',
    colorClass: 'text-primary',
    bgBadge: 'bg-primary-subtle text-primary border-primary-subtle',
    cardBorder: 'border-primary',
    description: 'Pass-and-play local duel! Two players take alternating turns on the same device.',
    rosterSummary: 'Player 1 vs Player 2',
    badgeText: '1v1 PvP',
  },
  {
    id: '2P_VS_2CPU',
    title: '2 Players vs 2 Computers',
    tag: 'Co-op vs Computer Team',
    icon: 'bi-controller',
    colorClass: 'text-warning',
    bgBadge: 'bg-warning-subtle text-warning-emphasis border-warning-subtle',
    cardBorder: 'border-warning',
    description: '2 Players team up against a squad of 2 computer opponents in a 4-turn rotation.',
    rosterSummary: '2 Players vs 2 Computers',
    badgeText: '2v2 Co-op',
  },
  {
    id: '2P_VS_2P',
    title: '2 Players vs 2 Players',
    tag: '2v2 Team Battle',
    icon: 'bi-shield-shaded',
    colorClass: 'text-success',
    bgBadge: 'bg-success-subtle text-success border-success-subtle',
    cardBorder: 'border-success',
    description: 'Team Blue (2 Players) vs Team Red (2 Players). Whichever team cracks the number wins!',
    rosterSummary: 'Team A (2P) vs Team B (2P)',
    badgeText: '2v2 PvP',
  },
  {
    id: '3P_VS_1CPU',
    title: '3 Players vs 1 Computer',
    tag: '3v1 Boss Raid',
    icon: 'bi-cpu-fill',
    colorClass: 'text-info',
    bgBadge: 'bg-info-subtle text-info-emphasis border-info-subtle',
    cardBorder: 'border-info',
    description: '3 Players join forces against a powerful MasterMind Computer in a squad raid challenge!',
    rosterSummary: '3 Players vs 1 Boss Computer',
    badgeText: '3v1 Boss Raid',
  },
  {
    id: '4P_FFA',
    title: '4 Players (Individual)',
    tag: 'Free-For-All',
    icon: 'bi-dice-5-fill',
    colorClass: 'text-warning',
    bgBadge: 'bg-warning-subtle text-dark border-warning',
    cardBorder: 'border-warning',
    description: 'Every player for themselves! 4 individual thinkers race against each other for the crown.',
    rosterSummary: 'P1 vs P2 vs P3 vs P4',
    badgeText: '4P Free-for-All',
  },
  {
    id: '4P_VS_4P',
    title: '4 Players vs 4 Players',
    tag: '4v4 Squad Clash',
    icon: 'bi-trophy-fill',
    colorClass: 'text-purple',
    bgBadge: 'bg-primary-subtle text-primary border-primary',
    cardBorder: 'border-primary',
    description: 'Massive 8-player squad showdown! Squad Alpha (4 Players) vs Squad Omega (4 Players).',
    rosterSummary: 'Squad Alpha (4) vs Squad Omega (4)',
    badgeText: '4v4 Mega Clash',
  },
  {
    id: 'SOLO',
    title: 'Solo Practice',
    tag: 'Single Player',
    icon: 'bi-person-fill',
    colorClass: 'text-secondary',
    bgBadge: 'bg-secondary-subtle text-secondary border-secondary-subtle',
    cardBorder: 'border-secondary',
    description: 'Classic solo play. Test your instincts and personal best streaks at your own pace.',
    rosterSummary: 'Single Player',
    badgeText: 'Solo Mode',
  },
];

const PlayerModeSelector = ({ selectedPlayerMode = '1_VS_CPU', onSelectPlayerMode, disabled = false }) => {
  return (
    <div className="row g-3">
      {PLAYER_MODES.map((mode) => {
        const isSelected = selectedPlayerMode === mode.id;
        return (
          <div key={mode.id} className="col-12 col-sm-6 col-lg-3">
            <div
              className={`card h-100 cursor-pointer player-mode-card transition-all ${
                isSelected
                  ? `${mode.cardBorder} shadow-lg border-2 selected-player-mode-glow`
                  : 'border-secondary-subtle'
              } ${disabled ? 'opacity-50 pe-none' : ''}`}
              onClick={() => {
                if (!disabled) {
                  sounds.playClick();
                  onSelectPlayerMode(mode.id);
                }
              }}
              style={{
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: isSelected ? 'translateY(-3px)' : 'none',
              }}
            >
              <div className="card-body d-flex flex-column p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className={`badge border rounded-pill px-2.5 py-1 ${mode.bgBadge}`}>
                    <i className={`bi ${mode.icon} me-1`}></i> {mode.badgeText}
                  </span>
                  <span className="badge bg-body-secondary text-body-secondary small font-monospace">
                    {mode.tag}
                  </span>
                </div>

                <div className="d-flex align-items-center gap-2 my-2">
                  <div
                    className={`rounded-circle p-2 d-flex align-items-center justify-content-center bg-body-tertiary ${mode.colorClass}`}
                    style={{ width: '38px', height: '38px', fontSize: '1.2rem' }}
                  >
                    <i className={`bi ${mode.icon}`}></i>
                  </div>
                  <h6 className="fw-bold mb-0 text-truncate">{mode.title}</h6>
                </div>

                <p className="card-text small text-secondary mb-3 flex-grow-1" style={{ fontSize: '0.85rem' }}>
                  {mode.description}
                </p>

                <div className="p-2 rounded bg-body-tertiary mb-3 text-center border border-dashed border-secondary-subtle">
                  <span className="small text-body-secondary fw-semibold">
                    <i className="bi bi-people me-1"></i> {mode.rosterSummary}
                  </span>
                </div>

                <button
                  type="button"
                  className={`btn btn-sm w-100 rounded-pill ${
                    isSelected ? 'btn-primary shadow-sm fw-bold' : 'btn-outline-secondary'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled) {
                      sounds.playClick();
                      onSelectPlayerMode(mode.id);
                    }
                  }}
                >
                  {isSelected ? (
                    <span>
                      <i className="bi bi-pencil-square me-1"></i> Edit Teams & Players
                    </span>
                  ) : (
                    <span>
                      <i className="bi bi-play-circle me-1"></i> Choose & Edit
                    </span>
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

export default PlayerModeSelector;
