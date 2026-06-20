import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Onboarding } from "@/components/sipsync/Onboarding";
import { ProgressRing } from "@/components/sipsync/ProgressRing";
import { QuickAddSheet } from "@/components/sipsync/QuickAddSheet";
import { HistorySheet } from "@/components/sipsync/HistorySheet";
import { NfcSheet } from "@/components/sipsync/NfcSheet";
import { SettingsSheet } from "@/components/sipsync/SettingsSheet";
import { HydrationChart } from "@/components/sipsync/HydrationChart";
import { Droplet } from "@/components/sipsync/Droplet";
import {
  computeStreakInfo,
  forgivenessMessage,
  formatAmount,
  startOfDay,
  toneMessage,
  totalForDay,
  useSipSync,
} from "@/lib/sipsync-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SipSync — Quiet hydration tracking" },
      {
        name: "description",
        content:
          "SipSync is a minimalist hydration app: tap an NFC sticker or the progress ring to log water instantly. Streaks, smart reminders, and a calm, native feel.",
      },
      { property: "og:title", content: "SipSync — Quiet hydration tracking" },
      {
        property: "og:description",
        content:
          "Tap to log. Tap to live. NFC-powered hydration tracking with smart reminders and streaks.",
      },
    ],
  }),
  component: Home,
});

type Range = "day" | "week" | "month";

function Home() {
  const {
    state,
    addLog,
    removeLog,
    completeOnboarding,
    updateOnboarding,
    setPresets,
    setStickers,
    clearLogs,
    resetAll,
  } = useSipSync();
  const [hydrated, setHydrated] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [nfcOpen, setNfcOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [flash, setFlash] = useState(0);
  const [range, setRange] = useState<Range>("day");


  useEffect(() => setHydrated(true), []);

  const today = startOfDay(Date.now());
  const todayMl = useMemo(() => totalForDay(state.logs, today), [state.logs, today]);
  const streakInfo = useMemo(
    () => computeStreakInfo(state.logs, state.onboarding.goalMl),
    [state.logs, state.onboarding.goalMl],
  );
  const streak = streakInfo.streak;
  const forgiveNote = forgivenessMessage(streakInfo.forgiveness);
  const percent = Math.min(100, Math.round((todayMl / state.onboarding.goalMl) * 100));

  const handleAdd = (ml: number, source = "Manual") => {
    const entry = addLog(ml, source);
    setFlash((f) => f + 1);
    // Haptic feedback (if supported)
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate?.(30);
      } catch {
        /* noop */
      }
    }
    const newTotal = todayMl + ml;
    toast(`+${formatAmount(ml, state.onboarding.unit)} added`, {
      description: `Total today: ${formatAmount(newTotal, state.onboarding.unit)}`,
      action: {
        label: "Undo",
        onClick: () => removeLog(entry.id),
      },
    });
  };

  if (!hydrated) {
    // SSR shell — keep visually quiet to avoid flash
    return <div className="min-h-dvh bg-background" />;
  }

  if (!state.onboarding.completed) {
    return (
      <>
        <Onboarding onComplete={completeOnboarding} />
        <Toaster position="top-center" />
      </>
    );
  }

  const tone = toneMessage(percent, streak);

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center">
      {/* Edge flash overlay */}
      <div
        key={flash}
        className={`pointer-events-none fixed inset-0 z-50 ${flash ? "animate-[edge-flash_1.2s_ease-out]" : ""}`}
        aria-hidden
      />

      <main className="w-full max-w-md flex-1 flex flex-col px-6 pt-8 pb-6 relative">
        {/* Ambient halo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[420px] h-[420px] bg-water/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Top bar */}
        <header className="relative z-10 flex items-center justify-between">
          <button
            onClick={() => setHistoryOpen(true)}
            className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            History
          </button>
          <div className="flex items-center gap-2">
            <Droplet size={12} />
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-foreground">SipSync</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setNfcOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Simulate NFC tap"
            >
              NFC
              <span className="size-1.5 rounded-full bg-water animate-pulse" />
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Open settings"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>

        </header>

        {/* Progress ring */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
          <ProgressRing
            currentMl={todayMl}
            goalMl={state.onboarding.goalMl}
            unit={state.onboarding.unit}
            onTap={() => setQuickOpen(true)}
            pulseKey={flash}
          />
          <p className="mt-6 text-sm text-muted-foreground text-center text-balance max-w-xs">
            {tone}
          </p>
        </div>

        {/* Streak */}
        <div className="relative z-10 flex flex-col items-center gap-2 mb-6">
          <div className="flex items-center gap-2.5 px-5 py-2.5 bg-surface rounded-full ring-1 ring-water-soft/60 shadow-soft">
            <span className="size-1.5 rounded-full bg-water animate-pulse" />
            <span className="text-xs font-bold tracking-[0.18em] uppercase text-foreground tabular">
              {streak === 0 ? "Start your rhythm" : `${streak} day rhythm`}
            </span>
          </div>
          {forgiveNote && (
            <p className="text-[11px] italic text-muted-foreground">{forgiveNote}</p>
          )}
        </div>


        {/* Stats card */}
        <div className="relative z-10 rounded-3xl bg-surface ring-1 ring-border/60 p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                {range === "day" ? "Today" : range === "week" ? "This week" : "This month"}
              </div>
              <div className="text-lg font-semibold text-foreground tabular mt-0.5">
                {formatAmount(
                  range === "day"
                    ? todayMl
                    : (() => {
                        const days = range === "week" ? 7 : 30;
                        const day = 24 * 60 * 60 * 1000;
                        let sum = 0;
                        for (let i = 0; i < days; i++) {
                          sum += totalForDay(state.logs, today - i * day);
                        }
                        return sum;
                      })(),
                  state.onboarding.unit,
                )}
              </div>
            </div>
            <div className="bg-muted p-1 rounded-xl flex">
              {(["day", "week", "month"] as Range[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1.5 text-xs font-bold tracking-wider uppercase rounded-lg transition-all ${range === r ? "bg-surface text-foreground shadow-soft" : "text-muted-foreground"}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <HydrationChart logs={state.logs} goalMl={state.onboarding.goalMl} range={range} />
        </div>
      </main>

      <QuickAddSheet
        open={quickOpen}
        onOpenChange={setQuickOpen}
        presets={state.presets}
        unit={state.onboarding.unit}
        onAdd={(ml) => handleAdd(ml, "Manual")}
      />

      <HistorySheet
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        logs={state.logs}
        unit={state.onboarding.unit}
        onUndo={removeLog}
      />

      <NfcSheet
        open={nfcOpen}
        onOpenChange={setNfcOpen}
        stickers={state.stickers}
        onTap={(s) => handleAdd(s.amountMl, s.name)}
      />

      <SettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onboarding={state.onboarding}
        presets={state.presets}
        stickers={state.stickers}
        onUpdateOnboarding={updateOnboarding}
        onSetPresets={setPresets}
        onSetStickers={setStickers}
        onClearLogs={clearLogs}
        onResetAll={resetAll}
      />

      <Toaster position="top-center" />
    </div>
  );
}
