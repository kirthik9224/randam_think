/**
 * GUESS THE NUMBER - PROFESSIONAL WEB APPLICATION ENGINE
 * Pure Vanilla JavaScript ES6+ implementation
 * Features:
 * - Dynamic difficulty scaling (Easy, Medium, Hard, Expert)
 * - Zero-cheat hidden target number generation
 * - Live stopwatch timer & real-time attempt tracking
 * - Narrowing range visual indicator
 * - Web Audio API synthesized sound effects
 * - HTML5 Canvas celebratory confetti engine
 * - Full Statistics & Leaderboard saved to localStorage
 * - Theme selector & accessibility settings
 */

(function () {
    'use strict';

    // =========================================================================
    // CONFIGURATION & DIFFICULTY CONSTANTS
    // =========================================================================

    const DIFFICULTIES = {
        EASY: {
            id: 'EASY',
            name: 'Easy',
            min: 1,
            max: 50,
            attempts: 10,
            icon: '🌱',
            accent: 'var(--neon-green)'
        },
        MEDIUM: {
            id: 'MEDIUM',
            name: 'Medium',
            min: 1,
            max: 100,
            attempts: 8,
            icon: '⚡',
            accent: 'var(--neon-cyan)'
        },
        HARD: {
            id: 'HARD',
            name: 'Hard',
            min: 1,
            max: 500,
            attempts: 10,
            icon: '🔥',
            accent: 'var(--neon-yellow)'
        },
        EXPERT: {
            id: 'EXPERT',
            name: 'Expert',
            min: 1,
            max: 1000,
            attempts: 10,
            icon: '👑',
            accent: 'var(--neon-pink)'
        }
    };

    const STORAGE_KEYS = {
        STATS: 'gtn_stats_v2',
        LEADERBOARD: 'gtn_leaderboard_v2',
        SETTINGS: 'gtn_settings_v2'
    };

    // Default Seed Leaderboard
    const DEFAULT_LEADERBOARD = [
        { name: 'NeoDeductive', difficulty: 'EXPERT', attempts: 7, time: '00:48', timeSec: 48, date: '2026-10-24' },
        { name: 'CyberSherlock', difficulty: 'HARD', attempts: 6, time: '00:35', timeSec: 35, date: '2026-10-25' },
        { name: 'QuantumThinker', difficulty: 'MEDIUM', attempts: 4, time: '00:22', timeSec: 22, date: '2026-10-25' },
        { name: 'BinaryMaster', difficulty: 'EASY', attempts: 3, time: '00:14', timeSec: 14, date: '2026-10-26' },
        { name: 'PixelMind', difficulty: 'MEDIUM', attempts: 5, time: '00:31', timeSec: 31, date: '2026-10-26' }
    ];

    // =========================================================================
    // AUDIO ENGINE (Web Audio API Synthesizer)
    // =========================================================================

    const AudioEngine = {
        ctx: null,
        enabled: true,

        init() {
            if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AudioCtx();
            }
        },

        resume() {
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        },

        playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.12) {
            if (!this.enabled) return;
            try {
                this.init();
                this.resume();
                if (!this.ctx) return;

                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = type;
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

                gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start();
                osc.stop(this.ctx.currentTime + duration);
            } catch (e) {
                // Audio safely fails silently if browser blocks autoplay
            }
        },

        playClick() {
            this.playTone(800, 'triangle', 0.06, 0.08);
        },

        playGuessLow() {
            // Ascending pitch indicates "try higher"
            if (!this.enabled) return;
            try {
                this.init();
                this.resume();
                if (!this.ctx) return;

                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(320, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(560, this.ctx.currentTime + 0.18);

                gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start();
                osc.stop(this.ctx.currentTime + 0.2);
            } catch (e) {}
        },

        playGuessHigh() {
            // Descending pitch indicates "try lower"
            if (!this.enabled) return;
            try {
                this.init();
                this.resume();
                if (!this.ctx) return;

                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(340, this.ctx.currentTime + 0.18);

                gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start();
                osc.stop(this.ctx.currentTime + 0.2);
            } catch (e) {}
        },

        playWin() {
            // Joyful triumphant arpeggio
            if (!this.enabled) return;
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, idx) => {
                setTimeout(() => {
                    this.playTone(freq, 'triangle', 0.28, 0.16);
                }, idx * 110);
            });
        },

        playGameOver() {
            // Friendly melancholy descending cue
            if (!this.enabled) return;
            const notes = [392.00, 349.23, 311.13, 261.63]; // G4, F4, Eb4, C4
            notes.forEach((freq, idx) => {
                setTimeout(() => {
                    this.playTone(freq, 'sawtooth', 0.22, 0.08);
                }, idx * 130);
            });
        },

        playAlert() {
            this.playTone(220, 'square', 0.1, 0.08);
            setTimeout(() => this.playTone(180, 'square', 0.12, 0.08), 80);
        }
    };

    // =========================================================================
    // CONFETTI ENGINE (HTML5 Canvas Particle System)
    // =========================================================================

    const ConfettiEngine = {
        canvas: null,
        ctx: null,
        particles: [],
        animId: null,
        active: false,

        init() {
            this.canvas = document.getElementById('confettiCanvas');
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d');
            this.resize();
            window.addEventListener('resize', () => this.resize());
        },

        resize() {
            if (!this.canvas) return;
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        },

        start() {
            if (!AppState.settings.animations) return;
            this.init();
            if (!this.canvas) return;

            this.particles = [];
            const colors = ['#00f0ff', '#00ff88', '#ffd60a', '#ff007f', '#8b5cf6', '#ffffff'];
            const count = Math.min(160, Math.floor(window.innerWidth / 8));

            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height - this.canvas.height,
                    size: Math.random() * 8 + 4,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    vx: (Math.random() - 0.5) * 4,
                    vy: Math.random() * 5 + 3,
                    rotation: Math.random() * 360,
                    vRot: (Math.random() - 0.5) * 10
                });
            }

            this.active = true;
            this.loop();

            // Auto extinguish after 4.5 seconds
            setTimeout(() => this.stop(), 4500);
        },

        loop() {
            if (!this.active || !this.ctx) return;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.vRot;

                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate((p.rotation * Math.PI) / 180);
                this.ctx.fillStyle = p.color;
                this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                this.ctx.restore();

                // Respawn particle at top if it falls off bottom
                if (p.y > this.canvas.height) {
                    p.y = -20;
                    p.x = Math.random() * this.canvas.width;
                }
            });

            this.animId = requestAnimationFrame(() => this.loop());
        },

        stop() {
            this.active = false;
            if (this.animId) cancelAnimationFrame(this.animId);
            if (this.ctx && this.canvas) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }
    };

    // =========================================================================
    // STATE MANAGEMENT & STORAGE
    // =========================================================================

    const AppState = {
        activeView: 'home', // 'home' | 'game'
        currentDifficulty: 'MEDIUM',
        
        // Active Game Session
        game: {
            isActive: false,
            isFinished: false,
            targetNumber: null, // Strictly hidden until game over/win
            difficulty: 'MEDIUM',
            minRange: 1,
            maxRange: 100,
            narrowMin: 1,
            narrowMax: 100,
            maxAttempts: 8,
            attemptsUsed: 0,
            startTime: null,
            elapsedSeconds: 0,
            timerInterval: null,
            guesses: [] // Array of { value, hint: 'TOO_LOW'|'TOO_HIGH'|'CORRECT', attemptNum }
        },

        // Statistics (persisted in localStorage)
        stats: {
            totalPlayed: 0,
            totalWon: 0,
            bestTimeSeconds: null,
            currentStreak: 0,
            bestStreak: 0,
            byDifficulty: {
                EASY: { played: 0, won: 0, bestTimeSeconds: null, fewestGuesses: null },
                MEDIUM: { played: 0, won: 0, bestTimeSeconds: null, fewestGuesses: null },
                HARD: { played: 0, won: 0, bestTimeSeconds: null, fewestGuesses: null },
                EXPERT: { played: 0, won: 0, bestTimeSeconds: null, fewestGuesses: null }
            },
            recentMatches: []
        },

        // Leaderboard (persisted in localStorage)
        leaderboard: [],

        // User Settings (persisted in localStorage)
        settings: {
            sound: true,
            animations: true,
            theme: 'theme-neon-cyber'
        },

        loadStorage() {
            // Load Settings
            try {
                const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
                if (savedSettings) {
                    this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
                }
            } catch (e) {}

            // Load Stats
            try {
                const savedStats = localStorage.getItem(STORAGE_KEYS.STATS);
                if (savedStats) {
                    const parsed = JSON.parse(savedStats);
                    this.stats = {
                        ...this.stats,
                        ...parsed,
                        byDifficulty: { ...this.stats.byDifficulty, ...(parsed.byDifficulty || {}) }
                    };
                }
            } catch (e) {}

            // Load Leaderboard
            try {
                const savedLb = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
                if (savedLb) {
                    this.leaderboard = JSON.parse(savedLb);
                } else {
                    this.leaderboard = [...DEFAULT_LEADERBOARD];
                    this.saveLeaderboard();
                }
            } catch (e) {
                this.leaderboard = [...DEFAULT_LEADERBOARD];
            }
        },

        saveStats() {
            try {
                localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(this.stats));
            } catch (e) {}
        },

        saveLeaderboard() {
            try {
                localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(this.leaderboard));
            } catch (e) {}
        },

        saveSettings() {
            try {
                localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
            } catch (e) {}
        }
    };

    // =========================================================================
    // DOM CACHED ELEMENTS
    // =========================================================================

    const DOM = {};

    function cacheDOMElements() {
        DOM.brandLogo = document.getElementById('brandLogo');
        DOM.soundToggleBtn = document.getElementById('soundToggleBtn');
        DOM.soundIconOn = document.getElementById('soundIconOn');
        DOM.soundIconOff = document.getElementById('soundIconOff');

        // Navigation Modals Buttons
        DOM.navStatsBtn = document.getElementById('navStatsBtn');
        DOM.navLeaderboardBtn = document.getElementById('navLeaderboardBtn');
        DOM.navHowToPlayBtn = document.getElementById('navHowToPlayBtn');
        DOM.navSettingsBtn = document.getElementById('navSettingsBtn');

        // Views
        DOM.homeView = document.getElementById('homeView');
        DOM.gameplayView = document.getElementById('gameplayView');
        DOM.heroPlayNowBtn = document.getElementById('heroPlayNowBtn');
        DOM.difficultySection = document.getElementById('difficultySection');

        // Quick Stats on Home
        DOM.quickStatPlayed = document.getElementById('quickStatPlayed');
        DOM.quickStatWon = document.getElementById('quickStatWon');
        DOM.quickStatRate = document.getElementById('quickStatRate');
        DOM.quickStatStreak = document.getElementById('quickStatStreak');

        // Gameplay Elements
        DOM.gameBackHomeBtn = document.getElementById('gameBackHomeBtn');
        DOM.gameRestartBtn = document.getElementById('gameRestartBtn');
        DOM.gameDifficultyBadge = document.getElementById('gameDifficultyBadge');
        DOM.gameDifficultyIcon = document.getElementById('gameDifficultyIcon');
        DOM.gameDifficultyText = document.getElementById('gameDifficultyText');

        DOM.gameRangeDisplay = document.getElementById('gameRangeDisplay');
        DOM.gameTimerDisplay = document.getElementById('gameTimerDisplay');
        DOM.gameAttemptsDisplay = document.getElementById('gameAttemptsDisplay');
        DOM.narrowRangeInfo = document.getElementById('narrowRangeInfo');
        DOM.attemptsRemainingText = document.getElementById('attemptsRemainingText');
        DOM.attemptsProgressBar = document.getElementById('attemptsProgressBar');

        DOM.feedbackBanner = document.getElementById('feedbackBanner');
        DOM.feedbackIcon = document.getElementById('feedbackIcon');
        DOM.feedbackTitle = document.getElementById('feedbackTitle');
        DOM.feedbackDetail = document.getElementById('feedbackDetail');

        DOM.guessForm = document.getElementById('guessForm');
        DOM.guessInput = document.getElementById('guessInput');
        DOM.submitGuessBtn = document.getElementById('submitGuessBtn');
        DOM.inputAlert = document.getElementById('inputAlert');
        DOM.inputAlertText = document.getElementById('inputAlertText');

        DOM.historyCount = document.getElementById('historyCount');
        DOM.guessHistoryList = document.getElementById('guessHistoryList');

        // Modals
        DOM.winModal = document.getElementById('winModal');
        DOM.winSecretNumber = document.getElementById('winSecretNumber');
        DOM.winAttemptsUsed = document.getElementById('winAttemptsUsed');
        DOM.winTimeTaken = document.getElementById('winTimeTaken');
        DOM.winDifficulty = document.getElementById('winDifficulty');
        DOM.winnerNameInput = document.getElementById('winnerNameInput');
        DOM.saveScoreBtn = document.getElementById('saveScoreBtn');
        DOM.savedScoreFeedback = document.getElementById('savedScoreFeedback');
        DOM.winPlayAgainBtn = document.getElementById('winPlayAgainBtn');
        DOM.winBackHomeBtn = document.getElementById('winBackHomeBtn');

        DOM.gameOverModal = document.getElementById('gameOverModal');
        DOM.gameOverSecretNumber = document.getElementById('gameOverSecretNumber');
        DOM.gameOverAttemptsUsed = document.getElementById('gameOverAttemptsUsed');
        DOM.gameOverTimeTaken = document.getElementById('gameOverTimeTaken');
        DOM.gameOverDifficulty = document.getElementById('gameOverDifficulty');
        DOM.gameOverTryAgainBtn = document.getElementById('gameOverTryAgainBtn');
        DOM.gameOverBackHomeBtn = document.getElementById('gameOverBackHomeBtn');

        // Stats Modal
        DOM.statsModal = document.getElementById('statsModal');
        DOM.statTotalPlayed = document.getElementById('statTotalPlayed');
        DOM.statTotalWon = document.getElementById('statTotalWon');
        DOM.statWinRate = document.getElementById('statWinRate');
        DOM.statBestTime = document.getElementById('statBestTime');
        DOM.statEasyWon = document.getElementById('statEasyWon');
        DOM.statEasyPlayed = document.getElementById('statEasyPlayed');
        DOM.statEasyTime = document.getElementById('statEasyTime');
        DOM.statEasyGuesses = document.getElementById('statEasyGuesses');
        DOM.statMedWon = document.getElementById('statMedWon');
        DOM.statMedPlayed = document.getElementById('statMedPlayed');
        DOM.statMedTime = document.getElementById('statMedTime');
        DOM.statMedGuesses = document.getElementById('statMedGuesses');
        DOM.statHardWon = document.getElementById('statHardWon');
        DOM.statHardPlayed = document.getElementById('statHardPlayed');
        DOM.statHardTime = document.getElementById('statHardTime');
        DOM.statHardGuesses = document.getElementById('statHardGuesses');
        DOM.statExpertWon = document.getElementById('statExpertWon');
        DOM.statExpertPlayed = document.getElementById('statExpertPlayed');
        DOM.statExpertTime = document.getElementById('statExpertTime');
        DOM.statExpertGuesses = document.getElementById('statExpertGuesses');
        DOM.recentMatchesBody = document.getElementById('recentMatchesBody');
        DOM.clearStatsBtn = document.getElementById('clearStatsBtn');

        // Leaderboard Modal
        DOM.leaderboardModal = document.getElementById('leaderboardModal');
        DOM.leaderboardBody = document.getElementById('leaderboardBody');

        // How To Play & Settings Modals
        DOM.howToPlayModal = document.getElementById('howToPlayModal');
        DOM.settingsModal = document.getElementById('settingsModal');
        DOM.settingSoundToggle = document.getElementById('settingSoundToggle');
        DOM.settingAnimationToggle = document.getElementById('settingAnimationToggle');
        DOM.resetAllDataBtn = document.getElementById('resetAllDataBtn');
    }

    // =========================================================================
    // GAME ENGINE & CORE LOGIC
    // =========================================================================

    function startNewGame(difficultyKey) {
        AudioEngine.playClick();
        const diffConfig = DIFFICULTIES[difficultyKey] || DIFFICULTIES.MEDIUM;

        // Reset and clear active timer
        if (AppState.game.timerInterval) {
            clearInterval(AppState.game.timerInterval);
        }

        // Generate target number securely
        const target = Math.floor(Math.random() * (diffConfig.max - diffConfig.min + 1)) + diffConfig.min;

        AppState.game = {
            isActive: true,
            isFinished: false,
            targetNumber: target,
            difficulty: difficultyKey,
            minRange: diffConfig.min,
            maxRange: diffConfig.max,
            narrowMin: diffConfig.min,
            narrowMax: diffConfig.max,
            maxAttempts: diffConfig.attempts,
            attemptsUsed: 0,
            startTime: Date.now(),
            elapsedSeconds: 0,
            timerInterval: null,
            guesses: []
        };

        // Start Stopwatch
        AppState.game.timerInterval = setInterval(() => {
            AppState.game.elapsedSeconds++;
            if (DOM.gameTimerDisplay) {
                DOM.gameTimerDisplay.textContent = formatTime(AppState.game.elapsedSeconds);
            }
        }, 1000);

        // Update Gameplay HUD & UI
        updateGameplayHUD(diffConfig);
        resetFeedbackBanner();
        clearInputAlert();
        renderGuessHistory();

        // Enable inputs
        DOM.guessInput.disabled = false;
        DOM.guessInput.value = '';
        DOM.guessInput.placeholder = `Enter ${diffConfig.min} - ${diffConfig.max}`;
        DOM.submitGuessBtn.disabled = false;

        // Close any modals that might be open
        closeAllModals();

        // Switch to Gameplay view
        switchView('game');

        // Focus input field smoothly
        setTimeout(() => {
            DOM.guessInput.focus();
        }, 150);
    }

    function updateGameplayHUD(diffConfig) {
        DOM.gameDifficultyBadge.className = `gameplay-level-pill`;
        DOM.gameDifficultyIcon.textContent = diffConfig.icon;
        DOM.gameDifficultyText.textContent = `${diffConfig.name.toUpperCase()} MODE`;

        DOM.gameRangeDisplay.textContent = `${diffConfig.min} – ${diffConfig.max}`;
        DOM.gameTimerDisplay.textContent = '00:00';
        DOM.gameAttemptsDisplay.textContent = `${diffConfig.attempts} / ${diffConfig.attempts}`;
        DOM.attemptsProgressBar.style.width = '100%';
        DOM.attemptsRemainingText.textContent = `${diffConfig.attempts} attempts remaining`;
        DOM.narrowRangeInfo.textContent = `Possible window: ${diffConfig.min} – ${diffConfig.max}`;
    }

    function resetFeedbackBanner() {
        DOM.feedbackBanner.className = 'feedback-banner state-neutral';
        DOM.feedbackIcon.textContent = '🎯';
        DOM.feedbackTitle.textContent = 'Make your guess!';
        DOM.feedbackDetail.textContent = 'Enter a number within the target range to begin.';
    }

    function handleGuessSubmission(e) {
        if (e) e.preventDefault();
        if (!AppState.game.isActive || AppState.game.isFinished) return;

        const rawValue = DOM.guessInput.value.trim();
        clearInputAlert();

        // 1. Validate empty
        if (rawValue === '') {
            showInputAlert('Please enter a number before submitting!');
            AudioEngine.playAlert();
            DOM.guessInput.focus();
            return;
        }

        const guess = Number(rawValue);

        // 2. Validate valid number
        if (Number.isNaN(guess) || !Number.isInteger(guess)) {
            showInputAlert('Please enter a valid whole number!');
            AudioEngine.playAlert();
            DOM.guessInput.focus();
            return;
        }

        // 3. Validate out-of-range
        if (guess < AppState.game.minRange || guess > AppState.game.maxRange) {
            showInputAlert(`Out of range! Enter a number between ${AppState.game.minRange} and ${AppState.game.maxRange}.`);
            AudioEngine.playAlert();
            DOM.guessInput.focus();
            return;
        }

        // 4. Validate duplicate guess
        const alreadyGuessed = AppState.game.guesses.some(g => g.value === guess);
        if (alreadyGuessed) {
            showInputAlert(`You already guessed ${guess}! Try a different number.`);
            AudioEngine.playAlert();
            DOM.guessInput.focus();
            return;
        }

        // Valid guess consumes an attempt
        AppState.game.attemptsUsed++;
        const remainingAttempts = AppState.game.maxAttempts - AppState.game.attemptsUsed;

        // Process Guess Outcome
        if (guess === AppState.game.targetNumber) {
            // ================== WIN ==================
            AppState.game.guesses.unshift({
                value: guess,
                hint: 'CORRECT',
                attemptNum: AppState.game.attemptsUsed,
                time: formatTime(AppState.game.elapsedSeconds)
            });

            handleGameWin();
        } else if (guess < AppState.game.targetNumber) {
            // ================== TOO LOW ==================
            AppState.game.narrowMin = Math.max(AppState.game.narrowMin, guess + 1);

            AppState.game.guesses.unshift({
                value: guess,
                hint: 'TOO_LOW',
                attemptNum: AppState.game.attemptsUsed,
                time: formatTime(AppState.game.elapsedSeconds)
            });

            AudioEngine.playGuessLow();
            setFeedback('state-low', '⬆️', 'Too Low — Try a higher number.', `Your guess ${guess} is lower than the target.`);

            checkLossOrContinue(remainingAttempts);
        } else {
            // ================== TOO HIGH ==================
            AppState.game.narrowMax = Math.min(AppState.game.narrowMax, guess - 1);

            AppState.game.guesses.unshift({
                value: guess,
                hint: 'TOO_HIGH',
                attemptNum: AppState.game.attemptsUsed,
                time: formatTime(AppState.game.elapsedSeconds)
            });

            AudioEngine.playGuessHigh();
            setFeedback('state-high', '⬇️', 'Too High — Try a lower number.', `Your guess ${guess} is higher than the target.`);

            checkLossOrContinue(remainingAttempts);
        }

        // Update HUD Attempts & Range
        updateRemainingAttemptsHUD(remainingAttempts);
        renderGuessHistory();

        // Clear and refocus input
        DOM.guessInput.value = '';
        if (!AppState.game.isFinished) {
            DOM.guessInput.focus();
        }
    }

    function checkLossOrContinue(remainingAttempts) {
        if (remainingAttempts <= 0) {
            handleGameOver();
        }
    }

    function updateRemainingAttemptsHUD(remaining) {
        DOM.gameAttemptsDisplay.textContent = `${remaining} / ${AppState.game.maxAttempts}`;
        const pct = Math.max(0, (remaining / AppState.game.maxAttempts) * 100);
        DOM.attemptsProgressBar.style.width = `${pct}%`;
        
        // Dynamic color for attempts progress bar
        if (pct <= 25) {
            DOM.attemptsProgressBar.style.background = 'var(--neon-pink)';
        } else if (pct <= 50) {
            DOM.attemptsProgressBar.style.background = 'var(--neon-yellow)';
        } else {
            DOM.attemptsProgressBar.style.background = 'linear-gradient(90deg, var(--neon-cyan), var(--neon-green))';
        }

        DOM.attemptsRemainingText.textContent = `${remaining} attempt${remaining === 1 ? '' : 's'} remaining`;
        DOM.narrowRangeInfo.textContent = `Narrowed window: ${AppState.game.narrowMin} – ${AppState.game.narrowMax}`;
    }

    function setFeedback(stateClass, icon, title, detail) {
        DOM.feedbackBanner.className = `feedback-banner ${stateClass}`;
        DOM.feedbackIcon.textContent = icon;
        DOM.feedbackTitle.textContent = title;
        DOM.feedbackDetail.textContent = detail;
    }

    function handleGameWin() {
        AppState.game.isFinished = true;
        clearInterval(AppState.game.timerInterval);

        // Feedback in Arena
        setFeedback('state-correct', '🎉', 'Correct — You guessed it!', `Spot on! The secret number is ${AppState.game.targetNumber}.`);
        AudioEngine.playWin();
        ConfettiEngine.start();

        // Disable input
        DOM.guessInput.disabled = true;
        DOM.submitGuessBtn.disabled = true;

        // Record Match in Stats
        recordMatchResult(true);

        // Populate and open Win Modal
        DOM.winSecretNumber.textContent = AppState.game.targetNumber;
        DOM.winAttemptsUsed.textContent = `${AppState.game.attemptsUsed} / ${AppState.game.maxAttempts}`;
        DOM.winTimeTaken.textContent = formatTime(AppState.game.elapsedSeconds);
        DOM.winDifficulty.textContent = DIFFICULTIES[AppState.game.difficulty].name;
        DOM.savedScoreFeedback.classList.add('hidden');
        DOM.saveScoreBtn.disabled = false;
        DOM.winnerNameInput.value = '';

        setTimeout(() => {
            openModal(DOM.winModal);
        }, 600);
    }

    function handleGameOver() {
        AppState.game.isFinished = true;
        clearInterval(AppState.game.timerInterval);

        // Feedback in Arena
        setFeedback('state-high', '💀', 'Game Over!', `You ran out of attempts. The secret number was ${AppState.game.targetNumber}.`);
        AudioEngine.playGameOver();

        // Disable input
        DOM.guessInput.disabled = true;
        DOM.submitGuessBtn.disabled = true;

        // Record Match in Stats
        recordMatchResult(false);

        // Populate and open Game Over Modal
        DOM.gameOverSecretNumber.textContent = AppState.game.targetNumber;
        DOM.gameOverAttemptsUsed.textContent = `${AppState.game.maxAttempts} / ${AppState.game.maxAttempts}`;
        DOM.gameOverTimeTaken.textContent = formatTime(AppState.game.elapsedSeconds);
        DOM.gameOverDifficulty.textContent = DIFFICULTIES[AppState.game.difficulty].name;

        setTimeout(() => {
            openModal(DOM.gameOverModal);
        }, 700);
    }

    // =========================================================================
    // STATISTICS & LEADERBOARD DATA SYNC
    // =========================================================================

    function recordMatchResult(isWin) {
        const diff = AppState.game.difficulty;
        const timeSec = AppState.game.elapsedSeconds;
        const attempts = AppState.game.attemptsUsed;

        AppState.stats.totalPlayed++;
        if (isWin) {
            AppState.stats.totalWon++;
            AppState.stats.currentStreak++;
            if (AppState.stats.currentStreak > AppState.stats.bestStreak) {
                AppState.stats.bestStreak = AppState.stats.currentStreak;
            }

            if (AppState.stats.bestTimeSeconds === null || timeSec < AppState.stats.bestTimeSeconds) {
                AppState.stats.bestTimeSeconds = timeSec;
            }

            // By Difficulty Record
            const dStat = AppState.stats.byDifficulty[diff];
            dStat.won++;
            if (dStat.bestTimeSeconds === null || timeSec < dStat.bestTimeSeconds) {
                dStat.bestTimeSeconds = timeSec;
            }
            if (dStat.fewestGuesses === null || attempts < dStat.fewestGuesses) {
                dStat.fewestGuesses = attempts;
            }
        } else {
            AppState.stats.currentStreak = 0;
        }

        AppState.stats.byDifficulty[diff].played++;

        // Append to Recent Matches (keep top 25)
        AppState.stats.recentMatches.unshift({
            result: isWin ? 'WON' : 'LOST',
            difficulty: diff,
            target: AppState.game.targetNumber,
            attempts: attempts,
            maxAttempts: AppState.game.maxAttempts,
            timeFormatted: formatTime(timeSec),
            timeSec: timeSec,
            date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        });

        if (AppState.stats.recentMatches.length > 25) {
            AppState.stats.recentMatches.pop();
        }

        AppState.saveStats();
        updateHomeQuickStats();
    }

    function updateHomeQuickStats() {
        DOM.quickStatPlayed.textContent = AppState.stats.totalPlayed;
        DOM.quickStatWon.textContent = AppState.stats.totalWon;
        
        const rate = AppState.stats.totalPlayed > 0
            ? Math.round((AppState.stats.totalWon / AppState.stats.totalPlayed) * 100)
            : 0;
        DOM.quickStatRate.textContent = `${rate}%`;
        DOM.quickStatStreak.textContent = AppState.stats.bestStreak;
    }

    function renderGuessHistory() {
        DOM.historyCount.textContent = AppState.game.guesses.length;

        if (AppState.game.guesses.length === 0) {
            DOM.guessHistoryList.innerHTML = `
                <li class="history-empty-item">
                    <span>No guesses made yet. Enter a number above!</span>
                </li>
            `;
            return;
        }

        DOM.guessHistoryList.innerHTML = AppState.game.guesses.map(item => {
            let badgeHtml = '';
            if (item.hint === 'TOO_LOW') {
                badgeHtml = `<span class="history-badge badge-clue-low">⬆️ Too Low</span>`;
            } else if (item.hint === 'TOO_HIGH') {
                badgeHtml = `<span class="history-badge badge-clue-high">⬇️ Too High</span>`;
            } else {
                badgeHtml = `<span class="history-badge badge-clue-correct">🎉 Correct</span>`;
            }

            return `
                <li class="history-item">
                    <div class="history-item-left">
                        <span class="history-attempt-num">#${item.attemptNum}</span>
                        <span class="history-guess-val">${item.value}</span>
                    </div>
                    <div class="history-item-right">
                        ${badgeHtml}
                    </div>
                </li>
            `;
        }).join('');
    }

    function showInputAlert(msg) {
        DOM.inputAlertText.textContent = msg;
        DOM.inputAlert.classList.remove('hidden');
    }

    function clearInputAlert() {
        DOM.inputAlert.classList.add('hidden');
    }

    function saveWinnerScore() {
        const nameInput = DOM.winnerNameInput.value.trim() || 'Anonymous Player';
        AudioEngine.playClick();

        const newEntry = {
            name: nameInput,
            difficulty: AppState.game.difficulty,
            attempts: AppState.game.attemptsUsed,
            time: formatTime(AppState.game.elapsedSeconds),
            timeSec: AppState.game.elapsedSeconds,
            date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        };

        AppState.leaderboard.push(newEntry);
        sortLeaderboard();
        AppState.saveLeaderboard();

        DOM.savedScoreFeedback.classList.remove('hidden');
        DOM.saveScoreBtn.disabled = true;
    }

    function sortLeaderboard() {
        const diffWeight = { EXPERT: 4, HARD: 3, MEDIUM: 2, EASY: 1 };
        AppState.leaderboard.sort((a, b) => {
            if (diffWeight[b.difficulty] !== diffWeight[a.difficulty]) {
                return diffWeight[b.difficulty] - diffWeight[a.difficulty];
            }
            if (a.attempts !== b.attempts) {
                return a.attempts - b.attempts;
            }
            return a.timeSec - b.timeSec;
        });

        // Keep top 50
        if (AppState.leaderboard.length > 50) {
            AppState.leaderboard = AppState.leaderboard.slice(0, 50);
        }
    }

    function renderLeaderboard(filterDiff = 'ALL') {
        let list = [...AppState.leaderboard];
        if (filterDiff !== 'ALL') {
            list = list.filter(item => item.difficulty === filterDiff);
        }

        if (list.length === 0) {
            DOM.leaderboardBody.innerHTML = `
                <tr>
                    <td colspan="6" class="table-empty-cell">No leaderboard records yet for this category.</td>
                </tr>
            `;
            return;
        }

        DOM.leaderboardBody.innerHTML = list.map((item, idx) => {
            let rankBadge = `#${idx + 1}`;
            if (idx === 0) rankBadge = '🥇 1st';
            else if (idx === 1) rankBadge = '🥈 2nd';
            else if (idx === 2) rankBadge = '🥉 3rd';

            return `
                <tr>
                    <td class="font-mono fw-bold">${rankBadge}</td>
                    <td class="fw-semibold text-white">${escapeHtml(item.name)}</td>
                    <td>
                        <span class="badge-clue badge-low">${item.difficulty}</span>
                    </td>
                    <td class="font-mono">${item.attempts}</td>
                    <td class="font-mono">${item.time}</td>
                    <td class="small text-muted">${item.date || 'Recent'}</td>
                </tr>
            `;
        }).join('');
    }

    function renderStatsModal() {
        const stats = AppState.stats;
        DOM.statTotalPlayed.textContent = stats.totalPlayed;
        DOM.statTotalWon.textContent = stats.totalWon;

        const rate = stats.totalPlayed > 0
            ? Math.round((stats.totalWon / stats.totalPlayed) * 100)
            : 0;
        DOM.statWinRate.textContent = `${rate}%`;
        DOM.statBestTime.textContent = stats.bestTimeSeconds !== null ? formatTime(stats.bestTimeSeconds) : '--:--';

        // Difficulty breakdowns
        renderDiffStat('EASY', DOM.statEasyWon, DOM.statEasyPlayed, DOM.statEasyTime, DOM.statEasyGuesses);
        renderDiffStat('MEDIUM', DOM.statMedWon, DOM.statMedPlayed, DOM.statMedTime, DOM.statMedGuesses);
        renderDiffStat('HARD', DOM.statHardWon, DOM.statHardPlayed, DOM.statHardTime, DOM.statHardGuesses);
        renderDiffStat('EXPERT', DOM.statExpertWon, DOM.statExpertPlayed, DOM.statExpertTime, DOM.statExpertGuesses);

        // Recent matches table
        if (stats.recentMatches.length === 0) {
            DOM.recentMatchesBody.innerHTML = `
                <tr>
                    <td colspan="6" class="table-empty-cell">No matches recorded yet. Play a game!</td>
                </tr>
            `;
            return;
        }

        DOM.recentMatchesBody.innerHTML = stats.recentMatches.map(m => {
            const isWin = m.result === 'WON';
            const resBadge = isWin
                ? `<span class="badge-clue badge-win">VICTORY</span>`
                : `<span class="badge-clue badge-high">DEFEAT</span>`;

            return `
                <tr>
                    <td>${resBadge}</td>
                    <td><span class="badge-clue badge-low">${m.difficulty}</span></td>
                    <td class="font-mono fw-bold text-white">${m.target}</td>
                    <td class="font-mono">${m.attempts} / ${m.maxAttempts}</td>
                    <td class="font-mono">${m.timeFormatted}</td>
                    <td class="small text-muted">${m.date}</td>
                </tr>
            `;
        }).join('');
    }

    function renderDiffStat(diffKey, elWon, elPlayed, elTime, elGuesses) {
        const d = AppState.stats.byDifficulty[diffKey] || { played: 0, won: 0, bestTimeSeconds: null, fewestGuesses: null };
        elWon.textContent = d.won;
        elPlayed.textContent = d.played;
        elTime.textContent = d.bestTimeSeconds !== null ? formatTime(d.bestTimeSeconds) : '--:--';
        elGuesses.textContent = d.fewestGuesses !== null ? `${d.fewestGuesses} guesses` : '--';
    }

    // =========================================================================
    // VIEW NAVIGATION & MODALS
    // =========================================================================

    function switchView(viewName) {
        AppState.activeView = viewName;
        if (viewName === 'home') {
            DOM.gameplayView.classList.remove('active');
            DOM.homeView.classList.add('active');
            updateHomeQuickStats();
        } else {
            DOM.homeView.classList.remove('active');
            DOM.gameplayView.classList.add('active');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function openModal(modalEl) {
        if (!modalEl) return;
        AudioEngine.playClick();
        modalEl.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modalEl) {
        if (!modalEl) return;
        AudioEngine.playClick();
        modalEl.classList.add('hidden');
        document.body.style.overflow = '';
        ConfettiEngine.stop();
    }

    function closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
        document.body.style.overflow = '';
        ConfettiEngine.stop();
    }

    // =========================================================================
    // UTILITY FUNCTIONS
    // =========================================================================

    function formatTime(totalSeconds) {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function applyTheme(themeClass) {
        document.body.className = themeClass;
        AppState.settings.theme = themeClass;
        AppState.saveSettings();

        document.querySelectorAll('.theme-chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.theme === themeClass);
        });
    }

    // =========================================================================
    // EVENT LISTENERS & SETUP
    // =========================================================================

    function setupEventListeners() {
        // Brand logo click
        DOM.brandLogo.addEventListener('click', () => {
            AudioEngine.playClick();
            if (AppState.game.isActive && !AppState.game.isFinished) {
                if (confirm('A game is currently in progress. Do you want to return to Home?')) {
                    if (AppState.game.timerInterval) clearInterval(AppState.game.timerInterval);
                    AppState.game.isActive = false;
                    switchView('home');
                }
            } else {
                switchView('home');
            }
        });

        // Global Sound Toggle Button
        DOM.soundToggleBtn.addEventListener('click', () => {
            AppState.settings.sound = !AppState.settings.sound;
            AudioEngine.enabled = AppState.settings.sound;
            AppState.saveSettings();
            syncSoundUI();
            if (AppState.settings.sound) AudioEngine.playClick();
        });

        // Navigation Action Buttons
        DOM.navStatsBtn.addEventListener('click', () => {
            renderStatsModal();
            openModal(DOM.statsModal);
        });

        DOM.navLeaderboardBtn.addEventListener('click', () => {
            renderLeaderboard('ALL');
            openModal(DOM.leaderboardModal);
        });

        DOM.navHowToPlayBtn.addEventListener('click', () => {
            openModal(DOM.howToPlayModal);
        });

        DOM.navSettingsBtn.addEventListener('click', () => {
            openModal(DOM.settingsModal);
        });

        // Close Modal Handlers (buttons with [data-close])
        document.querySelectorAll('[data-close]').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.getAttribute('data-close');
                closeModal(document.getElementById(modalId));
            });
        });

        // Close Modal by clicking overlay backdrop
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    closeModal(overlay);
                }
            });
        });

        // Hero Play Now button (scroll to or launch Medium)
        DOM.heroPlayNowBtn.addEventListener('click', () => {
            AudioEngine.playClick();
            DOM.difficultySection.scrollIntoView({ behavior: 'smooth' });
        });

        // Difficulty Cards on Home
        document.querySelectorAll('.difficulty-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // If button inside card clicked, let button handle it
                const diff = card.dataset.difficulty;
                startNewGame(diff);
            });
        });

        document.querySelectorAll('.btn-diff').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const diff = btn.dataset.difficulty;
                startNewGame(diff);
            });
        });

        // Gameplay Topbar Buttons
        DOM.gameBackHomeBtn.addEventListener('click', () => {
            AudioEngine.playClick();
            if (AppState.game.isActive && !AppState.game.isFinished) {
                if (confirm('Return to Home? Your current game will be discarded.')) {
                    if (AppState.game.timerInterval) clearInterval(AppState.game.timerInterval);
                    AppState.game.isActive = false;
                    switchView('home');
                }
            } else {
                switchView('home');
            }
        });

        DOM.gameRestartBtn.addEventListener('click', () => {
            startNewGame(AppState.game.difficulty);
        });

        // Guess Form Submission
        DOM.guessForm.addEventListener('submit', handleGuessSubmission);

        // Win Modal Actions
        DOM.saveScoreBtn.addEventListener('click', saveWinnerScore);
        DOM.winPlayAgainBtn.addEventListener('click', () => {
            closeModal(DOM.winModal);
            startNewGame(AppState.game.difficulty);
        });
        DOM.winBackHomeBtn.addEventListener('click', () => {
            closeModal(DOM.winModal);
            switchView('home');
        });

        // Game Over Modal Actions
        DOM.gameOverTryAgainBtn.addEventListener('click', () => {
            closeModal(DOM.gameOverModal);
            startNewGame(AppState.game.difficulty);
        });
        DOM.gameOverBackHomeBtn.addEventListener('click', () => {
            closeModal(DOM.gameOverModal);
            switchView('home');
        });

        // Leaderboard Tabs
        document.querySelectorAll('.leaderboard-tabs .tab-btn').forEach(tab => {
            tab.addEventListener('click', () => {
                AudioEngine.playClick();
                document.querySelectorAll('.leaderboard-tabs .tab-btn').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                renderLeaderboard(tab.dataset.tab);
            });
        });

        // Clear Stats Button
        DOM.clearStatsBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all your saved statistics and match history?')) {
                AudioEngine.playClick();
                AppState.stats = {
                    totalPlayed: 0,
                    totalWon: 0,
                    bestTimeSeconds: null,
                    currentStreak: 0,
                    bestStreak: 0,
                    byDifficulty: {
                        EASY: { played: 0, won: 0, bestTimeSeconds: null, fewestGuesses: null },
                        MEDIUM: { played: 0, won: 0, bestTimeSeconds: null, fewestGuesses: null },
                        HARD: { played: 0, won: 0, bestTimeSeconds: null, fewestGuesses: null },
                        EXPERT: { played: 0, won: 0, bestTimeSeconds: null, fewestGuesses: null }
                    },
                    recentMatches: []
                };
                AppState.saveStats();
                renderStatsModal();
                updateHomeQuickStats();
            }
        });

        // Settings Toggles
        DOM.settingSoundToggle.addEventListener('change', (e) => {
            AppState.settings.sound = e.target.checked;
            AudioEngine.enabled = AppState.settings.sound;
            AppState.saveSettings();
            syncSoundUI();
        });

        DOM.settingAnimationToggle.addEventListener('change', (e) => {
            AppState.settings.animations = e.target.checked;
            AppState.saveSettings();
        });

        // Theme Chips
        document.querySelectorAll('.theme-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                AudioEngine.playClick();
                applyTheme(chip.dataset.theme);
            });
        });

        // Reset All Data
        DOM.resetAllDataBtn.addEventListener('click', () => {
            if (confirm('DANGER: This will reset all statistics, leaderboard rankings, and settings back to factory defaults. Continue?')) {
                localStorage.removeItem(STORAGE_KEYS.STATS);
                localStorage.removeItem(STORAGE_KEYS.LEADERBOARD);
                localStorage.removeItem(STORAGE_KEYS.SETTINGS);
                location.reload();
            }
        });

        // Keyboard Shortcut: Escape closes modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAllModals();
            }
        });
    }

    function syncSoundUI() {
        const soundOn = AppState.settings.sound;
        AudioEngine.enabled = soundOn;
        DOM.soundIconOn.classList.toggle('hidden', !soundOn);
        DOM.soundIconOff.classList.toggle('hidden', soundOn);
        if (DOM.settingSoundToggle) {
            DOM.settingSoundToggle.checked = soundOn;
        }
    }

    // =========================================================================
    // INITIALIZATION
    // =========================================================================

    function init() {
        cacheDOMElements();
        AppState.loadStorage();

        // Apply saved theme
        applyTheme(AppState.settings.theme || 'theme-neon-cyber');

        // Apply saved sound setting
        syncSoundUI();

        // Apply animation toggle setting
        if (DOM.settingAnimationToggle) {
            DOM.settingAnimationToggle.checked = AppState.settings.animations;
        }

        // Initialize Home Dashboard Stats
        updateHomeQuickStats();

        // Attach all event listeners
        setupEventListeners();

        // Initial view
        switchView('home');
    }

    // Run on DOM Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
