/**
 * Site-wide configuration. Everything a non-developer may need to change
 * lives here or in `.env` (see `.env.example`).
 */

/** Prefix for files in /public. Leave empty on Vercel. */
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const A = (p: string) => `${BASE}${p}`;

export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_ZAZU_CA || "2KVUyPJra7KD1ayYFDZh3ZumzNPw9xGzwogHky9Upump";

export const TICKER = "$ZAZU";

/** Official X account (can be overridden with NEXT_PUBLIC_X_URL). */
const X_DEFAULT = "https://x.com/zazucatPF";

export const LINKS = {
  pump: process.env.NEXT_PUBLIC_PUMP_URL || `https://pump.fun/coin/${CONTRACT_ADDRESS}`,
  dex: process.env.NEXT_PUBLIC_DEX_URL || `https://dexscreener.com/solana/${CONTRACT_ADDRESS}`,
  x: process.env.NEXT_PUBLIC_X_URL || X_DEFAULT,
};

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zazu.vercel.app";

/** How often the token panel refreshes (ms). */
export const TOKEN_REFRESH_MS = Number(process.env.NEXT_PUBLIC_TOKEN_REFRESH_MS || 10_000);

/** Where the browser asks for market data. The default is this app's own API route. */
export const TOKEN_ENDPOINT = process.env.NEXT_PUBLIC_TOKEN_ENDPOINT || "/api/token";
