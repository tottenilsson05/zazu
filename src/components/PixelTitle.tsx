import type { CSSProperties, ElementType } from "react";

/** Pixel heading: each letter can take a palette colour, with an ink outline
 *  and a faint RGB split, like a 2005 forum banner. */
export const PALETTE = ["#ffd95a", "#7ee84a", "#ffffff", "#6fc2fa"];

export function PixelTitle({
  text,
  as: Tag = "h2",
  className = "",
  colors = ["#ffffff"],
  id,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  colors?: string[];
  id?: string;
}) {
  let n = 0;
  return (
    <Tag className={`px-title ${className}`} id={id} aria-label={text}>
      {text.split("").map((ch, i) => {
        if (ch === " ") return <span key={i} className="space" aria-hidden="true" />;
        const style = { "--c": colors[n % colors.length], "--i": n } as CSSProperties;
        n++;
        return (
          <span key={i} className="ch" style={style} aria-hidden="true">
            {ch}
          </span>
        );
      })}
    </Tag>
  );
}

export function Sparkles({ spots }: { spots: { x: string; y: string; d?: string; gold?: boolean }[] }) {
  return (
    <>
      {spots.map((s, i) => (
        <span
          key={i}
          className={`spark${s.gold ? " gold" : ""}`}
          aria-hidden="true"
          style={{ left: s.x, top: s.y, "--d": s.d ?? `${i * 1.4}s` } as CSSProperties}
        />
      ))}
    </>
  );
}
