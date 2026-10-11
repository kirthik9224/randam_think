import React, { useEffect, useRef } from 'react';

const GameJuiceEffects = ({ triggerConfetti = false, floatingTexts = [] }) => {
  const canvasRef = useRef(null);

  // Confetti Physics Engine
  useEffect(() => {
    if (!triggerConfetti) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confettiPieces = [];
    const colors = ['#38bdf8', '#fbbf24', '#f43f5e', '#10b981', '#a855f7', '#6366f1'];

    for (let i = 0; i < 120; i++) {
      confettiPieces.push({
        x: canvas.width * 0.5 + (Math.random() - 0.5) * 200,
        y: canvas.height * 0.6,
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 18 - 8,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 12,
        alpha: 1,
      });
    }

    let animationFrameId;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let activeCount = 0;

      for (let p of confettiPieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.5; // Gravity
        p.vx *= 0.98; // Drag
        p.rotation += p.vr;
        p.alpha -= 0.007;

        if (p.alpha > 0) {
          activeCount++;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      }

      if (activeCount > 0) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [triggerConfetti]);

  return (
    <>
      {/* Fullscreen Confetti Overlay */}
      <canvas
        ref={canvasRef}
        className="position-fixed top-0 start-0 w-100 h-100 pointer-events-none"
        style={{ zIndex: 9999, pointerEvents: 'none' }}
      />

      {/* Floating Floating Text FX Pills */}
      <div
        className="position-fixed top-50 start-50 translate-middle d-flex flex-column align-items-center pointer-events-none"
        style={{ zIndex: 9998, pointerEvents: 'none' }}
      >
        {floatingTexts.map((item) => (
          <div
            key={item.id}
            className="badge rounded-pill shadow-lg px-4 py-2 my-1 animate-floating-text font-monospace"
            style={{
              background: item.bg || 'linear-gradient(135deg, #f59e0b, #ef4444)',
              color: '#ffffff',
              fontSize: '1.25rem',
              border: '2px solid rgba(255, 255, 255, 0.8)',
              letterSpacing: '0.05em',
            }}
          >
            {item.text}
          </div>
        ))}
      </div>
    </>
  );
};

export default GameJuiceEffects;
