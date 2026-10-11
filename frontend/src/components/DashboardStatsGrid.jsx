import React from 'react';

const DashboardStatsGrid = ({ profile, history = [] }) => {
  const totalGames = profile?.totalGames || 0;
  const gamesWon = profile?.gamesWon || 0;
  const gamesLost = profile?.gamesLost || 0;
  const winRate = profile?.winRate !== undefined ? profile.winRate : (totalGames > 0 ? Math.round((gamesWon / totalGames) * 1000) / 10 : 0);
  const bestScore = profile?.bestScore || profile?.highestScore || 0;
  const currentStreak = profile?.currentStreak || 0;
  const bestStreak = profile?.bestStreak !== undefined ? profile.bestStreak : Math.max(currentStreak, 0);

  // Calculate small recent win/loss trend from latest 3 completed games
  const completedGames = history.filter((g) => g.status === 'WON' || g.status === 'LOST');
  const recentWins = completedGames.slice(0, 3).filter((g) => g.status === 'WON').length;
  const hasHistory = completedGames.length > 0;

  const stats = [
    {
      id: 'total_games',
      title: 'Total Games',
      value: totalGames,
      icon: 'bi-controller',
      color: 'primary',
      bgClass: 'bg-primary-subtle text-primary',
      trend: hasHistory ? `${gamesLost} losses recorded` : 'No games played yet',
      trendColor: 'text-muted',
    },
    {
      id: 'games_won',
      title: 'Games Won',
      value: gamesWon,
      icon: 'bi-trophy-fill',
      color: 'success',
      bgClass: 'bg-success-subtle text-success',
      trend: hasHistory ? `${winRate}% victory rate` : 'Awaiting 1st victory',
      trendColor: gamesWon > 0 ? 'text-success' : 'text-muted',
    },
    {
      id: 'win_rate',
      title: 'Win Rate',
      value: `${winRate}%`,
      icon: 'bi-pie-chart-fill',
      color: 'info',
      bgClass: 'bg-info-subtle text-info',
      trend: hasHistory
        ? recentWins >= 2
          ? '↑ Strong recent form'
          : 'Based on actual games'
        : '0% start',
      trendColor: recentWins >= 2 ? 'text-success' : 'text-muted',
    },
    {
      id: 'best_score',
      title: 'Best Score',
      value: bestScore > 0 ? bestScore.toLocaleString() : '0',
      icon: 'bi-star-fill',
      color: 'warning',
      bgClass: 'bg-warning-subtle text-warning-emphasis',
      trend: bestScore > 0 ? 'Personal all-time high' : 'Set a high score!',
      trendColor: bestScore > 0 ? 'text-warning-emphasis' : 'text-muted',
    },
    {
      id: 'current_streak',
      title: 'Current Streak',
      value: `${currentStreak} 🔥`,
      icon: 'bi-fire',
      color: 'danger',
      bgClass: 'bg-danger-subtle text-danger',
      trend: currentStreak > 0 ? `${currentStreak} consecutive win${currentStreak > 1 ? 's' : ''}` : 'Streak reset',
      trendColor: currentStreak > 0 ? 'text-danger' : 'text-muted',
    },
    {
      id: 'best_streak',
      title: 'Best Streak',
      value: `${bestStreak} ⚡`,
      icon: 'bi-lightning-charge-fill',
      color: 'purple',
      bgClass: 'bg-indigo-subtle text-indigo',
      trend: bestStreak > 0 ? 'Longest winning run' : 'Record your first win',
      trendColor: bestStreak > 0 ? 'text-primary' : 'text-muted',
    },
  ];

  return (
    <div className="row g-3 mb-4">
      {stats.map((s) => (
        <div key={s.id} className="col-6 col-md-4 col-xl-2">
          <div className="card h-100 border-0 shadow-sm rounded-4 p-3 text-center stat-card bg-body">
            <div
              className={`stat-icon rounded-circle mx-auto mb-2 ${s.bgClass}`}
              style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}
            >
              <i className={`bi ${s.icon}`}></i>
            </div>
            <div className="text-muted smaller fw-medium text-uppercase tracking-wider" style={{ fontSize: '0.72rem' }}>
              {s.title}
            </div>
            <div className={`h3 fw-bold mb-1 text-${s.color} font-monospace`}>
              {s.value}
            </div>
            <div className={`smaller ${s.trendColor} text-truncate`} style={{ fontSize: '0.72rem' }} title={s.trend}>
              {s.trend}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStatsGrid;
