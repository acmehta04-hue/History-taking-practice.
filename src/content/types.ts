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
  /** Deep dives: what the question is for. The student tags it after asking. */
  purpose?: Purpose;
  /** Deep dives: what it excludes, or which risk factor / severity marker it checks */
  target?: string;
}

/** Why a history question is asked (deep dive "why are you asking?" sets) */
export type Purpose = 'exclude' | 'risk' | 'severity';

export const PURPOSE_NAMES: Record<Purpose, string> = {
  exclude: 'Exclude a diagnosis',
  risk: 'Risk factor',
  severity: 'Severity & safety',
};

export const PURPOSE_HELP: Record<Purpose, string> = {
  exclude: 'Rules out another cause, or a must-not-miss condition',
  risk: 'Makes this condition more likely, or more likely to come back',
  severity: 'How bad it is, and how urgent',
};

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

/**
 * interview — the student asks, the patient answers
 * counsel   — the student explains a treatment, the patient reacts and asks back
 * reasoning — the student lists differentials / investigations / management / a prescription
 * viva      — examiner questions about the patient, with follow-up probes
 */
export type SectionKind = 'interview' | 'counsel' | 'reasoning' | 'viva';

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
  /** Only these patients appear in this section (deep dives use different patients per set) */
  caseIds?: string[];
  /** Interview sections: after each question, the student tags what it was for */
  tagPurpose?: boolean;
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
  /** Set on questions worth reviewing later as viva flashcards */
  id?: string;
  prompt: string;
  items: ReasonItem[];
  /** No option chips even in Guided mode (e.g. "commit to a diagnosis") */
  freeText?: boolean;
  /** Small heading above the question, e.g. "Prescription review", "Viva" */
  label?: string;
  /** Results or observations to interpret, shown under the question */
  data?: string;
  /** Wrong-but-plausible options mixed into Guided mode chips */
  distractors?: Distractor[];
}

/**
 * An examiner question about the patient.
 * tier 1 = recall, 2 = explain why, 3 = data interpretation and what-ifs.
 * Set 1 (Foundation) asks tier 1; Application adds tier 2 with probes; Challenge adds tier 3.
 */
export interface VivaQuestion extends FollowUp {
  id: string;
  tier: 1 | 2 | 3;
  /** The examiner's follow-up, asked from Application onwards */
  probe?: FollowUp;
}

/** Something a patient asks back during a counselling session */
export interface Concern {
  /** The counselling item that answers it */
  itemId: string;
  text: string;
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
  /** Questions asked after a block, keyed by section id (one, or a sequence) */
  followUps?: Record<string, FollowUp | FollowUp[]>;
  /** Examiner questions for the Viva block */
  viva?: VivaQuestion[];
  /** Counselling: what the patient asks back, in order */
  concerns?: Concern[];
  /** Per-section first words, when they differ from patient.opening (e.g. a counselling session) */
  openings?: Record<string, string>;
  /** Per-section vignette, when it differs from summary (e.g. a prescribing task) */
  summaries?: Record<string, string>;
  /** Teaching point shown on the summary for this case */
  pearl: string;
  /** Free-form flags used by ChecklistItem.appliesTo, e.g. "on-ssri" */
  tags?: string[];
  /** 1 = classic textbook, 2 = some ambiguity, 3 = atypical / high-stakes. Harder patients come in later sets. */
  difficulty: 1 | 2 | 3;
  /** Challenge-set twist: new information that forces a re-think (asked after reasoning reps in set 3+) */
  twist?: FollowUp;
}

/** A combined drill: several blocks run back-to-back on the same patient */
export interface ComboDef {
  id: string;
  title: string;
  short: string;
  blurb: string;
  /** Section ids, in the order they are run */
  sections: string[];
}

export interface Presentation {
  id: string;
  title: string;
  specialtyId: string;
  /** UKMLA content map areas this presentation draws on */
  ukmla: string[];
  sections: SectionDef[];
  /** Combined drills, unlocked once their blocks reach L2 */
  combos: ComboDef[];
  cases: CaseFile[];
  /** 'deepdive' = a condition walked from history to prescribing */
  kind?: 'presentation' | 'deepdive';
  deepDive?: DeepDiveMeta;
}

export interface DeepDiveMeta {
  /** The UKMLA condition, e.g. "Depression" */
  condition: string;
  /** What the student counsels on and prescribes */
  treatment: string;
  /** The presentation whose patients and checklists it builds on */
  source: string;
  blurb: string;
}

/** A deep dive that isn't written yet (shown as coming soon) */
export interface PlannedDeepDive {
  condition: string;
  treatment: string;
  specialtyId: string;
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
