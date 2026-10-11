import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import gameService from '../services/gameService';
import GameResult from '../components/GameResult';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import sounds from '../utils/soundEffects';
import '../styles/Result.css';

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { gameId } = useParams();

  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!location.state?.result && !!gameId);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!result && gameId) {
      fetchResult(gameId);
    }
  }, [gameId, result]);

  const fetchResult = async (id) => {
    try {
      setLoading(true);
      setError('');
      const data = await gameService.getGameResult(id);
      setResult(data);
    } catch (err) {
      setError('Could not retrieve game result.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAgain = () => {
    sounds.playClick();
    navigate('/game', { state: { difficulty: result?.difficulty || 'MEDIUM', mode: result?.gameMode || 'CLASSIC' } });
  };

  if (loading) {
    return <LoadingSpinner message="Loading match results..." fullScreen />;
  }

  if (error || !result) {
    return (
      <div className="container py-5 text-center">
        <ErrorMessage message={error || 'No game result found.'} />
        <Link to="/dashboard" className="btn btn-primary rounded-pill px-4 mt-3">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="result-page container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <GameResult result={result} onPlayAgain={handlePlayAgain} />
        </div>
      </div>
    </div>
  );
};

export default Result;
