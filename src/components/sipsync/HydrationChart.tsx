import { startOfDay, totalForDay, type LogEntry } from "@/lib/sipsync-store";
interface HydrationChartProps { logs: LogEntry[]; goalMl: number; range: "day" | "week" | "month"; }
export function HydrationChart({ logs, goalMl, range }: HydrationChartProps) {
  const today = startOfDay(Date.now());
  const count = range === "day" ? 24 : range === "week" ? 7 : 30;
  const buckets = Array.from({ length: count }, (_, i) => {
    if (range === "day") { const start = today + i * 3600000; return { total: logs.filter((l) => l.ts >= start && l.ts < start + 3600000).reduce((sum, l) => sum + l.amountMl, 0), label: i % 6 === 0 ? `${String(i).padStart(2, "0")}:00` : "" }; }
    const day = today - (count - i - 1) * 86400000;
    return { total: totalForDay(logs, day), label: range === "week" ? new Date(day).toLocaleDateString("en", { weekday: "short" }) : i % 5 === 0 ? new Date(day).getDate().toString() : "" };
  });
  const max = Math.max(range === "day" ? 500 : goalMl, ...buckets.map((b) => b.total));
  return <div className="hydration-chart" role="img" aria-label={`${range} hydration chart`}><div className="chart-grid" /><div className="chart-columns">{buckets.map((bucket, i) => <div className="chart-column" key={i}><div className="chart-bar-track"><div className={`chart-bar ${i === count - 1 ? "chart-bar-current" : ""}`} style={{ height: `${Math.max(2, bucket.total / max * 100)}%` }} title={`${bucket.total} ml`} /></div><span>{bucket.label}</span></div>)}</div></div>;
}
