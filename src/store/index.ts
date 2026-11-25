import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { programKey } from '../content';
import type { AssistLevel, SectionKind } from '../content/types';
import type { CalendarEvent } from '../engine/calendar';
import { cardKey, type CardState, gradeCard } from '../engine/flashcards';
import { isMastered, nextDueAt, nextLevel } from '../engine/progression';
import type { Stage } from '../engine/stages';
import { average, type Coverage } from '../engine/scoring';

export interface TranscriptLine {
  from: 'student' | 'patient';
  text: string;
  itemIds?: string[];
}

export interface EntryLine {
  text: string;
  itemIds: string[];
  distractor?: string;
}

export interface RepResult {
  caseId: string;
  /** Which block this result is for (combined drills store one per step) */
  sectionId?: string;
  /** Combined drills: one result per block, in order */
  steps?: RepResult[];
  kind: SectionKind;
  level: AssistLevel;
  accuracy: number;
  independence: number;
  points: number;
  speedBonus: number;
  durationSec: number;
  covered: Record<string, Coverage>;
  missed: string[];
  redFlagsMissed: string[];
  /** Questions that matched nothing — shown so students can see what the engine missed */
  unmatched: string[];
  distractors: string[];
  transcript?: TranscriptLine[];
  entries?: EntryLine[];
  /** Viva flashcard results: one per question that has an id */
  cards?: { qid: string; accuracy: number }[];
  /** Purpose tags the student chose, by item id (deep dive history sets) */
  tags?: Record<string, string>;
}

export interface SetResult {
  id: string;
  presentationId: string;
  sectionId: string;
  level: AssistLevel;
  nextLevel: AssistLevel;
  stage: Stage;
  startedAt: number;
  finishedAt: number;
  reps: RepResult[];
  points: number;
  accuracy: number;
  independence: number;
}

export interface ProgramState {
  level: AssistLevel;
  setsCompleted: number;
  lastSetAt?: number;
  nextDueAt?: number;
  bestAccuracy: number;
  /** consecutive mastered sets, drives spacing */
  masteredStreak: number;
}

interface AppState {
  sets: SetResult[];
  programs: Record<string, ProgramState>;
  events: CalendarEvent[];
  /** Viva flashcards, keyed by presentation|case|question */
  vivaCards: Record<string, CardState>;
  gradeCards: (results: { key: string; accuracy: number }[]) => void;
  addEvent: (e: Omit<CalendarEvent, 'id'>) => void;
  removeEvent: (id: string) => void;
  completeSet: (s: Omit<SetResult, 'id' | 'nextLevel' | 'points' | 'accuracy' | 'independence'>) => SetResult;
  resetAll: () => void;
}

export const defaultProgram: ProgramState = { level: 1, setsCompleted: 0, bestAccuracy: 0, masteredStreak: 0 };

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      sets: [],
      programs: {},
      events: [],
      vivaCards: {},
      gradeCards: (results) => {
        const now = Date.now();
        const cards = { ...get().vivaCards };
        for (const r of results) cards[r.key] = gradeCard(cards[r.key], r.accuracy, now);
        set({ vivaCards: cards });
      },
      addEvent: (e) =>
        set({ events: [...get().events, { ...e, id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}` }] }),
      removeEvent: (id) => set({ events: get().events.filter((e) => e.id !== id) }),
      completeSet: (s) => {
        const key = programKey(s.presentationId, s.sectionId);
        const prev = get().programs[key] ?? defaultProgram;
        const accuracy = average(s.reps.map((r) => r.accuracy));
        const independence = average(s.reps.map((r) => r.independence));
        const points = s.reps.reduce((a, r) => a + r.points, 0);
        const lvl = nextLevel(s.level, accuracy, independence);
        const masteredStreak = isMastered(s.level, accuracy) ? prev.masteredStreak + 1 : 0;
        const setsCompleted = prev.setsCompleted + 1;
        const result: SetResult = {
          ...s,
          id: `${s.finishedAt.toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
          nextLevel: lvl,
          points,
          accuracy,
          independence,
        };
        // Every viva question answered in this set updates its flashcard
        const cards = { ...get().vivaCards };
        const visit = (r: RepResult) => {
          for (const c of r.cards ?? []) {
            const k = cardKey(s.presentationId, r.caseId, c.qid);
            cards[k] = gradeCard(cards[k], c.accuracy, s.finishedAt);
          }
          r.steps?.forEach(visit);
        };
        s.reps.forEach(visit);
        set({
          vivaCards: cards,
          sets: [...get().sets, result],
          programs: {
            ...get().programs,
            [key]: {
              level: lvl,
              setsCompleted,
              lastSetAt: s.finishedAt,
              nextDueAt: nextDueAt(s.finishedAt, setsCompleted, masteredStreak),
              bestAccuracy: Math.max(prev.bestAccuracy, accuracy),
              masteredStreak,
            },
          },
        });
        return result;
      },
      resetAll: () => set({ sets: [], programs: {}, vivaCards: {} }),
    }),
    {
      name: 'history-drills-v1',
      storage: createJSONStorage(() => AsyncStorage),
      version: 3,
      // v1 → v2: sets gained a challenge stage; calendar events added
      // v2 → v3: viva flashcards
      migrate: (persisted, version) => {
        const st = (persisted ?? {}) as Partial<AppState>;
        if (version < 2) {
          st.sets = (st.sets ?? []).map((x) => ({ ...x, stage: (x as SetResult).stage ?? 1 }));
          st.events = st.events ?? [];
        }
        if (version < 3) st.vivaCards = st.vivaCards ?? {};
        return st as AppState;
      },
    },
  ),
);

/* ------------------------------------------------------------------ */
/* Derived stats                                                         */
/* ------------------------------------------------------------------ */

const dayKey = (t: number) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

/** Consecutive days with at least one set, ending today or yesterday */
export function streakDays(sets: SetResult[], now = Date.now()): number {
  const days = new Set(sets.map((s) => dayKey(s.finishedAt)));
  let streak = 0;
  let t = now;
  if (!days.has(dayKey(t))) t -= 86400000;
  while (days.has(dayKey(t))) {
    streak++;
    t -= 86400000;
  }
  return streak;
}

export function setsSince(sets: SetResult[], ms: number, now = Date.now()) {
  return sets.filter((s) => s.finishedAt >= now - ms);
}
