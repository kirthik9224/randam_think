import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import sounds from '../utils/soundEffects';
import ErrorMessage from '../components/ErrorMessage';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';
  const difficultyState = location.state?.difficulty;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email ? email.trim() : '';
    const cleanPassword = password ? password.trim() : '';

    if (!cleanEmail || !cleanPassword) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      sounds.playClick();
      await authService.login(cleanEmail, cleanPassword);

      if (difficultyState) {
        navigate('/game', { state: { difficulty: difficultyState } });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail.trim());
    setPassword(demoPass.trim());
    setError('');
    sounds.playClick();
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
              <h1 className="auth-title h3">Welcome Back!</h1>
              <p className="auth-subtitle">
                Sign in to play, challenge your mind, and track your scores
              </p>
            </div>

            <ErrorMessage message={error} onDismiss={() => setError('')} />

            <form onSubmit={handleSubmit} noValidate>
              {/* Email Field */}
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="login-email">
                  Email Address
                </label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    id="login-email"
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
                <label className="auth-label" htmlFor="login-password">
                  Password
                </label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input form-control"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
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

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary auth-submit-btn w-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Login to Play</span>
                    <i className="bi bi-arrow-right"></i>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Access Credentials */}
            <div className="auth-demo-box">
              <div className="auth-demo-title">
                <i className="bi bi-lightning-charge-fill text-warning"></i>
                <span>Quick Demo Accounts (One-Click)</span>
              </div>
              <div className="auth-demo-buttons">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('player1@example.com', 'password123')}
                  className="auth-demo-btn"
                  title="Use demo player credentials"
                >
                  <i className="bi bi-controller"></i>
                  <span>Demo Player</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin@randomthinkinggame.com', 'admin123')}
                  className="auth-demo-btn auth-demo-btn-admin"
                  title="Use demo admin credentials"
                >
                  <i className="bi bi-shield-lock"></i>
                  <span>Demo Admin</span>
                </button>
              </div>
            </div>

            {/* Link to Registration */}
            <div className="auth-footer mt-4">
              <span>Don't have an account? </span>
              <Link to="/register" className="auth-link">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
