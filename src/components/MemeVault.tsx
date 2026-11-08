"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { VAULT, type VaultItem } from "@/config/gallery";
import { saveFile } from "@/lib/save";
import { PixelTitle, Sparkles } from "./PixelTitle";
import { Reveal } from "./Reveal";
import { SectionHead, Window } from "./Window";

const EASE = [0.22, 0.8, 0.24, 1] as const;
const fileName = (item: VaultItem) => {
  if (item.download) return item.download;
  const ext = item.src.split(".").pop()?.split("?")[0] || "jpg";
  return `zazu-${item.id}.${ext}`;
};

export function MemeVault() {
  const [broken, setBroken] = useState<Set<string>>(() => new Set());
  const items = useMemo(() => VAULT.filter((v) => !broken.has(v.id)), [broken]);
  const [open, setOpen] = useState<number | null>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const markBroken = useCallback((id: string) => {
    setBroken((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);
  const show = (i: number, el: HTMLElement) => {
    lastFocus.current = el;
    setOpen(i);
  };
  const close = useCallback(() => {
    setOpen(null);
    window.setTimeout(() => lastFocus.current?.focus(), 0);
  }, []);

  if (!items.length) return null;

  return (
    <section id="vault" className="section" aria-labelledby="vault-title">
      <SectionHead kicker="the same stare, all over the internet">
        <PixelTitle text="meme vault" className="section-title" id="vault-title" />
        <Sparkles spots={[{ x: "14%", y: "6px", gold: true }, { x: "84%", y: "-10px" }]} />
      </SectionHead>
      <Reveal className="wide">
        <Window title="C:\My Pictures\zazu" status={[`${items.length} objects`, "click a picture to view and save it"]}>
          <div className="vault-grid">
            {items.map((item, i) => (
              <Reveal key={item.id} delay={(i % 3) * 0.07}>
                <button type="button" className="thumb" onClick={(e) => show(i, e.currentTarget)} aria-label={`Open “${item.title}”`}>
                  <span className="frame">
                    <Image
                      src={item.thumb ?? item.src}
                      alt={`Zazu — ${item.title}`}
                      fill
                      sizes="(max-width: 360px) 100vw, (max-width: 960px) 50vw, 360px"
                      onError={() => markBroken(item.id)}
                    />
                  </span>
                  <span className="name">{fileName(item)}</span>
                </button>
              </Reveal>
            ))}
          </div>
        </Window>
      </Reveal>
      <AnimatePresence>{open !== null && items[open] && <Lightbox items={items} index={open} onIndex={setOpen} onClose={close} />}</AnimatePresence>
    </section>
  );
}

function Lightbox({ items, index, onIndex, onClose }: { items: VaultItem[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const item = items[index];
  const closeBtn = useRef<HTMLButtonElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const [status, setStatus] = useState("");
  const go = useCallback((d: number) => onIndex((index + d + items.length) % items.length), [index, items.length, onIndex]);

  useEffect(() => {
    closeBtn.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [go, onClose]);
  useEffect(() => setStatus(""), [index]);

  const save = async () => {
    setStatus("saving…");
    try {
      const res = await fetch(item.src);
      if (!res.ok) throw new Error();
      const ok = await saveFile(fileName(item), await res.blob());
      setStatus(ok ? "saved" : "");
    } catch {
      setStatus("couldn't save — long-press or right-click the picture instead");
    }
  };

  return (
    <motion.div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Meme vault: ${item.title}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e) => {
        touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }}
      onTouchEnd={(e) => {
        const t = touch.current;
        if (!t) return;
        const dx = e.changedTouches[0].clientX - t.x;
        const dy = e.changedTouches[0].clientY - t.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
        touch.current = null;
      }}
    >
      <div className="lb-top">
        <span>
          {fileName(item)} · {index + 1}/{items.length}
        </span>
        <button ref={closeBtn} type="button" className="btn btn--sm" onClick={onClose}>
          close ✕
        </button>
      </div>
      <div className="lb-stage" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <motion.img
          key={item.id}
          src={item.src}
          alt={`Zazu — ${item.title}`}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: EASE }}
        />
        {items.length > 1 && (
          <>
            <button type="button" className="btn lb-nav lb-prev" onClick={() => go(-1)} aria-label="Previous picture">
              ‹
            </button>
            <button type="button" className="btn lb-nav lb-next" onClick={() => go(1)} aria-label="Next picture">
              ›
            </button>
          </>
        )}
      </div>
      <div className="lb-bottom">
        <button type="button" className="btn btn--primary" onClick={save}>
          save picture
        </button>
        <span className="lb-status" role="status">
          {status}
        </span>
      </div>
    </motion.div>
  );
}
