import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import gameService from '../services/gameService';
import Timer from '../components/Timer';
import ScoreCard from '../components/ScoreCard';
import AttemptCounter from '../components/AttemptCounter';
import GameResult from '../components/GameResult';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import sounds from '../utils/soundEffects';
import { getDefaultRoster, getPlayerModeTitle, calculateAiGuess } from '../utils/playerModesHelper';
import RosterCustomizer from '../components/RosterCustomizer';
import InteractiveRangeRuler from '../components/InteractiveRangeRuler';
import PowerUpsBar from '../components/PowerUpsBar';
import GameJuiceEffects from '../components/GameJuiceEffects';
import InteractiveNumpad from '../components/InteractiveNumpad';
import DeductionAnalyticsBar from '../components/DeductionAnalyticsBar';
import NetworkStatusPill from '../components/NetworkStatusPill';
import BossRaidHud from '../components/BossRaidHud';
import ThemeSelectorPill from '../components/ThemeSelectorPill';
import { getSelectedPin, applyThemeClass } from '../utils/themeHelper';
import { recordDailyChallengeResult } from '../utils/dailyChallengeHelper';
import '../styles/Game.css';
import '../styles/Themes.css';

const Game = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const inputRef = useRef(null);

  const initialDifficulty = location.state?.difficulty || 'MEDIUM';
  const initialMode = location.state?.mode || 'CLASSIC';
  const initialPlayerMode = location.state?.playerMode || '1_VS_CPU';
  const initialRoster = location.state?.roster || getDefaultRoster(initialPlayerMode, currentUser?.username);
  const isDailyChallenge = Boolean(location.state?.isDailyChallenge);

  const [game, setGame] = useState(null);
  const [currentMode, setCurrentMode] = useState(initialMode);
  const [playerMode, setPlayerMode] = useState(initialPlayerMode);
  const [roster, setRoster] = useState(initialRoster);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [aiThinking, setAiThinking] = useState(false);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [guessInput, setGuessInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentHint, setCurrentHint] = useState(null);
  const [proximity, setProximity] = useState(null);
  const [detectiveClues, setDetectiveClues] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timeAttackLeft, setTimeAttackLeft] = useState(45);
  const [finalResult, setFinalResult] = useState(null);

  // Sound, Combo & Game Juice Interactive Effects
  const [soundEnabled, setSoundEnabled] = useState(() => sounds.enabled);
  const [triggerConfetti, setTriggerConfetti] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [comboCount, setComboCount] = useState(1);
  const [isScreenShaking, setIsScreenShaking] = useState(false);

  // Thinker's Tactical Toolbox Power-Ups
  const [powerUps, setPowerUps] = useState({
    slice50: true,
    oracle: true,
    shield: true,
    empFreeze: true,
  });
  const [oracleClue, setOracleClue] = useState(null);

  const handleUpdatePlayerName = (id, newName) => {
    setRoster((prev) => {
      if (id && id.startsWith('cpu_boss')) {
        return prev.map((p) =>
          p.id && p.id.startsWith('cpu_boss') ? { ...p, name: newName } : p
        );
      }
      return prev.map((p) => (p.id === id ? { ...p, name: newName } : p));
    });
  };

  const handleUpdatePlayerTeam = (id, newTeam) => {
    setRoster((prev) =>
      prev.map((p) => (p.id === id ? { ...p, team: newTeam } : p))
    );
  };

  const handleUpdateTeamName = (oldTeamName, newTeamName) => {
    setRoster((prev) =>
      prev.map((p) => (p.team === oldTeamName ? { ...p, team: newTeamName } : p))
    );
  };

  const handleResetRoster = () => {
    setRoster(getDefaultRoster(playerMode, currentUser?.username));
  };

  // Range boundary tracking for helper guidance
  const [currentMin, setCurrentMin] = useState(1);
  const [currentMax, setCurrentMax] = useState(100);

  const activeContender = roster[currentTurnIndex] || roster[0] || { name: 'Player 1', team: 'Solo', isAi: false };
  const isCurrentAi = Boolean(activeContender?.isAi);
  const isAiMatch = roster.some((p) => p.isAi);
  const aiContender = roster.find((p) => p.isAi);


  useEffect(() => {
    applyThemeClass();
    if (!currentUser) {
      navigate('/login', { state: { from: location } });
      return;
    }
    initNewGame(initialDifficulty, initialMode, initialPlayerMode, initialRoster);
  }, []);

  const attemptsLeft = game ? Math.max(0, game.attemptsAllowed - (game.attemptsUsed || 0)) : 7;
  const isClutch = Boolean(!finalResult && game && attemptsLeft === 1);

  useEffect(() => {
    if (isClutch && soundEnabled && !finalResult) {
      sounds.playHeartbeat();
      const interval = setInterval(() => {
        sounds.playHeartbeat();
      }, 2400);
      return () => clearInterval(interval);
    }
  }, [isClutch, soundEnabled, finalResult]);

  useEffect(() => {
    if (!loading && !finalResult && !isCurrentAi && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading, finalResult, isCurrentAi, currentTurnIndex]);

  // Blitz Time Attack countdown timer
  useEffect(() => {
    let timerId = null;
    if (currentMode === 'TIME_ATTACK' && isTimerRunning && !finalResult) {
      timerId = setInterval(() => {
        setTimeAttackLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerId);
            setIsTimerRunning(false);
            sounds.playGameOver();
            setFinalResult({
              gameId: game?.gameId,
              status: 'LOST',
              difficulty: game?.difficulty || initialDifficulty,
              gameMode: 'TIME_ATTACK',
              playerMode: playerMode,
              score: 0,
              attemptsUsed: game?.attemptsUsed || 0,
              attemptsAllowed: game?.attemptsAllowed || 12,
              timeTakenSeconds: 45,
              message: "⚡ Time's Up! You ran out of time in Blitz Mode.",
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [currentMode, isTimerRunning, finalResult, game, initialDifficulty, playerMode]);

  // Computer Turn Automated Guess Hook
  useEffect(() => {
    if (!game || finalResult || loading || submitting || !isTimerRunning || aiThinking) {
      return;
    }

    const contender = roster[currentTurnIndex];
    if (contender && contender.isAi) {
      setAiThinking(true);
      const timer = setTimeout(async () => {
        const aiGuess = calculateAiGuess(currentMin, currentMax, game.difficulty, guesses);
        await executeGuess(aiGuess, contender);
        setAiThinking(false);
      }, 1300);

      return () => clearTimeout(timer);
    }
  }, [currentTurnIndex, game, finalResult, loading, submitting, isTimerRunning, currentMin, currentMax, roster, aiThinking, guesses]);

  const initNewGame = async (difficulty, mode = currentMode, pMode = playerMode, pRoster = roster) => {
    try {
      setLoading(true);
      setError('');
      setFinalResult(null);
      setCurrentHint(null);
      setProximity(null);
      setDetectiveClues([]);
      setGuesses([]);
      setGuessInput('');
      setElapsedSeconds(0);
      setTimeAttackLeft(45);
      setCurrentTurnIndex(0);
      setAiThinking(false);
      setTriggerConfetti(false);
      setComboCount(1);
      setIsScreenShaking(false);
      setFloatingTexts([]);
      setPowerUps({ slice50: true, oracle: true, shield: true, empFreeze: true });
      setOracleClue(null);
      setAiMood('idle');
      setAiSpeech('');

      const activeRoster = pRoster && pRoster.length > 0 ? pRoster : getDefaultRoster(pMode, currentUser?.username);
      setRoster(activeRoster);
      setPlayerMode(pMode);

      const newGame = await gameService.startGame(currentUser.id, difficulty, mode, pMode);
      setGame(newGame);
      setCurrentMode(newGame.gameMode || mode);
      setCurrentMin(newGame.minNumber);
      setCurrentMax(newGame.maxNumber);
      setIsTimerRunning(true);
    } catch (err) {
      setError(err.message || 'Failed to initialize game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSound = () => {
    const newVal = sounds.toggleSound();
    setSoundEnabled(newVal);
    if (newVal) sounds.playClick();
  };

  const triggerFloatingText = (text, bg) => {
    const id = Date.now() + Math.random();
    setFloatingTexts((prev) => [...prev, { id, text, bg }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 2200);
  };

  const triggerShake = () => {
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 380);
  };

  const handleUsePowerUp = async (type) => {
    if (!game || finalResult || !powerUps[type]) return;

    if (type === 'empFreeze') {
      setPowerUps((prev) => ({ ...prev, empFreeze: false }));
      sounds.playEmpGlitch();
      triggerFloatingText('⏸️ TURN FROZEN! Opponent Skipped!', 'linear-gradient(135deg, #06b6d4, #0284c7)');
      // If current turn is computer, skip turn immediately!
      if (isCurrentAi) {
        setAiThinking(false);
        setCurrentTurnIndex((prev) => (prev + 1) % roster.length);
      }
      return;
    }

    try {
      const res = await gameService.usePowerUp(game.gameId, type, currentMin, currentMax);
      setPowerUps((prev) => ({ ...prev, [type]: false }));

      if (type === 'slice50') {
        sounds.playLaserSlice();
        if (res.newMin && res.newMin > currentMin) {
          setCurrentMin(res.newMin);
        }
        if (res.newMax && res.newMax < currentMax) {
          setCurrentMax(res.newMax);
        }
        triggerFloatingText(`⚡ QUANTUM SLICE! -${res.slicedCount || '50%'} CUT!`, 'linear-gradient(135deg, #eab308, #ca8a04)');
        if (isAiMatch) {
          setAiMood('shocked');
          setAiSpeech(`Quantum cut! ${res.slicedCount || 'Half of the'} candidates were vaporized!`);
        }
      } else if (type === 'oracle') {
        sounds.playPowerUp();
        setOracleClue(res.clue);
        triggerFloatingText('🔮 ORACLE HAS SPOKEN!', 'linear-gradient(135deg, #6366f1, #4f46e5)');
      } else if (type === 'shield') {
        sounds.playShield();
        triggerFloatingText('🛡️ +1 BONUS ATTEMPT!', 'linear-gradient(135deg, #10b981, #059669)');
        setGame((prev) => ({
          ...prev,
          attemptsAllowed: res.attemptsAllowed || (prev.attemptsAllowed + 1),
          attemptsRemaining: res.attemptsRemaining || (prev.attemptsRemaining + 1),
        }));
      }
    } catch (err) {
      console.warn('Backend power-up fallback', err);
      setPowerUps((prev) => ({ ...prev, [type]: false }));
      if (type === 'shield') {
        sounds.playShield();
        triggerFloatingText('🛡️ +1 BONUS ATTEMPT!', 'linear-gradient(135deg, #10b981, #059669)');
        setGame((prev) => ({
          ...prev,
          attemptsAllowed: prev.attemptsAllowed + 1,
          attemptsRemaining: (prev.attemptsRemaining || 0) + 1,
        }));
      } else if (type === 'oracle') {
        sounds.playPowerUp();
        const parityClue = currentMin % 2 === 0 ? 'Target is situated in an even quadrant.' : 'Target is situated in an odd quadrant.';
        setOracleClue(`Mathematical Resonance: ${parityClue} (Sum of limits: ${currentMin + currentMax})`);
        triggerFloatingText('🔮 ORACLE HAS SPOKEN!', 'linear-gradient(135deg, #6366f1, #4f46e5)');
      } else if (type === 'slice50') {
        sounds.playLaserSlice();
        const half = Math.max(1, Math.floor((currentMax - currentMin) / 4));
        setCurrentMin((prev) => Math.min(prev + half, currentMax - 1));
        triggerFloatingText('⚡ QUANTUM SLICE EXECUTED!', 'linear-gradient(135deg, #eab308, #ca8a04)');
      }
    }
  };

  const executeGuess = async (num, contender) => {
    if (submitting || !game || finalResult) return;

    try {
      setSubmitting(true);
      setError('');
      sounds.playClick();

      const prevCandidates = currentMax - currentMin + 1;
      let nextMin = currentMin;
      let nextMax = currentMax;

      const response = await gameService.makeGuess(game.gameId, num);

      // Audio feedback & range tracking
      if (response.result === 'CORRECT') {
        setTriggerConfetti(true);
        sounds.playWin();
        triggerFloatingText('🎉 BULLSEYE! PERFECT DEDUCTION!', 'linear-gradient(135deg, #10b981, #059669)');
      } else if (response.result === 'TOO_LOW') {
        sounds.playTooLow();
        if (num >= currentMin) {
          nextMin = num + 1;
          setCurrentMin(nextMin);
        }
      } else if (response.result === 'TOO_HIGH') {
        sounds.playTooHigh();
        if (num <= currentMax) {
          nextMax = num - 1;
          setCurrentMax(nextMax);
        }
      }

      if (response.result !== 'CORRECT') {
        const nextCandidates = Math.max(1, nextMax - nextMin + 1);
        const eliminated = Math.max(0, prevCandidates - nextCandidates);
        const cutRatio = prevCandidates > 0 ? (eliminated / prevCandidates) * 100 : 0;

        if (response.proximity === 'BOILING_HOT') {
          triggerShake();
          triggerFloatingText('🌋 BOILING HOT! DANGEROUSLY CLOSE!', 'linear-gradient(135deg, #dc2626, #b91c1c)');
        } else if (cutRatio >= 25) {
          setComboCount((prev) => prev + 1);
          triggerFloatingText(`+${eliminated} VAPORIZED! 🔥 ${Math.round(cutRatio)}% CUT!`, 'linear-gradient(135deg, #f59e0b, #ef4444)');
        } else if (eliminated > 0) {
          triggerFloatingText(`-${eliminated} Candidates`, 'linear-gradient(135deg, #0284c7, #38bdf8)');
        }

        if (currentMode === 'HARDCORE') {
          triggerShake();
        }
      }

      if (response.proximity) {
        setProximity(response.proximity);
      }

      if (response.extraClue) {
        setDetectiveClues((prev) => {
          if (!prev.includes(response.extraClue)) {
            return [...prev, response.extraClue];
          }
          return prev;
        });
      }

      // Heartbeat tension audio on critical attempts
      if (response.result !== 'CORRECT' && response.attemptsRemaining <= 2 && response.attemptsRemaining > 0) {
        sounds.playHeartbeat();
      }

      setCurrentHint({
        result: response.result,
        message: response.message,
        guess: num,
        attempt: response.attemptNumber,
        proximity: response.proximity,
        guesser: contender,
      });

      setGuesses((prev) => [
        {
          id: Date.now(),
          guessNumber: num,
          result: response.result,
          attemptNumber: response.attemptNumber,
          createdAt: response.createdAt || new Date().toISOString(),
          proximity: response.proximity,
          guesserName: contender.name,
          guesserTeam: contender.team,
          guesserColor: contender.color,
          isAi: contender.isAi,
        },
        ...prev,
      ]);

      setGame((prev) => ({
        ...prev,
        attemptsUsed: response.attemptsUsed,
        attemptsRemaining: response.attemptsRemaining,
        score: response.score,
        status: response.status,
      }));

      setGuessInput('');

      if (response.gameOver) {
        setIsTimerRunning(false);
        const timeTaken = currentMode === 'TIME_ATTACK' ? (45 - timeAttackLeft) : elapsedSeconds;

        // Record Daily Mystery Challenge streak if in daily challenge mode
        if (isDailyChallenge || currentMode === 'DAILY') {
          recordDailyChallengeResult(response.status, response.attemptsUsed, [
            {
              id: Date.now(),
              guessNumber: num,
              result: response.result,
              attemptNumber: response.attemptNumber,
              createdAt: response.createdAt || new Date().toISOString(),
              proximity: response.proximity,
            },
            ...guesses,
          ]);
        }

        let winnerAnnouncement = '';
        if (response.status === 'WON') {
          if (playerMode === '1_VS_CPU') {
            winnerAnnouncement = contender.isAi
              ? `💻 Computer (${contender.name}) beat you to the secret number!`
              : `🎉 VICTORY! You defeated the Computer!`;
          } else if (playerMode === '1P_VS_1P') {
            winnerAnnouncement = `🏆 ${contender.name} WINS THE DUEL!`;
          } else if (playerMode === '2P_VS_2CPU') {
            winnerAnnouncement = contender.isAi
              ? `💻 Team Computer (${contender.name}) claimed victory!`
              : `🎉 Team Players (${contender.name}) WINS THE MATCH!`;
          } else if (playerMode === '2P_VS_2P') {
            winnerAnnouncement = `🏆 ${contender.team} (${contender.name}) WINS THE CLASH!`;
          } else if (playerMode === '3P_VS_1CPU') {
            winnerAnnouncement = contender.isAi
              ? `💀 MasterMind Boss Computer outsmarted the squad!`
              : `🎉 RAID VICTORY! ${contender.name} & Squad defeated the MasterMind Boss!`;
          } else if (playerMode === '4P_FFA') {
            winnerAnnouncement = `👑 CROWN CHAMPION: ${contender.name} cracked the secret number!`;
          } else if (playerMode === '4P_VS_4P') {
            winnerAnnouncement = `🏆 ${contender.team} WINS! Winning guess by ${contender.name}!`;
          } else {
            winnerAnnouncement = `🎉 Congratulations! You mastered the Random Thinking challenge!`;
          }
        } else {
          winnerAnnouncement = `Game Over! All attempts exhausted.`;
        }

        setFinalResult({
          gameId: game.gameId,
          status: response.status,
          difficulty: game.difficulty,
          gameMode: currentMode,
          playerMode: playerMode,
          winner: response.status === 'WON' ? contender : null,
          winnerAnnouncement,
          score: response.score,
          attemptsUsed: response.attemptsUsed,
          attemptsAllowed: game.attemptsAllowed,
          timeTakenSeconds: timeTaken,
          message: winnerAnnouncement,
          guesses: [
            {
              id: Date.now(),
              guessNumber: num,
              result: response.result,
              attemptNumber: response.attemptNumber,
              proximity: response.proximity,
            },
            ...guesses,
          ],
        });
      } else {
        // Rotate to next turn
        setCurrentTurnIndex((prev) => (prev + 1) % roster.length);
      }
    } catch (err) {
      setError(err.message || 'Error processing guess.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuessSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!guessInput || submitting || !game || finalResult || isCurrentAi || aiThinking) return;

    const num = parseInt(guessInput, 10);
    if (isNaN(num)) {
      setError('Please enter a valid number.');
      return;
    }

    if (num < game.minNumber || num > game.maxNumber) {
      setError(`Guess must be within range ${game.minNumber} and ${game.maxNumber}.`);
      return;
    }

    if (isClutch) {
      sounds.playHeartbeat();
      triggerFloatingText('💓 CLUTCH GUESS SUBMITTED...', 'linear-gradient(135deg, #dc2626, #b91c1c)');
      await new Promise((r) => setTimeout(r, 420));
    }

    await executeGuess(num, activeContender);
  };

  const handleRestart = () => {
    sounds.playClick();
    initNewGame(game?.difficulty || initialDifficulty, game?.gameMode || currentMode, playerMode, roster);
  };

  const handleExit = () => {
    sounds.playClick();
    if (window.confirm('Are you sure you want to exit? Your current game progress will be lost.')) {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Generating secret number & game session..." fullScreen />;
  }

  // Calculate Heat needle percentage for HOT_COLD mode
  const getProximityNeedlePercent = () => {
    switch (proximity) {
      case 'BOILING_HOT':
        return 95;
      case 'HOT':
        return 78;
      case 'WARM':
        return 50;
      case 'COLD':
        return 28;
      case 'FREEZING':
      default:
        return 8;
    }
  };

  const getModeBadge = () => {
    switch (currentMode) {
      case 'HOT_COLD':
        return { label: 'Hot or Cold', icon: 'bi-fire', badge: 'bg-danger text-white' };
      case 'TIME_ATTACK':
        return { label: 'Blitz Time Attack', icon: 'bi-lightning-charge-fill', badge: 'bg-warning text-dark' };
      case 'DETECTIVE':
        return { label: 'Number Detective', icon: 'bi-search-heart-fill', badge: 'bg-info text-dark' };
      case 'HARDCORE':
        return { label: 'Sudden Death', icon: 'bi-skull-fill', badge: 'bg-dark text-white border border-danger' };
      case 'DAILY':
        return { label: 'Daily Mystery', icon: 'bi-calendar-event-fill', badge: 'bg-primary text-white shadow-sm' };
      case 'CLASSIC':
      default:
        return { label: 'Classic Guess', icon: 'bi-bullseye', badge: 'bg-primary text-white' };
    }
  };

  const modeBadge = getModeBadge();

  return (
    <div className={`game-container container py-4 ${isScreenShaking ? 'screen-shake' : ''}`}>
      {/* 60FPS Confetti & Floating Score Popups Engine */}
      <GameJuiceEffects
        triggerConfetti={triggerConfetti}
        floatingTexts={floatingTexts}
      />

      {/* Top Header & Status Bar */}
      <div className="card shadow-sm border-0 rounded-4 mb-4 bg-body">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <span className="fs-3">🎯</span>
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h4 className="fw-bold mb-0">RANDOM THINKING</h4>
                  <span className={`badge rounded-pill px-2.5 py-1 ${modeBadge.badge}`}>
                    <i className={`bi ${modeBadge.icon} me-1`}></i>
                    {modeBadge.label}
                  </span>
                </div>
                <div className="d-flex align-items-center gap-2 small text-muted">
                  <span>Difficulty: <strong className="text-primary">{game?.difficulty}</strong></span>
                  <span>•</span>
                  <span>Target Range: <strong className="text-dark font-monospace">{game?.minNumber} – {game?.maxNumber}</strong></span>
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              {/* Board Theme & Pin Selector Pill */}
              <ThemeSelectorPill />

              {/* Online / Offline Network Pill */}
              <NetworkStatusPill />

              {/* Interactive Audio Sound FX Pill with Animated Equalizer */}
              <button
                type="button"
                onClick={handleToggleSound}
                className={`btn btn-sm rounded-pill d-flex align-items-center gap-2 px-3 py-1.5 transition-all ${
                  soundEnabled
                    ? 'btn-outline-success border-success-subtle bg-success-subtle text-success'
                    : 'btn-outline-secondary opacity-75'
                }`}
                title={soundEnabled ? 'Sound FX Enabled (Tap to mute)' : 'Sound Muted (Tap to enable)'}
              >
                <i className={`bi ${soundEnabled ? 'bi-volume-up-fill' : 'bi-volume-mute-fill'} fs-6`}></i>
                <span className="small fw-bold font-monospace">{soundEnabled ? 'SFX ON' : 'MUTED'}</span>
                {soundEnabled && (
                  <span className="sound-equalizer-bars d-inline-flex gap-0.5 align-items-end" style={{ height: '12px' }}>
                    <span className="eq-bar eq-bar-1"></span>
                    <span className="eq-bar eq-bar-2"></span>
                    <span className="eq-bar eq-bar-3"></span>
                  </span>
                )}
              </button>

              {/* Mode-specific timer */}
              {currentMode === 'TIME_ATTACK' ? (
                <div
                  className={`blitz-timer-pill d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill ${
                    timeAttackLeft <= 10 ? 'blitz-timer-critical' : ''
                  }`}
                  title="Blitz Countdown Time Remaining"
                >
                  <i className="bi bi-alarm-fill"></i>
                  <span className="fs-5">{timeAttackLeft}s</span>
                </div>
              ) : (
                <Timer
                  isRunning={isTimerRunning}
                  initialSeconds={0}
                  onTick={(sec) => setElapsedSeconds(sec)}
                />
              )}

              {playerMode !== 'SOLO' && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    setShowRosterModal(true);
                  }}
                  className="btn btn-outline-secondary btn-sm rounded-pill d-flex align-items-center gap-1"
                  title="Edit Player Names and Teams"
                >
                  <i className="bi bi-pencil-square"></i> Edit Teams & Players
                </button>
              )}
              <button
                onClick={handleRestart}
                className="btn btn-outline-primary btn-sm rounded-pill d-flex align-items-center gap-1"
                title="Restart Game"
              >
                <i className="bi bi-arrow-repeat"></i> Restart
              </button>
              <button
                onClick={handleExit}
                className="btn btn-outline-danger btn-sm rounded-pill d-flex align-items-center gap-1"
                title="Exit Game"
              >
                <i className="bi bi-box-arrow-left"></i> Exit
              </button>
            </div>
          </div>
        </div>
      </div>

      <ErrorMessage message={error} onDismiss={() => setError('')} />

      {/* Clutch Final Attempt Sensory Vignette and Alert Banner */}
      {isClutch && (
        <>
          <div className="clutch-vignette-overlay" aria-hidden="true"></div>
          <div className="clutch-warning-banner card border-0 p-3 rounded-4 mb-4 text-center shadow-lg">
            <div className="d-flex align-items-center justify-content-center gap-2">
              <span className="fs-3">💓</span>
              <h5 className="fw-bold mb-0">FINAL ATTEMPT CLUTCH! ONE GUESS REMAINS!</h5>
              <span className="fs-3">💓</span>
            </div>
            <div className="small text-white-50 mt-1 font-monospace">
              Adrenaline surging! Narrow your focus and execute the ultimate deduction!
            </div>
          </div>
        </>
      )}

      {/* Sudden Death Extreme Stakes Banner */}
      {currentMode === 'HARDCORE' && (
        <div className="sudden-death-banner card border-0 text-white p-3 rounded-4 mb-4 shadow-sm">
          <div className="d-flex align-items-center gap-3">
            <span className="fs-1">💀</span>
            <div>
              <h6 className="fw-bold mb-1 text-danger">SUDDEN DEATH CHALLENGE • 3.0x REWARD MULTIPLIER</h6>
              <p className="small text-white-50 mb-0">
                Extremely limited attempts. Any mistake costs dear. Maintain composure and deduce the number!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* When Game is Over: Show Result Card */}
      {finalResult ? (
        <GameResult result={finalResult} onPlayAgain={handleRestart} />
      ) : (
        /* Active Game Arena */
        <div>
          {/* Boss Raid HP Matrix Bar (for 3v1 Boss Computer Mode) */}
          {playerMode === '3P_VS_1CPU' && (
            <BossRaidHud
              bossName={aiContender?.name || 'MasterMind Boss Computer'}
              minNumber={game?.minNumber || 1}
              maxNumber={game?.maxNumber || 100}
              currentMin={currentMin}
              currentMax={currentMax}
              attemptsRemaining={attemptsLeft}
              isCurrentAiTurn={isCurrentAi}
            />
          )}

          {/* Turn & Matchup HUD Banner */}
          <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-body turn-hud-card">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-primary rounded-pill px-3 py-1 font-monospace">
                  <i className="bi bi-controller me-1"></i> {getPlayerModeTitle(playerMode)}
                </span>
                <span className="text-muted small">
                  Turn {game?.attemptsUsed ? game.attemptsUsed + 1 : 1} of {game?.attemptsAllowed}
                </span>
                {playerMode !== 'SOLO' && (
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-decoration-none p-0 ms-2 text-primary fw-semibold"
                    onClick={() => {
                      sounds.playClick();
                      setShowRosterModal(true);
                    }}
                    title="Edit Player Names and Teams"
                  >
                    <i className="bi bi-pencil-square me-1"></i> Edit Names & Teams
                  </button>
                )}
              </div>
              {isCurrentAi ? (
                <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-1 rounded-pill animate-pulse">
                  <i className="bi bi-cpu-fill me-1"></i> Computer Thinking...
                </span>
              ) : (
                <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1 rounded-pill">
                  <i className="bi bi-person-check-fill me-1"></i> Your Move!
                </span>
              )}
            </div>

            {/* Active Contender Spotlight */}
            <div
              className={`p-3 rounded-4 d-flex flex-wrap justify-content-between align-items-center gap-3 transition-all ${
                isCurrentAi
                  ? 'bg-danger-subtle border border-danger'
                  : 'bg-primary-subtle border border-primary'
              }`}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className={`rounded-circle p-2 d-flex align-items-center justify-content-center text-white shadow-sm ${
                    isCurrentAi ? 'bg-danger' : 'bg-primary'
                  }`}
                  style={{ width: '46px', height: '46px', fontSize: '1.3rem' }}
                >
                  <i className={`bi ${activeContender.icon || (isCurrentAi ? 'bi-cpu-fill' : 'bi-person-fill')}`}></i>
                </div>
                <div>
                  <div className="small text-muted font-monospace text-uppercase" style={{ fontSize: '0.75rem' }}>
                    CURRENT TURN:
                  </div>
                  <h5 className="fw-bold mb-0 text-body d-flex align-items-center gap-2">
                    <span>{activeContender.name}</span>
                    <span className="badge bg-body text-body-secondary border small font-monospace">
                      {activeContender.team}
                    </span>
                  </h5>
                </div>
              </div>

              {/* Roster Order Pills */}
              <div className="d-flex flex-wrap gap-1 align-items-center">
                <span className="small text-muted me-1 font-monospace">Order:</span>
                {roster.map((p, idx) => {
                  const isTurn = idx === currentTurnIndex;
                  return (
                    <span
                      key={p.id + '-' + idx}
                      className={`badge rounded-pill px-2.5 py-1 font-monospace ${
                        isTurn
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-body-secondary text-body-secondary'
                      }`}
                      style={{
                        transform: isTurn ? 'scale(1.08)' : 'scale(1)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {p.name}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Main Guessing Arena */}
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 text-center bg-body h-100 guessing-box">
                {/* Interactive Visual Range Ruler with Ice/Fire Pins & Draggable Slider */}
                <InteractiveRangeRuler
                  minNumber={game?.minNumber || 1}
                  maxNumber={game?.maxNumber || 100}
                  currentMin={currentMin}
                  currentMax={currentMax}
                  guesses={guesses}
                  currentGuess={guessInput}
                  onSelectNumber={(num) => setGuessInput(String(num))}
                  disabled={submitting || isCurrentAi || aiThinking}
                  gameMode={currentMode}
                  proximity={proximity}
                  customPin={getSelectedPin()}
                />

                {/* Real-Time Deduction IQ & Uncertainty Shrink Analytics */}
                <DeductionAnalyticsBar
                  minNumber={game?.minNumber || 1}
                  maxNumber={game?.maxNumber || 100}
                  currentMin={currentMin}
                  currentMax={currentMax}
                  guesses={guesses}
                  comboCount={comboCount}
                />

                {/* Thinker's Tactical Toolbox Power-Ups */}
                <PowerUpsBar
                  powerUps={powerUps}
                  onUsePowerUp={handleUsePowerUp}
                  disabled={submitting || isCurrentAi || aiThinking || Boolean(finalResult)}
                  isAiMatch={isAiMatch}
                  oracleClue={oracleClue}
                  onDismissOracle={() => setOracleClue(null)}
                />

                {/* Hot or Cold Proximity Heat Radar Bar */}
                {currentMode === 'HOT_COLD' && proximity && (
                  <div className="mb-4 p-3 rounded-4 bg-body-tertiary border text-center animate-pop-in">
                    <div className="d-flex justify-content-between align-items-center text-muted small fw-bold mb-2">
                      <span className="text-info">🧊 Freezing</span>
                      <span className="text-primary">❄️ Chilly</span>
                      <span className="text-warning">🌤️ Warm</span>
                      <span className="text-danger">🔥 Hot</span>
                      <span className="text-danger fw-black">🌋 Boiling!</span>
                    </div>
                    <div className="heat-radar-bar position-relative my-2">
                      <div
                        className="heat-needle"
                        style={{ left: `${getProximityNeedlePercent()}%` }}
                      ></div>
                    </div>
                    <div className="small fw-semibold mt-2 text-secondary">
                      Proximity Status: <strong className="text-danger text-uppercase">{proximity.replace('_', ' ')}</strong>
                    </div>
                  </div>
                )}

                {/* Number Detective Dossier Card */}
                {currentMode === 'DETECTIVE' && detectiveClues.length > 0 && (
                  <div className="detective-dossier-card card p-3 rounded-4 mb-4 text-start shadow-sm">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-search-heart-fill text-info fs-5"></i>
                      <h6 className="fw-bold mb-0 text-info">Detective's Secret Dossier (Clues Unlocked)</h6>
                    </div>
                    <div className="small">
                      {detectiveClues.map((clue, idx) => (
                        <div key={idx} className="detective-clue-item text-body">
                          {clue}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dynamic Hint Display */}
                {currentHint && (
                  <div
                    className={`alert ${
                      currentHint.result === 'CORRECT'
                        ? 'alert-success'
                        : currentHint.result === 'TOO_LOW'
                        ? 'alert-info'
                        : 'alert-warning'
                    } d-flex align-items-center justify-content-center gap-2 py-3 px-4 rounded-4 shadow-sm mb-4 animate-pop-in`}
                  >
                    <span className="fs-4">
                      {currentHint.result === 'TOO_LOW' ? '⬆️' : currentHint.result === 'TOO_HIGH' ? '⬇️' : '🎉'}
                    </span>
                    <div>
                      <strong className="d-block">
                        {currentHint.message}
                      </strong>
                      <span className="small text-muted">
                        Last Guess by <strong className="text-primary">{currentHint.guesser?.name || 'Player'}</strong>: {currentHint.guess} (Attempt #{currentHint.attempt})
                      </span>
                    </div>
                  </div>
                )}

                {/* Input Form */}
                <form onSubmit={handleGuessSubmit} className="my-auto py-2">
                  <label className="form-label text-muted small text-uppercase tracking-wider fw-bold mb-2">
                    {isCurrentAi
                      ? `🤖 ${activeContender.name} is calculating...`
                      : `Enter ${activeContender.name}'s guess (${game?.minNumber} – ${game?.maxNumber}):`}
                  </label>

                  {isCurrentAi && (
                    <div className="alert alert-danger-subtle text-danger border-0 rounded-4 py-2 px-3 mb-3 d-inline-flex align-items-center gap-2">
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                      <span className="fw-semibold font-monospace small">
                        {activeContender.name} is analyzing clue bounds [{currentMin} – {currentMax}]...
                      </span>
                    </div>
                  )}

                  <div className="d-flex justify-content-center mb-3">
                    <div className="guess-input-wrapper position-relative" style={{ maxWidth: '280px', width: '100%' }}>
                      <input
                        ref={inputRef}
                        type="number"
                        className="form-control form-control-lg text-center fw-bold fs-1 rounded-4 shadow-sm font-monospace guess-input"
                        placeholder="?"
                        value={guessInput}
                        onChange={(e) => setGuessInput(e.target.value)}
                        min={game?.minNumber}
                        max={game?.maxNumber}
                        disabled={submitting || isCurrentAi || aiThinking}
                        required
                      />
                    </div>
                  </div>

                  {/* Quick Midpoint and Increment helpers */}
                  <div className="d-flex justify-content-center gap-2 mb-4 flex-wrap">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                      onClick={() => setGuessInput((prev) => Math.max(game?.minNumber || 1, (parseInt(prev, 10) || currentMin) - 1))}
                      disabled={isCurrentAi || aiThinking}
                    >
                      -1
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                      onClick={() => setGuessInput((prev) => Math.max(game?.minNumber || 1, (parseInt(prev, 10) || currentMin) - 5))}
                      disabled={isCurrentAi || aiThinking}
                    >
                      -5
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold"
                      onClick={() => setGuessInput(Math.floor((currentMin + currentMax) / 2))}
                      disabled={isCurrentAi || aiThinking}
                      title="Binary search midpoint deduction"
                    >
                      🎯 Mid: {Math.floor((currentMin + currentMax) / 2)}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                      onClick={() => setGuessInput((prev) => Math.min(game?.maxNumber || 100, (parseInt(prev, 10) || currentMin) + 5))}
                      disabled={isCurrentAi || aiThinking}
                    >
                      +5
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                      onClick={() => setGuessInput((prev) => Math.min(game?.maxNumber || 100, (parseInt(prev, 10) || currentMin) + 1))}
                      disabled={isCurrentAi || aiThinking}
                    >
                      +1
                    </button>
                  </div>

                  {/* Thinking Matrix Virtual Numpad & Quick Probes */}
                  <InteractiveNumpad
                    currentGuess={guessInput}
                    onUpdateGuess={(val) => setGuessInput(val)}
                    onSubmitGuess={handleGuessSubmit}
                    currentMin={currentMin}
                    currentMax={currentMax}
                    minNumber={game?.minNumber || 1}
                    maxNumber={game?.maxNumber || 100}
                    disabled={submitting || isCurrentAi || aiThinking}
                  />

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg px-5 py-3 rounded-pill fw-bold shadow-lg w-100 hover-scale"
                    style={{ maxWidth: '340px' }}
                    disabled={submitting || !guessInput || isCurrentAi || aiThinking}
                  >
                    {submitting ? (
                      <span>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Evaluating...
                      </span>
                    ) : isCurrentAi ? (
                      <span>
                        <i className="bi bi-cpu-fill me-2"></i> COMPUTER THINKING...
                      </span>
                    ) : (
                      <span>
                        <i className="bi bi-send-fill me-2"></i> SUBMIT GUESS ({activeContender.name})
                      </span>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Side Info Panel: Attempts, Score, Guess Logs */}
            <div className="col-lg-4">
              <div className="d-flex flex-column gap-3">
                <AttemptCounter
                  attemptsUsed={game?.attemptsUsed || 0}
                  attemptsAllowed={game?.attemptsAllowed || 7}
                />

                <ScoreCard
                  score={game?.score || 0}
                  difficulty={game?.difficulty}
                  attemptsUsed={game?.attemptsUsed || 0}
                  attemptsAllowed={game?.attemptsAllowed || 7}
                />

                {/* Guess History List */}
                <div className="card border-0 shadow-sm rounded-4 p-3 bg-body">
                  <h6 className="fw-bold mb-3 d-flex justify-content-between align-items-center">
                    <span><i className="bi bi-list-check text-primary me-1"></i> Guesses in this Session</span>
                    <span className="badge bg-secondary-subtle text-body-secondary font-monospace">
                      {guesses.length}
                    </span>
                  </h6>

                  {guesses.length === 0 ? (
                    <p className="text-muted small text-center my-3">
                      No guesses made yet. Make your first move!
                    </p>
                  ) : (
                    <div className="guess-history-list overflow-auto" style={{ maxHeight: '240px' }}>
                      {guesses.map((g) => (
                        <div
                          key={g.id || g.attemptNumber}
                          onClick={() => {
                            if (!isCurrentAi && !submitting && !aiThinking) {
                              setGuessInput(String(g.guessNumber));
                              sounds.playClick();
                              triggerFloatingText(`Recalled #${g.guessNumber}`, 'linear-gradient(135deg, #0d6efd, #0284c7)');
                            }
                          }}
                          className="guess-history-item d-flex justify-content-between align-items-center p-2 mb-1.5 rounded-3 bg-body-tertiary border small"
                          title="Click to recall this guess number into input"
                        >
                          <span className="text-muted font-monospace">#{g.attemptNumber}</span>
                          <span className="badge bg-secondary-subtle text-body-secondary font-monospace text-truncate" style={{ maxWidth: '90px' }} title={g.guesserName}>
                            {g.guesserName || 'Player'}
                          </span>
                          <span className="fw-bold fs-6 font-monospace">{g.guessNumber}</span>
                          <span>
                            {g.result === 'CORRECT' ? (
                              <span className="badge bg-success">CORRECT 🎯</span>
                            ) : g.result === 'TOO_LOW' ? (
                              <span className="badge bg-info text-dark">TOO LOW ⬆️</span>
                            ) : (
                              <span className="badge bg-warning text-dark">TOO HIGH ⬇️</span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for In-Game Player & Team Editing */}
      {showRosterModal && (
        <RosterCustomizer
          roster={roster}
          onUpdatePlayerName={handleUpdatePlayerName}
          onUpdatePlayerTeam={handleUpdatePlayerTeam}
          onUpdateTeamName={handleUpdateTeamName}
          onResetRoster={handleResetRoster}
          playerMode={playerMode}
          isModal={true}
          onClose={() => setShowRosterModal(false)}
        />
      )}
    </div>
  );
};

export default Game;
