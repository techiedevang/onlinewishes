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

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let cachedRect = { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
    let cachedDpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let lastSpawnTime = 0;

    const colors = [
      '#f43f5e', '#ec4899', '#d946ef', '#a855f7',
      '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981',
      '#f59e0b', '#fb7185', '#ffffff', '#fde047'
    ];

    const updateBounds = () => {
      cachedDpr = Math.min(window.devicePixelRatio || 1, 1.5);
      if (isFullScreen) {
        cachedRect = { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
      } else {
        const rect = canvas.getBoundingClientRect();
        cachedRect = {
          left: rect.left,
          top: rect.top,
          width: rect.width || window.innerWidth,
          height: rect.height || window.innerHeight,
        };
      }
      canvas.width = cachedRect.width * cachedDpr;
      canvas.height = cachedRect.height * cachedDpr;
    };

    updateBounds();
    window.addEventListener('resize', updateBounds, { passive: true });

    const spawnSparkle = (clientX: number, clientY: number, count = 1) => {
      if (particles.length > 60) return; // Cap maximum active particles

      const x = (clientX - cachedRect.left) * cachedDpr;
      const y = (clientY - cachedRect.top) * cachedDpr;

      const shapes: Particle['shape'][] = ['sparkle', 'star', 'heart', 'circle'];

      for (let i = 0; i < count; i++) {
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 2 + 0.5) * particleDensity;

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.3,
          size: (Math.random() * 7 + 3) * cachedDpr,
          alpha: 1.0,
          decay: Math.random() * 0.025 + 0.02,
          color,
          shape,
          rotation: Math.random() * Math.PI,
          rotationSpeed: (Math.random() - 0.5) * 0.1,
        });
      }
    };

    // Throttled pointer move handler
    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastSpawnTime < 40) return; // Throttle to ~25fps spawn
      lastSpawnTime = now;
      spawnSparkle(e.clientX, e.clientY, 2);
    };

    // Throttled touch move for mobile
    const handleTouchMove = (e: TouchEvent) => {
      const now = performance.now();
      if (now - lastSpawnTime < 50) return;
      lastSpawnTime = now;

      if (e.touches.length > 0) {
        const touch = e.touches[0];
        spawnSparkle(touch.clientX, touch.clientY, 2);
      }
    };

    // Scroll event handler for mobile and desktop scroll trails
    let lastScrollY = window.scrollY;
    let lastScrollTime = 0;

    const handleScroll = () => {
      const now = performance.now();
      if (now - lastScrollTime < 45) return; // ~22fps responsive scroll trail
      lastScrollTime = now;

      const currentScrollY = window.scrollY;
      const scrollDiff = Math.abs(currentScrollY - lastScrollY);
      lastScrollY = currentScrollY;

      if (scrollDiff > 2) {
        // Spawn 2 sparkles across random visible viewport coordinates
        const rx = cachedRect.left + Math.random() * cachedRect.width;
        const ry = Math.random() * (window.innerHeight * 0.75) + (window.innerHeight * 0.1);
        spawnSparkle(rx, ry, 2);
      }
    };

    const targetElement = isFullScreen ? window : (canvas.parentElement || window);

    targetElement.addEventListener('pointermove', handlePointerMove as any, { passive: true });
    targetElement.addEventListener('touchmove', handleTouchMove as any, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Light ambient background sparkles
    const ambientInterval = setInterval(() => {
      if (document.hidden) return;
      if (particles.length < 15) {
        const rx = cachedRect.left + Math.random() * cachedRect.width;
        const ry = cachedRect.top + Math.random() * cachedRect.height;
        spawnSparkle(rx, ry, 1);
      }
    }, 600);

    // Fast shape drawing without shadowBlur
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
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.015; // gentle float up
        p.alpha -= p.decay;
        p.rotation += p.rotationSpeed;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;

        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.shape === 'heart') {
          drawHeart(ctx, p.size * 0.8);
        } else if (p.shape === 'sparkle' || p.shape === 'star') {
          drawSparkleStar(ctx, p.size);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.4, 0, Math.PI * 2);
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
      window.removeEventListener('resize', updateBounds);
      window.removeEventListener('scroll', handleScroll);
      targetElement.removeEventListener('pointermove', handlePointerMove as any);
      targetElement.removeEventListener('touchmove', handleTouchMove as any);
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

