import React, { useState, useEffect } from 'react';
import sounds from '../../utils/soundEffects';

const MultiplayerArena = ({
  room,
  currentUserId,
  onSubmitGuess,
  onNextRound,
  onLeaveRoom,
  loading,
}) => {
  const [guessInput, setGuessInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isHost = room.hostPlayerId === currentUserId;
  const isMyTurn = room.currentTurnPlayerId === currentUserId;
  const isTeamBattle = room.matchType === 'TEAM_BATTLE';
  const currentPlayer = room.players.find((p) => p.playerId === currentUserId);
  const attemptsLeft = currentPlayer ? currentPlayer.attemptsRemaining : 0;
  const isRoundOver = room.roundStatus === 'ROUND_WON' || room.roundStatus === 'ROUND_DRAW';

  // Sound effects on guess outcomes
  useEffect(() => {
    if (room.recentGuesses && room.recentGuesses.length > 0) {
      const lastGuess = room.recentGuesses[room.recentGuesses.length - 1];
      if (lastGuess.result === 'CORRECT') {
        sounds.playVictory();
      } else if (lastGuess.result === 'TOO_LOW' || lastGuess.result === 'TOO_HIGH') {
        sounds.playHint();
      }
    }
  }, [room.recentGuesses?.length]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isMyTurn) {
      setErrorMsg("It's not your turn!");
      return;
    }

    const val = parseInt(guessInput, 10);
    if (isNaN(val) || val < room.minNumber || val > room.maxNumber) {
      setErrorMsg(`Enter a valid number between ${room.minNumber} and ${room.maxNumber}`);
      return;
    }

    sounds.playSubmit();
    onSubmitGuess(val);
    setGuessInput('');
  };

  return (
    <div className="container py-4">
      {/* Top Match Bar */}
      <div className="mp-glass-card p-3 mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <span className="badge bg-primary px-3 py-1.5 rounded-pill text-uppercase">
              {room.matchType.replace('_', ' ')}
            </span>
            <span className="fw-bold text-warning">
              Round {room.currentRoundNumber} of {room.totalRounds}
            </span>
            <span className="text-white-50 small">
              Range: <strong className="text-white">{room.minNumber} - {room.maxNumber}</strong>
            </span>
          </div>

          {/* Team Battle Scoreboard */}
          {isTeamBattle ? (
            <div className="d-flex align-items-center gap-3 px-3 py-1 rounded-pill" style={{ background: 'rgba(0,0,0,0.4)' }}>
              <span className="fw-black text-danger">🔥 Red: {room.teamRedScore}</span>
              <span className="text-white-50">vs</span>
              <span className="fw-black text-primary">⚡ Blue: {room.teamBlueScore}</span>
            </div>
          ) : (
            room.stakeAmount > 0 && (
              <span className="mp-coin-badge">
                🏆 Prize: 🪙 {room.totalPrizePool}
              </span>
            )
          )}

          <button
            className="btn btn-sm btn-outline-secondary rounded-pill px-3"
            onClick={() => {
              sounds.playClick();
              if (window.confirm('Are you sure you want to leave the active match?')) {
                onLeaveRoom();
              }
            }}
          >
            Leave
          </button>
        </div>
      </div>

      {/* Turn Banner */}
      <div
        className={`mp-glass-card p-4 mb-4 text-center ${
          isRoundOver
            ? 'border-warning'
            : isMyTurn
            ? 'mp-turn-active'
            : 'border-secondary'
        }`}
      >
        {isRoundOver ? (
          <div>
            <span className="fs-1">
              {room.roundStatus === 'ROUND_WON' ? '🎉' : '🤝'}
            </span>
            <h3 className="fw-black text-warning mt-2 mb-1">
              {room.roundStatus === 'ROUND_WON'
                ? `${room.roundWinnerName} Guessed Correctly!`
                : 'Round Ended in a Draw!'}
            </h3>
            <p className="text-white-50 mb-3">
              The secret number was <span className="badge bg-warning text-dark fs-5">{room.secretNumber}</span>
            </p>

            {room.status !== 'FINISHED' && (
              <div>
                {isHost ? (
                  <button
                    className="btn btn-warning px-5 py-2.5 rounded-pill fw-black text-dark shadow"
                    onClick={() => {
                      sounds.playClick();
                      onNextRound();
                    }}
                    disabled={loading}
                  >
                    Start Round {room.currentRoundNumber + 1} ➡️
                  </button>
                ) : (
                  <div className="text-white-50">Waiting for host to start the next round...</div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
              <span className="spinner-grow spinner-grow-sm text-info" role="status"></span>
              <h4 className="fw-black text-white mb-0">
                {isMyTurn ? '👉 YOUR TURN TO GUESS!' : `Waiting for ${room.currentTurnUsername}...`}
              </h4>
            </div>
            <p className="text-white-50 mb-0 small">
              {isMyTurn
                ? `You have ${attemptsLeft} attempts remaining in this round.`
                : `${room.currentTurnUsername} is thinking...`}
            </p>
          </div>
        )}
      </div>

      <div className="row g-4">
        {/* Left Column: Guess Form + Roster */}
        <div className="col-lg-5">
          {/* Guess Input Form */}
          {!isRoundOver && (
            <div className="mp-glass-card p-4 mb-4">
              <h5 className="fw-bold text-white mb-3">Make Your Guess</h5>

              {errorMsg && <div className="alert alert-danger py-2 small mb-3">{errorMsg}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <div className="input-group input-group-lg">
                    <input
                      type="number"
                      className="form-control text-center fw-black fs-3 bg-dark text-white border-secondary"
                      placeholder={`${room.minNumber} - ${room.maxNumber}`}
                      min={room.minNumber}
                      max={room.maxNumber}
                      value={guessInput}
                      onChange={(e) => setGuessInput(e.target.value)}
                      disabled={!isMyTurn || attemptsLeft <= 0 || loading}
                      autoFocus={isMyTurn}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`btn w-100 py-3 rounded-pill fw-black fs-5 shadow ${
                    isMyTurn && attemptsLeft > 0 ? 'btn-primary' : 'btn-secondary disabled'
                  }`}
                  disabled={!isMyTurn || attemptsLeft <= 0 || loading}
                >
                  {isMyTurn ? '🎯 Submit Guess' : 'Waiting for Turn...'}
                </button>
              </form>
            </div>
          )}

          {/* Players Roster & Attempts */}
          <div className="mp-glass-card p-4">
            <h5 className="fw-bold text-white mb-3">Players & Attempts</h5>
            <div className="d-flex flex-column gap-2">
              {room.players.map((p) => {
                const isCurrentTurn = room.currentTurnPlayerId === p.playerId;
                return (
                  <div
                    key={p.id}
                    className={`p-3 rounded-3 d-flex justify-content-between align-items-center ${
                      isCurrentTurn ? 'border border-info' : ''
                    }`}
                    style={{
                      background: isCurrentTurn
                        ? 'rgba(56, 189, 248, 0.15)'
                        : 'rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <span
                        className="rounded-circle d-inline-block"
                        style={{ width: '12px', height: '12px', backgroundColor: p.avatarColor }}
                      ></span>
                      <div>
                        <span className="fw-bold text-white me-1">{p.username}</span>
                        {p.playerId === currentUserId && (
                          <span className="badge bg-secondary small me-1">YOU</span>
                        )}
                        {p.team && p.team !== 'SOLO' && (
                          <span className={`badge small ${p.team === 'TEAM_RED' ? 'bg-danger' : 'bg-primary'}`}>
                            {p.team === 'TEAM_RED' ? 'Red' : 'Blue'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-dark border border-secondary text-white-50">
                        {p.attemptsRemaining} left
                      </span>
                      {p.roundsWon > 0 && (
                        <span className="badge bg-warning text-dark">
                          🏆 {p.roundsWon}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Shared Guesses Timeline */}
        <div className="col-lg-7">
          <div className="mp-glass-card p-4 h-100">
            <h5 className="fw-bold text-white mb-3 d-flex align-items-center justify-content-between">
              <span>📜 Guess History</span>
              <span className="text-white-50 small">
                {room.recentGuesses ? room.recentGuesses.length : 0} guesses
              </span>
            </h5>

            <div
              className="d-flex flex-column gap-2 overflow-y-auto pe-1"
              style={{ maxHeight: '420px' }}
            >
              {room.recentGuesses && room.recentGuesses.length > 0 ? (
                [...room.recentGuesses].reverse().map((g) => {
                  let badgeClass = 'bg-secondary';
                  let icon = '•';
                  if (g.result === 'TOO_LOW') {
                    badgeClass = 'bg-info text-dark';
                    icon = '⬆️ Too Low';
                  } else if (g.result === 'TOO_HIGH') {
                    badgeClass = 'bg-danger';
                    icon = '⬇️ Too High';
                  } else if (g.result === 'CORRECT') {
                    badgeClass = 'bg-success text-white';
                    icon = '🎉 CORRECT';
                  }

                  return (
                    <div
                      key={g.id}
                      className="mp-guess-item p-3 rounded-3 d-flex justify-content-between align-items-center"
                      style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <strong className="text-white fs-5">{g.guessNumber}</strong>
                        <span className="text-white-50 small">
                          by <span className="text-white fw-bold">{g.username}</span>
                          {g.team && g.team !== 'SOLO' && (
                            <span className={`ms-1 small ${g.team === 'TEAM_RED' ? 'text-danger' : 'text-primary'}`}>
                              ({g.team === 'TEAM_RED' ? 'Red' : 'Blue'})
                            </span>
                          )}
                        </span>
                      </div>

                      <span className={`badge px-3 py-2 rounded-pill fw-bold ${badgeClass}`}>
                        {icon}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-5 text-white-50 fst-italic">
                  No guesses submitted yet. Make the first move!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerArena;
