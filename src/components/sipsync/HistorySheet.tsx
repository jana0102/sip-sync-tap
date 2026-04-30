import { useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Droplet } from "./Droplet";
import { formatAmount, startOfDay, type LogEntry, type Unit } from "@/lib/sipsync-store";

interface HistorySheetProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  logs: LogEntry[];
  unit: Unit;
  onUndo: (id: string) => void;
}

function dayLabel(ts: number): string {
  const today = startOfDay(Date.now());
  const yest = today - 24 * 60 * 60 * 1000;
  if (ts === today) return "Today";
  if (ts === yest) return "Yesterday";
  return new Date(ts).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

export function HistorySheet({ open, onOpenChange, logs, unit, onUndo }: HistorySheetProps) {
  const grouped = useMemo(() => {
    const groups = new Map<number, LogEntry[]>();
    for (const l of logs) {
      const d = startOfDay(l.ts);
      if (!groups.has(d)) groups.set(d, []);
      groups.get(d)!.push(l);
    }
    return Array.from(groups.entries()).sort((a, b) => b[0] - a[0]);
  }, [logs]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl border-0 bg-surface px-0 pb-0 pt-4 h-[80dvh] flex flex-col">
        <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-muted" />
        <SheetHeader className="text-left px-6 pb-4">
          <SheetTitle className="text-xl font-semibold tracking-tight">History</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-8">
          {grouped.length === 0 && (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No entries yet. Tap the circle to log your first sip.
            </div>
          )}
          {grouped.map(([day, items]) => {
            const total = items.reduce((s, l) => s + l.amountMl, 0);
            return (
              <div key={day} className="mb-8">
                <div className="flex items-baseline justify-between mb-3">
                  <h3 className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                    {dayLabel(day)}
                  </h3>
                  <span className="text-xs font-semibold text-water tabular">
                    {formatAmount(total, unit)}
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {items.map((l) => (
                    <li key={l.id} className="group flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-muted/50 transition-colors">
                      <span className="text-sm font-medium text-muted-foreground tabular w-12">
                        {new Date(l.ts).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false })}
                      </span>
                      <Droplet size={14} />
                      <span className="text-sm font-medium text-foreground flex-1 truncate">
                        {l.source}
                      </span>
                      <span className="text-sm font-semibold text-foreground tabular">
                        +{formatAmount(l.amountMl, unit)}
                      </span>
                      <button
                        onClick={() => onUndo(l.id)}
                        className="opacity-0 group-hover:opacity-100 text-xs font-medium text-destructive hover:underline transition-opacity"
                      >
                        Undo
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
