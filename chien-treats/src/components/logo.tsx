export function LogoMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="coralGradient" x1="12%" y1="8%" x2="88%" y2="92%">
          <stop offset="0%" stopColor="#fdd1c6" />
          <stop offset="100%" stopColor="#f45d48" />
        </linearGradient>
      </defs>
      <path
        d="M32 6c-7.2 0-13 5.8-13 13v5.5c0 1-.8 1.8-1.8 1.8H14c-4.4 0-8 3.6-8 8v4.8c0 3.9 2.8 7.2 6.5 7.9l8.5 1.6c1 .2 1.7 1 1.7 2v5.4c0 4.8 3.9 8.7 8.7 8.7 4.8 0 8.7-3.9 8.7-8.7V50c0-1 .7-1.8 1.6-2l8.4-1.7c3.7-.7 6.4-4 6.4-7.9v-4.7c0-4.4-3.6-8-8-8h-3.2c-1 0-1.8-.8-1.8-1.8V19C45 11.8 39.2 6 32 6Z"
        fill="url(#coralGradient)"
      />
      <path
        d="M24 31.2V19c0-4.4 3.6-8 8-8s8 3.6 8 8v12.2c0 1.8 1.2 3.3 3 3.6l3.2.6c1.5.3 2.6 1.6 2.6 3.1v4.7a3.3 3.3 0 0 1-2.6 3.2l-8.4 1.7A6.3 6.3 0 0 0 33 51v6c0 1.9-1.4 3.3-3.3 3.3-1.8 0-3.3-1.4-3.3-3.3v-6a6.3 6.3 0 0 0-5.8-6.2l-8.5-1.6A3.3 3.3 0 0 1 10 43.1v-4.8c0-1.5 1.1-2.8 2.6-3.1l3.3-.6c1.7-.3 3-1.8 3-3.4Z"
        fill="#0b1e31"
        opacity={0.12}
      />
    </svg>
  );
}

export function WordMark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display text-lg font-semibold tracking-wide text-slate-800 ${className}`}>
      Coral<span className="text-primary-500">Hosts</span>
    </span>
  );
}
