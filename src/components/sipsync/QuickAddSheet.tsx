import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Droplet } from "./Droplet";
import { formatAmount, type Unit } from "@/lib/sipsync-store";

interface QuickAddSheetProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  presets: number[];
  unit: Unit;
  onAdd: (ml: number, source?: string) => void;
}

export function QuickAddSheet({ open, onOpenChange, presets, unit, onAdd }: QuickAddSheetProps) {
  const [custom, setCustom] = useState("");

  const submit = (ml: number) => {
    onAdd(ml);
    setCustom("");
    onOpenChange(false);
  };

  const handleCustom = () => {
    const n = parseInt(custom, 10);
    if (!Number.isFinite(n) || n <= 0) return;
    const ml = unit === "oz" ? Math.round(n * 29.5735) : n;
    submit(ml);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl border-0 bg-surface px-6 pb-8 pt-4">
        <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-muted" />
        <SheetHeader className="text-left px-0">
          <SheetTitle className="text-xl font-semibold tracking-tight">Add water</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Tap a preset, or enter a custom amount.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {presets.map((ml) => (
            <button
              key={ml}
              onClick={() => submit(ml)}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-water-soft/60 p-5 ring-1 ring-water-soft transition-all hover:bg-water-soft hover:-translate-y-0.5 active:scale-95"
            >
              <Droplet size={20} />
              <span className="text-base font-semibold text-foreground tabular">
                {formatAmount(ml, unit)}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-2">
          <div className="flex-1 relative">
            <Input
              inputMode="numeric"
              value={custom}
              onChange={(e) => setCustom(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="Custom"
              className="h-14 rounded-2xl bg-water-soft/50 border-0 pl-5 pr-16 text-base font-medium tabular focus-visible:ring-2 focus-visible:ring-water"
              onKeyDown={(e) => e.key === "Enter" && handleCustom()}
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
              {unit}
            </span>
          </div>
          <Button
            onClick={handleCustom}
            disabled={!custom}
            className="h-14 rounded-2xl px-6 bg-water hover:bg-water-deep text-white font-semibold shadow-soft"
          >
            Add
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
