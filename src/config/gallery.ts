import { A } from "./site";

/**
 * MEME VAULT
 * ----------
 * Every scene is built from the real Zazu photo. To add your own later:
 *   1. drop the full image in  public/images/vault/  (jpg/png/webp)
 *   2. optionally add a small  "-thumb"  version (600px wide is plenty)
 *   3. add an entry below.
 * A card whose image is missing is hidden automatically, so an entry can be
 * added before the file is uploaded without showing a broken image.
 */
export interface VaultItem {
  id: string;
  title: string;
  src: string;
  thumb?: string;
  /** filename visitors get when they save it */
  download?: string;
}

export const VAULT: VaultItem[] = [
  { id: "original", title: "the original", src: "/images/vault/original.jpg", thumb: "/images/vault/original-thumb.jpg" },
  { id: "green-hills", title: "the green hills", src: "/images/vault/green-hills.jpg", thumb: "/images/vault/green-hills-thumb.jpg" },
  { id: "outer-space", title: "zazu in space", src: "/images/vault/outer-space.jpg", thumb: "/images/vault/outer-space-thumb.jpg" },
  { id: "windows-xp", title: "zazu.jpg on xp", src: "/images/vault/windows-xp.jpg", thumb: "/images/vault/windows-xp-thumb.jpg" },
  { id: "cloud-world", title: "dreamy cloud world", src: "/images/vault/cloud-world.jpg", thumb: "/images/vault/cloud-world-thumb.jpg" },
  { id: "psychedelic-y2k", title: "psychedelic y2k", src: "/images/vault/psychedelic-y2k.jpg", thumb: "/images/vault/psychedelic-y2k-thumb.jpg" },
  { id: "old-computer", title: "inside the old pc", src: "/images/vault/old-computer.jpg", thumb: "/images/vault/old-computer-thumb.jpg" },
  { id: "chatroom", title: "#oldinternet chat", src: "/images/vault/chatroom.jpg", thumb: "/images/vault/chatroom-thumb.jpg" },
  { id: "vaporwave", title: "vaporwave sunset", src: "/images/vault/vaporwave.jpg", thumb: "/images/vault/vaporwave-thumb.jpg" },
].map((v) => ({ ...v, src: A(v.src), thumb: v.thumb ? A(v.thumb) : undefined }));
