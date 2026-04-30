import { startOfDay, totalForDay, type LogEntry } from "@/lib/sipsync-store";

interface HydrationChartProps {
  logs: LogEntry[];
  goalMl: number;
  range: "day" | "week" | "month";
}

export function HydrationChart({ logs, goalMl, range }: HydrationChartProps) {
  const today = startOfDay(Date.now());
  const day = 24 * 60 * 60 * 1000;

  if (range === "day") {
    // Hourly buckets
    const buckets = Array.from({ length: 24 }, (_, h) => {
      const start = today + h * 60 * 60 * 1000;
      const end = start + 60 * 60 * 1000;
      return logs.filter((l) => l.ts >= start && l.ts < end).reduce((s, l) => s + l.amountMl, 0);
    });
    const max = Math.max(...buckets, 250);
    return (
      <div className="flex items-end gap-1 h-28 px-1">
        {buckets.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t-sm bg-gradient-to-t from-water to-water/40"
              style={{ height: `${(v / max) * 100}%`, minHeight: v ? 3 : 0 }}
            />
          </div>
        ))}
      </div>
    );
  }

  const days = range === "week" ? 7 : 30;
  const buckets = Array.from({ length: days }, (_, i) => {
    const ds = today - (days - 1 - i) * day;
    return { ds, total: totalForDay(logs, ds) };
  });

  return (
    <div className="flex items-end gap-1.5 h-32 px-1">
      {buckets.map((b, i) => {
        const pct = Math.min(1.2, b.total / goalMl);
        const met = b.total >= goalMl;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="relative w-full h-full flex items-end">
              <div
                className={`w-full rounded-md transition-all ${met ? "bg-water" : "bg-water/40"}`}
                style={{ height: `${Math.max(2, pct * 100)}%` }}
              />
              {/* Goal line */}
              <div className="absolute left-0 right-0 border-t border-dashed border-muted-foreground/30" style={{ bottom: `${Math.min(100, (goalMl / (goalMl * 1.2)) * 100)}%` }} />
            </div>
            {(range === "week" || (range === "month" && i % 5 === 0)) && (
              <span className="text-[10px] font-medium text-muted-foreground tabular">
                {new Date(b.ds).toLocaleDateString(undefined, { weekday: range === "week" ? "narrow" : undefined, day: range === "month" ? "numeric" : undefined })}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
