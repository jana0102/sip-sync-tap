import { Droplet } from "./Droplet";
import { mlToDisplay, type Unit } from "@/lib/sipsync-store";

interface ProgressRingProps {
  currentMl: number;
  goalMl: number;
  unit: Unit;
  size?: number;
  onTap?: () => void;
  pulseKey?: number; // changes to retrigger pulse
}

export function ProgressRing({ currentMl, goalMl, unit, size = 280, onTap, pulseKey }: ProgressRingProps) {
  const percent = Math.min(1, currentMl / goalMl);
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - percent);

  const cur = mlToDisplay(currentMl, unit);
  const goal = mlToDisplay(goalMl, unit);

  return (
    <button
      onClick={onTap}
      className="relative group focus:outline-none active:scale-[0.98] transition-transform"
      style={{ width: size, height: size }}
      aria-label="Log water"
    >
      {/* Ambient halo */}
      <span
        aria-hidden
        className="absolute inset-4 rounded-full bg-water/15 blur-2xl"
      />

      <svg width={size} height={size} className="relative -rotate-90" key={pulseKey}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-water-soft)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-water)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
            filter: "drop-shadow(0 4px 12px rgba(92,156,230,0.35))",
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
        <Droplet size={26} pulse />
        <div className="flex flex-col items-center">
          <div className="flex items-baseline gap-1.5">
            <span className="text-6xl font-light tracking-tighter text-foreground tabular leading-none">
              {cur.value}
            </span>
            <span className="text-xl font-medium text-muted-foreground">{cur.suffix}</span>
          </div>
          <div className="h-px w-12 bg-water-soft my-3" />
          <div className="text-xs font-medium tracking-widest text-muted-foreground uppercase tabular">
            of {goal.value} {goal.suffix}
          </div>
        </div>
      </div>
    </button>
  );
}
