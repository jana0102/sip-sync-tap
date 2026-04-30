import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Droplet } from "@/components/sipsync/Droplet";
import { recommendGoalMl, type Sex, type Unit, type OnboardingData } from "@/lib/sipsync-store";

interface OnboardingProps {
  onComplete: (data: Partial<OnboardingData>) => void;
}

type Step = 0 | 1 | 2 | 3 | 4;

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<Step>(0);
  const [unit, setUnit] = useState<Unit>("ml");
  const [healthConnected, setHealthConnected] = useState(false);
  const [sex, setSex] = useState<Sex>("male");
  const [weight, setWeight] = useState<string>("75");
  const [height, setHeight] = useState<string>("175");
  const [goalMl, setGoalMl] = useState<number>(2300);
  const [editingGoal, setEditingGoal] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [smartReminders, setSmartReminders] = useState(true);
  const [reminderHours, setReminderHours] = useState(2);

  const computeGoal = () => {
    const w = parseInt(weight, 10) || undefined;
    const ml = recommendGoalMl(w, sex);
    setGoalMl(ml);
    return ml;
  };

  const next = () => setStep((s) => (Math.min(4, s + 1) as Step));
  const back = () => setStep((s) => (Math.max(0, s - 1) as Step));

  const finish = (skipNfc = false) => {
    onComplete({
      unit,
      goalMl,
      healthConnected,
      sex,
      weightKg: parseInt(weight, 10) || undefined,
      heightCm: parseInt(height, 10) || undefined,
      remindersEnabled,
      smartReminders,
      reminderHours,
    });
    void skipNfc;
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* progress dots */}
      <div className="flex items-center justify-center gap-1.5 pt-12">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`h-1 rounded-full transition-all ${i === step ? "w-8 bg-water" : i < step ? "w-1.5 bg-water/50" : "w-1.5 bg-muted"}`}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 max-w-md w-full mx-auto">
        {step === 0 && (
          <div className="w-full text-center animate-[fade-in_0.4s_ease-out]">
            <Droplet size={56} pulse className="mx-auto mb-8" />
            <h1 className="text-4xl font-light tracking-tight text-foreground">SipSync</h1>
            <p className="mt-3 text-base text-muted-foreground text-balance">
              Quiet hydration tracking. Tap to log, sync to live.
            </p>
            <div className="mt-12 flex flex-col gap-3">
              <Button onClick={next} className="h-14 rounded-2xl bg-water hover:bg-water-deep text-white text-base font-semibold shadow-soft">
                Get started
              </Button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="w-full animate-[fade-in_0.4s_ease-out]">
            <h2 className="text-3xl font-light tracking-tight text-foreground text-balance">
              Connect your health data
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Pull weight and activity from Health Connect to keep your goal accurate.
            </p>
            <div className="mt-10 flex flex-col gap-3">
              <button
                onClick={() => {
                  setHealthConnected(true);
                  next();
                }}
                className="rounded-2xl bg-water-soft/60 ring-1 ring-water-soft p-5 text-left transition-all hover:-translate-y-0.5"
              >
                <div className="font-semibold text-foreground">Connect Health Connect</div>
                <div className="text-sm text-muted-foreground mt-1">Recommended — keeps your goal current.</div>
              </button>
              <button
                onClick={next}
                className="rounded-2xl bg-surface ring-1 ring-border p-5 text-left transition-all hover:bg-muted/50"
              >
                <div className="font-semibold text-foreground">Skip for now</div>
                <div className="text-sm text-muted-foreground mt-1">You can connect later in Settings.</div>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="w-full animate-[fade-in_0.4s_ease-out]">
            <h2 className="text-3xl font-light tracking-tight text-foreground text-balance">
              A little about you
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              We use this to recommend a daily target.
            </p>

            <div className="mt-8 space-y-5">
              <div>
                <Label className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Units</Label>
                <div className="mt-2 grid grid-cols-2 gap-2 p-1.5 bg-muted rounded-2xl">
                  {(["ml", "oz"] as Unit[]).map((u) => (
                    <button
                      key={u}
                      onClick={() => setUnit(u)}
                      className={`py-3 rounded-xl text-sm font-semibold transition-all ${unit === u ? "bg-surface text-foreground shadow-soft" : "text-muted-foreground"}`}
                    >
                      {u === "ml" ? "Metric (ml / L)" : "Imperial (oz)"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Sex</Label>
                <div className="mt-2 grid grid-cols-3 gap-2 p-1.5 bg-muted rounded-2xl">
                  {(["male", "female", "other"] as Sex[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSex(s)}
                      className={`py-3 rounded-xl text-sm font-semibold capitalize transition-all ${sex === s ? "bg-surface text-foreground shadow-soft" : "text-muted-foreground"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="weight" className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Weight (kg)</Label>
                  <Input id="weight" inputMode="numeric" value={weight} onChange={(e) => setWeight(e.target.value.replace(/\D/g, ""))} className="mt-2 h-12 rounded-xl bg-surface tabular" />
                </div>
                <div>
                  <Label htmlFor="height" className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Height (cm)</Label>
                  <Input id="height" inputMode="numeric" value={height} onChange={(e) => setHeight(e.target.value.replace(/\D/g, ""))} className="mt-2 h-12 rounded-xl bg-surface tabular" />
                </div>
              </div>
            </div>

            <Button
              onClick={() => {
                computeGoal();
                next();
              }}
              className="mt-10 w-full h-14 rounded-2xl bg-water hover:bg-water-deep text-white text-base font-semibold shadow-soft"
            >
              Continue
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="w-full animate-[fade-in_0.4s_ease-out] text-center">
            <Droplet size={40} pulse className="mx-auto mb-6" />
            <h2 className="text-3xl font-light tracking-tight text-foreground text-balance">
              Your daily target
            </h2>
            <p className="mt-3 text-base text-muted-foreground text-balance">
              Based on your information, your daily target is
            </p>

            {!editingGoal ? (
              <button onClick={() => setEditingGoal(true)} className="mt-8 inline-flex items-baseline gap-2 rounded-2xl px-6 py-4 hover:bg-muted/50 transition-colors">
                <span className="text-7xl font-light text-foreground tabular tracking-tighter">
                  {(goalMl / 1000).toFixed(1)}
                </span>
                <span className="text-2xl font-medium text-muted-foreground">L</span>
              </button>
            ) : (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Input
                  inputMode="numeric"
                  value={String(goalMl)}
                  onChange={(e) => setGoalMl(parseInt(e.target.value || "0", 10))}
                  className="h-14 w-40 text-2xl text-center rounded-2xl bg-surface tabular"
                />
                <span className="text-lg text-muted-foreground">ml</span>
              </div>
            )}

            <button onClick={() => setEditingGoal((e) => !e)} className="mt-3 block mx-auto text-sm font-medium text-water hover:text-water-deep">
              {editingGoal ? "Done" : "Adjust manually"}
            </button>

            <div className="mt-10 flex flex-col gap-3">
              <Button onClick={next} className="h-14 rounded-2xl bg-water hover:bg-water-deep text-white text-base font-semibold shadow-soft">
                Looks good
              </Button>
              <button onClick={back} className="text-sm text-muted-foreground hover:text-foreground">Back</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="w-full animate-[fade-in_0.4s_ease-out]">
            <h2 className="text-3xl font-light tracking-tight text-foreground text-balance">
              Reminders
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Gentle nudges, only when you need them.
            </p>

            <div className="mt-8 space-y-3">
              <button
                onClick={() => {
                  setRemindersEnabled(true);
                  setSmartReminders(true);
                }}
                className={`w-full text-left rounded-2xl p-5 ring-1 transition-all ${remindersEnabled && smartReminders ? "bg-water-soft ring-water" : "bg-surface ring-border"}`}
              >
                <div className="font-semibold text-foreground">Smart reminders</div>
                <div className="text-sm text-muted-foreground mt-1">SipSync decides when, based on your pace.</div>
              </button>
              <button
                onClick={() => {
                  setRemindersEnabled(true);
                  setSmartReminders(false);
                }}
                className={`w-full text-left rounded-2xl p-5 ring-1 transition-all ${remindersEnabled && !smartReminders ? "bg-water-soft ring-water" : "bg-surface ring-border"}`}
              >
                <div className="font-semibold text-foreground">Every {reminderHours} hours</div>
                <div className="text-sm text-muted-foreground mt-1">Fixed cadence between 8:00 and 22:00.</div>
                {remindersEnabled && !smartReminders && (
                  <div className="mt-3 flex gap-2">
                    {[1, 2, 3, 4].map((h) => (
                      <button
                        key={h}
                        onClick={(e) => {
                          e.stopPropagation();
                          setReminderHours(h);
                        }}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold ${reminderHours === h ? "bg-water text-white" : "bg-surface text-muted-foreground"}`}
                      >
                        {h}h
                      </button>
                    ))}
                  </div>
                )}
              </button>
              <button
                onClick={() => setRemindersEnabled(false)}
                className={`w-full text-left rounded-2xl p-5 ring-1 transition-all ${!remindersEnabled ? "bg-water-soft ring-water" : "bg-surface ring-border"}`}
              >
                <div className="font-semibold text-foreground">No reminders</div>
                <div className="text-sm text-muted-foreground mt-1">Track on your own terms.</div>
              </button>
            </div>

            <div className="mt-8 rounded-2xl bg-surface ring-1 ring-border p-5">
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-full bg-water-soft flex items-center justify-center flex-shrink-0">
                  <Droplet size={14} />
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">NFC stickers</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Stick one on your bottle. Tap your phone to log instantly — even when locked.
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={() => finish(true)}
              className="mt-8 w-full h-14 rounded-2xl bg-water hover:bg-water-deep text-white text-base font-semibold shadow-soft"
            >
              Start sipping
            </Button>
            <button onClick={() => finish(true)} className="mt-3 w-full text-sm text-muted-foreground hover:text-foreground">
              Set up NFC later
            </button>
          </div>
        )}
      </div>

      <div className="h-12" />
    </div>
  );
}
