import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowRight, Check, Clock3, Droplets, GlassWater, History, Moon, Plus, Radio, Settings2, Sun, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Onboarding } from "@/components/sipsync/Onboarding";
import { ProgressRing } from "@/components/sipsync/ProgressRing";
import { QuickAddSheet } from "@/components/sipsync/QuickAddSheet";
import { HistorySheet } from "@/components/sipsync/HistorySheet";
import { NfcSheet } from "@/components/sipsync/NfcSheet";
import { SettingsSheet } from "@/components/sipsync/SettingsSheet";
import { HydrationChart } from "@/components/sipsync/HydrationChart";
import { computeStreakInfo, forgivenessMessage, formatAmount, startOfDay, toneMessage, totalForDay, useSipSync } from "@/lib/sipsync-store";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "SipSync — Your daily hydration" },
    { name: "description", content: "Your water, your rhythm. Track daily hydration, personal goals, and your drinking history with SipSync." },
    { property: "og:title", content: "SipSync — Your daily hydration" },
    { property: "og:description", content: "Your water, your rhythm. A personal space for daily hydration, goals, and drinking history." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Home,
});
type Range = "day" | "week" | "month";
function Home() {
  const { state, addLog, removeLog, completeOnboarding, updateOnboarding, setPresets, setStickers, clearLogs, resetAll } = useSipSync();
  const [hydrated, setHydrated] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [nfcOpen, setNfcOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [flash, setFlash] = useState(0);
  const [range, setRange] = useState<Range>("week");
  const [dark, setDark] = useState(false);
  useEffect(() => { setHydrated(true); setDark(document.documentElement.classList.contains("dark")); }, []);
  const today = startOfDay(Date.now());
  const todayMl = useMemo(() => totalForDay(state.logs, today), [state.logs, today]);
  const streakInfo = useMemo(() => computeStreakInfo(state.logs, state.onboarding.goalMl), [state.logs, state.onboarding.goalMl]);
  const todayLogs = state.logs.filter((log) => log.ts >= today);
  const percent = Math.min(100, Math.round(todayMl / state.onboarding.goalMl * 100));
  const remaining = Math.max(0, state.onboarding.goalMl - todayMl);
  const rangeTotal = Array.from({ length: range === "day" ? 1 : range === "week" ? 7 : 30 }, (_, i) => totalForDay(state.logs, today - i * 86400000)).reduce((a, b) => a + b, 0);
  const handleAdd = (ml: number, source = "Manual") => {
    const entry = addLog(ml, source);
    setFlash((f) => f + 1);
    navigator.vibrate?.(30);
    toast(`${formatAmount(ml, state.onboarding.unit)} added`, { description: `Today: ${formatAmount(todayMl + ml, state.onboarding.unit)}`, action: { label: "Undo", onClick: () => removeLog(entry.id) } });
  };
  const toggleTheme = () => { const next = !dark; setDark(next); document.documentElement.classList.toggle("dark", next); };
  if (!hydrated) return <div className="min-h-dvh bg-background" />;
  if (!state.onboarding.completed) return <><Onboarding onComplete={completeOnboarding} /><Toaster position="top-center" /></>;
  return (
    <div className="app-canvas min-h-dvh">
      <div className="dashboard-shell">
        <header className="app-header">
          <span className="wordmark">sipsync<span className="text-primary">.</span></span>
          <span className="header-divider" />
          <nav aria-label="Main navigation" className="desktop-nav">
            <Button variant="ghost" className="nav-active" onClick={() => { setHistoryOpen(false); setNfcOpen(false); setSettingsOpen(false); }}>Today</Button>
            <Button variant="ghost" onClick={() => setHistoryOpen(true)}>History</Button>
            <Button variant="ghost" onClick={() => setNfcOpen(true)}>Bottles</Button>
            <Button variant="ghost" onClick={() => setSettingsOpen(true)}>Settings</Button>
          </nav>
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" size="icon" title={dark ? "Light appearance" : "Dark appearance"} aria-label={dark ? "Light appearance" : "Dark appearance"} onClick={toggleTheme}>{dark ? <Sun /> : <Moon />}</Button>
            <Button variant="outline" size="icon" title="Settings" aria-label="Open settings" onClick={() => setSettingsOpen(true)}><Settings2 /></Button>
          </div>
        </header>
        <main>
          <section className="daily-overview">
            <div className="overview-copy animate-enter">
              <div className="eyebrow"><span />{new Date().toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })}</div>
              <h1>Your water.<br />Your rhythm<span className="text-primary">.</span></h1>
              <p className="daily-tone">{toneMessage(percent, streakInfo.streak)}</p>
              <div className="overview-actions">
                <Button className="primary-pill" onClick={() => setQuickOpen(true)}>Add water <Plus /></Button>
                <Button variant="outline" className="secondary-pill" onClick={() => setNfcOpen(true)}><Radio /> Bottle tap</Button>
              </div>
              <div className="overview-facts">
                <div><span className="eyebrow">Remaining</span><strong>{remaining ? formatAmount(remaining, state.onboarding.unit) : "Goal reached"}</strong></div>
                <div><span className="eyebrow">Daily rhythm</span><strong>{streakInfo.streak} <span>days</span></strong></div>
              </div>
              {forgivenessMessage(streakInfo.forgiveness) && <p className="text-sm text-muted-foreground mt-3">{forgivenessMessage(streakInfo.forgiveness)}</p>}
            </div>
            <div className="ring-area animate-enter">
              <ProgressRing currentMl={todayMl} goalMl={state.onboarding.goalMl} unit={state.onboarding.unit} onTap={() => setQuickOpen(true)} pulseKey={flash} size={320} />
              <div className="ring-caption"><span className="status-dot" /> {percent}% of your daily goal {percent === 100 && <Check size={14} />}</div>
            </div>
          </section>
          <section className="quick-section animate-enter">
            <div className="section-heading"><h2>A little more water.</h2><Button variant="ghost" className="text-muted-foreground" onClick={() => setQuickOpen(true)}>Custom amount <ArrowRight /></Button></div>
            <div className="quick-grid">
              {state.presets.map((ml, i) => <Button variant="outline" key={`${ml}-${i}`} className="quick-item" onClick={() => handleAdd(ml)}><span className="quick-icon"><GlassWater /></span><span className="quick-label"><strong>{formatAmount(ml, state.onboarding.unit)}</strong><span>{i === 0 ? "A small sip" : i === 1 ? "A fresh refill" : "A little extra"}</span></span><Plus className="ml-auto text-muted-foreground" /></Button>)}
            </div>
          </section>
          <div className="insights-grid animate-enter">
            <section className="trend-section">
              <div className="section-heading"><div><div className="eyebrow">Your hydration</div><h2 className="mt-2">The bigger picture<span className="text-primary">.</span></h2></div><div className="range-toggle" role="group" aria-label="Chart range">{(["day", "week", "month"] as Range[]).map((r) => <Button key={r} variant="ghost" size="sm" aria-pressed={range === r} className={range === r ? "range-active" : ""} onClick={() => setRange(r)}>{r}</Button>)}</div></div>
              <div className="chart-total">{formatAmount(rangeTotal, state.onboarding.unit)} <span>{range === "day" ? "today" : `over the last ${range === "week" ? "7" : "30"} days`}</span></div>
              <HydrationChart logs={state.logs} goalMl={state.onboarding.goalMl} range={range} />
            </section>
            <section className="recent-section">
              <div className="section-heading"><h2>Today's sips</h2><Button variant="ghost" size="icon" title="View all history" aria-label="History" onClick={() => setHistoryOpen(true)}><ArrowRight /></Button></div>
              {todayLogs.length ? <div className="recent-list">{todayLogs.slice(0, 3).map((log) => <div className="recent-row" key={log.id}><span className="recent-icon"><Droplets size={17} /></span><div><strong>{formatAmount(log.amountMl, state.onboarding.unit)}</strong><span>{log.source} · {new Date(log.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></div><Button variant="ghost" size="icon" title="Remove entry" aria-label={`Remove ${formatAmount(log.amountMl, state.onboarding.unit)} entry`} onClick={() => removeLog(log.id)}><Trash2 className="text-muted-foreground" /></Button></div>)}</div> : <div className="empty-sips"><GlassWater size={25} /><p>A fresh start.</p><span>Your first sip is still ahead.</span></div>}
            </section>
          </div>
        </main>
        <footer className="app-footer"><span className="flex items-center gap-2"><span className="status-dot" /> A little, often.</span><span className="footer-line" /><span>SIPSYNC / DAILY RITUAL</span><ArrowDown size={14} /></footer>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation"><Button variant="ghost" onClick={() => setQuickOpen(true)}><Plus />Add</Button><Button variant="ghost" onClick={() => setHistoryOpen(true)}><History />History</Button><Button variant="ghost" onClick={() => setNfcOpen(true)}><Radio />Bottles</Button><Button variant="ghost" onClick={() => setSettingsOpen(true)}><Settings2 />Settings</Button></nav>
      <QuickAddSheet open={quickOpen} onOpenChange={setQuickOpen} presets={state.presets} unit={state.onboarding.unit} onAdd={(ml) => handleAdd(ml)} />
      <HistorySheet open={historyOpen} onOpenChange={setHistoryOpen} logs={state.logs} unit={state.onboarding.unit} onUndo={removeLog} />
      <NfcSheet open={nfcOpen} onOpenChange={setNfcOpen} stickers={state.stickers} onTap={(s) => handleAdd(s.amountMl, s.name)} />
      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} onboarding={state.onboarding} presets={state.presets} stickers={state.stickers} onUpdateOnboarding={updateOnboarding} onSetPresets={setPresets} onSetStickers={setStickers} onClearLogs={clearLogs} onResetAll={resetAll} />
      <Toaster position="top-center" />
    </div>
  );
}
