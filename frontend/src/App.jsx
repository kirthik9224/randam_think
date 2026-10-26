import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Game from './pages/Game';
import Result from './pages/Result';
import Leaderboard from './pages/Leaderboard';
import History from './pages/History';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import MultiplayerHub from './pages/MultiplayerHub';
import MultiplayerRoomPage from './pages/MultiplayerRoomPage';
import WalletPage from './pages/WalletPage';

import sounds from './utils/soundEffects';
import { applyThemeClass } from './utils/themeHelper';
import './styles/App.css';
import './styles/Themes.css';
import './styles/CollageGameTheme.css';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('rtg_theme');
    return saved !== null ? saved === 'dark' : true;
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('rtg_sound') !== 'false';
  });

  useEffect(() => {
    applyThemeClass();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('rtg_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    sounds.toggleSound(soundEnabled);
    localStorage.setItem('rtg_sound', soundEnabled ? 'true' : 'false');
  }, [soundEnabled]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  return (
    <Router>
      <div className={`app-wrapper d-flex flex-column min-vh-100 ${darkMode ? 'dark-theme' : 'light-theme'}`}>
        <Navbar
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          soundEnabled={soundEnabled}
          toggleSound={toggleSound}
        />

        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/leaderboard" element={<Leaderboard />} />

            {/* Protected User Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowGuest={true}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game"
              element={
                <ProtectedRoute allowGuest={true}>
                  <Game />
                </ProtectedRoute>
              }
            />
            <Route
              path="/multiplayer"
              element={
                <ProtectedRoute allowGuest={true}>
                  <MultiplayerHub />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallet"
              element={
                <ProtectedRoute allowGuest={true}>
                  <WalletPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/multiplayer/room/:roomCode"
              element={
                <ProtectedRoute allowGuest={true}>
                  <MultiplayerRoomPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/result"
              element={
                <ProtectedRoute allowGuest={true}>
                  <Result />
                </ProtectedRoute>
              }
            />
            <Route
              path="/result/:gameId"
              element={
                <ProtectedRoute allowGuest={true}>
                  <Result />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute allowGuest={true}>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowGuest={false}>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Route */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer darkMode={darkMode} />
      </div>
    </Router>
  );
}

export default App;
