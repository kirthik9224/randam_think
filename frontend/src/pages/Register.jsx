import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import sounds from '../utils/soundEffects';
import ErrorMessage from '../components/ErrorMessage';
import '../styles/Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanUsername = username ? username.trim() : '';
    const cleanEmail = email ? email.trim() : '';
    const cleanPassword = password ? password.trim() : '';
    const cleanConfirmPassword = confirmPassword ? confirmPassword.trim() : '';

    if (cleanPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (cleanPassword !== cleanConfirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    try {
      setLoading(true);
      sounds.playClick();
      await authService.register(cleanUsername, cleanEmail, cleanPassword, cleanConfirmPassword);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-wrapper">
        <div className="auth-card">
          {/* Subtle Top Accent Gradient */}
          <div className="auth-card-top-bar"></div>

          <div className="auth-card-body">
            {/* Header with Game Logo & Welcoming Title */}
            <div className="auth-header">
              <div className="auth-logo-badge">
                🎯
              </div>
              <div className="auth-brand-name">Random Thinking Game</div>
              <h1 className="auth-title h3">Create Account</h1>
              <p className="auth-subtitle">
                Join the Random Thinking arena, compete on leaderboards, and build streaks
              </p>
            </div>

            <ErrorMessage message={error} onDismiss={() => setError('')} />

            <form onSubmit={handleSubmit} noValidate>
              {/* Username Field */}
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="register-username">
                  Player Username
                </label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    id="register-username"
                    type="text"
                    className="auth-input form-control"
                    placeholder="e.g. MasterGuesser"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    minLength={3}
                    maxLength={30}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="register-email">
                  Email Address
                </label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    id="register-email"
                    type="email"
                    className="auth-input form-control"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="register-password">
                  Password <span className="text-muted fw-normal">(min. 6 characters)</span>
                </label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input form-control"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="register-confirm-password">
                  Confirm Password
                </label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">
                    <i className="bi bi-shield-check"></i>
                  </span>
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="auth-input form-control"
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-toggle-password-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    <i className={`bi ${showConfirmPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary auth-submit-btn w-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <i className="bi bi-arrow-right"></i>
                  </>
                )}
              </button>
            </form>

            {/* Offline Play Option */}
            <div className="text-center my-3">
              <div className="d-flex align-items-center justify-content-center gap-2 my-2 text-muted small">
                <hr className="flex-grow-1 opacity-25" />
                <span className="text-uppercase font-monospace text-secondary" style={{ fontSize: '0.72rem' }}>OR PLAY OFFLINE</span>
                <hr className="flex-grow-1 opacity-25" />
              </div>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  authService.loginAsGuest('Guest Explorer');
                  navigate('/dashboard');
                }}
                className="btn btn-outline-success w-100 py-2.5 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 hover-scale"
                title="Play immediately without an account or server connection"
              >
                <i className="bi bi-play-circle-fill fs-5 text-success"></i>
                <span>Play Offline as Guest (100% Local)</span>
              </button>
            </div>

            {/* Link to Login */}
            <div className="auth-footer">
              <span>Already registered? </span>
              <Link to="/login" className="auth-link">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
