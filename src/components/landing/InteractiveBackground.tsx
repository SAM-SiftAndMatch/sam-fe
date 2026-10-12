import type React from 'react';
import { useEffect, useRef } from 'react';

interface Dot {
  ox: number;
  oy: number;
  dx: number;
  dy: number;
  vx: number;
  vy: number;
  t: number; // 0 to 1 for color interpolation
}

export const InteractiveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const SPACING = 28;
    const INFLUENCE_RADIUS = 160;

    // Detect capabilities
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches;

    // Mouse coordinates & lerped spotlight coordinates
    let mouseX = -9999;
    let mouseY = -9999;
    let mouseActive = false;
    let spotX = width / 2;
    let spotY = height / 3;

    let dots: Dot[] = [];

    const initDots = () => {
      dots = [];
      const cols = Math.ceil(width / SPACING) + 2;
      const rows = Math.ceil(height / SPACING) + 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots.push({
            ox: c * SPACING,
            oy: r * SPACING,
            dx: 0,
            dy: 0,
            vx: 0,
            vy: 0,
            t: 0,
          });
        }
      }
    };

    initDots();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      width = window.innerWidth;
      height = window.innerHeight;
      initDots();
      if (prefersReducedMotion) {
        drawStatic();
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isTouchDevice) return;
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseActive = true;
    };

    const handlePointerLeave = () => {
      mouseActive = false;
      mouseX = -9999;
      mouseY = -9999;
    };

    window.addEventListener('resize', handleResize, { passive: true });
    if (!isTouchDevice) {
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      document.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    }

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.22)';
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        ctx.beginPath();
        ctx.arc(dot.ox, dot.oy, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    if (prefersReducedMotion) {
      drawStatic();
      return () => {
        window.removeEventListener('resize', handleResize);
        if (!isTouchDevice) {
          window.removeEventListener('pointermove', handlePointerMove);
          document.removeEventListener('pointerleave', handlePointerLeave);
        }
      };
    }

    const startTime = performance.now();

    const render = (currentTime: number) => {
      const elapsed = currentTime - startTime;

      ctx.clearRect(0, 0, width, height);

      // 1. Soft radial spotlight following cursor with lag (lerp 0.12)
      if (!isTouchDevice && mouseActive) {
        spotX += (mouseX - spotX) * 0.12;
        spotY += (mouseY - spotY) * 0.12;

        const spotlightGrad = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, 260);
        spotlightGrad.addColorStop(0, 'rgba(29, 78, 216, 0.055)');
        spotlightGrad.addColorStop(0.6, 'rgba(29, 78, 216, 0.015)');
        spotlightGrad.addColorStop(1, 'rgba(29, 78, 216, 0)');

        ctx.fillStyle = spotlightGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Render dot matrix
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];

        if (isTouchDevice) {
          // Slow ambient drift on touch devices
          const ambientX = Math.sin(elapsed * 0.0012 + dot.ox * 0.02) * 2;
          const ambientY = Math.cos(elapsed * 0.0012 + dot.oy * 0.02) * 2;
          ctx.fillStyle = 'rgba(148, 163, 184, 0.20)';
          ctx.beginPath();
          ctx.arc(dot.ox + ambientX, dot.oy + ambientY, 1, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }

        // Desktop mouse physics
        let targetDx = 0;
        let targetDy = 0;
        let targetT = 0;

        if (mouseActive) {
          const dist = Math.hypot(dot.ox - mouseX, dot.oy - mouseY);
          if (dist < INFLUENCE_RADIUS) {
            const factor = 1 - dist / INFLUENCE_RADIUS;
            const angle = Math.atan2(dot.oy - mouseY, dot.ox - mouseX);
            const push = factor * 14;
            targetDx = Math.cos(angle) * push;
            targetDy = Math.sin(angle) * push;
            targetT = factor;
          }
        }

        // Spring-like damping motion: acceleration = k * displacement - c * velocity
        const ax = (targetDx - dot.dx) * 0.16;
        dot.vx = (dot.vx + ax) * 0.72;
        dot.dx += dot.vx;

        const ay = (targetDy - dot.dy) * 0.16;
        dot.vy = (dot.vy + ay) * 0.72;
        dot.dy += dot.vy;

        dot.t += (targetT - dot.t) * 0.15;

        // Color interpolation: Base slate -> Primary #1D4ED8 (rgb 29, 78, 216)
        const t = Math.max(0, Math.min(1, dot.t));
        const r = Math.round(148 - 119 * t);
        const g = Math.round(163 - 85 * t);
        const b = Math.round(184 + 32 * t);
        const alpha = 0.2 + 0.65 * t;
        const radius = 1 + 0.35 * t;

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(dot.ox + dot.dx, dot.oy + dot.dy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (!isTouchDevice) {
        window.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerleave', handlePointerLeave);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

export default InteractiveBackground;
