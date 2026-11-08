"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { PFP_ACCESSORIES, PFP_BACKGROUNDS, PFP_CUTOUT } from "@/config/pfp";
import { PfpEngine, type EngineState } from "@/lib/pfp-engine";
import { saveFile } from "@/lib/save";
import { PixelTitle, Sparkles } from "./PixelTitle";
import { Reveal } from "./Reveal";
import { SectionHead, Window } from "./Window";

const EMPTY: EngineState = { background: PFP_BACKGROUNDS[0].id, layers: [], selected: null, ready: false };

export function PfpMaker() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<PfpEngine | null>(null);
  const [state, setState] = useState<EngineState>(EMPTY);
  const [status, setStatus] = useState("");
  const [uploadMsg, setUploadMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!canvas.current) return;
    const e = new PfpEngine({
      canvas: canvas.current,
      cutoutSrc: PFP_CUTOUT,
      backgrounds: PFP_BACKGROUNDS,
      accessories: PFP_ACCESSORIES,
      initialBackground: "hills",
      onChange: setState,
    });
    engine.current = e;
    return () => {
      e.destroy();
      engine.current = null;
    };
  }, []);

  const worn = new Set(state.layers.map((l) => l.defId));
  const hasSel = Boolean(state.selected);
  const selLabel = state.selected
    ? (PFP_ACCESSORIES.find((a) => a.id === state.layers.find((l) => l.uid === state.selected)?.defId)?.label ?? "your png")
    : null;
  const bgLabel = PFP_BACKGROUNDS.find((b) => b.id === state.background)?.label ?? "";

  const onUpload = async (ev: ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    ev.target.value = "";
    if (!file || !engine.current) return;
    setUploadMsg("");
    try {
      await engine.current.addCustomFile(file);
      setStatus(`added ${file.name}`);
    } catch (err) {
      setUploadMsg(err instanceof Error ? err.message : "Could not add that image.");
    }
  };

  const download = async () => {
    if (!engine.current) return;
    setBusy(true);
    setStatus("rendering 400×400…");
    try {
      const blob = await engine.current.exportBlob(400);
      const ok = await saveFile("zazu-pfp.png", blob);
      setStatus(ok ? "saved zazu-pfp.png" : "save cancelled");
    } catch {
      setStatus("couldn't save the picture — try again");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="pfp" className="section" aria-labelledby="pfp-title">
      <SectionHead kicker="pick a background · add a hat · drag, resize, rotate · save">
        <PixelTitle text="pfp maker" className="section-title" id="pfp-title" />
        <Sparkles spots={[{ x: "10%", y: "-6px" }, { x: "88%", y: "8px", gold: true }]} />
      </SectionHead>
      <Reveal className="wide">
        <Window
          title="zazu_pfp_maker.exe"
          status={[
            state.ready ? `background: ${bgLabel}` : "loading zazu…",
            selLabel ? `selected: ${selLabel}` : `${state.layers.length} item${state.layers.length === 1 ? "" : "s"} on zazu`,
            status || "exports a 400×400 png",
          ]}
        >
          <div className="pfp-body">
            <div className="stage">
              <div className="canvas-frame">
                <canvas
                  ref={canvas}
                  width={800}
                  height={800}
                  tabIndex={0}
                  role="img"
                  aria-label="Your Zazu profile picture. Select an accessory, then use arrow keys to move it, plus and minus to resize, brackets to rotate, Delete to remove."
                />
              </div>
              <div className="toolbar well" role="toolbar" aria-label="Edit selected accessory">
                <button type="button" className="btn btn--sm" disabled={!hasSel} onClick={() => engine.current?.scaleSelected(1 / 1.1)} aria-label="Make smaller">
                  − smaller
                </button>
                <button type="button" className="btn btn--sm" disabled={!hasSel} onClick={() => engine.current?.scaleSelected(1.1)} aria-label="Make bigger">
                  + bigger
                </button>
                <button type="button" className="btn btn--sm" disabled={!hasSel} onClick={() => engine.current?.rotateSelected(-10)} aria-label="Rotate left">
                  ⟲
                </button>
                <button type="button" className="btn btn--sm" disabled={!hasSel} onClick={() => engine.current?.rotateSelected(10)} aria-label="Rotate right">
                  ⟳
                </button>
                <button type="button" className="btn btn--sm btn--danger" disabled={!hasSel} onClick={() => engine.current?.deleteSelected()}>
                  remove
                </button>
                <span className="hint">{hasSel ? "drag on the picture to move" : "tap an item on zazu to edit it"}</span>
              </div>
            </div>

            <div className="pane">
              <div className="group well">
                <span className="label">background</span>
                <div className="swatches">
                  {PFP_BACKGROUNDS.map((b) => (
                    <button key={b.id} type="button" className="swatch" aria-pressed={state.background === b.id} title={b.label} aria-label={b.label} onClick={() => engine.current?.setBackground(b.id)}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={b.thumb ?? b.src} alt="" loading="lazy" width={120} height={120} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="group well">
                <span className="label">hats &amp; accessories</span>
                <div className="swatches acc-grid">
                  <button type="button" className="acc" aria-pressed={state.layers.length === 0} aria-label="No accessories" title="none" onClick={() => engine.current?.clearAccessories()}>
                    <span className="none">none</span>
                  </button>
                  {PFP_ACCESSORIES.map((a) => (
                    <button key={a.id} type="button" className="acc" aria-pressed={worn.has(a.id)} title={a.label} aria-label={a.label} onClick={() => engine.current?.toggleAccessory(a.id)}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={a.src} alt="" loading="lazy" />
                    </button>
                  ))}
                </div>
                <label className="btn btn--sm btn--block" htmlFor="pfp-upload">
                  + add your own png
                </label>
                <input id="pfp-upload" className="upload-input" type="file" accept="image/png,image/webp,image/gif,image/jpeg" onChange={onUpload} />
                <span className="upload-msg" role="alert">
                  {uploadMsg}
                </span>
              </div>
              <div className="pfp-actions">
                <button type="button" className="btn" onClick={() => engine.current?.randomize()}>
                  randomize
                </button>
                <button type="button" className="btn" onClick={() => engine.current?.reset()}>
                  reset
                </button>
              </div>
              <button type="button" className="btn btn--primary btn--lg btn--block" onClick={download} disabled={busy || !state.ready}>
                {state.ready ? "save pfp · 400×400" : "loading…"}
              </button>
            </div>
          </div>
        </Window>
      </Reveal>
    </section>
  );
}
