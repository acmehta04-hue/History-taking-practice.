import type { AssistLevel, CaseFile, Presentation } from '../content/types';

/**
 * Sets & reps progression.
 *  - A program is one presentation × one section (e.g. Abdominal pain · HPC).
 *  - A set is REPS_PER_SET reps, each with a different patient.
 *  - After each set, guidance fades if the student did well, and returns if they struggled.
 *  - The next set is "due" after a spacing interval, but can be started any time.
 */

export const REPS_PER_SET = 3;
export const SETS_PER_BLOCK = 3;

export const LEVEL_UP = { accuracy: 0.8, independence: 0.8 };
export const LEVEL_DOWN = { accuracy: 0.5 };
export const MASTERY_ACCURACY = 0.85;

const DAY = 24 * 60 * 60 * 1000;

/**
 * quiz: the set was a multiple-choice quiz (Guided reasoning or viva). Every
 * answer there is picked from options, so independence can't be earned:
 * 80% right is enough to move on to answering in your own words.
 */
export function nextLevel(level: AssistLevel, accuracy: number, independence: number, quiz = false): AssistLevel {
  const independent = independence >= LEVEL_UP.independence || (quiz && level === 1);
  if (accuracy >= LEVEL_UP.accuracy && independent && level < 3) {
    return (level + 1) as AssistLevel;
  }
  if (accuracy < LEVEL_DOWN.accuracy && level > 1) return (level - 1) as AssistLevel;
  return level;
}

export function isMastered(level: AssistLevel, accuracy: number): boolean {
  return level === 3 && accuracy >= MASTERY_ACCURACY;
}

/**
 * Spacing: next day while building a block, then expanding intervals once mastered
 * (3, 7, 14, 30 days) so skills are revisited before they fade.
 */
export function nextDueAt(finishedAt: number, setsCompleted: number, masteredStreak: number): number {
  if (masteredStreak <= 0) return finishedAt + (setsCompleted < SETS_PER_BLOCK ? 1 : 2) * DAY;
  const ladder = [3, 7, 14, 30];
  return finishedAt + ladder[Math.min(masteredStreak - 1, ladder.length - 1)] * DAY;
}

/** Rotate through the cases so each set starts with a different patient */
export function pickCases(p: Presentation, setsCompleted: number, reps = REPS_PER_SET): CaseFile[] {
  const n = p.cases.length;
  const out: CaseFile[] = [];
  for (let i = 0; i < Math.min(reps, n); i++) out.push(p.cases[(setsCompleted + i) % n]);
  return out;
}
