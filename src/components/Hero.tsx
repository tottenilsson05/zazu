import { LinkButtons } from "./LinkButtons";
import { PixelTitle } from "./PixelTitle";

const TITLE_COLORS = ["#ffd95a", "#7ee84a", "#ffffff", "#6fc2fa"];

/** The hero is just words and links; the scene behind it is the shared <World />. */
export function Hero() {
  return (
    <section id="home" className="hero" aria-label="zuzu">
      <div className="hero-words">
        <PixelTitle as="h1" text="ZAZU" colors={TITLE_COLORS} />
        <p className="tagline">the cat that has seen everything.</p>
        <p className="subline">the internet never forgot him.</p>
      </div>
      <div className="hero-cta">
        <LinkButtons size="lg" />
      </div>
      <a href="#about" className="scroll-cue" aria-label="Scroll to about Zazu">
        <span className="mouse" aria-hidden="true" />
        scroll
      </a>
    </section>
  );
}
