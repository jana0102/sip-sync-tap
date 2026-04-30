import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Droplet } from "./Droplet";

interface NfcSheetProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  stickers: { id: string; name: string; amountMl: number }[];
  onTap: (sticker: { id: string; name: string; amountMl: number }) => void;
}

export function NfcSheet({ open, onOpenChange, stickers, onTap }: NfcSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl border-0 bg-surface px-6 pb-8 pt-4">
        <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-muted" />
        <SheetHeader className="text-left px-0">
          <SheetTitle className="text-xl font-semibold tracking-tight">Simulate NFC tap</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            On Android, you'd tap a sticker. Here, pick one to demo.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 grid gap-3">
          {stickers.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                onTap(s);
                onOpenChange(false);
              }}
              className="flex items-center gap-4 rounded-2xl bg-water-soft/60 ring-1 ring-water-soft p-4 text-left transition-all hover:-translate-y-0.5 hover:bg-water-soft active:scale-[0.98]"
            >
              <div className="size-12 rounded-xl bg-surface flex items-center justify-center shadow-soft">
                <Droplet size={20} pulse />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-foreground">{s.name}</div>
                <div className="text-xs text-muted-foreground tabular">{s.amountMl} ml per tap</div>
              </div>
              <span className="text-xs font-bold tracking-widest uppercase text-water">Tap</span>
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          onClick={() => onOpenChange(false)}
          className="mt-4 w-full text-muted-foreground"
        >
          Cancel
        </Button>
      </SheetContent>
    </Sheet>
  );
}
