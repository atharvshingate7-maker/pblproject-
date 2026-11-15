import React, { useEffect, useRef } from 'react';

export default function SciFiBackground() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep matte obsidian backdrop
      ctx.fillStyle = '#060608';
      ctx.fillRect(0, 0, width, height);

      // Subtle radial highlight from top
      const radialGrad = ctx.createRadialGradient(
        width * 0.5, height * 0.15, 50,
        width * 0.5, height * 0.45, Math.max(width, height) * 0.75
      );
      radialGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
      radialGrad.addColorStop(0.5, 'rgba(148, 163, 184, 0.02)');
      radialGrad.addColorStop(1, 'rgba(6, 6, 8, 0)');
      ctx.fillStyle = radialGrad;
      ctx.fillRect(0, 0, width, height);

      // Delicate Topological Wave Wireframe Mesh (Reference Image Aesthetic)
      time += 0.008;
      const numLines = 28;
      const stepX = 14;
      const centerY = height * 0.45;
      const centerX = width * 0.65;

      ctx.lineWidth = 1;
      for (let i = 0; i < numLines; i++) {
        const offset = i * 18;
        ctx.beginPath();
        const alpha = 0.03 + (Math.sin(time + i * 0.15) + 1) * 0.025;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;

        for (let x = 0; x < width; x += stepX) {
          const distFromCenter = Math.abs(x - centerX) / (width * 0.5);
          const envelope = Math.max(0, 1 - distFromCenter * distFromCenter);
          const y = centerY + Math.sin(x * 0.004 + time + i * 0.08) * 65 * envelope
                            + Math.cos(x * 0.008 - time * 0.5) * 35 * envelope
                            + offset - (numLines * 9);
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Orbital Trajectory Circles (as in reference image)
      const orbitX = width > 1024 ? width * 0.28 : width * 0.5;
      const orbitY = height * 0.4;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      [120, 240, 360].forEach(r => {
        ctx.beginPath();
        ctx.arc(orbitX, orbitY, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Mouse subtle light spotlight
      if (mouseRef.current.active) {
        const mGrad = ctx.createRadialGradient(
          mouseRef.current.x, mouseRef.current.y, 0,
          mouseRef.current.x, mouseRef.current.y, 180
        );
        mGrad.addColorStop(0, 'rgba(255, 255, 255, 0.07)');
        mGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = mGrad;
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, 180, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
      {/* Soft Ambient Depth Orbs */}
      <div className="ambient-orb-crimson" />
      <div className="ambient-orb-blood" />
      <div className="ambient-orb-ruby" />
    </div>
  );
}
