import React, { useState } from 'react';

const ScoreProgressionChart = ({ games = [] }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Take the last 10 completed games, reversed so they are chronologically left-to-right
  const chartGames = [...games]
    .filter((g) => g.status === 'WON' || g.status === 'LOST')
    .slice(0, 10)
    .reverse();

  if (chartGames.length === 0) {
    return (
      <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-body h-100 d-flex flex-column justify-content-center">
        <div className="text-muted mb-2">
          <i className="bi bi-graph-up text-secondary fs-1"></i>
        </div>
        <h6 className="fw-bold mb-1">Score Progression</h6>
        <p className="text-muted small mb-0">
          Play and complete games to visualize your score progression and performance trajectory over time.
        </p>
      </div>
    );
  }

  const height = 180;
  const width = 500;
  const paddingX = 40;
  const paddingY = 30;

  const maxScore = Math.max(1000, ...chartGames.map((g) => g.score || 0));
  const minScore = 0;

  const getX = (index) => {
    if (chartGames.length === 1) return width / 2;
    return paddingX + (index / (chartGames.length - 1)) * (width - 2 * paddingX);
  };

  const getY = (score) => {
    const range = maxScore - minScore || 1;
    return height - paddingY - ((score - minScore) / range) * (height - 2 * paddingY);
  };

  // Generate SVG path for the line
  const points = chartGames.map((g, i) => `${getX(i)},${getY(g.score || 0)}`);
  const linePath = `M ${points.join(' L ')}`;

  // Generate SVG path for the gradient area under the line
  const areaPath = `M ${getX(0)},${height - paddingY} L ${points.join(' L ')} L ${getX(
    chartGames.length - 1
  )},${height - paddingY} Z`;

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-body h-100">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-graph-up-arrow text-primary"></i>
            <span>Score Progression</span>
          </h5>
          <span className="small text-muted">Latest {chartGames.length} games trajectory</span>
        </div>
        <div className="d-flex align-items-center gap-3 small text-muted">
          <span className="d-flex align-items-center gap-1">
            <span className="rounded-circle bg-success d-inline-block" style={{ width: '8px', height: '8px' }}></span>
            Win
          </span>
          <span className="d-flex align-items-center gap-1">
            <span className="rounded-circle bg-danger d-inline-block" style={{ width: '8px', height: '8px' }}></span>
            Loss
          </span>
        </div>
      </div>

      <div className="position-relative w-100" style={{ minHeight: '180px' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-100 h-auto"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal gridlines */}
          {[0, 0.5, 1].map((pct, i) => {
            const yVal = height - paddingY - pct * (height - 2 * paddingY);
            const scoreLabel = Math.round(minScore + pct * (maxScore - minScore));
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={yVal}
                  x2={width - paddingX}
                  y2={yVal}
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 6}
                  y={yVal + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="currentColor"
                  opacity="0.4"
                  className="font-monospace"
                >
                  {scoreLabel}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          {chartGames.length > 1 && (
            <path d={areaPath} fill="url(#scoreAreaGradient)" />
          )}

          {/* Connected Line */}
          {chartGames.length > 1 && (
            <path
              d={linePath}
              fill="none"
              stroke="#2563EB"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {chartGames.map((g, i) => {
            const cx = getX(i);
            const cy = getY(g.score || 0);
            const isWon = g.status === 'WON';
            const isHovered = hoveredPoint?.gameId === g.gameId;

            return (
              <g
                key={g.gameId || i}
                onMouseEnter={() => setHoveredPoint(g)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 7 : 4.5}
                  fill={isWon ? '#198754' : '#dc3545'}
                  stroke="#ffffff"
                  strokeWidth="2"
                  style={{ transition: 'all 0.2s ease' }}
                />
                {/* Game number below */}
                <text
                  x={cx}
                  y={height - 10}
                  textAnchor="middle"
                  fontSize="9"
                  fill="currentColor"
                  opacity="0.5"
                  className="font-monospace"
                >
                  #{i + 1}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="card position-absolute shadow-sm border p-2 rounded-3 bg-body small"
            style={{
              top: '10px',
              right: '15px',
              zIndex: 10,
              minWidth: '150px',
              pointerEvents: 'none',
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className={`badge ${hoveredPoint.status === 'WON' ? 'bg-success' : 'bg-danger'} rounded-pill`}>
                {hoveredPoint.status}
              </span>
              <span className="font-monospace text-muted small">
                {hoveredPoint.difficulty}
              </span>
            </div>
            <div className="fw-bold text-primary fs-6">
              Score: {hoveredPoint.score || 0} pts
            </div>
            <div className="text-muted small">
              Attempts: {hoveredPoint.attemptsUsed}
              {hoveredPoint.gameMode ? ` • ${hoveredPoint.gameMode.replace('_', ' ')}` : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreProgressionChart;
