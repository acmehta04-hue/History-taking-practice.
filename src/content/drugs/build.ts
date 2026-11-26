import { VIVA_FLOW, item, r } from '../common';
import type { CaseFile, ChecklistItem, Patient, Presentation, ReasonItem, Weight } from '../types';

/**
 * Drug drills, generated from a DrugProfile:
 *  - Viva: three topics (uses and how it works, safety and interactions,
 *    monitoring and results), recall first, then why, then data.
 *  - Counsel: explain it to a patient who asks back.
 *  - Prescribe: write the prescription PSA-style, then review and monitor.
 * Doses and monitoring: verify against the current BNF before release.
 */

const NOBODY: Patient = { name: '', age: 0, sex: 'female', setting: '', opening: '' };

/* ------------------------------------------------------------------ */
/* Builders used by the drug files                                      */
/* ------------------------------------------------------------------ */

/** A counselling point: modelQuestion is what a good explanation says */
export function point(
  id: string,
  label: string,
  match: string[],
  model: string,
  why: string,
  opts: { weight?: Weight; defaultAnswer?: string; tag?: string; group?: string } = {},
): ChecklistItem {
  return item({
    id,
    label,
    group: opts.group ?? 'Explain',
    weight: opts.weight ?? 'core',
    match,
    modelQuestion: model,
    hint: label,
    why,
    defaultAnswer: opts.defaultAnswer ?? 'Okay, that makes sense.',
    ...(opts.tag ? { appliesTo: (c: CaseFile) => (c.tags ?? []).includes(opts.tag!) } : {}),
  });
}

/** Opening: what they already know and worry about */
export const ideas = (id: string, drug: string) =>
  point(
    id,
    'What they know and fear',
    [
      'what do you (already )?know',
      'have you (heard|read|taken|had|been on)',
      'how do you feel about',
      'any (worries|concerns)',
      'what (have you been|were you) told',
      'what are your thoughts',
    ],
    `Before I explain, what do you already know about ${drug}, and is there anything worrying you about it?`,
    'Explaining from what they already believe makes the rest stick.',
    { weight: 'extra', group: 'Set up', defaultAnswer: 'Not much, really.' },
  );

/** Closing: check understanding */
export const teachBack = (id: string) =>
  point(
    id,
    'Check understanding (teach-back)',
    [
      '(can you|could you) (tell|explain|repeat|summari)',
      'in your own words',
      'what will you',
      'just to (check|make sure)',
      'make sure (i|i ve) explained',
    ],
    'Just to check I’ve explained it well, can you tell me how you’re going to take it, and when you’d get help?',
    'Teach-back is the most reliable way to find gaps in what was understood.',
    { group: 'Close', defaultAnswer: 'I think I’ve got it.' },
  );

export const rxDrug = (name: string, match: string[]) =>
  r('rx_drug', name, 'core', match, 'The approved (generic) name, written in full.', undefined, 'Prescription');
export const rxDose = (label: string, match: string[], why: string) => r('rx_dose', label, 'core', match, why, undefined, 'Prescription');
export const rxOral = r('rx_route', 'Oral', 'core', ['\\boral|orally|by mouth|\\bpo\\b'], 'Route in full.', undefined, 'Prescription');
export const rxFreq = (label: string, match: string[], why: string) => r('rx_freq', label, 'core', match, why, undefined, 'Prescription');

export const ONCE_DAILY = ['once (a |per )?day|once daily|\\bod\\b|\\bdaily|every (morning|day|evening)|\\bmane\\b|in the morning'];
export const ONCE_WEEKLY = ['once (a |per )?week|weekly|every week|same day (each|every) week|(mon|tues|wednes|thurs|fri|satur|sun)days?'];

/* ------------------------------------------------------------------ */
/* The generator                                                        */
/* ------------------------------------------------------------------ */

const TOPICS = [
  { key: 'uses', title: 'Uses and how it works', difficulty: 1 },
  { key: 'safety', title: 'Side effects and interactions', difficulty: 2 },
  { key: 'monitoring', title: 'Monitoring and results', difficulty: 3 },
] as const;

export function drugDrill(d: import('../types').DrugProfile): Presentation {
  const topicCases: CaseFile[] = TOPICS.map((t, i) => ({
    id: `v-${t.key}`,
    diagnosis: d.name,
    topic: { kicker: 'Drug viva', title: t.title },
    patient: NOBODY,
    summary: d.summary,
    answers: {},
    reasoning: {},
    viva: d.viva[t.key],
    pearl: d.keyPoints[i],
    difficulty: t.difficulty,
  }));
  const patientCases: CaseFile[] = d.patients.map((p) => ({
    id: p.id,
    diagnosis: `${p.indication}: ${d.name}`,
    patient: p.patient,
    summary: p.summary,
    answers: p.answers,
    concerns: p.concerns,
    tags: p.tags,
    reasoning: { prescribe: p.rx },
    ...(p.rxDistractors ? { distractors: { prescribe: p.rxDistractors } } : {}),
    followUps: { prescribe: p.review },
    pearl: p.pearl,
    difficulty: p.difficulty,
  }));
  const ids = d.patients.map((p) => p.id);
  return {
    id: `drug-${d.id}`,
    title: d.name,
    specialtyId: d.areaId,
    ukmla: ['Clinical pharmacology and therapeutics'],
    kind: 'drug',
    drug: { name: d.name, drugClass: d.drugClass, summary: d.summary, keyPoints: d.keyPoints, verify: d.verify },
    sections: [
      {
        id: 'viva',
        title: `${d.name}: viva`,
        short: 'Viva',
        kind: 'viva',
        blurb: 'Uses and how it works, side effects and interactions, monitoring and results.',
        targetSeconds: 240,
        caseIds: topicCases.map((c) => c.id),
        flow: VIVA_FLOW,
      },
      {
        id: 'counsel',
        title: `Counsel a patient starting ${d.name.toLowerCase()}`,
        short: 'Counsel',
        kind: 'counsel',
        blurb: 'Explain it in plain words, answer what they ask back, then check understanding.',
        targetSeconds: 360,
        checklist: d.counsel,
        caseIds: ids,
        flow: [
          'Start with what they know and what worries them.',
          'What it is for and how it works, in plain words.',
          'How to take it: dose, timing, and anything special about it.',
          'Side effects, and the warning signs that mean get help now.',
          'Monitoring, interactions and lifestyle.',
          'Check understanding with teach-back.',
        ],
      },
      {
        id: 'prescribe',
        title: `Prescribe ${d.name.toLowerCase()} (PSA style)`,
        short: 'Prescribe',
        kind: 'reasoning',
        blurb: 'Write the prescription for this patient, then review, monitor and act on results.',
        targetSeconds: 240,
        prompt: 'Write the prescription: drug, dose, route and frequency, plus anything else the chart needs. One part per line.',
        caseIds: ids,
        flow: [
          'Read the patient details first: weight, renal function, other medicines, allergies.',
          'Approved name, dose with units, route, frequency (and duration or the day of the week if it matters).',
          'Then think about what else this patient needs: monitoring, cover, supplements.',
        ],
      },
    ],
    combos: [
      {
        id: 'combo-drug',
        title: 'Counsel, then prescribe',
        short: 'Counsel → Prescribe',
        blurb: 'Explain it to the patient, then write their prescription.',
        sections: ['counsel', 'prescribe'],
      },
    ],
    cases: [...topicCases, ...patientCases],
  };
}

/** Labels for a quick look at a prescription item list */
export const rxSummary = (items: ReasonItem[]) => items.map((i) => i.label).join(' · ');
