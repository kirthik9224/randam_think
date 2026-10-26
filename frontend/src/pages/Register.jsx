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
                  Password
                </label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input form-control"
                    placeholder="Create a strong password (min 6 chars)"
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
                    placeholder="Re-enter your password"
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
                className="btn btn-primary auth-submit-btn w-100 mt-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Creating your account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <i className="bi bi-arrow-right"></i>
                  </>
                )}
              </button>
            </form>

            {/* Link to Login */}
            <div className="auth-footer mt-4">
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
