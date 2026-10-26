import React, { useState, useEffect } from 'react';
import sounds from '../../utils/soundEffects';
import multiplayerService from '../../services/multiplayerService';

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
  const currentPlayer = room.players?.find((p) => p.playerId === currentUserId);
  const attemptsLeft = currentPlayer ? currentPlayer.attemptsRemaining : 0;
  const isRoundOver = room.roundStatus === 'ROUND_WON' || room.roundStatus === 'ROUND_DRAW';

  const isNightmare = room.difficultyLabel === 'NIGHTMARE' || room.currentRoundNumber === 9;
  const isFinalBoss = room.difficultyLabel === 'FINAL BOSS' || room.currentRoundNumber === 10;
  const isBossDefeated = isFinalBoss && room.roundStatus === 'ROUND_WON';

  // Server-synchronized turn countdown
  const totalTurnSeconds = room.turnTimeLimitSeconds || (isFinalBoss ? 15 : isNightmare ? 20 : 45);
  const [secondsLeft, setSecondsLeft] = useState(room.secondsRemaining ?? totalTurnSeconds);

  useEffect(() => {
    if (room.turnDeadline) {
      const diff = Math.max(0, Math.floor((new Date(room.turnDeadline).getTime() - Date.now()) / 1000));
      setSecondsLeft(diff);
    } else if (room.secondsRemaining !== undefined && room.secondsRemaining !== null) {
      setSecondsLeft(room.secondsRemaining);
    } else {
      setSecondsLeft(totalTurnSeconds);
    }
  }, [room.turnDeadline, room.secondsRemaining, room.currentTurnPlayerId, room.currentRoundNumber, totalTurnSeconds]);

  useEffect(() => {
    if (isRoundOver || room.status === 'FINISHED') return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (isMyTurn && room.status === 'IN_PROGRESS' && room.roundStatus === 'IN_PROGRESS') {
            multiplayerService.handleTimeout(room.roomCode).catch(() => {});
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRoundOver, room.status, isMyTurn, room.roomCode, room.roundStatus]);

  // Audio feedback on guess results & victory
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
      setErrorMsg(
        `Enter a valid number between ${Number(room.minNumber).toLocaleString()} and ${Number(
          room.maxNumber
        ).toLocaleString()}`
      );
      return;
    }

    // Client-side duplicate guess prevention
    const alreadyGuessed = room.recentGuesses?.some(
      (g) => Number(g.guessNumber) === val && g.roundNumber === room.currentRoundNumber
    );
    if (alreadyGuessed) {
      sounds.playError();
      setErrorMsg(
        `The number ${val.toLocaleString()} has already been guessed in this round! Please choose another number.`
      );
      return;
    }

    sounds.playSubmit();
    onSubmitGuess(val);
    setGuessInput('');
  };

  const timerPct = Math.max(0, Math.min(100, (secondsLeft / totalTurnSeconds) * 100));
  const isUrgent = secondsLeft <= 5;
  const timerColor = isUrgent ? '#ef4444' : secondsLeft <= 10 ? '#f59e0b' : '#22c55e';

  return (
    <div
      className={`container py-4 ${
        isFinalBoss ? 'mp-finalboss-theme' : isNightmare ? 'mp-nightmare-theme' : ''
      }`}
    >
      {/* Boss Stage Indicator Banner */}
      {isFinalBoss && (
        <div className="mp-glass-card mp-finalboss-card p-3 mb-4 text-center">
          <div className="d-flex align-items-center justify-content-center gap-3">
            <span className="fs-2 animate-bounce">👑</span>
            <div>
              <h4 className="mp-boss-defeated-title mb-0">STAGE 10: THE FINAL BOSS ENCOUNTER</h4>
              <p className="text-warning-50 small mb-0">
                1 in a Billion Range • 3 Attempts Only • 15s Blitz Clock • 5× Victory Reward
              </p>
            </div>
            <span className="fs-2 animate-bounce">👑</span>
          </div>
        </div>
      )}

      {/* Top Match Bar */}
      <div
        className={`mp-glass-card p-3 mb-4 ${
          isFinalBoss ? 'border-warning' : isNightmare ? 'border-danger' : ''
        }`}
      >
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex flex-wrap align-items-center gap-3">
            <span className="badge bg-primary px-3 py-1.5 rounded-pill text-uppercase">
              {room.matchType?.replace('_', ' ')}
            </span>

            {/* Difficulty Badge */}
            {isFinalBoss ? (
              <span className="badge mp-badge-finalboss px-3 py-1.5 rounded-pill">
                👑 FINAL BOSS
              </span>
            ) : isNightmare ? (
              <span className="badge mp-badge-nightmare px-3 py-1.5 rounded-pill">
                🔥 NIGHTMARE
              </span>
            ) : (
              <span className="badge bg-secondary px-3 py-1.5 rounded-pill text-uppercase">
                {room.difficultyLabel || 'STANDARD'}
              </span>
            )}

            {/* Virtual Reward Multiplier */}
            {room.rewardMultiplier > 1 && (
              <span className="mp-multiplier-pill">
                ⚡ {room.rewardMultiplier}× REWARD
              </span>
            )}

            <span className="fw-bold text-warning">
              Round {room.currentRoundNumber} of {room.totalRounds}
            </span>

            <span className="text-white-50 small">
              Range:{' '}
              <strong className="text-white">
                {Number(room.minNumber).toLocaleString()} – {Number(room.maxNumber).toLocaleString()}
              </strong>
            </span>
          </div>

          {/* Team Battle Scoreboard or Solo Prize */}
          {isTeamBattle ? (
            <div
              className="d-flex align-items-center gap-3 px-3 py-1 rounded-pill"
              style={{ background: 'rgba(0,0,0,0.4)' }}
            >
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

      {/* Special Final Boss Defeated Banner */}
      {isBossDefeated && (
        <div className="mp-boss-victory-banner p-4 mb-4 text-center">
          <div className="display-3 mb-2">👑🏆🎉</div>
          <h2 className="mp-boss-defeated-title mb-2">FINAL BOSS DEFEATED!</h2>
          <p className="fs-5 text-warning mb-3">
            {room.roundWinnerName} conquered the 1-Billion challenge and claimed the 5× Grand Reward!
          </p>
          <div className="d-flex justify-content-center gap-3">
            <span className="badge bg-warning text-dark px-4 py-2 fs-6 rounded-pill fw-black">
              🪙 5× Coin Multiplier Applied
            </span>
            <span className="badge bg-danger text-white px-4 py-2 fs-6 rounded-pill fw-black">
              ⭐ Champion of Champions
            </span>
          </div>
        </div>
      )}

      {/* Turn & Status Banner */}
      <div
        className={`mp-glass-card p-4 mb-4 text-center ${
          isRoundOver
            ? 'border-warning'
            : isMyTurn
            ? isFinalBoss
              ? 'mp-finalboss-card'
              : isNightmare
              ? 'mp-nightmare-card'
              : 'mp-turn-active'
            : 'border-secondary'
        }`}
      >
        {isRoundOver ? (
          <div>
            <span className="fs-1">
              {room.roundStatus === 'ROUND_WON' ? (isFinalBoss ? '👑' : '🎉') : '🤝'}
            </span>
            <h3 className="fw-black text-warning mt-2 mb-1">
              {room.roundStatus === 'ROUND_WON'
                ? `${room.roundWinnerName} Guessed Correctly!`
                : 'Round Ended in a Draw!'}
            </h3>
            <p className="text-white-50 mb-3">
              The secret number was{' '}
              <span className="badge bg-warning text-dark fs-5">
                {room.secretNumber !== null && room.secretNumber !== undefined
                  ? Number(room.secretNumber).toLocaleString()
                  : 'Revealed'}
              </span>
            </p>

            {room.status !== 'FINISHED' && (
              <div>
                {isHost ? (
                  <button
                    className={`btn px-5 py-2.5 rounded-pill fw-black shadow ${
                      room.currentRoundNumber + 1 === 10
                        ? 'btn-danger text-white fs-5'
                        : 'btn-warning text-dark'
                    }`}
                    onClick={() => {
                      sounds.playClick();
                      onNextRound();
                    }}
                    disabled={loading}
                  >
                    {room.currentRoundNumber + 1 === 10
                      ? '⚡ ENTER FINAL BOSS ROUND 10 ➡️'
                      : room.currentRoundNumber + 1 === 9
                      ? '🔥 ENTER NIGHTMARE ROUND 9 ➡️'
                      : `Start Round ${room.currentRoundNumber + 1} ➡️`}
                  </button>
                ) : (
                  <div className="text-white-50">Waiting for host to start the next round...</div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="d-flex align-items-center justify-content-center gap-3 mb-2">
              <span
                className={`spinner-grow spinner-grow-sm ${isUrgent ? 'text-danger' : 'text-info'}`}
                role="status"
              ></span>
              <h4 className="fw-black text-white mb-0">
                {isMyTurn ? '👉 YOUR TURN TO GUESS!' : `Waiting for ${room.currentTurnUsername}...`}
              </h4>
              <span
                className={`badge px-3 py-1.5 rounded-pill fw-bold ${
                  isUrgent ? 'bg-danger mp-timer-urgent text-white' : 'bg-dark text-info border border-info'
                }`}
              >
                ⏱️ {secondsLeft}s
              </span>
            </div>

            {/* Countdown Progress Bar */}
            <div className="mp-timer-container mx-auto" style={{ maxWidth: '480px' }}>
              <div
                className={`mp-timer-fill ${isUrgent ? 'mp-timer-urgent' : ''}`}
                style={{
                  width: `${timerPct}%`,
                  backgroundColor: timerColor,
                }}
              ></div>
            </div>

            <p className="text-white-50 mb-0 mt-2 small">
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
            <div
              className={`mp-glass-card p-4 mb-4 ${
                isFinalBoss ? 'border-warning' : isNightmare ? 'border-danger' : ''
              }`}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-white mb-0">Make Your Guess</h5>
                <span className="badge bg-dark border border-secondary text-warning">
                  Attempts: {attemptsLeft} left
                </span>
              </div>

              {errorMsg && <div className="alert alert-danger py-2 small mb-3">{errorMsg}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <div className="input-group input-group-lg">
                    <input
                      type="number"
                      className="form-control text-center fw-black fs-4 bg-dark text-white border-secondary"
                      placeholder={`${Number(room.minNumber).toLocaleString()} - ${Number(
                        room.maxNumber
                      ).toLocaleString()}`}
                      min={room.minNumber}
                      max={room.maxNumber}
                      value={guessInput}
                      onChange={(e) => setGuessInput(e.target.value)}
                      disabled={!isMyTurn || attemptsLeft <= 0 || loading}
                      autoFocus={isMyTurn}
                    />
                  </div>
                  <div className="form-text text-white-50 small mt-1 text-center">
                    Enter any number between {Number(room.minNumber).toLocaleString()} and{' '}
                    {Number(room.maxNumber).toLocaleString()}
                  </div>
                </div>

                <button
                  type="submit"
                  className={`btn w-100 py-3 rounded-pill fw-black fs-5 shadow ${
                    isMyTurn && attemptsLeft > 0
                      ? isFinalBoss
                        ? 'btn-warning text-dark'
                        : isNightmare
                        ? 'btn-danger text-white'
                        : 'btn-primary'
                      : 'btn-secondary disabled'
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
              {room.players?.map((p) => {
                const isCurrentTurn = room.currentTurnPlayerId === p.playerId;
                return (
                  <div
                    key={p.id || p.playerId}
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
                          <span
                            className={`badge small ${
                              p.team === 'TEAM_RED' ? 'bg-danger' : 'bg-primary'
                            }`}
                          >
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
                        <span className="badge bg-warning text-dark">🏆 {p.roundsWon}</span>
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
          <div
            className={`mp-glass-card p-4 h-100 ${
              isFinalBoss ? 'border-warning' : isNightmare ? 'border-danger' : ''
            }`}
          >
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
                    badgeClass = 'bg-danger text-white';
                    icon = '⬇️ Too High';
                  } else if (g.result === 'CORRECT') {
                    badgeClass = 'bg-success text-white';
                    icon = '🎉 CORRECT';
                  }

                  return (
                    <div
                      key={g.id || `${g.roundNumber}-${g.attemptNumber}-${g.guessNumber}`}
                      className="mp-guess-item p-3 rounded-3 d-flex justify-content-between align-items-center"
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <strong className="text-white fs-5">
                          {Number(g.guessNumber).toLocaleString()}
                        </strong>
                        <span className="text-white-50 small">
                          by <span className="text-white fw-bold">{g.username}</span>
                          {g.team && g.team !== 'SOLO' && (
                            <span
                              className={`ms-1 small ${
                                g.team === 'TEAM_RED' ? 'text-danger' : 'text-primary'
                              }`}
                            >
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
