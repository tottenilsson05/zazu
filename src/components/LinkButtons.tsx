import { LINKS } from "@/config/site";
import { DexLogo, PumpLogo, XLogo } from "./BrandIcons";

export function LinkButtons({ size, className = "cta-row" }: { size?: "lg" | "sm"; className?: string }) {
  const sz = size ? ` btn--${size}` : "";
  return (
    <div className={className}>
      <a className={`btn btn--pump${sz}`} href={LINKS.pump} target="_blank" rel="noopener noreferrer">
        <span className="logo">
          <PumpLogo />
        </span>
        Pump.fun
      </a>
      <a className={`btn btn--dark${sz}`} href={LINKS.dex} target="_blank" rel="noopener noreferrer">
        <span className="logo">
          <DexLogo />
        </span>
        Dexscreener
      </a>
      <a className={`btn btn--dark${sz}`} href={LINKS.x} target="_blank" rel="noopener noreferrer">
        <span className="logo">
          <XLogo />
        </span>
        X / Twitter
      </a>
    </div>
  );
}
