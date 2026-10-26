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
import BossRaidHud from '../components/BossRaidHud';
import { getSelectedPin, applyThemeClass } from '../utils/themeHelper';
import { recordDailyChallengeResult } from '../utils/dailyChallengeHelper';
import { getDifficultyConfig, formatRange } from '../utils/gameConfig';
import { getLevelConfig, completeLevel } from '../utils/levelProgression';
import '../styles/Game.css';
import '../styles/Themes.css';

const Game = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const inputRef = useRef(null);

  const [gameLevel, setGameLevel] = useState(() => location.state?.level || 1);
  const currentLevelCfg = getLevelConfig(gameLevel);

  const initialDifficulty = location.state?.difficulty || (gameLevel <= 2 ? 'EASY' : gameLevel <= 5 ? 'MEDIUM' : gameLevel <= 10 ? 'HARD' : 'EXPERT');
  const diffConfig = getDifficultyConfig(initialDifficulty);
  const initialMode = location.state?.mode || 'CLASSIC';
  const initialPlayerMode = location.state?.playerMode || 'SOLO';
  const initialRoster = location.state?.roster || getDefaultRoster(initialPlayerMode, currentUser?.username);
  const isDailyChallenge = Boolean(location.state?.isDailyChallenge);

  const [hintClue, setHintClue] = useState('');
  const [hintUsed, setHintUsed] = useState(false);
  const [showOptionalTools, setShowOptionalTools] = useState(false);

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
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => {
    return localStorage.getItem('rtg_reduced_motion') === 'true';
  });

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

  // Range boundary tracking with guaranteed default fallbacks
  const [currentMin, setCurrentMin] = useState(diffConfig.min);
  const [currentMax, setCurrentMax] = useState(diffConfig.max);

  const activeContender = roster[currentTurnIndex] || roster[0] || { name: 'Player 1', team: 'Solo', isAi: false };
  const isCurrentAi = Boolean(activeContender?.isAi);
  const isAiMatch = roster.some((p) => p.isAi);
  const aiContender = roster.find((p) => p.isAi);


  useEffect(() => {
    applyThemeClass();
    const userToUse = currentUser || authService.getCurrentUser() || authService.loginAsGuest('Guest Player');
    initNewGame(initialDifficulty, initialMode, initialPlayerMode, initialRoster, userToUse);
  }, []);

  const activeLevelConfig = getLevelConfig(gameLevel);
  const safeMin = game?.minNumber ?? activeLevelConfig?.min ?? 1;
  const safeMax = game?.maxNumber ?? activeLevelConfig?.max ?? 100;
  const safeAttemptsAllowed = game?.attemptsAllowed ?? activeLevelConfig?.attempts ?? 7;
  const attemptsLeft = game ? Math.max(0, safeAttemptsAllowed - (game.attemptsUsed || 0)) : safeAttemptsAllowed;
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
    if (currentMode === 'TIME_ATTACK' && isTimerRunning && !isPaused && !finalResult) {
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
  }, [currentMode, isTimerRunning, isPaused, finalResult, game, initialDifficulty, playerMode]);

  // Computer Turn Automated Guess Hook
  useEffect(() => {
    if (!game || finalResult || loading || submitting || !isTimerRunning || isPaused || aiThinking) {
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
  }, [currentTurnIndex, game, finalResult, loading, submitting, isTimerRunning, isPaused, currentMin, currentMax, roster, aiThinking, guesses]);

  const initNewGame = async (difficulty, mode = currentMode, pMode = playerMode, pRoster = roster, activeUser = null, targetLevel = gameLevel) => {
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
      setIsPaused(false);
      setTriggerConfetti(false);
      setComboCount(1);
      setIsScreenShaking(false);
      setFloatingTexts([]);
      setHintClue('');
      setHintUsed(false);

      const lvlCfg = getLevelConfig(targetLevel);
      const isCustom = Boolean(location.state?.isCustomRange);
      const minBound = isCustom && location.state?.minNumber != null ? location.state.minNumber : (lvlCfg?.min ?? 1);
      const maxBound = isCustom && location.state?.maxNumber != null ? location.state.maxNumber : (lvlCfg?.max ?? 100);
      const attemptsCount = isCustom && location.state?.attemptsAllowed != null ? location.state.attemptsAllowed : (lvlCfg?.attempts ?? 7);

      setCurrentMin(minBound);
      setCurrentMax(maxBound);

      const userToUse = activeUser || currentUser || authService.getCurrentUser() || authService.loginAsGuest('Guest Player');
      const activeRoster = pRoster && pRoster.length > 0 ? pRoster : getDefaultRoster(pMode, userToUse?.username);
      setRoster(activeRoster);
      setPlayerMode(pMode);

      const customOptions = {
        level: targetLevel,
        minNumber: minBound,
        maxNumber: maxBound,
        attemptsAllowed: attemptsCount,
      };

      const newGame = await gameService.startGame(userToUse.id, difficulty, mode, pMode, customOptions);
      setGame(newGame);
      setCurrentMode(newGame.gameMode || mode);
      setCurrentMin(newGame?.minNumber ?? minBound);
      setCurrentMax(newGame?.maxNumber ?? maxBound);
      setIsTimerRunning(true);
    } catch (err) {
      setError(err.message || 'Failed to initialize game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartNextLevel = (nextLevelNumber) => {
    sounds.playClick();
    setGameLevel(nextLevelNumber);
    const nextCfg = getLevelConfig(nextLevelNumber);
    initNewGame(
      nextLevelNumber <= 2 ? 'EASY' : nextLevelNumber <= 5 ? 'MEDIUM' : nextLevelNumber <= 10 ? 'HARD' : 'EXPERT',
      'CLASSIC',
      'SOLO',
      roster,
      currentUser,
      nextLevelNumber
    );
  };

  const handleRequestHint = async () => {
    if (hintUsed || !game || finalResult || submitting) return;
    sounds.playPowerUp();
    setHintUsed(true);
    try {
      const res = await gameService.usePowerUp(game.gameId, 'slice50', currentMin, currentMax);
      if (res.newMin && res.newMin > currentMin) setCurrentMin(res.newMin);
      if (res.newMax && res.newMax < currentMax) setCurrentMax(res.newMax);
      setHintClue(`Helpful Clue: The secret number is between ${res.newMin || currentMin} and ${res.newMax || currentMax}!`);
    } catch {
      const mid = Math.floor((currentMin + currentMax) / 2);
      setHintClue(`Helpful Clue: Try guessing ${mid} (the midpoint) to cut the remaining numbers in half!`);
    }
  };

  const handleToggleSound = () => {
    const newVal = sounds.toggleSound();
    setSoundEnabled(newVal);
    if (newVal) sounds.playClick();
  };

  const handleTogglePause = () => {
    sounds.playClick();
    setIsPaused((prev) => !prev);
  };

  const handleToggleReducedMotion = () => {
    sounds.playClick();
    setReducedMotion((prev) => {
      const next = !prev;
      localStorage.setItem('rtg_reduced_motion', String(next));
      return next;
    });
  };

  const triggerFloatingText = (text, bg) => {
    const id = Date.now() + Math.random();
    setFloatingTexts((prev) => [...prev, { id, text, bg }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 2200);
  };

  const triggerShake = () => {
    if (reducedMotion) return;
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
        if (!reducedMotion) setTriggerConfetti(true);
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

        let levelProgResult = null;
        if (response.status === 'WON' && gameLevel) {
          levelProgResult = completeLevel(gameLevel, response.attemptsUsed, safeAttemptsAllowed);
        }

        const isWin = response.status === 'WON';
        const stars = levelProgResult ? levelProgResult.stars : (isWin ? (response.attemptsUsed <= 3 ? 3 : response.attemptsUsed <= 5 ? 2 : 1) : 0);
        const nextLevelNum = levelProgResult?.nextLevel || (gameLevel + 1);

        setFinalResult({
          gameId: game.gameId,
          status: response.status,
          difficulty: game.difficulty,
          gameMode: currentMode,
          playerMode: playerMode,
          level: gameLevel,
          nextLevel: nextLevelNum,
          unlockedNext: levelProgResult?.unlockedNext ?? false,
          stars,
          secretNumber: response.secretNumber || num,
          winningGuess: num,
          winner: isWin ? contender : null,
          winnerAnnouncement,
          score: response.score,
          attemptsUsed: response.attemptsUsed,
          attemptsAllowed: safeAttemptsAllowed,
          timeTakenSeconds: timeTaken,
          message: isWin ? 'Amazing! You got it!' : 'Almost! Try again.',
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

  const formatTime = (secs) => {
    const safeSecs = Math.max(0, secs || 0);
    const m = Math.floor(safeSecs / 60).toString().padStart(2, '0');
    const s = (safeSecs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handlePickRandomNumber = () => {
    sounds.playClick();
    const min = currentMin || safeMin;
    const max = currentMax || safeMax;
    const guessedSet = new Set(guesses.map((g) => g.guessNumber));
    const available = [];
    for (let i = min; i <= max; i++) {
      if (!guessedSet.has(i)) available.push(i);
    }
    const chosen = available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : Math.floor(Math.random() * (max - min + 1)) + min;

    setGuessInput(String(chosen));
    if (error) setError('');
    triggerFloatingText(`🎲 Random Pick: ${chosen}`, 'linear-gradient(135deg, #8b5cf6, #6366f1)');
  };

  const handleGuessSubmit = async (e) => {
    if (e) e.preventDefault();
    if (submitting || !game || finalResult || isCurrentAi || aiThinking) return;

    if (!guessInput || guessInput.trim() === '') {
      setError('Please enter a number first.');
      return;
    }

    const num = parseInt(guessInput, 10);
    if (isNaN(num)) {
      setError('Please enter a valid number.');
      return;
    }

    const minBound = safeMin;
    const maxBound = safeMax;
    if (num < minBound || num > maxBound) {
      setError(`Please guess a number between ${minBound} and ${maxBound}.`);
      return;
    }

    if (guesses.some((g) => g.guessNumber === num)) {
      setError(`You already guessed ${num}! Try a different number.`);
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
    initNewGame(game?.difficulty || initialDifficulty, game?.gameMode || currentMode, playerMode, roster, currentUser, gameLevel);
  };

  const handleExit = () => {
    sounds.playClick();
    navigate('/');
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
    <div className={`game-container collage-theme-body py-4 px-3 min-vh-100 d-flex flex-column align-items-center ${isScreenShaking ? 'screen-shake' : ''} ${reducedMotion ? 'reduced-motion' : ''}`}>
      {/* 60FPS Confetti & Floating Score Popups Engine */}
      <GameJuiceEffects
        triggerConfetti={triggerConfetti}
        floatingTexts={floatingTexts}
      />

      {/* Hidden Active Timer Engine */}
      <Timer
        isRunning={isTimerRunning && !isPaused}
        initialSeconds={0}
        onTick={(sec) => setElapsedSeconds(sec)}
      />

      <div className="container" style={{ maxWidth: '640px' }}>
        
        {/* Top Header Bar: Back Button, Level & Difficulty, Hearts (Lives) */}
        <div className="d-flex justify-content-between align-items-center mb-3 px-1 flex-wrap gap-2">
          {/* Back Button */}
          <button
            onClick={handleExit}
            className="btn btn-outline-light rounded-pill px-3 py-1.5 fw-bold d-flex align-items-center gap-1.5 shadow-xs"
            style={{ background: 'rgba(255, 255, 255, 0.08)', borderColor: 'rgba(255, 255, 255, 0.2)' }}
            title="Back to Home"
          >
            <i className="bi bi-chevron-left"></i>
            <span>Back</span>
          </button>

          {/* Level & Difficulty Badge */}
          <div className="d-flex align-items-center gap-1.5">
            <span
              className="badge rounded-pill px-3 py-1.5 font-monospace fw-bold"
              style={{ background: 'rgba(139, 92, 246, 0.25)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.4)' }}
            >
              Level {gameLevel}
            </span>
            <span
              className="badge rounded-pill px-2.5 py-1.5 font-monospace fw-bold"
              style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.35)' }}
            >
              {game?.difficulty || initialDifficulty}
            </span>
          </div>

          {/* Remaining Lives / Hearts & Quick Actions */}
          <div className="d-flex align-items-center gap-2">
            {/* Lives Hearts */}
            <div className="d-flex align-items-center" title={`${attemptsLeft} lives remaining`}>
              {Array.from({ length: Math.min(safeAttemptsAllowed, 8) }).map((_, idx) => (
                <span key={idx} className={idx < attemptsLeft ? 'heart-life' : 'heart-life-lost'}>
                  ❤️
                </span>
              ))}
            </div>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={handleToggleSound}
              className="btn btn-sm btn-outline-light rounded-circle p-0 d-flex align-items-center justify-content-center"
              style={{ width: '32px', height: '32px', background: 'rgba(255, 255, 255, 0.08)', borderColor: 'rgba(255, 255, 255, 0.2)' }}
              title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            >
              <i className={`bi ${soundEnabled ? 'bi-volume-up-fill text-success' : 'bi-volume-mute-fill text-muted'}`}></i>
            </button>

            {/* Pause Toggle */}
            <button
              type="button"
              onClick={handleTogglePause}
              className="btn btn-sm btn-outline-light rounded-circle p-0 d-flex align-items-center justify-content-center"
              style={{ width: '32px', height: '32px', background: 'rgba(255, 255, 255, 0.08)', borderColor: 'rgba(255, 255, 255, 0.2)' }}
              title={isPaused ? 'Resume' : 'Pause'}
            >
              <i className={`bi ${isPaused ? 'bi-play-fill text-warning' : 'bi-pause-fill text-white-50'}`}></i>
            </button>
          </div>
        </div>

        {/* Clutch Warning Alert */}
        {isClutch && (
          <div className="alert alert-danger border-danger rounded-4 py-2 px-3 text-center mb-3 animate-pulse shadow-sm">
            <strong className="d-block small">💓 FINAL ATTEMPT! ONE GUESS REMAINS!</strong>
          </div>
        )}

        {/* When Game is Over: Show Result Card */}
        {finalResult ? (
          <GameResult
            result={finalResult}
            onPlayAgain={handleRestart}
            onNextLevel={handleStartNextLevel}
            onHome={handleExit}
          />
        ) : (
          /* Active Central Gameplay Panel Matching Collage */
          <div className="collage-card p-4 p-md-5 text-center position-relative overflow-hidden shadow-2xl mb-4">
            
            {/* Friendly Instruction */}
            <div className="mb-4">
              <h2 className="display-6 fw-black text-white mb-1">
                I'm thinking of a number between {safeMin} and {safeMax}.
              </h2>
              <p className="lead fw-bold mb-0" style={{ color: '#fbbf24' }}>
                Can you guess it?
              </p>
            </div>

            {/* Color-Coded Feedback Message Banner */}
            {currentHint && (
              <div
                className={`p-3 mb-4 d-flex align-items-center justify-content-center gap-3 animate-pop-in ${
                  currentHint.result === 'TOO_LOW'
                    ? 'feedback-too-low'
                    : currentHint.result === 'TOO_HIGH'
                    ? 'feedback-too-high'
                    : 'feedback-correct'
                }`}
              >
                <span className="fs-2">
                  {currentHint.result === 'TOO_LOW' ? '⬆️' : currentHint.result === 'TOO_HIGH' ? '⬇️' : '🎯'}
                </span>
                <div className="text-start">
                  <h4 className="fw-black mb-0">
                    {currentHint.result === 'TOO_LOW'
                      ? 'Too Low!'
                      : currentHint.result === 'TOO_HIGH'
                      ? 'Too High!'
                      : 'Correct!'}
                  </h4>
                  <span className="small">
                    {currentHint.result === 'TOO_LOW'
                      ? 'Try a higher number.'
                      : currentHint.result === 'TOO_HIGH'
                      ? 'Try a lower number.'
                      : 'You guessed it!'}
                  </span>
                </div>
              </div>
            )}

            {/* Error Message Alert */}
            {error && (
              <div className="alert alert-warning border-warning rounded-4 py-2 px-3 mb-3 small d-flex align-items-center justify-content-between animate-pop-in">
                <span>⚠️ {error}</span>
                <button
                  type="button"
                  className="btn-close btn-close-sm"
                  onClick={() => setError('')}
                ></button>
              </div>
            )}

            {/* Large Number Input Field + Random Shortcut Button */}
            <form onSubmit={handleGuessSubmit} className="mb-4">
              <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
                <div style={{ maxWidth: '240px', width: '100%' }}>
                  <input
                    ref={inputRef}
                    type="number"
                    className="form-control collage-number-input"
                    placeholder="?"
                    value={guessInput}
                    onChange={(e) => {
                      setGuessInput(e.target.value);
                      if (error) setError('');
                    }}
                    min={safeMin}
                    max={safeMax}
                    disabled={submitting || isCurrentAi || aiThinking}
                    autoFocus
                  />
                </div>

                {/* 🎲 Random Shortcut Button */}
                <button
                  type="button"
                  onClick={handlePickRandomNumber}
                  className="btn btn-collage-random px-3 py-2 d-flex flex-column align-items-center justify-content-center shadow-sm"
                  title="Pick a random valid number"
                  disabled={submitting || isCurrentAi || aiThinking}
                  style={{ height: '70px', minWidth: '70px' }}
                >
                  <span className="fs-3">🎲</span>
                  <span style={{ fontSize: '0.65rem', letterSpacing: '0.04em' }}>RANDOM</span>
                </button>
              </div>

              {/* Prominent Green Submit Guess Button */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={submitting || !guessInput || isCurrentAi || aiThinking}
                  className="btn btn-collage-submit btn-lg px-5 py-3.5 fs-3 w-100 shadow-lg d-inline-flex align-items-center justify-content-center gap-2"
                  style={{ maxWidth: '380px' }}
                >
                  {submitting ? (
                    <span>Checking...</span>
                  ) : (
                    <>
                      <span>SUBMIT GUESS</span>
                      <i className="bi bi-arrow-right-circle-fill fs-4"></i>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Interactive Range Ruler (Candidate Window) */}
            <div className="mb-3">
              <InteractiveRangeRuler
                minNumber={safeMin}
                maxNumber={safeMax}
                currentMin={currentMin}
                currentMax={currentMax}
                guesses={guesses}
                currentGuess={guessInput}
                onSelectNumber={(num) => {
                  setGuessInput(String(num));
                  if (error) setError('');
                }}
                disabled={submitting || isCurrentAi || aiThinking}
              />
            </div>

            {/* Single Friendly Hint Button */}
            <div className="text-center mb-3">
              {hintClue ? (
                <div className="alert alert-info border-info rounded-4 py-2 px-3 small my-1 animate-fade-in d-inline-flex align-items-center gap-2">
                  <span>💡 {hintClue}</span>
                  <button
                    type="button"
                    className="btn-close btn-close-sm"
                    onClick={() => setHintClue('')}
                  ></button>
                </div>
              ) : (
                !hintUsed && (
                  <button
                    type="button"
                    onClick={handleRequestHint}
                    className="btn btn-outline-info rounded-pill px-4 py-1.5 fw-bold small"
                    disabled={submitting || Boolean(finalResult)}
                  >
                    <i className="bi bi-lightbulb-fill text-warning me-1"></i> Need a Hint?
                  </button>
                )
              )}
            </div>

            {/* Three Small Information Cards at the Bottom */}
            <div className="row g-2.5 mt-2 pt-3 border-top" style={{ borderColor: 'rgba(168, 85, 247, 0.2) !important' }}>
              <div className="col-4">
                <div className="collage-info-pill">
                  <span className="label">Number Range</span>
                  <div className="val">{safeMin} – {safeMax}</div>
                </div>
              </div>
              <div className="col-4">
                <div className="collage-info-pill">
                  <span className="label">Attempts</span>
                  <div className="val">{game?.attemptsUsed || 0} / {safeAttemptsAllowed}</div>
                </div>
              </div>
              <div className="col-4">
                <div className="collage-info-pill">
                  <span className="label">Time</span>
                  <div className="val">{formatTime(elapsedSeconds)}</div>
                </div>
              </div>
            </div>

            {/* Collapsible Session Guesses & Advanced Tools */}
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => setShowOptionalTools(!showOptionalTools)}
                className="btn btn-link btn-sm text-decoration-none text-white-50 p-0"
              >
                {showOptionalTools ? '▲ Hide Guesses & Tools' : `▼ View Guesses in this Session (${guesses.length})`}
              </button>

              {showOptionalTools && (
                <div className="mt-3 text-start animate-fade-in">
                  {guesses.length > 0 ? (
                    <div className="guess-history-list overflow-auto p-2 rounded-3 mb-3" style={{ maxHeight: '180px', background: 'rgba(0,0,0,0.3)' }}>
                      {guesses.map((g) => (
                        <div
                          key={g.id || g.attemptNumber}
                          className="d-flex justify-content-between align-items-center p-2 mb-1 rounded-2 bg-dark bg-opacity-40 small font-monospace"
                        >
                          <span className="text-white-50">#{g.attemptNumber}</span>
                          <strong className="fs-6 text-white">{g.guessNumber}</strong>
                          <span className={g.result === 'CORRECT' ? 'text-success' : g.result === 'TOO_LOW' ? 'text-info' : 'text-warning'}>
                            {g.result === 'CORRECT' ? 'CORRECT 🎯' : g.result === 'TOO_LOW' ? 'TOO LOW ⬆️' : 'TOO HIGH ⬇️'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white-50 small text-center my-2">No guesses submitted yet.</p>
                  )}

                  <PowerUpsBar
                    powerUps={powerUps}
                    onUsePowerUp={handleUsePowerUp}
                    disabled={submitting || isCurrentAi || aiThinking || Boolean(finalResult)}
                    isAiMatch={isAiMatch}
                    oracleClue={oracleClue}
                    onDismissOracle={() => setOracleClue(null)}
                  />
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Pause Modal Overlay */}
      {isPaused && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(5px)', zIndex: 1060 }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg bg-body text-center p-4">
              <div className="display-4 mb-2">⏸️</div>
              <h3 className="fw-bold mb-1">Game Paused</h3>
              <p className="text-muted small mb-4">Timer and opponents are frozen. Take a breath or adjust settings.</p>

              <div className="row g-2 mb-4 text-center">
                <div className="col-4">
                  <div className="p-2 bg-body-tertiary rounded-3 border">
                    <span className="d-block text-muted small">Attempts</span>
                    <strong className="fs-6 font-monospace">{game?.attemptsUsed || 0}/{game?.attemptsAllowed || 7}</strong>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-2 bg-body-tertiary rounded-3 border">
                    <span className="d-block text-muted small">Time</span>
                    <strong className="fs-6 font-monospace">{currentMode === 'TIME_ATTACK' ? `${timeAttackLeft}s` : `${elapsedSeconds}s`}</strong>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-2 bg-body-tertiary rounded-3 border">
                    <span className="d-block text-muted small">Range</span>
                    <strong className="fs-6 font-monospace">{currentMin}–{currentMax}</strong>
                  </div>
                </div>
              </div>

              {/* In-Game Accessibility & Sensory Toggles */}
              <div className="d-flex justify-content-center gap-2 mb-4 flex-wrap">
                <button
                  type="button"
                  onClick={handleToggleSound}
                  className={`btn btn-sm rounded-pill px-3 py-1.5 ${soundEnabled ? 'btn-outline-success' : 'btn-outline-secondary'}`}
                >
                  <i className={`bi ${soundEnabled ? 'bi-volume-up-fill' : 'bi-volume-mute-fill'} me-1`}></i>
                  {soundEnabled ? 'Sound FX ON' : 'Sound Muted'}
                </button>
                <button
                  type="button"
                  onClick={handleToggleReducedMotion}
                  className={`btn btn-sm rounded-pill px-3 py-1.5 ${reducedMotion ? 'btn-outline-warning' : 'btn-outline-secondary'}`}
                >
                  <i className="bi bi-eye-slash-fill me-1"></i>
                  {reducedMotion ? 'Reduced Motion ON' : 'Animations Full'}
                </button>
              </div>

              <div className="d-grid gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaused(false)}
                  className="btn btn-primary btn-lg rounded-pill fw-bold shadow-sm"
                >
                  <i className="bi bi-play-fill me-1"></i> Resume Game
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPaused(false);
                    handleRestart();
                  }}
                  className="btn btn-outline-primary rounded-pill"
                >
                  <i className="bi bi-arrow-repeat me-1"></i> Restart Match
                </button>
                <button
                  type="button"
                  onClick={handleExit}
                  className="btn btn-outline-danger rounded-pill"
                >
                  <i className="bi bi-box-arrow-left me-1"></i> Exit Game
                </button>
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
