import type { FollowUp } from '../content/types';
import { type Coverage, scoreRep } from './scoring';
import { xid } from './stages';

/**
 * Viva flashcards (a Leitner box system).
 * Every question with an `id` becomes a card the first time it's answered.
 *  - Under 70% → back to box 0, due straight away ("comes back sooner")
 *  - 70%+     → up a box: due again after 1, 3, 7, 14, then 30 days
 */

export interface CardState {
  box: number;
  due: number;
  /** accuracy last time, 0–1 */
  last: number;
  seen: number;
}

export const PASS_MARK = 0.7;
export const BOX_DAYS = [0, 1, 3, 7, 14, 30];
const DAY = 86400000;

export const cardKey = (presentationId: string, caseId: string, questionId: string) => `${presentationId}|${caseId}|${questionId}`;

export function parseCardKey(key: string): { presentationId: string; caseId: string; questionId: string } {
  const [presentationId, caseId, questionId] = key.split('|');
  return { presentationId, caseId, questionId };
}

export function gradeCard(prev: CardState | undefined, accuracy: number, now: number): CardState {
  const pass = accuracy >= PASS_MARK;
  const box = pass ? Math.min((prev?.box ?? 0) + 1, BOX_DAYS.length - 1) : 0;
  return { box, due: now + BOX_DAYS[box] * DAY, last: accuracy, seen: (prev?.seen ?? 0) + 1 };
}

/** Keys of cards due now, missed and oldest first */
export function dueCards(cards: Record<string, CardState>, now = Date.now()): string[] {
  return Object.entries(cards)
    .filter(([, c]) => c.due <= now)
    .sort(([, a], [, b]) => a.box - b.box || a.due - b.due)
    .map(([k]) => k);
}

/** A card counts as learned once it has survived the 7-day box */
export const isLearned = (c: CardState) => c.box >= 4;

/** Accuracy for each extra question, from the prefixed coverage map a rep produces */
export function questionScores(extras: FollowUp[], covered: Record<string, Coverage>): { index: number; id?: string; accuracy: number }[] {
  return extras.map((q, i) => {
    const items = q.items.map((it) => ({ id: xid(i, it.id), weight: it.weight, hasReason: !!it.reasonMatch }));
    const s = scoreRep({ items, covered, level: 1, durationSec: 0, targetSeconds: 0 });
    return { index: i, id: q.id, accuracy: s.accuracy };
  });
}

/** The flashcard results a rep should record: only questions that have an id */
export function cardResults(extras: FollowUp[], covered: Record<string, Coverage>): { qid: string; accuracy: number }[] {
  return questionScores(extras, covered)
    .filter((s): s is { index: number; id: string; accuracy: number } => !!s.id)
    .map((s) => ({ qid: s.id, accuracy: s.accuracy }));
}

/** The next card to come due (for "next review in N days") */
export function nextUpcoming(cards: Record<string, CardState>, now = Date.now()): CardState | undefined {
  return Object.values(cards)
    .filter((c) => c.due > now)
    .sort((a, b) => a.due - b.due)[0];
}
