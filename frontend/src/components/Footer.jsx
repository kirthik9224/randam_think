import React from 'react';
import { Link } from 'react-router-dom';

const Footer = ({ darkMode }) => {
  return (
    <footer className="mt-auto py-4 border-top" style={{ background: 'rgba(10, 6, 26, 0.95)', borderColor: 'rgba(168, 85, 247, 0.2)' }}>
      <div className="container">
        <div className="row align-items-center gy-3">
          <div className="col-md-6 text-center text-md-start">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-1">
              <span className="fs-5">💡</span>
              <span className="fw-bold tracking-tight text-white">Guess the Number</span>
              <span className="badge rounded-pill" style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.4)' }}>Think • Guess • Win</span>
            </div>
            <p className="small mb-0 text-white-50">
              A colorful casual number-guessing puzzle for everyone.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <div className="d-flex justify-content-center justify-content-md-end gap-3 small mb-2">
              <Link to="/" className="text-decoration-none text-white-50">Home</Link>
              <Link to="/dashboard" className="text-decoration-none text-white-50">Dashboard</Link>
              <Link to="/leaderboard" className="text-decoration-none text-white-50">Leaderboard</Link>
              <Link to="/history" className="text-decoration-none text-white-50">Stats</Link>
              <Link to="/game" className="text-decoration-none text-white-50">Play</Link>
            </div>
            <div className="small text-white-50">
              &copy; {new Date().getFullYear()} Guess the Number. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
