import type { CaseFile, FollowUp, ReasonItem, SectionDef, SectionKind } from '../content/types';

/**
 * Challenge stages. Assistance level (L1–L3) controls how much HELP you get;
 * the stage controls how HARD the work is. Stage rises with sets completed:
 *
 *  1 Foundation  — classic patients, standard time; viva asks recall questions
 *  2 Application — mixed patients; after each history you commit to a diagnosis and defend it;
 *                  viva adds "explain why" questions and examiner follow-ups
 *  3 Challenge   — hardest patients first, 25% less time, must-not-miss reasoning,
 *                  a twist after each reasoning rep; viva adds data and what-if questions
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

/** What a stage changes, in words that fit the drill (a viva block levels up differently from a history) */
/** How a wrong option is labelled: a differential that doesn't fit isn't "not first line" */
export function wrongLabelFor(section: SectionDef): string {
  if (section.wrongLabel) return section.wrongLabel;
  if (section.id === 'ddx' || section.id === 'sprint') return 'Doesn’t fit';
  if (section.id === 'ix') return 'Not needed here';
  return 'Not first line';
}

export function stageBlurb(stage: Stage, sections: SectionDef[]): string {
  const notes = sections[0]?.stageNotes;
  if (notes && sections.length === 1) return notes[stage];
  const kinds: SectionKind[] = sections.map((s) => s.kind);
  if (kinds.every((k) => k === 'viva'))
    return {
      1: 'Recall questions.',
      2: 'Adds “explain why” questions and examiner follow-ups.',
      3: 'Adds data interpretation and what-ifs, with 25% less time.',
    }[stage];
  if (kinds.every((k) => k === 'counsel'))
    return {
      1: 'Straightforward patients at a steady pace.',
      2: 'Patients with more questions and interactions.',
      3: 'The most complex patients first, with 25% less time.',
    }[stage];
  if (kinds.includes('interview')) return STAGES[stage].blurb;
  return {
    1: 'Classic patients at a steady pace.',
    2: 'Mixed patients.',
    3: 'Hardest patients first, 25% less time, and a twist to re-think.',
  }[stage];
}

export const VIVA_TIERS: Record<1 | 2 | 3, string> = {
  1: 'Viva · recall',
  2: 'Viva · explain why',
  3: 'Viva · data and what-ifs',
};

export function stageFor(setsCompleted: number): Stage {
  return Math.min(3, setsCompleted + 1) as Stage;
}

/**
 * Syllabus drills have many topics: each set takes the next three in turn
 * (easier ones first), so every topic comes up before any repeats.
 */
export function pickRotating(cases: CaseFile[], setsCompleted: number, reps = 3): CaseFile[] {
  const sorted = [...cases].sort((a, b) => a.difficulty - b.difficulty || hash(a.id) - hash(b.id));
  const n = sorted.length;
  const k = Math.min(reps, n);
  const start = (setsCompleted * k) % Math.max(1, n);
  return Array.from({ length: k }, (_, i) => sorted[(start + i) % n]);
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** The patients for a set: rotating sections cycle through every topic, others pick by difficulty */
export function casesForSet(cases: CaseFile[], section: SectionDef | undefined, stage: Stage, setsCompleted: number): CaseFile[] {
  if (section?.ordered && section.caseIds) {
    const ids = section.caseIds;
    return [...cases].sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
  }
  return section?.rotate ? pickRotating(cases, setsCompleted) : pickCasesForStage(cases, stage, setsCompleted);
}

/** Choose this set's patients by difficulty: easy first at stage 1, hardest first at stage 3 */
export function pickCasesForStage(cases: CaseFile[], stage: Stage, setsCompleted: number, reps = 3): CaseFile[] {
  const sorted = [...cases].sort((a, b) => a.difficulty - b.difficulty || a.id.localeCompare(b.id));
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
    label: 'Commit and defend',
    prompt:
      stage === 3
        ? 'Commit and defend: your leading diagnosis with the features from this history that support it, then the must-not-miss diagnosis you still need to exclude. One per line.'
        : 'Commit: what is your leading diagnosis, and which features from this history support it? One line, e.g. “Appendicitis — pain migrated to the RIF, anorexia”.',
    items,
    freeText: true,
  };
}

/** Viva questions for this stage: recall first, then "why" with examiner probes, then data and what-ifs */
export function vivaQuestions(c: CaseFile, stage: Stage): FollowUp[] {
  return (c.viva ?? [])
    .filter((q) => q.tier <= stage)
    .sort((a, b) => a.tier - b.tier)
    .flatMap((q) => {
      const main: FollowUp = { ...q, label: q.label ?? VIVA_TIERS[q.tier] };
      return stage >= 2 && q.probe ? [main, { ...q.probe, id: undefined, label: q.probe.label ?? 'Examiner follow-up' }] : [main];
    });
}

export const followUpsFor = (c: CaseFile, sectionId: string): FollowUp[] => {
  const fu = c.followUps?.[sectionId];
  return fu ? (Array.isArray(fu) ? fu : [fu]) : [];
};

/**
 * Extra questions asked after a block, in order: the case's follow-ups for that
 * block, then the stage's own question (commit-and-defend after histories, a
 * twist after reasoning). In a combined drill, those come only after the last block.
 * A viva block is nothing but questions.
 */
export function extraQuestions(section: SectionDef, c: CaseFile, stage: Stage, isLastStep = true): FollowUp[] {
  if (section.kind === 'viva') return vivaQuestions(c, stage);
  const out: FollowUp[] = followUpsFor(c, section.id).filter((q) => !q.minStage || q.minStage <= stage);
  if (section.kind === 'interview') {
    const syn = isLastStep ? synthesisQuestion(c, stage) : undefined;
    if (syn) out.push(syn);
  } else if (section.kind === 'reasoning' && stage === 3 && isLastStep && c.twist) {
    out.push({ ...c.twist, label: 'Challenge · new information' });
  }
  return out;
}

/** Id prefix for items from extra question i, so they never clash with checklist ids */
export const xid = (i: number, id: string) => `x${i}:${id}`;
