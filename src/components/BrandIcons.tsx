/* Platform marks as inline SVG so they stay crisp and inherit colour.
   To swap in different official artwork, replace the files in /public/logos
   and the paths below. */

export function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
      />
    </svg>
  );
}

export function PumpLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="pump-pill-clip">
          <rect x="9" y="1.5" width="14" height="29" rx="7" />
        </clipPath>
      </defs>
      <g transform="rotate(45 16 16)">
        <g clipPath="url(#pump-pill-clip)">
          <rect x="9" y="1.5" width="14" height="14.5" fill="#5fdc8a" />
          <rect x="9" y="16" width="14" height="14.5" fill="#ffffff" />
        </g>
        <line x1="9" y1="16" x2="23" y2="16" stroke="#14301f" strokeWidth="2" />
        <rect x="9" y="1.5" width="14" height="29" rx="7" fill="none" stroke="#14301f" strokeWidth="2.2" />
        <path d="M12.6 5.4C12.6 4.6 13.4 4 14.2 4" stroke="#d6ffe4" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function DexLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M16 3.2c1.6 1.7 3.9 2.7 6.5 2.7.9 0 1.7-.1 2.5-.3-.4 2-1.4 3.6-2.8 4.8 2.6 1.4 4.5 4.3 4.5 7.6v1.6c0 1.9-.6 3.7-1.7 5.2l1.6 3.6-4.1-1.7a8.5 8.5 0 0 1-6.5 3c-2.5 0-4.8-1.1-6.5-3l-4.1 1.7 1.6-3.6A8.7 8.7 0 0 1 5.3 19.6V18c0-3.3 1.9-6.2 4.5-7.6A8.3 8.3 0 0 1 7 5.6c.8.2 1.6.3 2.5.3 2.6 0 4.9-1 6.5-2.7Zm-4.6 13.3c-.9.4-1.3 1.3-1 2.1l.3.6 3.4-1.3c-.6-1.3-1.7-1.8-2.7-1.4Zm9.2 0c-1-.4-2.1.1-2.7 1.4l3.4 1.3.3-.6c.3-.8-.1-1.7-1-2.1Z"
      />
    </svg>
  );
}
