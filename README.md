# zuzu — ZAZU ($ZAZU) website

Zazu's own little corner of the internet: a 2005-style homepage built with
Next.js 15, TypeScript, Tailwind CSS 4 and Framer Motion, ready for Vercel.

Every image of Zazu on the site comes from the two original photos (the
square profile picture and the green-hills banner). The cat was cut out of
the real photo once and composited onto each background, so his face is
never redrawn or generated.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Node 18.18 or newer.

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. In Vercel: **Add New → Project → Import** the repo. Framework is detected
   as Next.js; no build settings need changing.
3. Add environment variables (optional, see below) and deploy.

## Configuration

All settings have working defaults. Set them in `.env.local` or in
Vercel → Project → Settings → Environment Variables (see `.env.example`).

| Variable | What it does | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_X_URL` | Official X account for every X button | `https://x.com/zazucatPF` |
| `NEXT_PUBLIC_SITE_URL` | Your domain, used for link previews | `https://zazu.vercel.app` |
| `NEXT_PUBLIC_ZAZU_CA` | Token contract address | `2KVUyPJra7KD1ayYFDZh3ZumzNPw9xGzwogHky9Upump` |
| `NEXT_PUBLIC_PUMP_URL` | Pump.fun link | `https://pump.fun/coin/<CA>` |
| `NEXT_PUBLIC_DEX_URL` | Dexscreener link | `https://dexscreener.com/solana/<CA>` |
| `NEXT_PUBLIC_TOKEN_REFRESH_MS` | Token panel refresh interval | `10000` |
| `DEXSCREENER_API_BASE` | Server-side API base | `https://api.dexscreener.com` |

No API keys are required.

## Live token data

`src/app/api/token/route.ts` calls DEX Screener's public API on the server
(`/tokens/v1/solana/<CA>`, falling back to `/latest/dex/tokens/<CA>`), picks
the most liquid ZAZU pair and returns market cap, price, 24h volume,
liquidity and 24h change. The browser polls it every 10 seconds while the tab
is visible. Results are reused for 8 seconds per server and cached by Vercel's
CDN for 8 seconds, which keeps far below DEX Screener's 300 requests/min limit.
If the API fails the panel shows **Data unavailable** and keeps retrying; it
never shows made-up numbers.

## Where things live

```
src/app/page.tsx              page order: hero → about → vault → pfp → token → footer
src/app/zazu.css              the whole visual system (glass, CRT, pixel type, XP buttons)
src/config/site.ts            links, contract, env handling
src/config/gallery.ts         meme vault entries
src/config/pfp.ts             PFP backgrounds + accessories (default positions)
src/lib/pfp-engine.ts         canvas PFP editor (drag / resize / rotate / export)
src/lib/token.ts              DEX Screener parsing + number formatting
src/lib/particles.ts          floating pollen, pixel sparkles, cursor sparkles
src/components/*              one component per section
public/images/                hero plate, cutout, backdrop, vault scenes, pfp backgrounds
public/accessories/*.svg      hats & accessories
public/logos/*.svg            platform marks (also inlined in BrandIcons.tsx)
```

## Adding meme vault images later

1. Put the image in `public/images/vault/` (and optionally a ~600px-wide
   `-thumb` copy for speed).
2. Add an entry to `src/config/gallery.ts`.

A card whose image file is missing is hidden automatically, so you can add the
entry before the file and never show a broken image.

## PFP maker

- Base: the real Zazu cutout, centred, 576px wide in an 800×800 design space.
- 8 backgrounds, 9 accessories plus "none", and visitors' own PNG uploads
  (kept in the browser only, never uploaded anywhere).
- Drag to move, corner dot to resize, top dot to rotate, red dot to remove.
  Keyboard: arrows move, `+`/`-` resize, `[`/`]` rotate, Delete removes.
- **Save PFP** renders a 400×400 PNG with the same drawing code as the preview,
  so the download matches what you see (without the handles).
- To add an accessory: drop an SVG/PNG in `public/accessories/` and add a line
  to `src/config/pfp.ts` with its default position.

## Logos

The X logo is the official mark. The Pump.fun pill and the Dexscreener mark
are SVG redraws, because the official files could not be downloaded in the
build environment. To use the exact official artwork, replace
`public/logos/pumpfun.svg` / `dexscreener.svg` and the matching components in
`src/components/BrandIcons.tsx`.

## Accessibility & motion

All animation (drifting clouds, sun, parallax, reveals, particles, cursor
sparkles) switches off when the visitor has "reduce motion" turned on.
Navigation, lightbox and PFP controls work by keyboard.
