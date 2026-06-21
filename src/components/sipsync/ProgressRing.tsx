import { Droplet } from "./Droplet";
import { mlToDisplay, type Unit } from "@/lib/sipsync-store";

interface ProgressRingProps {
  currentMl: number;
  goalMl: number;
  unit: Unit;
  size?: number;
  onTap?: () => void;
  pulseKey?: number;
}

export function ProgressRing({
  currentMl,
  goalMl,
  unit,
  size = 296,
  onTap,
  pulseKey,
}: ProgressRingProps) {
  const percent = Math.min(1, currentMl / goalMl);
  const stroke = 6;
  const trackStroke = 1.5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - percent);

  const cur = mlToDisplay(currentMl, unit);
  const goal = mlToDisplay(goalMl, unit);

  return (
    <button
      onClick={onTap}
      className="relative group focus:outline-none active:scale-[0.985] transition-transform duration-500"
      style={{ width: size, height: size }}
      aria-label="Log water"
    >
      {/* Layered ambient halos for depth */}
      <span
        aria-hidden
        className="absolute inset-8 rounded-full"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 45%, color-mix(in oklab, var(--color-water) 14%, transparent), transparent 70%)",
          filter: "blur(28px)",
        }}
      />
      <span
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--color-water) 5%, transparent), transparent 75%)",
        }}
      />

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="relative -rotate-90"
        key={pulseKey}
      >
        <defs>
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-water)" />
            <stop offset="100%" stopColor="var(--color-water-deep)" />
          </linearGradient>
          <filter id="ring-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        </defs>

        {/* Hairline track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-hairline)"
          strokeWidth={trackStroke}
        />

        {/* Glow underlay */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ring-gradient)"
          strokeWidth={stroke + 1}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          opacity={0.35}
          filter="url(#ring-glow)"
          style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />

        {/* Primary stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ring-gradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
        <span className="text-[10px] font-medium tracking-[0.32em] uppercase text-muted-foreground">
          Today
        </span>
        <div className="flex flex-col items-center">
          <div className="flex items-baseline gap-1.5">
            <span
              className="font-display text-[88px] font-light tracking-[-0.04em] text-foreground tabular leading-none"
              style={{ fontVariationSettings: "'opsz' 144" }}
            >
              {cur.value}
            </span>
            <span className="text-base font-medium text-muted-foreground tracking-wide">
              {cur.suffix}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Droplet size={10} />
            <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-muted-foreground tabular">
              of {goal.value} {goal.suffix}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
