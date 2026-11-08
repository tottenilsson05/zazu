"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { CONTRACT_ADDRESS, LINKS, TOKEN_ENDPOINT, TOKEN_REFRESH_MS } from "@/config/site";
import { fmtPct, fmtPrice, fmtUsdCompact, parseDexscreener, type TokenStats } from "@/lib/token";
import { LinkButtons } from "./LinkButtons";
import { PixelTitle, Sparkles } from "./PixelTitle";
import { Reveal } from "./Reveal";
import { SectionHead, Window } from "./Window";

type Load = { kind: "loading" } | { kind: "ok"; data: TokenStats } | { kind: "error"; last?: TokenStats };

/**
 * Fetch market data. By default this calls our own /api/token route (which
 * talks to DEX Screener server-side); NEXT_PUBLIC_TOKEN_ENDPOINT may also
 * point straight at a DEX Screener token URL.
 */
export async function fetchTokenStats(signal?: AbortSignal): Promise<TokenStats> {
  const res = await fetch(TOKEN_ENDPOINT, { signal, cache: "no-store" });
  const json = (await res.json().catch(() => null)) as unknown;
  if (!res.ok || !json) throw new Error("unavailable");
  const wrapped = json as { ok?: boolean; data?: TokenStats };
  if (wrapped.ok && wrapped.data) return wrapped.data;
  const direct = parseDexscreener(json, CONTRACT_ADDRESS);
  if (direct) return direct;
  throw new Error("unavailable");
}

export function TokenPanel({ fetcher = fetchTokenStats }: { fetcher?: (s?: AbortSignal) => Promise<TokenStats> }) {
  const [load, setLoad] = useState<Load>({ kind: "loading" });
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const lastGood = useRef<TokenStats | undefined>(undefined);

  const tick = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const data = await fetcher(signal);
        lastGood.current = data;
        setLoad({ kind: "ok", data });
      } catch (e) {
        if ((e as Error)?.name === "AbortError") return;
        setLoad({ kind: "error", last: lastGood.current });
      }
    },
    [fetcher],
  );

  useEffect(() => {
    let ctrl = new AbortController();
    const run = () => {
      ctrl.abort();
      ctrl = new AbortController();
      void tick(ctrl.signal);
    };
    run();
    const timer = window.setInterval(() => {
      if (!document.hidden) run();
    }, TOKEN_REFRESH_MS);
    const onVis = () => {
      if (!document.hidden) run();
    };
    document.addEventListener("visibilitychange", onVis);
    const clock = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      ctrl.abort();
      window.clearInterval(timer);
      window.clearInterval(clock);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [tick]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTRACT_ADDRESS);
      setCopied(true);
    } catch {
      const el = document.getElementById("zazu-ca");
      if (el) {
        const r = document.createRange();
        r.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(r);
      }
    }
    window.setTimeout(() => setCopied(false), 1800);
  };

  const data = load.kind === "ok" ? load.data : load.kind === "error" ? load.last : undefined;
  const ago = data ? Math.max(0, Math.round((now - data.updatedAt) / 1000)) : null;
  const live = load.kind === "ok" && ago !== null && ago < 45;
  const change = data?.priceChange24h ?? null;

  const stat = (k: string, v: string | null, extra?: ReactNode) => (
    <div className="stat well">
      <div className="label">{k}</div>
      <div className="v">{v === null ? <span className="skeleton" aria-label="loading" /> : v}</div>
      {extra}
    </div>
  );

  const statusText =
    load.kind === "loading" ? "connecting…" : load.kind === "error" ? (data ? `couldn't refresh · last data ${ago}s ago` : "waiting for market data") : `live · updated ${ago}s ago`;

  return (
    <section id="token" className="section" aria-labelledby="token-title">
      <SectionHead kicker="market data straight from the chain, refreshed every 10 seconds">
        <PixelTitle text="live $zazu" className="section-title" id="token-title" />
        <Sparkles spots={[{ x: "12%", y: "2px", gold: true }, { x: "86%", y: "-10px" }]} />
      </SectionHead>
      <Reveal className="narrow">
        <Window
          title="zazu_market.exe — pump.fun · solana"
          status={[
            <>
              <span className={`dot${live ? "" : " off"}`} aria-hidden="true" />
              {statusText}
            </>,
            <>
              source:{" "}
              <a href={data?.pairUrl ?? LINKS.dex} target="_blank" rel="noopener noreferrer">
                DEX Screener
              </a>
            </>,
          ]}
        >
          <div className="token-body">
            {load.kind === "error" && !data ? (
              <div className="notice well" role="status">
                <span className="ico" aria-hidden="true">
                  !
                </span>
                <div>
                  <b>Data unavailable</b>
                  <span>No market data yet. Price, market cap and volume appear here as soon as $ZAZU is trading.</span>
                </div>
              </div>
            ) : (
              <div className="stats" aria-live="polite">
                {stat("market cap", data ? fmtUsdCompact(data.marketCap) : null)}
                {stat("price", data ? fmtPrice(data.priceUsd) : null, change !== null ? <div className={`d ${change >= 0 ? "up" : "down"}`}>{fmtPct(change)} 24h</div> : null)}
                {stat("24h volume", data ? fmtUsdCompact(data.volume24h) : null)}
                {stat("liquidity", data ? (data.liquidityUsd === null ? "n/a" : fmtUsdCompact(data.liquidityUsd)) : null)}
              </div>
            )}
            <div className="field ca">
              <span className="lbl">CA</span>
              <code id="zazu-ca">{CONTRACT_ADDRESS}</code>
              <button type="button" className="btn btn--sm" onClick={copy}>
                {copied ? "copied!" : "copy"}
              </button>
            </div>
            <LinkButtons className="token-links" />
          </div>
        </Window>
      </Reveal>
    </section>
  );
}
