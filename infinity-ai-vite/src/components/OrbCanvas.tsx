import { useEffect, useRef } from 'react';

export default function OrbCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    cv.width = 520; cv.height = 320;
    const ctx = cv.getContext('2d')!;
    const W = 520, H = 320, CX = 260, CY = 160;
    let T = 0;
    const A = 115;

    function infinityPoint(t: number) {
      const s = Math.sin(t), c2 = Math.cos(t);
      const denom = 1 + s * s;
      return { x: CX + A * c2 / denom, y: CY + A * s * c2 / denom };
    }
    function ptAtFrac(frac: number) { return infinityPoint(frac * Math.PI * 2); }

    function drawTrail() {
      const STEPS = 80, SPAN = 0.55;
      const headFrac = ((T * 0.012) % 1 + 1) % 1;
      for (let s = STEPS; s >= 0; s--) {
        const f0 = headFrac - ((s + 0) / STEPS) * SPAN;
        const f1 = headFrac - ((s + 1) / STEPS) * SPAN;
        const p0 = ptAtFrac(f0), p1 = ptAtFrac(f1);
        const fade = 1 - s / STEPS;
        const alpha = fade * fade;
        const lw = 1 + fade * 10;
        ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y);
        ctx.lineCap = 'round'; ctx.lineWidth = lw;
        if (fade > 0.7) {
          const t2 = (fade - 0.7) / 0.3;
          const r = Math.round(180 + t2 * 75), g = Math.round(180 + t2 * 75);
          ctx.strokeStyle = `rgba(${r},${g},255,${alpha})`;
          ctx.shadowBlur = 28 * fade; ctx.shadowColor = 'rgba(140,160,255,0.9)';
        } else {
          ctx.strokeStyle = `rgba(140,80,255,${alpha * 0.8})`;
          ctx.shadowBlur = 16 * fade; ctx.shadowColor = 'rgba(120,60,240,0.6)';
        }
        ctx.stroke();
      }
      const head = ptAtFrac(headFrac);
      const grd = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 22);
      grd.addColorStop(0, 'rgba(220,230,255,0.95)'); grd.addColorStop(0.25, 'rgba(160,180,255,0.7)');
      grd.addColorStop(0.6, 'rgba(100,80,255,0.3)'); grd.addColorStop(1, 'rgba(80,40,220,0)');
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(head.x, head.y, 22, 0, Math.PI * 2); ctx.fill();
      const grd2 = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 6);
      grd2.addColorStop(0, 'rgba(255,255,255,1)'); grd2.addColorStop(0.5, 'rgba(200,220,255,0.8)'); grd2.addColorStop(1, 'rgba(150,160,255,0)');
      ctx.fillStyle = grd2; ctx.beginPath(); ctx.arc(head.x, head.y, 6, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    function drawAmbient() {
      const pulse = 0.5 + 0.5 * Math.sin(T * 0.03);
      const g1 = ctx.createRadialGradient(CX, CY, 10, CX, CY, 160);
      g1.addColorStop(0, `rgba(100,60,200,${0.06 + pulse * 0.04})`);
      g1.addColorStop(1, 'rgba(60,20,120,0)');
      ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);
    }

    function frame() {
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      drawAmbient();
      drawTrail();
      T++;
      animRef.current = requestAnimationFrame(frame);
    }
    frame();

    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="orb-wrap">
      <canvas ref={canvasRef} />
    </div>
  );
}
