import { NextResponse } from "next/server";
import { CONTRACT_ADDRESS } from "@/config/site";
import { parseDexscreener, type TokenStats } from "@/lib/token";

/**
 * GET /api/token
 * Server-side proxy to DEX Screener's public API (no key required).
 * - avoids CORS and keeps any future provider key off the client
 * - each server instance reuses a result for 8s, and the response carries
 *   `s-maxage=8` so Vercel's CDN serves repeat requests too. Thousands of
 *   visitors polling every 10s still cause only a handful of upstream calls
 *   per minute (DEX Screener allows 300 requests/min on these endpoints).
 */
export const dynamic = "force-dynamic";

const BASE = process.env.DEXSCREENER_API_BASE || "https://api.dexscreener.com";
const TTL_MS = 8_000;
let memo: { at: number; data: TokenStats } | null = null;

async function fromDex(url: string): Promise<TokenStats | null> {
  const res = await fetch(url, {
    headers: { accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) throw new Error(`DEX Screener responded ${res.status}`);
  return parseDexscreener(await res.json(), CONTRACT_ADDRESS);
}

const ok = (data: TokenStats) =>
  NextResponse.json({ ok: true, data }, { headers: { "Cache-Control": "public, s-maxage=8, stale-while-revalidate=30" } });

export async function GET() {
  if (memo && Date.now() - memo.at < TTL_MS) return ok(memo.data);
  try {
    const data =
      (await fromDex(`${BASE}/tokens/v1/solana/${CONTRACT_ADDRESS}`)) ??
      (await fromDex(`${BASE}/latest/dex/tokens/${CONTRACT_ADDRESS}`));
    if (!data) {
      return NextResponse.json(
        { ok: false, error: "No market data found for this token yet." },
        { status: 404, headers: { "Cache-Control": "public, s-maxage=8" } },
      );
    }
    memo = { at: Date.now(), data };
    return ok(data);
  } catch (err) {
    console.error("[api/token]", err);
    return NextResponse.json(
      { ok: false, error: "Market data is unavailable right now." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
