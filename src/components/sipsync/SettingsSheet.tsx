import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  formatAmount,
  type OnboardingData,
  type SipState,
  type Unit,
} from "@/lib/sipsync-store";

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onboarding: OnboardingData;
  presets: number[];
  stickers: SipState["stickers"];
  onUpdateOnboarding: (data: Partial<OnboardingData>) => void;
  onSetPresets: (presets: number[]) => void;
  onSetStickers: (stickers: SipState["stickers"]) => void;
  onClearLogs: () => void;
  onResetAll: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-[11px] font-bold tracking-[0.22em] uppercase text-muted-foreground">
        {title}
      </h3>
      <div className="rounded-2xl bg-surface ring-1 ring-border/60 p-4 space-y-4">
        {children}
      </div>
    </section>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {hint && <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function SettingsSheet({
  open,
  onOpenChange,
  onboarding,
  presets,
  stickers,
  onUpdateOnboarding,
  onSetPresets,
  onSetStickers,
  onClearLogs,
  onResetAll,
}: SettingsSheetProps) {
  const [confirmReset, setConfirmReset] = useState(false);

  const updatePreset = (i: number, val: number) => {
    const next = [...presets];
    next[i] = Math.max(1, Math.round(val));
    onSetPresets(next);
  };

  const updateSticker = (id: string, patch: Partial<SipState["stickers"][number]>) => {
    onSetStickers(stickers.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const addSticker = () => {
    const id = crypto.randomUUID();
    onSetStickers([
      ...stickers,
      { id, name: "New sticker", amountMl: 250, askEveryTime: false },
    ]);
  };

  const removeSticker = (id: string) => {
    onSetStickers(stickers.filter((s) => s.id !== id));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[92dvh] overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>Tune your goal, reminders, presets, and stickers.</SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-5 pb-8">
          {/* Units */}
          <Section title="Units">
            <Row label="Measurement">
              <div className="flex bg-muted p-1 rounded-xl">
                {(["ml", "oz"] as Unit[]).map((u) => (
                  <button
                    key={u}
                    onClick={() => onUpdateOnboarding({ unit: u })}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${onboarding.unit === u ? "bg-surface text-foreground shadow-soft" : "text-muted-foreground"}`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </Row>
          </Section>

          {/* Goal */}
          <Section title="Daily goal">
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <div className="text-sm text-muted-foreground">Target</div>
                <div className="tabular text-lg font-semibold">
                  {formatAmount(onboarding.goalMl, onboarding.unit)}
                </div>
              </div>
              <Slider
                value={[onboarding.goalMl]}
                min={500}
                max={5000}
                step={50}
                onValueChange={(v) => onUpdateOnboarding({ goalMl: v[0] })}
              />
              <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                <span>0.5 L</span>
                <span>5 L</span>
              </div>
            </div>
            <Row label="Health Connect" hint="Recalculate goal from synced data">
              <Switch
                checked={onboarding.healthConnected}
                onCheckedChange={(c) => onUpdateOnboarding({ healthConnected: c })}
              />
            </Row>
          </Section>

          {/* Reminders */}
          <Section title="Reminders">
            <Row label="Enabled">
              <Switch
                checked={onboarding.remindersEnabled}
                onCheckedChange={(c) => onUpdateOnboarding({ remindersEnabled: c })}
              />
            </Row>
            <Row label="Smart reminders" hint="Adapts to your sipping pace">
              <Switch
                checked={onboarding.smartReminders}
                disabled={!onboarding.remindersEnabled}
                onCheckedChange={(c) => onUpdateOnboarding({ smartReminders: c })}
              />
            </Row>
            {!onboarding.smartReminders && (
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <div className="text-sm text-muted-foreground">Every</div>
                  <div className="tabular text-sm font-semibold">
                    {onboarding.reminderHours}h
                  </div>
                </div>
                <Slider
                  value={[onboarding.reminderHours]}
                  min={1}
                  max={6}
                  step={1}
                  disabled={!onboarding.remindersEnabled}
                  onValueChange={(v) => onUpdateOnboarding({ reminderHours: v[0] })}
                />
              </div>
            )}
          </Section>

          {/* Quick-add presets */}
          <Section title="Quick-add presets">
            <div className="grid grid-cols-3 gap-3">
              {presets.map((p, i) => (
                <div key={i} className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Preset {i + 1}
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={p}
                      onChange={(e) => updatePreset(i, Number(e.target.value))}
                      className="pr-9 tabular"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase text-muted-foreground">
                      ml
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Stickers */}
          <Section title="NFC stickers">
            <div className="space-y-3">
              {stickers.map((s) => (
                <div key={s.id} className="rounded-xl bg-muted/50 p-3 space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={s.name}
                      onChange={(e) => updateSticker(s.id, { name: e.target.value })}
                      placeholder="Sticker name"
                      className="flex-1"
                    />
                    <div className="relative w-28">
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={s.amountMl}
                        onChange={(e) =>
                          updateSticker(s.id, { amountMl: Math.max(1, Number(e.target.value)) })
                        }
                        className="pr-9 tabular"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase text-muted-foreground">
                        ml
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Switch
                        checked={s.askEveryTime}
                        onCheckedChange={(c) => updateSticker(s.id, { askEveryTime: c })}
                      />
                      Ask every time
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeSticker(s.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" onClick={addSticker}>
                + Add sticker
              </Button>
            </div>
          </Section>

          {/* Danger zone */}
          <Section title="Data">
            <Row label="Clear today & history" hint="Removes all logged entries">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClearLogs();
                }}
              >
                Clear logs
              </Button>
            </Row>
            <Row label="Reset everything" hint="Wipes data and restarts onboarding">
              {confirmReset ? (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setConfirmReset(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      onResetAll();
                      setConfirmReset(false);
                      onOpenChange(false);
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="destructive" onClick={() => setConfirmReset(true)}>
                  Reset
                </Button>
              )}
            </Row>
          </Section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
