import { depressionDive } from './deepdives/depression';
import { library, libraryById } from './library';
import { abdominalPain } from './presentations/abdominal-pain';
import { lowMood } from './presentations/low-mood';
import { palpitations } from './presentations/palpitations';
import type { CaseFile, ChecklistItem, ComboDef, FollowUp, PlannedDeepDive, Presentation, SectionDef, Specialty } from './types';

export * from './types';
export { library, libraryById };

/**
 * Specialties follow the UKMLA content map areas. "planned" lists presentations
 * from the content map that are not written yet — they show as "coming soon".
 */
export const specialties: Specialty[] = [
  {
    id: 'gastro',
    title: 'Gastro & surgery',
    tone: 'butter',
    icon: 'nutrition-outline',
    planned: ['Change in bowel habit', 'Jaundice', 'Rectal bleeding', 'Dysphagia', 'Vomiting'],
  },
  {
    id: 'cardio',
    title: 'Cardiology',
    tone: 'coral',
    icon: 'heart-outline',
    planned: ['Chest pain', 'Breathlessness', 'Syncope', 'Peripheral oedema'],
  },
  {
    id: 'psych',
    title: 'Psychiatry',
    tone: 'lilac',
    icon: 'happy-outline',
    planned: ['Anxiety', 'Self-harm', 'Elated mood', 'Hallucinations', 'Substance misuse', 'Memory loss'],
  },
  { id: 'resp', title: 'Respiratory', tone: 'sky', icon: 'cloud-outline', planned: ['Cough', 'Wheeze', 'Haemoptysis'] },
  { id: 'neuro', title: 'Neurology', tone: 'mint', icon: 'flash-outline', planned: ['Headache', 'Dizziness', 'Seizures', 'Limb weakness'] },
  {
    id: 'womens',
    title: 'Women’s health',
    tone: 'rose',
    icon: 'flower-outline',
    planned: ['Pelvic pain', 'Bleeding in pregnancy', 'Menstrual problems'],
  },
];

export const presentations: Presentation[] = [abdominalPain, palpitations, lowMood];

/** Deep dives: a UKMLA condition walked from history to prescribing */
export const deepDives: Presentation[] = [depressionDive];

export const plannedDeepDives: PlannedDeepDive[] = [
  { condition: 'Bipolar disorder', treatment: 'Lithium', specialtyId: 'psych' },
  { condition: 'Atrial fibrillation', treatment: 'Apixaban and bisoprolol', specialtyId: 'cardio' },
  { condition: 'Graves’ disease', treatment: 'Carbimazole', specialtyId: 'cardio' },
  { condition: 'Crohn’s disease', treatment: 'Prednisolone, then azathioprine', specialtyId: 'gastro' },
];

/** Presentations and deep dives share one lookup (drills, summaries and the store key by id) */
export const presentationById: Record<string, Presentation> = Object.fromEntries([...presentations, ...deepDives].map((p) => [p.id, p]));

export const specialtyById: Record<string, Specialty> = Object.fromEntries(specialties.map((s) => [s.id, s]));

export function getSection(presentationId: string, sectionId: string): SectionDef | undefined {
  return presentationById[presentationId]?.sections.find((s) => s.id === sectionId);
}

export function getCase(presentationId: string, caseId: string): CaseFile | undefined {
  return presentationById[presentationId]?.cases.find((c) => c.id === caseId);
}

/** Checklist items that apply to this patient (e.g. LMP only for people who could be pregnant) */
export function checklistFor(section: SectionDef, c: CaseFile): ChecklistItem[] {
  return (section.checklist ?? []).filter((i) => !i.appliesTo || i.appliesTo(c));
}

export function presentationsFor(specialtyId: string): Presentation[] {
  return presentations.filter((p) => p.specialtyId === specialtyId);
}

export const programKey = (presentationId: string, sectionId: string) => `${presentationId}:${sectionId}`;

/* ------------------------------------------------------------------ */
/* Drills: a single block, or a combined drill that chains blocks       */
/* ------------------------------------------------------------------ */

export interface Drill {
  id: string;
  kind: 'single' | 'combo';
  title: string;
  short: string;
  blurb: string;
  sections: SectionDef[];
  /** Target time for one rep (all steps) */
  targetSeconds: number;
  flow: string[];
  teach: string[];
  /** Restricts which patients appear (deep dive sets) */
  caseIds?: string[];
}

function singleDrill(s: SectionDef): Drill {
  return {
    id: s.id,
    kind: 'single',
    title: s.title,
    short: s.short,
    blurb: s.blurb,
    sections: [s],
    targetSeconds: s.targetSeconds,
    flow: s.flow ?? [],
    teach: s.teach ?? [],
    caseIds: s.caseIds,
  };
}

function comboDrill(p: Presentation, c: ComboDef): Drill {
  const sections = c.sections.map((id) => p.sections.find((s) => s.id === id)).filter((s): s is SectionDef => !!s);
  return {
    id: c.id,
    kind: 'combo',
    title: c.title,
    short: c.short,
    blurb: c.blurb,
    sections,
    targetSeconds: sections.reduce((a, s) => a + s.targetSeconds, 0),
    flow: [
      ...sections.map((s, i) => `${i + 1}. ${s.title}: ${s.blurb}`),
      'Link the blocks: let each answer shape the next questions, and signpost every change of topic.',
    ],
    teach: [...new Set(sections.flatMap((s) => s.teach ?? []))],
  };
}

export function getDrill(presentationId: string, drillId: string): Drill | undefined {
  const p = presentationById[presentationId];
  if (!p) return undefined;
  const s = p.sections.find((x) => x.id === drillId);
  if (s) return singleDrill(s);
  const c = p.combos.find((x) => x.id === drillId);
  return c ? comboDrill(p, c) : undefined;
}

export function singlesFor(p: Presentation): Drill[] {
  return p.sections.map(singleDrill);
}

export function combosFor(p: Presentation): Drill[] {
  return p.combos.map((c) => comboDrill(p, c));
}

/** The patients a drill draws from */
export function casesForDrill(p: Presentation, d: Drill): CaseFile[] {
  return d.caseIds ? p.cases.filter((c) => d.caseIds!.includes(c.id)) : p.cases;
}

/** Find a flashcard question (a viva question or a follow-up with an id) */
export function findQuestion(
  presentationId: string,
  caseId: string,
  questionId: string,
): { p: Presentation; c: CaseFile; q: FollowUp } | undefined {
  const p = presentationById[presentationId];
  const c = p?.cases.find((x) => x.id === caseId);
  if (!p || !c) return undefined;
  const viva = c.viva?.find((q) => q.id === questionId);
  if (viva) return { p, c, q: viva };
  for (const fu of Object.values(c.followUps ?? {})) {
    const list = Array.isArray(fu) ? fu : [fu];
    const q = list.find((x) => x.id === questionId);
    if (q) return { p, c, q };
  }
  return undefined;
}
