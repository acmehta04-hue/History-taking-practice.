import type { CaseFile, ChecklistItem } from '../content/types';

/**
 * Counselling sessions: the student explains, the patient reacts and asks back.
 * Each turn the patient acknowledges what was newly explained, then raises the
 * next thing on their mind (a "concern") once the student has had a turn or two.
 * A concern stays open until the student covers the item that answers it; the
 * patient asks again once, then lets it go.
 */

export interface CounselState {
  /** index of the next concern to raise */
  next: number;
  /** index of the concern waiting for an answer */
  open: number | null;
  /** student turns since the open concern was raised */
  openTurns: number;
  /** student turns so far */
  turn: number;
}

export const initialCounselState: CounselState = { next: 0, open: null, openTurns: 0, turn: 0 };

const FILLERS = ['Okay.', 'Right, okay.', 'Mm, I see.', 'Okay, go on.'];

/** Turn number from which the patient starts asking their own questions */
export const FIRST_CONCERN_TURN = 2;

export function counselTurn(args: { gained: ChecklistItem[]; covered: Set<string>; c: CaseFile; state: CounselState }): {
  reply: string;
  state: CounselState;
} {
  const { gained, covered, c } = args;
  const concerns = c.concerns ?? [];
  let { next, open, openTurns, turn } = args.state;
  turn += 1;
  const parts: string[] = [];

  for (const it of gained.slice(0, 2)) {
    const a = c.answers[it.id] ?? it.defaultAnswer;
    if (a && !parts.includes(a)) parts.push(a);
  }

  if (open !== null) {
    if (covered.has(concerns[open].itemId)) {
      open = null;
      openTurns = 0;
    } else {
      openTurns += 1;
      if (openTurns === 2) parts.push(`Sorry, I'm still not sure. ${concerns[open].text}`);
      if (openTurns >= 3) {
        open = null;
        openTurns = 0;
      }
    }
  }

  if (open === null && turn >= FIRST_CONCERN_TURN) {
    while (next < concerns.length && covered.has(concerns[next].itemId)) next++;
    if (next < concerns.length) {
      parts.push(concerns[next].text);
      open = next;
      openTurns = 0;
      next++;
    }
  }

  if (!parts.length) parts.push(FILLERS[turn % FILLERS.length]);
  return { reply: parts.join(' '), state: { next, open, openTurns, turn } };
}
