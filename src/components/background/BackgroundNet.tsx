import { useEffect, useRef } from "react";

/**
 * The signature hero background: a constellation / neural-net on canvas with a
 * silver "binary drizzle", over a grain + vignette + dot texture.
 *
 * Perf: a single cheap 2D canvas (no WebGL). It animates only on capable devices
 * — on touch, small viewports, or `prefers-reduced-motion` it renders one static
 * frame and never starts the rAF loop. The loop also pauses when the tab is hidden.
 */
const SILVER: [number, number, number] = [206, 214, 232];
const EDGE = 132;
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  z: number;
}
interface Star {
  x: number;
  y: number;
  r: number;
  p: number;
}
interface Bit {
  x: number;
  y: number;
  c: string;
  life: number;
  vy: number;
  size: number;
  big: boolean;
}

export function BackgroundNet() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const small = window.matchMedia("(max-width: 768px)").matches;
    const STATIC = reduced || coarse || small;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    let mx = -999;
    let my = -999;
    let raf = 0;
    let lastW = -1;
    let nodes: Node[] = [];
    let stars: Star[] = [];
    let bits: Bit[] = [];

    const seed = () => {
      nodes = [];
      const gap = Math.max(78, Math.min(120, W / 13));
      for (let gy = gap * 0.4; gy < H + gap; gy += gap) {
        for (let gx = gap * 0.4; gx < W + gap; gx += gap) {
          nodes.push({
            x: gx + (Math.random() - 0.5) * gap * 0.7,
            y: gy + (Math.random() - 0.5) * gap * 0.7,
            vx: (Math.random() - 0.5) * 0.16,
            vy: (Math.random() - 0.5) * 0.16,
            z: 0.4 + Math.random() * 0.6,
          });
        }
      }
      stars = [];
      const ns = Math.floor((W * H) / 11000);
      for (let i = 0; i < ns; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() + 0.2,
          p: Math.random() * 6.28,
        });
      }
      bits = [];
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, W, H);
      // stars
      for (const s of stars) {
        const tw = STATIC ? 0.6 : 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(now / 700 + s.p));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 7);
        ctx.fillStyle = `rgba(206,220,255,${0.4 * tw})`;
        ctx.fill();
      }
      // drift
      if (!STATIC) {
        for (const p of nodes) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -20) p.x = W + 20;
          if (p.x > W + 20) p.x = -20;
          if (p.y < -20) p.y = H + 20;
          if (p.y > H + 20) p.y = -20;
        }
      }
      // connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          if (!a || !b) continue;
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < EDGE) {
            ctx.strokeStyle = `rgba(139,92,246,${0.14 * (1 - d / EDGE) * Math.min(a.z, b.z)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      // nodes + cursor reach
      for (const p of nodes) {
        const dc = Math.hypot(p.x - mx, p.y - my);
        const near = dc < 190;
        if (near) {
          ctx.strokeStyle = `rgba(34,211,238,${0.5 * (1 - dc / 190)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mx, my);
          ctx.stroke();
        }
        const r = (near ? 2.6 : 1.5) * (0.6 + p.z * 0.6);
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, 7);
        if (near) {
          ctx.fillStyle = "rgba(34,211,238,0.95)";
          ctx.shadowColor = "rgba(34,211,238,0.9)";
          ctx.shadowBlur = 9;
        } else {
          ctx.fillStyle = `rgba(168,85,247,${0.32 + p.z * 0.32})`;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      // silver binary drizzle (animated only)
      if (!STATIC) {
        if (Math.random() < 0.07) {
          const p = nodes[(Math.random() * nodes.length) | 0];
          if (p) {
            const big = Math.random() < 0.35;
            bits.push({
              x: p.x + (Math.random() - 0.5) * 26,
              y: p.y,
              c: Math.random() < 0.5 ? "0" : "1",
              life: 0,
              vy: -0.22 - Math.random() * 0.4,
              size: big ? 16 + Math.random() * 10 : 9 + Math.random() * 5,
              big,
            });
          }
        }
        const [sr, sg, sb] = SILVER;
        for (let k = bits.length - 1; k >= 0; k--) {
          const b = bits[k];
          if (!b) continue;
          b.life++;
          b.y += b.vy;
          const a = Math.sin(Math.min(b.life / 55, 1) * Math.PI);
          ctx.font = `${b.size | 0}px "JetBrains Mono", monospace`;
          if (b.big) {
            ctx.fillStyle = `rgba(${sr},${sg},${sb},${0.92 * a})`;
            ctx.shadowColor = `rgba(${sr},${sg},${sb},0.9)`;
            ctx.shadowBlur = 12;
          } else {
            ctx.fillStyle = `rgba(${sr},${sg},${sb},${0.55 * a})`;
          }
          ctx.fillText(b.c, b.x, b.y);
          ctx.shadowBlur = 0;
          if (b.life > 55) bits.splice(k, 1);
        }
      }
    };

    const loop = (now: number) => {
      if (!document.hidden) draw(now);
      raf = requestAnimationFrame(loop);
    };

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      // Mobile browsers fire resize on scroll as the URL bar shows/hides, changing
      // only the height. Reseeding there would re-randomize every node and make the
      // static constellation jump around, so only reseed when the width changes.
      if (W !== lastW) {
        lastW = W;
        seed();
      }
      if (STATIC) draw(0);
    };

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    resize();
    window.addEventListener("resize", resize);
    if (!STATIC) {
      window.addEventListener("pointermove", onMove);
      raf = requestAnimationFrame(loop);
    }
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden bg-[#09060f] bg-[radial-gradient(rgba(198,188,224,0.05)_1px,transparent_1.6px)] bg-size-[26px_26px]"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(125%_95%_at_50%_32%,transparent_52%,rgba(0,0,0,0.62)_100%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />
    </div>
  );
}
