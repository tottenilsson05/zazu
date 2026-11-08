"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import { A } from "@/config/site";
import { startCursorSparkles, startParticles } from "@/lib/particles";

/**
 * The one continuous world behind every section:
 * sky → sun → far clouds → mid clouds → hills → haze → Zazu.
 * Scrolling past the hero (--p: 0→1) softly blurs the hills and turns Zazu
 * into a soft glow behind the content, so sections float in the same scene.
 */
const CLOUDS: { layer: "far" | "mid"; n: number; y: string; w: string; d: number; at: number }[] = [
  { layer: "far", n: 5, y: "7%", w: "clamp(150px, 20vw, 400px)", d: 360, at: 0.15 },
  { layer: "far", n: 7, y: "26%", w: "clamp(130px, 16vw, 320px)", d: 320, at: 0.62 },
  { layer: "far", n: 3, y: "38%", w: "clamp(170px, 19vw, 380px)", d: 380, at: 0.86 },
  { layer: "far", n: 6, y: "15%", w: "clamp(140px, 17vw, 340px)", d: 340, at: 0.4 },
  { layer: "mid", n: 1, y: "4%", w: "clamp(250px, 34vw, 680px)", d: 240, at: 0.08 },
  { layer: "mid", n: 2, y: "19%", w: "clamp(220px, 29vw, 600px)", d: 220, at: 0.68 },
  { layer: "mid", n: 4, y: "33%", w: "clamp(200px, 25vw, 520px)", d: 260, at: 0.42 },
];

export function World() {
  const ref = useRef<HTMLDivElement>(null);
  const particles = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // scroll progress through the hero → --p
    let sraf = 0;
    const update = () => {
      sraf = 0;
      const p = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.85)));
      el.style.setProperty("--p", p.toFixed(3));
    };
    const onScroll = () => {
      if (!sraf) sraf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // eased pointer parallax (desktop only)
    let mraf = 0;
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    const step = () => {
      cur.x += (target.x - cur.x) * 0.06;
      cur.y += (target.y - cur.y) * 0.06;
      el.style.setProperty("--mx", cur.x.toFixed(4));
      el.style.setProperty("--my", cur.y.toFixed(4));
      mraf = Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) > 0.001 ? requestAnimationFrame(step) : 0;
    };
    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
      if (!mraf) mraf = requestAnimationFrame(step);
    };
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!reduce && fine) window.addEventListener("pointermove", onMove, { passive: true });

    const stopP = particles.current ? startParticles(particles.current) : () => {};
    const stopC = startCursorSparkles();
    return () => {
      cancelAnimationFrame(sraf);
      cancelAnimationFrame(mraf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pointermove", onMove);
      stopP();
      stopC();
    };
  }, []);

  const cloud = (c: (typeof CLOUDS)[number], i: number) => (
    <div
      key={i}
      className="cloud"
      style={{ "--y": c.y, "--w": c.w, "--d": `${c.d}s`, "--delay": `${-c.d * c.at}s`, "--rest": `${c.at * 160 - 45}vw` } as CSSProperties}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={A(`/images/world/cloud-${c.n}.webp`)} alt="" decoding="async" />
    </div>
  );

  return (
    <div ref={ref} className="world" aria-hidden="true">
      <div className="sky" />
      <div className="rays" />
      <div className="sun" />
      <div className="clouds far">{CLOUDS.filter((c) => c.layer === "far").map(cloud)}</div>
      <div className="clouds mid">{CLOUDS.filter((c) => c.layer === "mid").map(cloud)}</div>
      <div className="hills">
        <Image src={A("/images/world/hills.webp")} alt="" fill priority sizes="300vw" quality={90} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="blurred" src={A("/images/world/hills-blur.webp")} alt="" decoding="async" />
      </div>
      <div className="haze" />
      <div className="zazu">
        <div className="zazu-in">
          <Image className="sharp" src={A("/images/zazu-cutout.png")} alt="" fill priority sizes="(max-aspect-ratio: 3/4) 130vw, 80vh" quality={92} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="soft" src={A("/images/world/zazu-blur.webp")} alt="" decoding="async" />
        </div>
      </div>
      <div className="veil" />
      <canvas ref={particles} className="particles" />
    </div>
  );
}
