import React, { useState } from 'react';
import sounds from '../utils/soundEffects';

export const CASUAL_PLAYER_OPTIONS = [
  {
    id: 'SOLO',
    name: 'Play Solo',
    subtitle: 'Classic Single Player',
    icon: 'bi-person-fill',
    badgeText: 'Single Player',
    badgeClass: 'bg-secondary-subtle text-secondary',
    borderClass: 'border-secondary',
    description: 'Just you against the secret number. Enjoy solving at your own relaxed pace.',
    turnsExplained: 'You make every guess until you crack the secret number or run out of attempts.',
  },
  {
    id: '1P_VS_1P',
    name: 'Play with a Friend',
    subtitle: 'Pass & Play on this Device',
    icon: 'bi-people-fill',
    badgeText: '2 Players (Same Screen)',
    badgeClass: 'bg-primary-subtle text-primary',
    borderClass: 'border-primary',
    description: 'Play with a friend sitting next to you! Take alternating turns guessing on this same screen.',
    turnsExplained: 'Player 1 guesses first, then passes the device to Player 2. The first person to deduce the number wins!',
  },
  {
    id: '1_VS_CPU',
    name: 'Play against Computer',
    subtitle: 'You vs Friendly AI',
    icon: 'bi-robot',
    badgeText: 'Player vs Computer',
    badgeClass: 'bg-danger-subtle text-danger',
    borderClass: 'border-danger',
    description: 'Challenge a computer AI! You and the AI alternate guesses after each clue.',
    turnsExplained: 'You make your guess, then the Computer analyzes the clue and guesses next. Race to find the answer first!',
  },
];

export const ADVANCED_TEAM_OPTIONS = [
  {
    id: '4P_FFA',
    name: '4 Players (Free-for-All)',
    icon: 'bi-dice-4-fill',
    badgeText: '4P Party',
    description: '4 friends pass the device in a round-robin rotation.',
  },
  {
    id: '2P_VS_2CPU',
    name: '2 Players vs 2 Computers',
    icon: 'bi-controller',
    badgeText: '2v2 Co-op',
    description: 'Team up with a friend against two computer players.',
  },
  {
    id: '3P_VS_1CPU',
    name: '3 Players vs Boss Computer',
    icon: 'bi-cpu-fill',
    badgeText: '3v1 Boss Raid',
    description: 'A 3-player team raid against an AI Boss.',
  },
  {
    id: '4P_VS_4P',
    name: '4 Players vs 4 Players',
    icon: 'bi-trophy-fill',
    badgeText: '4v4 Team Clash',
    description: 'Two teams of 4 players clash in a squad deduction match.',
  },
];

const PlayerModeSelector = ({ selectedPlayerMode = 'SOLO', onSelectPlayerMode, disabled = false }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeCasual = CASUAL_PLAYER_OPTIONS.find((m) => m.id === selectedPlayerMode);
  const activeAdvanced = ADVANCED_TEAM_OPTIONS.find((m) => m.id === selectedPlayerMode);

  return (
    <div>
      {/* 3 Core Casual Choices */}
      <div className="row g-3 mb-3">
        {CASUAL_PLAYER_OPTIONS.map((mode) => {
          const isSelected = selectedPlayerMode === mode.id;
          return (
            <div key={mode.id} className="col-12 col-md-4">
              <div
                className={`card h-100 cursor-pointer rounded-4 shadow-sm transition-all ${
                  isSelected
                    ? `${mode.borderClass} border-2 bg-primary-subtle shadow-md`
                    : 'border-secondary-subtle bg-body hover-lift'
                } ${disabled ? 'opacity-50 pe-none' : ''}`}
                onClick={() => {
                  if (!disabled) {
                    sounds.playClick();
                    onSelectPlayerMode(mode.id);
                  }
                }}
                style={{
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  borderWidth: isSelected ? '2px' : '1px',
                  transition: 'all 0.2s ease',
                }}
              >
                <div className="card-body p-3 p-xl-4 text-center d-flex flex-column">
                  <div className="mb-2">
                    <span className={`badge ${mode.badgeClass} rounded-pill px-3 py-1 font-monospace small`}>
                      <i className={`bi ${mode.icon} me-1`}></i> {mode.badgeText}
                    </span>
                  </div>

                  <h5 className="fw-bold mb-1">{mode.name}</h5>
                  <span className="text-muted small fw-semibold mb-3">{mode.subtitle}</span>

                  <p className="card-text small text-secondary mb-3 flex-grow-1">
                    {mode.description}
                  </p>

                  <button
                    type="button"
                    className={`btn btn-sm w-100 rounded-pill fw-bold ${
                      isSelected ? 'btn-primary shadow-sm' : 'btn-outline-secondary'
                    }`}
                  >
                    {isSelected ? '✓ Selected' : 'Choose Mode'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Clear Explanation of How Turns Work */}
      <div className="alert alert-info-subtle border-info-subtle rounded-4 py-2 px-3 mb-3 d-flex align-items-center gap-2">
        <i className="bi bi-info-circle-fill text-info fs-5 flex-shrink-0"></i>
        <div className="small">
          <strong>How turns work: </strong>
          <span>
            {activeCasual
              ? activeCasual.turnsExplained
              : (activeAdvanced ? activeAdvanced.description : 'Players alternate taking turns guessing the number.')}
          </span>
          <span className="text-muted ms-2">(Local pass-and-play on this same device)</span>
        </div>
      </div>

      {/* Advanced Team Modes (Optional) */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setShowAdvanced(!showAdvanced);
          }}
          className="btn btn-link btn-sm text-decoration-none text-muted"
        >
          {showAdvanced ? '▲ Hide Advanced Team Modes' : '▼ More Modes: 4P FFA, Teams & Boss Raids'}
        </button>

        {showAdvanced && (
          <div className="row g-2 mt-2 pt-2 border-top">
            {ADVANCED_TEAM_OPTIONS.map((adv) => {
              const isSelected = selectedPlayerMode === adv.id;
              return (
                <div key={adv.id} className="col-6 col-md-3">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      onSelectPlayerMode(adv.id);
                    }}
                    className={`btn btn-sm w-100 rounded-3 text-start p-2.5 ${
                      isSelected ? 'btn-primary' : 'btn-outline-secondary bg-body'
                    }`}
                  >
                    <div className="fw-bold small text-truncate">
                      <i className={`bi ${adv.icon} me-1`}></i> {adv.name}
                    </div>
                    <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                      {adv.badgeText}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export const PLAYER_MODES = CASUAL_PLAYER_OPTIONS;
export default PlayerModeSelector;
