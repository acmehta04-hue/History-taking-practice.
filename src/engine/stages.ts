import type { CaseFile, FollowUp, Presentation, ReasonItem, SectionDef } from '../content/types';

/**
 * Challenge stages. Assistance level (L1–L3) controls how much HELP you get;
 * the stage controls how HARD the work is. Stage rises with sets completed:
 *
 *  1 Foundation  — classic patients, standard time
 *  2 Application — mixed patients; after each history you commit to a diagnosis and defend it
 *  3 Challenge   — hardest patients first, 25% less time, must-not-miss reasoning,
 *                  and a twist (new information) after each reasoning rep
 */
export type Stage = 1 | 2 | 3;

export const STAGES: Record<Stage, { name: string; blurb: string; timeFactor: number }> = {
  1: { name: 'Foundation', blurb: 'Classic patients at a steady pace.', timeFactor: 1 },
  2: { name: 'Application', blurb: 'Mixed patients. After each history, commit to a diagnosis and defend it.', timeFactor: 1 },
  3: {
    name: 'Challenge',
    blurb: 'Hardest patients first, 25% less time, the must-not-miss diagnosis, and a twist to re-think.',
    timeFactor: 0.75,
  },
};

export function stageFor(setsCompleted: number): Stage {
  return Math.min(3, setsCompleted + 1) as Stage;
}

/** Choose this set's patients by difficulty: easy first at stage 1, hardest first at stage 3 */
export function pickCasesForStage(p: Presentation, stage: Stage, setsCompleted: number, reps = 3): CaseFile[] {
  const sorted = [...p.cases].sort((a, b) => a.difficulty - b.difficulty || a.id.localeCompare(b.id));
  const n = sorted.length;
  const k = Math.min(reps, n);
  if (stage === 1) return sorted.slice(0, k);
  if (stage === 2) {
    const start = Math.ceil((n - k) / 2);
    const window = sorted.slice(start, start + k);
    // interleave so the hardest isn't always last
    return window.length === 3 ? [window[1], window[0], window[2]] : window;
  }
  const hardest = sorted.slice(n - k).reverse();
  // Later challenge sets rotate the order so each starts with a different patient
  const shift = Math.max(0, setsCompleted - 2) % k;
  return [...hardest.slice(shift), ...hardest.slice(0, shift)];
}

/** Stage 2+: "commit and defend" question after an interview block, derived from the case's differential */
export function synthesisQuestion(c: CaseFile, stage: Stage): FollowUp | undefined {
  const ddx = c.reasoning.ddx ?? [];
  if (!ddx.length || stage < 2) return undefined;
  const lead = ddx[0];
  const items: ReasonItem[] = [{ ...lead, id: 'lead', label: `Leading diagnosis: ${lead.label}`, weight: 'core' }];
  if (stage === 3) {
    const mustNot = ddx.slice(1).filter((d) => d.weight === 'redflag');
    const pool = mustNot.length ? mustNot : ddx.slice(1, 2);
    for (const d of pool)
      items.push({ ...d, id: `mnm-${d.id}`, label: `Must not miss: ${d.label}`, weight: 'redflag', reasonMatch: undefined });
  }
  return {
    prompt:
      stage === 3
        ? 'Commit and defend: your leading diagnosis with the features from this history that support it, then the must-not-miss diagnosis you still need to exclude. One per line.'
        : 'Commit: what is your leading diagnosis, and which features from this history support it? One line, e.g. “Appendicitis — pain migrated to the RIF, anorexia”.',
    items,
    freeText: true,
  };
}

/**
 * Extra questions asked after a block, in order. In a combined drill, the
 * synthesis and twist come only after the last block.
 */
export function extraQuestions(section: SectionDef, c: CaseFile, stage: Stage, isLastStep = true): FollowUp[] {
  const out: FollowUp[] = [];
  if (section.kind === 'interview') {
    const fu = c.followUps?.[section.id];
    if (fu) out.push(fu);
    const syn = isLastStep ? synthesisQuestion(c, stage) : undefined;
    if (syn) out.push(syn);
  } else if (stage === 3 && isLastStep && c.twist) {
    out.push({ ...c.twist, prompt: `Twist — ${c.twist.prompt}` });
  }
  return out;
}

/** Id prefix for items from extra question i, so they never clash with checklist ids */
export const xid = (i: number, id: string) => `x${i}:${id}`;
