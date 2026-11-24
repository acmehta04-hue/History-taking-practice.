/**
 * Content model for History Drills.
 *
 * Specialty  ->  Presentation (a UKMLA presentation, e.g. "Abdominal pain")
 *            ->  Sections (the drillable blocks: HPC, drug history, investigations...)
 *            ->  Cases (patients). One rep = one case x one section.
 *
 * Interview sections share one checklist per presentation; each case supplies the
 * patient's answers. Reasoning sections (differentials, investigations,
 * management) have a model answer per case.
 */

/** core = expected of every student; extra = good practice; redflag = must not miss */
export type Weight = 'core' | 'extra' | 'redflag';

export const WEIGHT_VALUE: Record<Weight, number> = { core: 2, extra: 1, redflag: 3 };

export type AssistLevel = 1 | 2 | 3;

export const LEVEL_NAMES: Record<AssistLevel, string> = {
  1: 'Guided',
  2: 'Prompted',
  3: 'Independent',
};

export interface ChecklistItem {
  id: string;
  /** Short label shown on the framework strip, e.g. "Onset" */
  label: string;
  /** Optional group, e.g. "SOCRATES" — used to cluster chips */
  group?: string;
  weight: Weight;
  /** Regex sources (case-insensitive) tested against the student's normalised question */
  match: string[];
  /** The model question shown in Guided mode and in feedback */
  modelQuestion: string;
  /** A nudge shown when the student asks for a hint */
  hint: string;
  /** Why the question matters — shown in feedback */
  why: string;
  /** What the patient says when the case gives no specific answer */
  defaultAnswer?: string;
  /** Only relevant for some patients (e.g. LMP for people who could be pregnant) */
  appliesTo?: (c: CaseFile) => boolean;
}

export interface ReasonItem {
  id: string;
  label: string;
  weight: Weight;
  match: string[];
  /** Keywords that show the student gave the right reason on the same line */
  reasonMatch?: string[];
  /** Model reasoning, e.g. "Faecal calprotectin — distinguishes IBD from IBS" */
  why: string;
  /** Used for Prompted mode counts, e.g. "Bloods", "Bedside", "Imaging" */
  category?: string;
}

/** A plausible-sounding option offered in Guided mode that is not in the model answer */
export interface Distractor {
  label: string;
  match: string[];
  whyNot: string;
}

export type SectionKind = 'interview' | 'reasoning';

export interface SectionDef {
  id: string;
  title: string;
  short: string;
  kind: SectionKind;
  blurb: string;
  /** Target time for one rep, in seconds — used for the speed bonus */
  targetSeconds: number;
  /** Interview sections only */
  checklist?: ChecklistItem[];
  /** Reasoning sections only: the instruction shown to the student */
  prompt?: string;
  /** Library card ids to teach after the set */
  teach?: string[];
  /** Ordered "ideal flow" tips for the set summary */
  flow?: string[];
}

export interface Patient {
  name: string;
  age: number;
  sex: 'male' | 'female';
  setting: string;
  /** The patient's first words */
  opening: string;
}

export interface FollowUp {
  prompt: string;
  items: ReasonItem[];
}

export interface CaseFile {
  id: string;
  /** Hidden until the summary, e.g. "Acute appendicitis" */
  diagnosis: string;
  patient: Patient;
  /** One-paragraph vignette shown in reasoning sections */
  summary: string;
  /** Patient answers keyed by checklist item id (across all interview sections) */
  answers: Record<string, string>;
  /** Model answers for reasoning sections, keyed by section id */
  reasoning: Record<string, ReasonItem[]>;
  /** Guided-mode distractors, keyed by section id */
  distractors?: Record<string, Distractor[]>;
  /** Optional reasoning question asked at the end of an interview rep, keyed by section id */
  followUps?: Record<string, FollowUp>;
  /** Teaching point shown on the summary for this case */
  pearl: string;
  /** Free-form flags used by ChecklistItem.appliesTo, e.g. "on-ssri" */
  tags?: string[];
}

export interface Presentation {
  id: string;
  title: string;
  specialtyId: string;
  /** UKMLA content map areas this presentation draws on */
  ukmla: string[];
  sections: SectionDef[];
  cases: CaseFile[];
}

export interface Specialty {
  id: string;
  title: string;
  /** Theme key for the card colour */
  tone: 'lilac' | 'coral' | 'butter' | 'mint' | 'sky' | 'rose';
  icon: string;
  /** Presentations with content, plus planned ones shown as "coming soon" */
  planned: string[];
}

export interface LibraryCard {
  id: string;
  title: string;
  kicker: string;
  specialtyId: string;
  minutes: number;
  blocks: { heading: string; points: string[] }[];
  /** Where to verify — NICE CKS / BNF / guideline names */
  verify: string[];
}
