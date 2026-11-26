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
  /** Shown when the student asks for a hint (defaults to `why`) */
  hint?: string;
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
  /** Many patients or topics: each set takes the next three in turn, so every one comes up */
  rotate?: boolean;
  /** Reasoning sections: one answer only (spot the diagnosis) */
  single?: boolean;
  /** Reasoning sections: what a wrong-but-plausible option is called in feedback (default "Not first line") */
  wrongLabel?: string;
  /** Wrong options only appear as Guided chips; typing one at Prompted or Independent isn't penalised */
  guidedOnlyDistractors?: boolean;
  /** Reasoning sections: example answer shown in the empty input */
  placeholder?: string;
  /** What each stage adds, when it differs from the defaults (syllabus drills have topics, not patients) */
  stageNotes?: Record<1 | 2 | 3, string>;
  /** Every set runs its caseIds in this order (a patient's journey) */
  ordered?: boolean;
}

export interface Patient {
  name: string;
  age: number;
  sex: 'male' | 'female';
  setting: string;
  /** The patient's first words */
  opening: string;
}

/* ------------------------------------------------------------------ */
/* Results: observations, bloods, ECGs and X-rays to interpret          */
/* ------------------------------------------------------------------ */

/** Observations, scored with NEWS2 (src/engine/news2.ts) */
export interface Obs {
  /** Breaths per minute */
  rr: number;
  /** Oxygen saturation, % */
  spo2: number;
  /** Oxygen being given, e.g. "2 L/min nasal cannulae"; leave out on room air */
  o2?: string;
  /** Use SpO2 scale 2 (target 88–92%, e.g. COPD with hypercapnic respiratory failure) */
  scale2?: boolean;
  sbp: number;
  dbp: number;
  /** Pulse, beats per minute */
  hr: number;
  /** A alert, C new confusion, V voice, P pain, U unresponsive */
  acvpu: 'A' | 'C' | 'V' | 'P' | 'U';
  /** °C */
  temp: number;
}

export interface BloodRow {
  test: string;
  value: number | string;
  unit?: string;
  /** Reference range: a value outside it is flagged L or H */
  low?: number;
  high?: number;
  /** An earlier result, for trends */
  prev?: number | string;
}

/** A schematic rhythm strip, drawn by src/engine/ecg.ts */
export interface EcgSpec {
  rate: number;
  rhythm: 'sinus' | 'af' | 'flutter';
  qrs?: 'narrow' | 'broad';
  st?: 'normal' | 'elevated' | 'depressed';
  t?: 'normal' | 'peaked' | 'flat' | 'inverted';
  /** U waves (e.g. low potassium) */
  u?: boolean;
  lead?: string;
}

export type XrayFinding = 'dilated-small-bowel' | 'dilated-large-bowel' | 'free-air';

/** A schematic radiograph (not a real image) */
export interface XraySpec {
  view: 'axr' | 'cxr';
  findings: XrayFinding[];
}

export type ResultPanel =
  | { kind: 'obs'; title?: string; obs: Obs }
  | { kind: 'bloods'; title?: string; rows: BloodRow[] }
  | { kind: 'ecg'; title?: string; ecg: EcgSpec }
  | { kind: 'xray'; title?: string; xray: XraySpec }
  | { kind: 'report'; title: string; lines: string[] };

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
  /** Only asked from this stage on (2 = Application, 3 = Challenge) */
  minStage?: 2 | 3;
  /** Observations, bloods, ECG or imaging to interpret, shown under the question */
  results?: ResultPanel[];
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
  /** Shown instead of the patient's name when a rep is a topic, not a person (syllabus drills) */
  topic?: { kicker: string; title: string };
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
  /** Results shown with the vignette, keyed by section id */
  results?: Record<string, ResultPanel[]>;
  /**
   * A later visit by the same patient (a follow-up episode). Episodes only
   * appear in sections that list them in caseIds, in order.
   */
  episode?: { of: string; order: number; when: string };
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
  /** 'deepdive' = a condition walked from history to prescribing; 'area' = generated syllabus drills for a UKMLA area; 'drug' = a drug's viva, counselling and prescribing drills */
  kind?: 'presentation' | 'deepdive' | 'area' | 'drug';
  deepDive?: DeepDiveMeta;
  drug?: DrugMeta;
}

/** What the drug page shows above the drills */
export interface DrugMeta {
  name: string;
  drugClass: string;
  summary: string;
  /** Three exam-critical points: uses, safety, monitoring */
  keyPoints: [string, string, string];
  verify: string[];
}

/** A patient being started on the drug: counselled, then prescribed for */
export interface DrugPatient {
  id: string;
  /** e.g. "Rheumatoid arthritis" */
  indication: string;
  patient: Patient;
  /** Weight, renal function, other medicines, allergies: shown before prescribing */
  summary: string;
  difficulty: 1 | 2 | 3;
  /** What they say back to each counselling point (missing ones fall back to the point's default) */
  answers: Record<string, string>;
  /** What they ask during counselling */
  concerns: Concern[];
  /** Turn on patient-specific counselling points (ChecklistItem.appliesTo) */
  tags?: string[];
  /** The prescription, one item per part (drug, dose, route, frequency…) */
  rx: ReasonItem[];
  rxDistractors?: Distractor[];
  /** After prescribing: review, monitoring, results */
  review: FollowUp[];
  pearl: string;
}

/** Everything needed to generate a drug's drills (src/content/drugs) */
export interface DrugProfile extends DrugMeta {
  id: string;
  /** Home area, for colour and where it is listed */
  areaId: string;
  /** Viva questions in three topics; each topic needs a recall question, and the set needs tiers 1–3 */
  viva: { uses: VivaQuestion[]; safety: VivaQuestion[]; monitoring: VivaQuestion[] };
  /** What a good counselling session covers (modelQuestion = the model statement) */
  counsel: ChecklistItem[];
  patients: DrugPatient[];
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

/** A UKMLA area of clinical practice (the app calls these specialties for short) */
export interface Specialty {
  id: string;
  /** The content map's name, e.g. "Gastrointestinal including liver" */
  title: string;
  /** Short name for cards and chips, e.g. "Gastro & liver" */
  short: string;
  /** Theme key for the card colour */
  tone: 'lilac' | 'coral' | 'butter' | 'mint' | 'sky' | 'rose';
  icon: string;
}

/* ------------------------------------------------------------------ */
/* Syllabus catalogue (src/content/catalogue)                           */
/* ------------------------------------------------------------------ */

/** An investigation the syllabus drills can ask for */
export interface TestDef {
  id: string;
  label: string;
  category: string;
  match: string[];
}

/** A condition: what it is called, the picture to recognise, and how to confirm it */
export interface SyllabusCondition {
  id: string;
  title: string;
  /** Area ids; the first is its home */
  areas: string[];
  /** Every pattern that names it: from the title, plus synonyms */
  match: string[];
  /** Synonyms only (used by the cross-credit test) */
  synonyms: string[];
  /** The classic picture, written without naming the condition */
  key: string;
  /** Test ids that confirm it */
  ix: string[];
  /** A differential bucket rather than a content-map condition (e.g. "Adverse drug effect"): never a spot-the-diagnosis answer */
  helper?: boolean;
}

/** A presentation and the conditions it could be */
export interface SyllabusPresentation {
  id: string;
  title: string;
  /** Area ids; the first is its home */
  areas: string[];
  /** Candidate conditions: must-not-miss (redflag), common (core), also consider (extra) */
  causes: { id: string; weight: Weight }[];
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
