import React from 'react';
import { Link } from 'react-router-dom';

const Footer = ({ darkMode }) => {
  return (
    <footer className={`mt-auto py-4 border-top ${darkMode ? 'bg-dark text-light border-secondary' : 'bg-light text-muted border-light'}`}>
      <div className="container">
        <div className="row align-items-center gy-3">
          <div className="col-md-6 text-center text-md-start">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-1">
              <span className="fs-5">🎯</span>
              <span className="fw-bold tracking-tight">Random Thinking Game</span>
              <span className="badge bg-primary">v1.0</span>
            </div>
            <p className="small mb-0 text-secondary">
              Master your intuition & logic. Built with Spring Boot, MySQL & React.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <div className="d-flex justify-content-center justify-content-md-end gap-3 small mb-2">
              <Link to="/" className="text-decoration-none text-secondary">Home</Link>
              <Link to="/leaderboard" className="text-decoration-none text-secondary">Leaderboard</Link>
              <Link to="/dashboard" className="text-decoration-none text-secondary">Dashboard</Link>
              <Link to="/game" className="text-decoration-none text-secondary">Play</Link>
            </div>
            <div className="small text-secondary">
              &copy; {new Date().getFullYear()} Random Thinking. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
