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
// Motion is authored in "units per 60fps frame" and scaled by a delta-time factor
// so the scene runs at the same speed on 60Hz, 120Hz and 144Hz displays. The factor
// is clamped: a backgrounded tab or a long GC pause must not teleport the scene.
const FRAME_MS = 1000 / 60;
// Clamped at ~100ms so anything from 10fps upward stays real-time; past that the
// scene slows down rather than teleporting after a stall.
const MAX_STEP = 6;
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
    // Pointer position in *viewport* coords, plus the canvas origin needed to map it
    // into canvas-local space. The canvas is absolutely positioned inside the hero, so
    // once the page scrolls its origin no longer matches the viewport's and the cursor
    // reach would trail the real cursor by exactly scrollY. The origin is re-read only
    // when scroll/resize marks it stale, so pointermove stays layout-read free.
    let cx = -9999;
    let cy = -9999;
    let originX = 0;
    let originY = 0;
    let originStale = true;
    let raf = 0;
    let last = 0;
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

    const draw = (now: number, step: number) => {
      if (originStale) {
        const rect = canvas.getBoundingClientRect();
        originX = rect.left;
        originY = rect.top;
        originStale = false;
      }
      const mx = cx - originX;
      const my = cy - originY;

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
          p.x += p.vx * step;
          p.y += p.vy * step;
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
        // Spawn odds scale with the step so the drizzle keeps the same rate per
        // second rather than per frame.
        if (Math.random() < 0.07 * step) {
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
          b.life += step;
          b.y += b.vy * step;
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
      raf = requestAnimationFrame(loop);
      if (document.hidden) {
        // Skip the frame *and* the elapsed time, so resuming doesn't fast-forward.
        last = now;
        return;
      }
      if (!last) last = now;
      const step = Math.min((now - last) / FRAME_MS, MAX_STEP);
      last = now;
      draw(now, step);
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
      originStale = true;
      if (STATIC) draw(0, 0);
    };

    const onMove = (e: PointerEvent) => {
      cx = e.clientX;
      cy = e.clientY;
    };

    // Park the cursor reach off-canvas when the pointer leaves the page, otherwise the
    // highlight freezes wherever it was last seen. `pointerleave` on the root element
    // doesn't bubble, so it fires only on a real exit — not on every element boundary.
    const onLeave = () => {
      cx = -9999;
      cy = -9999;
    };
    const root = document.documentElement;

    const invalidateOrigin = () => {
      originStale = true;
    };

    resize();
    window.addEventListener("resize", resize);
    if (!STATIC) {
      window.addEventListener("pointermove", onMove);
      root.addEventListener("pointerleave", onLeave);
      window.addEventListener("scroll", invalidateOrigin, { passive: true });
      raf = requestAnimationFrame(loop);
    }
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", invalidateOrigin);
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
