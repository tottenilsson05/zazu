/**
 * Floating pollen + pixel sparkles on a fixed canvas.
 * Lightweight: ~40 particles, DPR capped, pauses when the tab is hidden,
 * draws a single still frame when the visitor prefers reduced motion.
 */
interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  tw: number;
  kind: "dust" | "spark";
  hue: string;
}

const SPARK_COLORS = ["#ffffff", "#fff3b0", "#bfe6ff", "#c8ffb0"];

export function startParticles(canvas: HTMLCanvasElement, opts: { count?: number } = {}) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  let w = 0;
  let h = 0;
  const count = opts.count ?? (window.innerWidth < 640 ? 12 : 22);
  const ps: P[] = [];

  const resize = () => {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const spawn = (initial: boolean): P => {
    const spark = Math.random() < 0.25;
    return {
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + 10,
      vx: (Math.random() - 0.5) * 0.12,
      vy: -(0.08 + Math.random() * 0.22),
      r: spark ? 2 + Math.floor(Math.random() * 2) : 0.8 + Math.random() * 1.8,
      a: 0.25 + Math.random() * 0.55,
      tw: Math.random() * Math.PI * 2,
      kind: spark ? "spark" : "dust",
      hue: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
    };
  };

  resize();
  for (let i = 0; i < count; i++) ps.push(spawn(true));

  const drawSpark = (p: P, alpha: number) => {
    const s = p.r;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.hue;
    const x = Math.round(p.x);
    const y = Math.round(p.y);
    ctx.fillRect(x - s / 2, y - s * 2, s, s * 4);
    ctx.fillRect(x - s * 2, y - s / 2, s * 4, s);
    ctx.fillRect(x - s / 2, y - s / 2, s, s);
  };

  let last = performance.now();
  let raf = 0;
  const frame = (t: number) => {
    const dt = Math.min(48, t - last) / 16.67;
    last = t;
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < ps.length; i++) {
      const p = ps[i];
      if (!reduce) {
        p.x += p.vx * dt + Math.sin((t / 2400) + p.tw) * 0.05;
        p.y += p.vy * dt;
        p.tw += 0.02 * dt;
        if (p.y < -12 || p.x < -12 || p.x > w + 12) ps[i] = spawn(false);
      }
      const twinkle = 0.55 + 0.45 * Math.sin(p.tw * 2);
      if (p.kind === "spark") drawSpark(p, p.a * twinkle);
      else {
        ctx.globalAlpha = p.a * 0.8;
        ctx.fillStyle = "#fffbe6";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    if (!reduce) raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  const onVis = () => {
    if (reduce) return;
    if (document.hidden) cancelAnimationFrame(raf);
    else {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  };
  const onResize = () => {
    resize();
    if (reduce) raf = requestAnimationFrame(frame);
  };
  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", onVis);
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize);
    document.removeEventListener("visibilitychange", onVis);
  };
}

/**
 * Retro cursor hover effect: tiny pixel sparkles trail the pointer while it
 * is over links, buttons and anything marked data-spark.
 */
export function startCursorSparkles() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  if (!window.matchMedia("(pointer: fine)").matches) return () => {};
  let lastT = 0;
  const colors = ["#fff", "#ffe680", "#9fdcff", "#b6ff9a"];
  const onMove = (e: PointerEvent) => {
    const t = performance.now();
    if (t - lastT < 90) return;
    const el = e.target as Element | null;
    if (!el || !el.closest("a, button, [data-spark], .swatch, .acc")) return;
    lastT = t;
    const s = document.createElement("span");
    s.className = "cursor-spark";
    s.style.left = `${e.clientX + (Math.random() * 16 - 4)}px`;
    s.style.top = `${e.clientY + (Math.random() * 16 - 2)}px`;
    s.style.color = colors[Math.floor(Math.random() * colors.length)];
    document.body.appendChild(s);
    window.setTimeout(() => s.remove(), 700);
  };
  document.addEventListener("pointermove", onMove, { passive: true });
  return () => document.removeEventListener("pointermove", onMove);
}
