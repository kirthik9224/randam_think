import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DifficultySelector from '../components/DifficultySelector';
import GameModeSelector from '../components/GameModeSelector';
import LeaderboardTable from '../components/LeaderboardTable';
import leaderboardService from '../services/leaderboardService';
import authService from '../services/authService';
import sounds from '../utils/soundEffects';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = useState('MEDIUM');
  const [selectedMode, setSelectedMode] = useState('CLASSIC');
  const [topScores, setTopScores] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    fetchTopLeaderboard();
  }, []);

  const fetchTopLeaderboard = async () => {
    try {
      setLoadingLeaderboard(true);
      const data = await leaderboardService.getTopLeaderboard();
      setTopScores(data ? data.slice(0, 5) : []);
    } catch (e) {
      console.error('Error fetching top scores:', e);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const handleStartGame = () => {
    sounds.playClick();
    if (!currentUser) {
      authService.loginAsGuest('Guest Player');
    }
    navigate('/game', { state: { difficulty: selectedDifficulty, mode: selectedMode } });
  };

  return (
    <div className="home-page pb-5">
      {/* Hero Section */}
      <section className="hero-section text-center py-5 mb-5 position-relative overflow-hidden">
        <div className="container py-lg-4">
          <div className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1.5 mb-3 fw-semibold">
            ✨ Next-Gen Full-Stack Random Thinking Game
          </div>
          <h1 className="display-4 fw-black mb-3 hero-title">
            TEST YOUR INSTINCTS & <br />
            <span className="text-gradient">RANDOM THINKING ARENA</span>
          </h1>
          <p className="lead text-secondary mx-auto mb-4 hero-subtitle" style={{ maxWidth: '680px' }}>
            A brain-teasing game of deductive reasoning, dynamic hints, and lightning-fast score multipliers. Pick your difficulty and climb the global leaderboard!
          </p>

          <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">
            <button
              onClick={handleStartGame}
              className="btn btn-primary btn-lg px-5 py-3 rounded-pill shadow-lg fw-bold d-flex align-items-center gap-2 hover-scale"
            >
              <i className="bi bi-play-circle-fill fs-5"></i>
              START PLAYING NOW
            </button>
            <Link
              to="/leaderboard"
              className="btn btn-outline-secondary btn-lg px-4 py-3 rounded-pill fw-semibold d-flex align-items-center gap-2"
              onClick={() => sounds.playClick()}
            >
              <i className="bi bi-trophy-fill text-warning"></i>
              View Leaderboard
            </Link>
          </div>

          {/* Quick Select Showcase: Modes & Difficulties */}
          <div className="difficulty-showcase p-4 rounded-4 shadow-sm bg-body border mx-auto text-start" style={{ maxWidth: '1000px' }}>
            <div className="mb-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-controller text-primary"></i> 1. Choose Game Mode
              </h5>
              <GameModeSelector
                selectedMode={selectedMode}
                onSelectMode={setSelectedMode}
              />
            </div>

            <hr className="my-4 opacity-25" />

            <div>
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-sliders2 text-primary"></i> 2. Choose Difficulty Level
              </h5>
              <DifficultySelector
                selectedDifficulty={selectedDifficulty}
                onSelectDifficulty={setSelectedDifficulty}
              />
            </div>
          </div>
        </div>
      </section>

      {/* How to Play Section */}
      <section className="container my-5">
        <div className="text-center mb-5">
          <span className="badge bg-info-subtle text-info-emphasis rounded-pill px-3 py-1 mb-2">
            Game Guide
          </span>
          <h2 className="fw-bold">How To Play</h2>
          <p className="text-muted">Master the game in three simple steps</p>
        </div>

        <div className="row g-4">
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center bg-body-tertiary">
              <div className="feature-icon bg-primary text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', fontSize: '24px' }}>
                1
              </div>
              <h5 className="fw-bold mb-2">Select Difficulty</h5>
              <p className="text-muted small">
                Choose from Easy (1–50), Medium (1–100), Hard (1–500), or Expert (1–1000). The backend generates a secure secret number.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center bg-body-tertiary">
              <div className="feature-icon bg-success text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', fontSize: '24px' }}>
                2
              </div>
              <h5 className="fw-bold mb-2">Follow Smart Hints</h5>
              <p className="text-muted small">
                Enter your guess and receive instant feedback: <strong>"Try a higher number!"</strong> or <strong>"Try a lower number!"</strong> to narrow down the range.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center bg-body-tertiary">
              <div className="feature-icon bg-warning text-dark rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', fontSize: '24px' }}>
                3
              </div>
              <h5 className="fw-bold mb-2">Maximize Score & Win</h5>
              <p className="text-muted small">
                Solve it in fewer attempts and less time to earn high scores up to 10,000+ points and dominate the leaderboard!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Highlights */}
      <section className="bg-body-tertiary py-5 my-5 border-top border-bottom">
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 mb-2">
              Key Features
            </span>
            <h2 className="fw-bold">Designed for Maximum Fun & Challenge</h2>
          </div>

          <div className="row g-4">
            <div className="col-sm-6 col-lg-3">
              <div className="d-flex gap-3 align-items-start">
                <i className="bi bi-shield-check text-primary fs-2"></i>
                <div>
                  <h6 className="fw-bold mb-1">Zero Cheat Engine</h6>
                  <p className="text-muted small mb-0">Secret numbers remain 100% hidden on the Spring Boot backend.</p>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="d-flex gap-3 align-items-start">
                <i className="bi bi-stopwatch text-warning fs-2"></i>
                <div>
                  <h6 className="fw-bold mb-1">Dynamic Time Scoring</h6>
                  <p className="text-muted small mb-0">Faster guesses award higher multipliers and score bonuses.</p>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="d-flex gap-3 align-items-start">
                <i className="bi bi-bar-chart-line text-success fs-2"></i>
                <div>
                  <h6 className="fw-bold mb-1">Game History & Stats</h6>
                  <p className="text-muted small mb-0">Detailed logs of all guesses, win rates, and streak tracking.</p>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="d-flex gap-3 align-items-start">
                <i className="bi bi-moon-stars text-info fs-2"></i>
                <div>
                  <h6 className="fw-bold mb-1">Audio & Dark Mode</h6>
                  <p className="text-muted small mb-0">Synthesized audio cues, victory confetti, and dark/light themes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Leaderboard Snippet */}
      <section className="container my-5">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">🏆 Hall of Champions</h3>
            <p className="text-muted mb-0">Top high scorers across all difficulty levels</p>
          </div>
          <Link to="/leaderboard" className="btn btn-outline-primary rounded-pill px-4" onClick={() => sounds.playClick()}>
            View Full Leaderboard <i className="bi bi-arrow-right ms-1"></i>
          </Link>
        </div>

        <LeaderboardTable entries={topScores} loading={loadingLeaderboard} />
      </section>
    </div>
  );
};

export default Home;
