import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
  shape: 'sparkle' | 'heart' | 'star' | 'circle';
  rotation: number;
  rotationSpeed: number;
}

interface SparkleParticleCanvasProps {
  className?: string;
  particleDensity?: number;
  isFullScreen?: boolean;
}

export function SparkleParticleCanvas({
  className = 'absolute inset-0 pointer-events-none z-10',
  particleDensity = 1.0,
  isFullScreen = false,
}: SparkleParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let lastX = -1000;
    let lastY = -1000;

    const colors = [
      '#f43f5e', '#ec4899', '#d946ef', '#a855f7',
      '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981',
      '#f59e0b', '#fb7185', '#ffffff', '#fde047'
    ];

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      if (isFullScreen) {
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
      } else {
        const rect = canvas.getBoundingClientRect();
        canvas.width = (rect.width || window.innerWidth) * dpr;
        canvas.height = (rect.height || window.innerHeight) * dpr;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const spawnSparkle = (clientX: number, clientY: number, count = 2) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const dpr = window.devicePixelRatio || 1;
      const shapes: Particle['shape'][] = ['sparkle', 'star', 'heart', 'circle'];

      for (let i = 0; i < count; i++) {
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 2.5 + 0.6) * particleDensity;

        particles.push({
          x: x * dpr,
          y: y * dpr,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.4,
          size: (Math.random() * 9 + 4) * dpr,
          alpha: 1.0,
          decay: Math.random() * 0.02 + 0.015,
          color,
          shape,
          rotation: Math.random() * Math.PI,
          rotationSpeed: (Math.random() - 0.5) * 0.12,
        });
      }
    };

    // Pointer move handler (mouse / stylus / touch)
    const handlePointerMove = (e: PointerEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      spawnSparkle(e.clientX, e.clientY, 3);
    };

    // Mobile Touch Move & Touch Start handler
    const handleTouchMove = (e: TouchEvent) => {
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        lastX = touch.clientX;
        lastY = touch.clientY;
        spawnSparkle(touch.clientX, touch.clientY, 2);
      }
    };

    // Mobile scroll burst
    let scrollTimeout: any = null;
    const handleScroll = () => {
      if (lastX > 0 && lastY > 0) {
        spawnSparkle(lastX, lastY, 2);
      } else {
        // Fallback center screen sparkles on scroll
        const cx = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
        const cy = window.innerHeight / 2 + (Math.random() - 0.5) * 200;
        spawnSparkle(cx, cy, 2);
      }
    };

    const targetElement = isFullScreen ? window : (canvas.parentElement || window);

    targetElement.addEventListener('pointermove', handlePointerMove as any, { passive: true });
    targetElement.addEventListener('touchmove', handleTouchMove as any, { passive: true });
    targetElement.addEventListener('touchstart', handleTouchMove as any, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Ambient background sparkles
    const ambientInterval = setInterval(() => {
      if (canvas && particles.length < 40) {
        const rect = canvas.getBoundingClientRect();
        const rx = rect.left + Math.random() * rect.width;
        const ry = rect.top + Math.random() * rect.height;
        spawnSparkle(rx, ry, 1);
      }
    }, 350);

    // Shape drawing helpers
    const drawSparkleStar = (c: CanvasRenderingContext2D, size: number) => {
      c.beginPath();
      for (let i = 0; i < 4; i++) {
        c.lineTo(Math.cos((i * Math.PI) / 2) * size, Math.sin((i * Math.PI) / 2) * size);
        c.lineTo(Math.cos(((i + 0.5) * Math.PI) / 2) * (size * 0.25), Math.sin(((i + 0.5) * Math.PI) / 2) * (size * 0.25));
      }
      c.closePath();
      c.fill();
    };

    const drawHeart = (c: CanvasRenderingContext2D, size: number) => {
      c.beginPath();
      const topCurveHeight = size * 0.3;
      c.moveTo(0, topCurveHeight);
      c.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
      c.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, size, 0, size);
      c.bezierCurveTo(0, size, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
      c.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
      c.closePath();
      c.fill();
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.02; // float up gently
        p.alpha -= p.decay;
        p.rotation += p.rotationSpeed;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;

        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.shape === 'heart') {
          drawHeart(ctx, p.size * 0.85);
        } else if (p.shape === 'sparkle' || p.shape === 'star') {
          drawSparkleStar(ctx, p.size);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(ambientInterval);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      window.removeEventListener('resize', resizeCanvas);
      targetElement.removeEventListener('pointermove', handlePointerMove as any);
      targetElement.removeEventListener('touchmove', handleTouchMove as any);
      targetElement.removeEventListener('touchstart', handleTouchMove as any);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [particleDensity, isFullScreen]);

  return (
    <canvas
      ref={canvasRef}
      className={isFullScreen ? 'fixed inset-0 pointer-events-none z-50' : className}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

