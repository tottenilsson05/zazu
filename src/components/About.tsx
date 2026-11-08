import Image from "next/image";
import { A } from "@/config/site";
import { PALETTE, PixelTitle, Sparkles } from "./PixelTitle";
import { Reveal } from "./Reveal";
import { SectionHead, Window } from "./Window";

export function About() {
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <SectionHead>
        <PixelTitle text="who is zazu?" className="section-title" colors={PALETTE} id="about-title" />
        <Sparkles spots={[{ x: "6%", y: "-8px" }, { x: "92%", y: "14px", gold: true }]} />
      </SectionHead>
      <Reveal className="narrow">
        <Window title="who_is_zazu.txt - Notepad" menu={["File", "Edit", "Format", "View", "Help"]} status={["zazu.txt", "written by zazu"]}>
          <div className="about-body">
            <figure className="polaroid" style={{ margin: 0 }}>
              <Image src={A("/images/zazu-pfp-400.png")} alt="Zazu's profile picture" width={400} height={400} sizes="148px" />
              <p>zazu.jpg · 400×400</p>
            </figure>
            <div className="letter">
              <p className="hello">hey, remember me?</p>
              <p>i&apos;m zazu.</p>
              <p>you&apos;ve probably seen my face somewhere on the internet.</p>
              <p>the stare. the eyes. the look that says everything without saying a word.</p>
              <p>i&apos;ve been around long before most of these coins existed.</p>
              <p>
                back then, memes were just memes. people shared pictures because they were funny, not because someone
                told them to buy something.
              </p>
              <p>somehow, i ended up becoming one of those cats the internet never forgot.</p>
              <p>and now i&apos;m here in the trenches.</p>
              <p className="stack">
                same cat.
                <br />
                same stare.
                <br />
                different world.
              </p>
              <p>love you guys.</p>
              <p className="sig">
                <span className="heart" aria-hidden="true">
                  ♥
                </span>
                <span className="ticker">$ZAZU</span>
              </p>
            </div>
          </div>
        </Window>
      </Reveal>
    </section>
  );
}
