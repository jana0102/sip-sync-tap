import { Button } from "@/components/ui/button";
import { mlToDisplay, type Unit } from "@/lib/sipsync-store";
interface ProgressRingProps { currentMl: number; goalMl: number; unit: Unit; size?: number; onTap?: () => void; pulseKey?: number; }
export function ProgressRing({ currentMl, goalMl, unit, size = 320, onTap, pulseKey }: ProgressRingProps) {
  const percent = Math.min(1, currentMl / goalMl);
  const r = 144;
  const circumference = 2 * Math.PI * r;
  const cur = mlToDisplay(currentMl, unit);
  const goal = mlToDisplay(goalMl, unit);
  return <Button variant="ghost" className="hydration-ring" style={{ width: size, height: size }} onClick={onTap} aria-label="Log water">
    <svg className="ring-svg" viewBox="0 0 320 320" aria-hidden="true">
      <defs><linearGradient id="water-stroke" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="var(--water)" /><stop offset="100%" stopColor="var(--water-deep)" /></linearGradient></defs>
      <circle cx="160" cy="160" r="156" fill="none" stroke="var(--hairline)" strokeWidth="1" />
      <circle cx="160" cy="160" r={r} fill="none" stroke="var(--water-mist)" strokeWidth="7" />
      <circle cx="160" cy="160" r={r} fill="none" stroke="url(#water-stroke)" strokeWidth="7" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - percent)} className="progress-stroke" transform="rotate(-90 160 160)" />
      <circle cx="160" cy="160" r="127" fill="none" stroke="var(--hairline)" strokeWidth="0.6" strokeDasharray="1 8" />
    </svg>
    <span key={pulseKey} className="ring-content"><span className="eyebrow">Today’s intake</span><span className="ring-value">{cur.value}<span>{cur.suffix}</span></span><span className="ring-goal">of {goal.value} {goal.suffix}</span><span className="ring-add">+</span></span>
  </Button>;
}
