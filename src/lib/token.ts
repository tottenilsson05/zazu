/** Token market data: parsing + formatting. No values are ever invented here. */

export interface TokenStats {
  priceUsd: number | null;
  marketCap: number | null;
  fdv: number | null;
  volume24h: number | null;
  liquidityUsd: number | null;
  priceChange24h: number | null;
  dexId: string | null;
  pairUrl: string | null;
  updatedAt: number;
  source: "dexscreener";
}

interface DexPair {
  chainId?: string;
  dexId?: string;
  url?: string;
  priceUsd?: string;
  marketCap?: number;
  fdv?: number;
  volume?: { h24?: number };
  liquidity?: { usd?: number };
  priceChange?: { h24?: number };
  baseToken?: { address?: string };
}

const num = (v: unknown): number | null => {
  const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : null;
};

/**
 * Accepts either the `/tokens/v1/{chain}/{address}` array response or the
 * legacy `/latest/dex/tokens/{address}` `{ pairs: [] }` response and picks
 * the most liquid pair where ZAZU is the base token.
 */
export function parseDexscreener(json: unknown, address: string): TokenStats | null {
  const pairs: DexPair[] = Array.isArray(json)
    ? (json as DexPair[])
    : Array.isArray((json as { pairs?: unknown })?.pairs)
      ? ((json as { pairs: DexPair[] }).pairs)
      : [];
  const mine = pairs.filter(
    (p) => p && (p.chainId ?? "solana") === "solana" && (p.baseToken?.address ?? "").toLowerCase() === address.toLowerCase(),
  );
  if (!mine.length) return null;
  mine.sort((a, b) => (num(b.liquidity?.usd) ?? 0) - (num(a.liquidity?.usd) ?? 0) || (num(b.volume?.h24) ?? 0) - (num(a.volume?.h24) ?? 0));
  const p = mine[0];
  const stats: TokenStats = {
    priceUsd: num(p.priceUsd),
    marketCap: num(p.marketCap) ?? num(p.fdv),
    fdv: num(p.fdv),
    volume24h: num(p.volume?.h24),
    liquidityUsd: num(p.liquidity?.usd),
    priceChange24h: num(p.priceChange?.h24),
    dexId: p.dexId ?? null,
    pairUrl: p.url ?? null,
    updatedAt: Date.now(),
    source: "dexscreener",
  };
  if (stats.priceUsd === null && stats.marketCap === null) return null;
  return stats;
}

export function fmtUsdCompact(n: number | null): string {
  if (n === null) return "—";
  const abs = Math.abs(n);
  const units: [number, string][] = [
    [1e12, "T"],
    [1e9, "B"],
    [1e6, "M"],
    [1e3, "K"],
  ];
  for (const [v, s] of units) {
    if (abs >= v) {
      const x = n / v;
      return `$${x >= 100 ? x.toFixed(0) : x >= 10 ? x.toFixed(1) : x.toFixed(2)}${s}`;
    }
  }
  return `$${n.toFixed(abs >= 1 ? 2 : 4)}`;
}

const SUB = "₀₁₂₃₄₅₆₇₈₉";
/** $0.0₄2606 style for tiny prices. */
export function fmtPrice(n: number | null): string {
  if (n === null) return "—";
  if (n >= 1) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 4 })}`;
  if (n >= 0.001) return `$${n.toFixed(5).replace(/0+$/, "")}`;
  const s = n.toFixed(20);
  const m = /^0\.(0+)(\d{1,4})/.exec(s);
  if (!m) return `$${n.toPrecision(4)}`;
  const zeros = m[1].length;
  const sub = String(zeros)
    .split("")
    .map((d) => SUB[Number(d)])
    .join("");
  return `$0.0${sub}${m[2]}`;
}

export function fmtPct(n: number | null): string {
  if (n === null) return "";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(Math.abs(n) >= 100 ? 0 : 1)}%`;
}
