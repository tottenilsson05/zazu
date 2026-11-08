/**
 * ZAZU PFP engine — framework-agnostic canvas editor.
 *
 * One render function draws both the on-screen preview and the exported
 * PNG, so the download always matches what the visitor sees (minus the
 * selection handles).
 */

export type Slot = "head" | "face" | "custom";

export interface AccessoryDef {
  id: string;
  label: string;
  src: string;
  slot: Slot;
  /** default placement in the 800×800 design space (centre point, width, degrees) */
  x: number;
  y: number;
  w: number;
  rot?: number;
}

export interface BackgroundDef {
  id: string;
  label: string;
  src: string;
  thumb?: string;
}

export interface Layer {
  uid: string;
  defId: string;
  slot: Slot;
  img: HTMLImageElement;
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number; // radians
  born: number;
}

export interface EngineState {
  background: string;
  layers: { uid: string; defId: string; slot: Slot }[];
  selected: string | null;
  ready: boolean;
}

export interface EngineOptions {
  canvas: HTMLCanvasElement;
  cutoutSrc: string;
  backgrounds: BackgroundDef[];
  accessories: AccessoryDef[];
  initialBackground?: string;
  onChange?: (s: EngineState) => void;
}

export const DESIGN = 800;
/** Zazu cutout placement in design space: 72% of the width, anchored to the bottom edge. */
export const CAT_W = 576;

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });

let uidCounter = 0;
const uid = () => `l${Date.now().toString(36)}${(uidCounter++).toString(36)}`;

type Drag =
  | { mode: "move"; uid: string; dx: number; dy: number }
  | { mode: "resize"; uid: string; startDist: number; startW: number; startH: number }
  | { mode: "rotate"; uid: string; startAngle: number; startRot: number };

export class PfpEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private opts: EngineOptions;
  private cutout: HTMLImageElement | null = null;
  private bgImages = new Map<string, HTMLImageElement>();
  private accImages = new Map<string, HTMLImageElement>();
  private layers: Layer[] = [];
  private bg: string;
  private prevBg: HTMLImageElement | null = null;
  private fadeStart = 0;
  private selected: string | null = null;
  private drag: Drag | null = null;
  private raf = 0;
  private destroyed = false;
  private ready = false;
  private cleanup: (() => void)[] = [];

  constructor(opts: EngineOptions) {
    this.opts = opts;
    this.canvas = opts.canvas;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D is not available");
    this.ctx = ctx;
    this.canvas.width = DESIGN;
    this.canvas.height = DESIGN;
    this.bg = opts.initialBackground ?? opts.backgrounds[0]?.id ?? "";
    this.bindPointer();
    void this.load();
  }

  // ------------------------------------------------------------------ loading
  private async load() {
    try {
      const first = this.opts.backgrounds.find((b) => b.id === this.bg) ?? this.opts.backgrounds[0];
      const [cut, bg] = await Promise.all([loadImage(this.opts.cutoutSrc), loadImage(first.src)]);
      if (this.destroyed) return;
      this.cutout = cut;
      this.bgImages.set(first.id, bg);
      this.ready = true;
      this.requestRender();
      this.emit();
      // warm the rest quietly
      for (const b of this.opts.backgrounds) {
        if (!this.bgImages.has(b.id)) loadImage(b.src).then((i) => this.bgImages.set(b.id, i)).catch(() => {});
      }
      for (const a of this.opts.accessories) {
        loadImage(a.src).then((i) => this.accImages.set(a.id, i)).catch(() => {});
      }
    } catch (e) {
      console.error(e);
    }
  }

  private async getAccImage(def: AccessoryDef) {
    const hit = this.accImages.get(def.id);
    if (hit) return hit;
    const img = await loadImage(def.src);
    this.accImages.set(def.id, img);
    return img;
  }

  // ------------------------------------------------------------------ state
  state(): EngineState {
    return {
      background: this.bg,
      layers: this.layers.map(({ uid, defId, slot }) => ({ uid, defId, slot })),
      selected: this.selected,
      ready: this.ready,
    };
  }
  private emit() {
    this.opts.onChange?.(this.state());
  }

  async setBackground(id: string) {
    const def = this.opts.backgrounds.find((b) => b.id === id);
    if (!def) return;
    if (id !== this.bg) {
      this.prevBg = this.bgImages.get(this.bg) ?? null;
      this.fadeStart = performance.now();
    }
    this.bg = id;
    this.emit();
    if (!this.bgImages.has(id)) {
      try {
        const img = await loadImage(def.src);
        this.bgImages.set(id, img);
      } catch {
        return;
      }
    }
    this.requestRender();
  }

  /**
   * Toggle an accessory. Head items replace each other, face items replace
   * each other; tapping the one already worn takes it off.
   */
  async toggleAccessory(id: string) {
    const def = this.opts.accessories.find((a) => a.id === id);
    if (!def) return;
    const existing = this.layers.find((l) => l.defId === id);
    if (existing) {
      this.remove(existing.uid);
      return;
    }
    let img: HTMLImageElement;
    try {
      img = await this.getAccImage(def);
    } catch {
      return;
    }
    if (def.slot !== "custom") this.layers = this.layers.filter((l) => l.slot !== def.slot);
    const layer = this.makeLayer(def, img);
    this.layers.push(layer);
    this.layers.sort((a, b) => order(a.slot) - order(b.slot));
    this.selected = layer.uid;
    this.requestRender();
    this.emit();
  }

  private makeLayer(def: AccessoryDef, img: HTMLImageElement, jitter = 0): Layer {
    const ratio = img.naturalHeight / img.naturalWidth || 1;
    const j = () => (Math.random() - 0.5) * jitter;
    return {
      uid: uid(),
      defId: def.id,
      slot: def.slot,
      img,
      x: def.x + j() * 30,
      y: def.y + j() * 20,
      w: def.w * (1 + j() * 0.12),
      h: def.w * (1 + j() * 0.12) * ratio,
      rot: (((def.rot ?? 0) + j() * 8) * Math.PI) / 180,
      born: performance.now(),
    };
  }

  /** Add a visitor's own PNG (or any image file) as a new movable layer. */
  async addCustomFile(file: File) {
    if (!file.type.startsWith("image/")) throw new Error("Please choose an image file (PNG works best).");
    if (file.size > 8 * 1024 * 1024) throw new Error("That image is over 8 MB. Try a smaller PNG.");
    const url = await new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result));
      r.onerror = () => rej(new Error("Could not read that file."));
      r.readAsDataURL(file);
    });
    const img = await loadImage(url);
    const def: AccessoryDef = { id: `custom-${uid()}`, label: file.name, src: url, slot: "custom", x: 400, y: 250, w: 300 };
    const ratio = img.naturalHeight / img.naturalWidth || 1;
    let w = 300;
    if (w * ratio > 360) w = 360 / ratio;
    const layer = this.makeLayer({ ...def, w }, img);
    this.layers.push(layer);
    this.selected = layer.uid;
    this.requestRender();
    this.emit();
  }

  remove(layerUid: string) {
    this.layers = this.layers.filter((l) => l.uid !== layerUid);
    if (this.selected === layerUid) this.selected = null;
    this.requestRender();
    this.emit();
  }
  clearAccessories() {
    this.layers = [];
    this.selected = null;
    this.requestRender();
    this.emit();
  }
  reset() {
    this.layers = [];
    this.selected = null;
    this.bg = this.opts.initialBackground ?? this.opts.backgrounds[0]?.id ?? this.bg;
    void this.setBackground(this.bg);
    this.requestRender();
    this.emit();
  }
  async randomize() {
    const bgs = this.opts.backgrounds;
    const nextBg = bgs[Math.floor(Math.random() * bgs.length)];
    const heads = this.opts.accessories.filter((a) => a.slot === "head");
    const faces = this.opts.accessories.filter((a) => a.slot === "face");
    const picks: AccessoryDef[] = [heads[Math.floor(Math.random() * heads.length)]];
    if (faces.length && Math.random() < 0.6) picks.push(faces[Math.floor(Math.random() * faces.length)]);
    const imgs = await Promise.all(picks.map((p) => this.getAccImage(p).catch(() => null)));
    this.layers = [];
    picks.forEach((p, i) => {
      const img = imgs[i];
      if (img) this.layers.push(this.makeLayer(p, img, 1));
    });
    this.layers.sort((a, b) => order(a.slot) - order(b.slot));
    this.selected = null;
    await this.setBackground(nextBg.id);
    this.requestRender();
    this.emit();
  }

  select(layerUid: string | null) {
    this.selected = layerUid;
    this.requestRender();
    this.emit();
  }
  private sel() {
    return this.layers.find((l) => l.uid === this.selected) ?? null;
  }
  scaleSelected(f: number) {
    const l = this.sel();
    if (!l) return;
    const w = clamp(l.w * f, 24, 2400);
    l.h = (l.h / l.w) * w;
    l.w = w;
    this.requestRender();
  }
  rotateSelected(deg: number) {
    const l = this.sel();
    if (!l) return;
    l.rot += (deg * Math.PI) / 180;
    this.requestRender();
  }
  nudgeSelected(dx: number, dy: number) {
    const l = this.sel();
    if (!l) return;
    l.x += dx;
    l.y += dy;
    this.requestRender();
  }
  deleteSelected() {
    if (this.selected) this.remove(this.selected);
  }
  bringForward() {
    const i = this.layers.findIndex((l) => l.uid === this.selected);
    if (i < 0 || i === this.layers.length - 1) return;
    const [l] = this.layers.splice(i, 1);
    this.layers.splice(i + 1, 0, l);
    this.requestRender();
    this.emit();
  }

  // ------------------------------------------------------------------ rendering
  private requestRender() {
    if (this.raf || this.destroyed) return;
    this.raf = requestAnimationFrame(() => {
      this.raf = 0;
      this.draw(this.ctx, DESIGN, true);
    });
  }

  /** Draw the whole PFP into ctx at `size`×`size`. */
  draw(ctx: CanvasRenderingContext2D, size: number, withHandles: boolean) {
    const s = size / DESIGN;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, size, size);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    const bg = this.bgImages.get(this.bg);
    const cover = (img: HTMLImageElement) => {
      const r = Math.max(size / img.naturalWidth, size / img.naturalHeight);
      const w = img.naturalWidth * r;
      const h = img.naturalHeight * r;
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
    };
    const now = performance.now();
    let animating = false;
    if (bg) {
      // preview only: cross-fade from the previous background
      const t = withHandles && this.prevBg ? Math.min(1, (now - this.fadeStart) / 380) : 1;
      if (t < 1 && this.prevBg) {
        cover(this.prevBg);
        ctx.globalAlpha = easeOut(t);
        cover(bg);
        ctx.globalAlpha = 1;
        animating = true;
      } else {
        this.prevBg = null;
        cover(bg);
      }
    } else {
      const g = ctx.createLinearGradient(0, 0, 0, size);
      g.addColorStop(0, "#0b3bd6");
      g.addColorStop(1, "#7cc4ff");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
    }
    if (this.cutout) {
      const cw = CAT_W * s;
      const ch = cw * (this.cutout.naturalHeight / this.cutout.naturalWidth);
      ctx.drawImage(this.cutout, (size - cw) / 2, size - ch, cw, ch);
    }
    for (const l of this.layers) {
      // preview only: new items settle in with a short scale + fade
      const a = withHandles ? Math.min(1, (now - l.born) / 320) : 1;
      if (a < 1) animating = true;
      const k = 0.82 + 0.18 * easeOut(a);
      ctx.save();
      ctx.globalAlpha = easeOut(a);
      ctx.translate(l.x * s, l.y * s);
      ctx.rotate(l.rot);
      ctx.drawImage(l.img, (-l.w / 2) * s * k, (-l.h / 2) * s * k, l.w * s * k, l.h * s * k);
      ctx.restore();
    }
    if (withHandles) {
      const l = this.sel();
      if (l) this.drawHandles(ctx, l, s);
    }
    ctx.restore();
    if (animating && withHandles) this.requestRender();
  }

  private handleRadius() {
    const css = this.canvas.getBoundingClientRect().width || DESIGN;
    return (11 * DESIGN) / css;
  }

  private handlePoints(l: Layer) {
    const r = this.handleRadius();
    const c = Math.cos(l.rot);
    const sn = Math.sin(l.rot);
    const toWorld = (lx: number, ly: number) => ({ x: l.x + lx * c - ly * sn, y: l.y + lx * sn + ly * c });
    return {
      resize: toWorld(l.w / 2, l.h / 2),
      rotate: toWorld(0, -l.h / 2 - r * 3.2),
      del: toWorld(-l.w / 2, -l.h / 2),
      top: toWorld(0, -l.h / 2),
      r,
    };
  }

  private drawHandles(ctx: CanvasRenderingContext2D, l: Layer, s: number) {
    const p = this.handlePoints(l);
    ctx.save();
    ctx.translate(l.x * s, l.y * s);
    ctx.rotate(l.rot);
    ctx.setLineDash([8 * s, 6 * s]);
    ctx.lineWidth = 2.5 * s;
    ctx.strokeStyle = "rgba(255,255,255,.95)";
    ctx.strokeRect((-l.w / 2) * s, (-l.h / 2) * s, l.w * s, l.h * s);
    ctx.strokeStyle = "rgba(10,40,200,.9)";
    ctx.lineDashOffset = 7 * s;
    ctx.strokeRect((-l.w / 2) * s, (-l.h / 2) * s, l.w * s, l.h * s);
    ctx.restore();
    ctx.save();
    ctx.setLineDash([]);
    ctx.strokeStyle = "rgba(255,255,255,.9)";
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(p.top.x * s, p.top.y * s);
    ctx.lineTo(p.rotate.x * s, p.rotate.y * s);
    ctx.stroke();
    const dot = (pt: { x: number; y: number }, fill: string, glyph: string) => {
      ctx.beginPath();
      ctx.arc(pt.x * s, pt.y * s, p.r * s, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.lineWidth = 2.5 * s;
      ctx.strokeStyle = "#fff";
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${p.r * 1.25 * s}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(glyph, pt.x * s, pt.y * s + 1 * s);
    };
    dot(p.resize, "#1f4bff", "⤡");
    dot(p.rotate, "#19a64a", "↻");
    dot(p.del, "#e0243a", "×");
    ctx.restore();
  }

  /** Render a clean square PNG (no handles). */
  exportBlob(size = 400): Promise<Blob> {
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d");
    if (!ctx) return Promise.reject(new Error("Canvas 2D is not available"));
    this.draw(ctx, size, false);
    return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("Export failed"))), "image/png"));
  }

  // ------------------------------------------------------------------ pointer
  private toDesign(e: PointerEvent) {
    const r = this.canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * DESIGN, y: ((e.clientY - r.top) / r.height) * DESIGN };
  }

  private hitLayer(pt: { x: number; y: number }) {
    for (let i = this.layers.length - 1; i >= 0; i--) {
      const l = this.layers[i];
      const c = Math.cos(-l.rot);
      const sn = Math.sin(-l.rot);
      const dx = pt.x - l.x;
      const dy = pt.y - l.y;
      const lx = dx * c - dy * sn;
      const ly = dx * sn + dy * c;
      if (Math.abs(lx) <= l.w / 2 && Math.abs(ly) <= l.h / 2) return l;
    }
    return null;
  }

  private bindPointer() {
    const cv = this.canvas;
    cv.style.touchAction = "none";
    const down = (e: PointerEvent) => {
      if (!this.ready) return;
      const pt = this.toDesign(e);
      const cur = this.sel();
      if (cur) {
        const p = this.handlePoints(cur);
        const near = (h: { x: number; y: number }) => Math.hypot(pt.x - h.x, pt.y - h.y) <= p.r * 1.7;
        if (near(p.del)) {
          this.remove(cur.uid);
          e.preventDefault();
          return;
        }
        if (near(p.resize)) {
          this.drag = { mode: "resize", uid: cur.uid, startDist: Math.hypot(pt.x - cur.x, pt.y - cur.y), startW: cur.w, startH: cur.h };
        } else if (near(p.rotate)) {
          this.drag = { mode: "rotate", uid: cur.uid, startAngle: Math.atan2(pt.y - cur.y, pt.x - cur.x), startRot: cur.rot };
        }
      }
      if (!this.drag) {
        const hit = this.hitLayer(pt);
        if (hit) {
          this.selected = hit.uid;
          this.drag = { mode: "move", uid: hit.uid, dx: pt.x - hit.x, dy: pt.y - hit.y };
          this.emit();
        } else if (this.selected) {
          this.select(null);
        }
      }
      if (this.drag) {
        cv.setPointerCapture(e.pointerId);
        cv.classList.add("is-dragging");
        e.preventDefault();
      }
      this.requestRender();
    };
    const move = (e: PointerEvent) => {
      const pt = this.toDesign(e);
      if (!this.drag) {
        // hover cursor feedback
        const cur = this.sel();
        let cursor = "";
        if (cur) {
          const p = this.handlePoints(cur);
          const near = (h: { x: number; y: number }) => Math.hypot(pt.x - h.x, pt.y - h.y) <= p.r * 1.7;
          if (near(p.resize)) cursor = "nwse-resize";
          else if (near(p.rotate)) cursor = "grab";
          else if (near(p.del)) cursor = "pointer";
        }
        if (!cursor && this.hitLayer(pt)) cursor = "move";
        cv.style.cursor = cursor;
        return;
      }
      const l = this.layers.find((x) => x.uid === this.drag!.uid);
      if (!l) return;
      const d = this.drag;
      if (d.mode === "move") {
        l.x = clamp(pt.x - d.dx, -200, DESIGN + 200);
        l.y = clamp(pt.y - d.dy, -200, DESIGN + 200);
      } else if (d.mode === "resize") {
        const k = Math.hypot(pt.x - l.x, pt.y - l.y) / Math.max(1, d.startDist);
        const w = clamp(d.startW * k, 24, 2400);
        l.w = w;
        l.h = (d.startH / d.startW) * w;
      } else {
        let r = d.startRot + Math.atan2(pt.y - l.y, pt.x - l.x) - d.startAngle;
        if (e.shiftKey) r = Math.round(r / (Math.PI / 12)) * (Math.PI / 12);
        else if (Math.abs(((r % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) < 0.05) r = 0;
        l.rot = r;
      }
      this.requestRender();
    };
    const up = (e: PointerEvent) => {
      if (this.drag) {
        try {
          cv.releasePointerCapture(e.pointerId);
        } catch {
          /* already released */
        }
      }
      this.drag = null;
      cv.classList.remove("is-dragging");
      this.requestRender();
    };
    const key = (e: KeyboardEvent) => {
      if (!this.selected) return;
      const step = e.shiftKey ? 10 : 2;
      const map: Record<string, () => void> = {
        ArrowLeft: () => this.nudgeSelected(-step, 0),
        ArrowRight: () => this.nudgeSelected(step, 0),
        ArrowUp: () => this.nudgeSelected(0, -step),
        ArrowDown: () => this.nudgeSelected(0, step),
        "+": () => this.scaleSelected(1.05),
        "=": () => this.scaleSelected(1.05),
        "-": () => this.scaleSelected(1 / 1.05),
        "[": () => this.rotateSelected(-5),
        "]": () => this.rotateSelected(5),
        Delete: () => this.deleteSelected(),
        Backspace: () => this.deleteSelected(),
        Escape: () => this.select(null),
      };
      const fn = map[e.key];
      if (fn) {
        e.preventDefault();
        fn();
      }
    };
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => this.requestRender()) : null;
    ro?.observe(cv);
    cv.addEventListener("pointerdown", down);
    cv.addEventListener("pointermove", move);
    cv.addEventListener("pointerup", up);
    cv.addEventListener("pointercancel", up);
    cv.addEventListener("keydown", key);
    this.cleanup.push(() => {
      ro?.disconnect();
      cv.removeEventListener("pointerdown", down);
      cv.removeEventListener("pointermove", move);
      cv.removeEventListener("pointerup", up);
      cv.removeEventListener("pointercancel", up);
      cv.removeEventListener("keydown", key);
    });
  }

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    this.cleanup.forEach((f) => f());
  }
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const order = (s: Slot) => (s === "head" ? 1 : s === "face" ? 0 : 2);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
