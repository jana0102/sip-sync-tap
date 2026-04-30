// Local hydration store — localStorage backed, no backend.
import { useEffect, useState, useCallback } from "react";

export type Unit = "ml" | "oz";
export type Sex = "male" | "female" | "other";

export interface LogEntry {
  id: string;
  amountMl: number;
  source: string; // sticker name or "Manual"
  ts: number; // epoch ms
}

export interface OnboardingData {
  completed: boolean;
  unit: Unit;
  goalMl: number;
  weightKg?: number;
  heightCm?: number;
  sex?: Sex;
  healthConnected: boolean;
  remindersEnabled: boolean;
  smartReminders: boolean;
  reminderHours: number;
}

export interface SipState {
  onboarding: OnboardingData;
  logs: LogEntry[];
  presets: number[]; // ml
  stickers: { id: string; name: string; amountMl: number; askEveryTime: boolean }[];
}

const STORAGE_KEY = "sipsync.v1";

const defaultState: SipState = {
  onboarding: {
    completed: false,
    unit: "ml",
    goalMl: 2300,
    healthConnected: false,
    remindersEnabled: true,
    smartReminders: true,
    reminderHours: 2,
  },
  logs: [],
  presets: [250, 500, 750],
  stickers: [
    { id: "desk", name: "Desk Bottle", amountMl: 500, askEveryTime: false },
    { id: "gym", name: "Gym Shaker", amountMl: 750, askEveryTime: false },
  ],
};

function read(): SipState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed, onboarding: { ...defaultState.onboarding, ...parsed.onboarding } };
  } catch {
    return defaultState;
  }
}

function write(s: SipState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

const listeners = new Set<() => void>();
let memState: SipState | null = null;

function getState(): SipState {
  if (memState === null) memState = read();
  return memState;
}
function setState(updater: (s: SipState) => SipState) {
  memState = updater(getState());
  write(memState);
  listeners.forEach((l) => l());
}

export function useSipSync() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const state = getState();

  const addLog = useCallback((amountMl: number, source = "Manual") => {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      amountMl,
      source,
      ts: Date.now(),
    };
    setState((s) => ({ ...s, logs: [entry, ...s.logs] }));
    return entry;
  }, []);

  const removeLog = useCallback((id: string) => {
    setState((s) => ({ ...s, logs: s.logs.filter((l) => l.id !== id) }));
  }, []);

  const updateLog = useCallback((id: string, amountMl: number) => {
    setState((s) => ({
      ...s,
      logs: s.logs.map((l) => (l.id === id ? { ...l, amountMl } : l)),
    }));
  }, []);

  const completeOnboarding = useCallback((data: Partial<OnboardingData>) => {
    setState((s) => ({
      ...s,
      onboarding: { ...s.onboarding, ...data, completed: true },
    }));
  }, []);

  const updateOnboarding = useCallback((data: Partial<OnboardingData>) => {
    setState((s) => ({ ...s, onboarding: { ...s.onboarding, ...data } }));
  }, []);

  const resetAll = useCallback(() => {
    setState(() => defaultState);
  }, []);

  return {
    state,
    addLog,
    removeLog,
    updateLog,
    completeOnboarding,
    updateOnboarding,
    resetAll,
  };
}

// ---- helpers ----
export function recommendGoalMl(weightKg?: number, sex?: Sex): number {
  // Simple heuristic: 35 ml/kg, sex adjustment.
  const w = weightKg ?? (sex === "female" ? 65 : 75);
  let ml = w * 33;
  if (sex === "male") ml += 200;
  return Math.round(ml / 50) * 50;
}

export function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function totalForDay(logs: LogEntry[], dayStart: number): number {
  const next = dayStart + 24 * 60 * 60 * 1000;
  return logs
    .filter((l) => l.ts >= dayStart && l.ts < next)
    .reduce((sum, l) => sum + l.amountMl, 0);
}

export function computeStreak(logs: LogEntry[], goalMl: number): number {
  if (logs.length === 0) return 0;
  let streak = 0;
  let day = startOfDay(Date.now());
  // Allow today to count even if not yet met — we count completed days going back.
  // Skip today if not yet met but check if user is on track.
  if (totalForDay(logs, day) >= goalMl) streak++;
  day -= 24 * 60 * 60 * 1000;
  while (true) {
    const total = totalForDay(logs, day);
    if (total >= goalMl) {
      streak++;
      day -= 24 * 60 * 60 * 1000;
    } else {
      // grace: if today isn't met yet but we logged before 10am next day — let it slide once
      break;
    }
  }
  return streak;
}

export function formatAmount(ml: number, unit: Unit): string {
  if (unit === "oz") {
    const oz = ml / 29.5735;
    return `${oz.toFixed(oz >= 10 ? 0 : 1)} oz`;
  }
  if (ml >= 1000) return `${(ml / 1000).toFixed(1).replace(/\.0$/, "")} L`;
  return `${ml} ml`;
}

export function mlToDisplay(ml: number, unit: Unit): { value: string; suffix: string } {
  if (unit === "oz") {
    const oz = ml / 29.5735;
    return { value: oz.toFixed(oz >= 100 ? 0 : 1), suffix: "oz" };
  }
  if (ml >= 1000) {
    return { value: (ml / 1000).toFixed(1), suffix: "L" };
  }
  return { value: String(ml), suffix: "ml" };
}

export function toneMessage(percent: number, streak: number): string {
  if (percent >= 100) {
    if (streak >= 7) return "Goal hit. The streak holds.";
    return "Goal reached. Nice rhythm.";
  }
  if (percent >= 75) return "Almost there. One more sip.";
  if (percent >= 40) return "Steady pace. Keep it going.";
  if (percent >= 15) return streak > 3 ? "The streak's watching." : "Off to a slow start.";
  return streak > 5 ? "Your bottle is judging you." : "Time to start sipping.";
}
