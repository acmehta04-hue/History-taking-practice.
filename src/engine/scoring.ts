import { type AssistLevel, WEIGHT_VALUE, type Weight } from '../content/types';

/**
 * How a student covered an item:
 *  typed     — on their own
 *  hinted    — after pressing Hint
 *  suggested — tapped a suggested question/option (Guided mode)
 */
export type Method = 'typed' | 'hinted' | 'suggested';

export const METHOD_FACTOR: Record<Method, number> = { typed: 1, hinted: 0.75, suggested: 0.5 };
export const LEVEL_MULTIPLIER: Record<AssistLevel, number> = { 1: 1, 2: 1.2, 3: 1.4 };

export interface ScorableItem {
  id: string;
  weight: Weight;
  /** Reasoning items with reasonMatch can earn a 50% reason bonus */
  hasReason?: boolean;
}

export interface Coverage {
  method: Method;
  reason?: boolean;
}

export interface ScoreInput {
  items: ScorableItem[];
  covered: Record<string, Coverage>;
  level: AssistLevel;
  durationSec: number;
  targetSeconds: number;
  /** Count of Guided-mode distractors the student picked */
  distractorsPicked?: number;
}

export interface RepScore {
  /** 0–1: weighted share of the model answer covered, regardless of help */
  accuracy: number;
  /** 0–1: 1 = everything typed unaided, 0 = everything tapped from suggestions */
  independence: number;
  points: number;
  speedBonus: number;
  missed: string[];
  redFlagsMissed: string[];
}

const clamp = (n: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, n));

/**
 * Points = 100 × accuracy × (0.5 + 0.5 × independence) × level multiplier
 *        + speed bonus (up to 10, only if accuracy ≥ 60%)
 *        − 5 per missed red flag − 2 per distractor picked
 */
export function scoreRep(input: ScoreInput): RepScore {
  const { items, covered, level, durationSec, targetSeconds, distractorsPicked = 0 } = input;

  let max = 0;
  let raw = 0;
  let indepNum = 0;
  let indepDen = 0;
  const missed: string[] = [];
  const redFlagsMissed: string[] = [];

  for (const it of items) {
    const w = WEIGHT_VALUE[it.weight];
    const reasonMax = it.hasReason ? 0.5 * w : 0;
    max += w + reasonMax;
    const c = covered[it.id];
    if (!c) {
      missed.push(it.id);
      if (it.weight === 'redflag') redFlagsMissed.push(it.id);
      continue;
    }
    raw += w + (c.reason && it.hasReason ? reasonMax : 0);
    // independence rescales the method factor: typed 1, hinted 0.5, suggested 0
    indepNum += w * ((METHOD_FACTOR[c.method] - 0.5) / 0.5);
    indepDen += w;
  }

  const accuracy = max > 0 ? raw / max : 0;
  const independence = indepDen > 0 ? indepNum / indepDen : 0;
  const speedBonus = accuracy >= 0.6 && targetSeconds > 0 ? Math.round(10 * clamp(1 - durationSec / targetSeconds)) : 0;

  const base = 100 * accuracy * (0.5 + 0.5 * independence) * LEVEL_MULTIPLIER[level];
  const points = Math.max(0, Math.round(base) + speedBonus - 5 * redFlagsMissed.length - 2 * distractorsPicked);

  return { accuracy, independence, points, speedBonus, missed, redFlagsMissed };
}

export function average(nums: number[]): number {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}
