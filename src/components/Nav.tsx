"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { A, LINKS } from "@/config/site";
import { XLogo } from "./BrandIcons";

const ITEMS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "vault", label: "Meme Vault" },
  { id: "pfp", label: "PFP Maker" },
];

export function Nav() {
  const [active, setActive] = useState("home");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const sections = [...ITEMS.map((i) => i.id), "token"]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis) setActive(vis.target.id === "token" ? "pfp" : vis.target.id);
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    sections.forEach((s) => io.observe(s));
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <nav className={`nav${scrolled ? " scrolled" : ""}`} aria-label="Main">
      <div className="nav-inner">
        <a href="#home" className="nav-logo" aria-label="zuzu home" style={{ padding: 0 }}>
          <Image src={A("/images/zazu-pfp-400.png")} alt="" width={28} height={28} />
        </a>
        {ITEMS.map((it) => (
          <a key={it.id} href={`#${it.id}`} className={active === it.id ? "active" : undefined} aria-current={active === it.id ? "true" : undefined}>
            {it.label}
          </a>
        ))}
        <span className="sep" aria-hidden="true" />
        <a href={LINKS.x} target="_blank" rel="noopener noreferrer" aria-label="Zazu on X">
          <XLogo /> X
        </a>
      </div>
    </nav>
  );
}
