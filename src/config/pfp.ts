import type { AccessoryDef, BackgroundDef } from "@/lib/pfp-engine";
import { A } from "./site";

/**
 * PFP maker content. Positions are in the 800×800 design space; Zazu's
 * cutout is 576px wide, centred and anchored to the bottom edge, so his
 * eyes sit around (310, 315) and (484, 315).
 */
const bg = (id: string, label: string): BackgroundDef => ({
  id,
  label,
  src: A(`/images/pfp-bg/${id}.jpg`),
  thumb: A(`/images/pfp-bg/${id}-thumb.jpg`),
});

export const PFP_BACKGROUNDS: BackgroundDef[] = [
  bg("hills", "classic green hills"),
  bg("sky", "blue sky & clouds"),
  bg("xp", "windows xp"),
  bg("vapor", "purple vaporwave"),
  bg("space", "outer space"),
  bg("psych", "psychedelic rainbow"),
  bg("core", "dark internetcore"),
  bg("crt", "retro computer screen"),
];

const acc = (d: Omit<AccessoryDef, "src">): AccessoryDef => ({ ...d, src: A(`/accessories/${d.id}.svg`) });

export const PFP_ACCESSORIES: AccessoryDef[] = [
  acc({ id: "sunglasses", label: "sunglasses", slot: "face", x: 397, y: 318, w: 330 }),
  acc({ id: "crown", label: "golden crown", slot: "head", x: 400, y: 138, w: 230 }),
  acc({ id: "cowboy", label: "cowboy hat", slot: "head", x: 400, y: 132, w: 520 }),
  acc({ id: "wizard", label: "wizard hat", slot: "head", x: 405, y: 112, w: 260 }),
  acc({ id: "halo", label: "halo", slot: "head", x: 400, y: 62, w: 300 }),
  acc({ id: "santa", label: "santa hat", slot: "head", x: 412, y: 128, w: 360 }),
  acc({ id: "headphones", label: "headphones", slot: "head", x: 400, y: 238, w: 440 }),
  acc({ id: "laser", label: "laser eyes", slot: "face", x: 397, y: 315, w: 600 }),
  acc({ id: "party", label: "party hat", slot: "head", x: 432, y: 108, w: 170, rot: 14 }),
];

export const PFP_CUTOUT = A("/images/zazu-cutout.webp");
