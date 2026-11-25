import type { ChecklistItem, ReasonItem, Weight } from './types';

/**
 * Reusable checklist items. Patterns run against a normalised question:
 * lower-case, punctuation turned into spaces ("what's" -> "what s").
 * Keep patterns broad — a student phrasing a question well should never be
 * told they missed it. Tests in /tests check the common phrasings.
 */

type ItemInput = Omit<ChecklistItem, 'weight'> & { weight?: Weight };
export const item = (i: ItemInput): ChecklistItem => ({ weight: 'core', ...i });

export const isFemale = (c: { patient: { sex: string } }) => c.patient.sex === 'female';
export const couldBePregnant = (c: { patient: { sex: string; age: number } }) =>
  c.patient.sex === 'female' && c.patient.age >= 12 && c.patient.age <= 55;

/* ------------------------------------------------------------------ */
/* Opening and ICE                                                      */
/* ------------------------------------------------------------------ */

export const openQuestion = item({
  id: 'open',
  label: 'Open question',
  weight: 'extra',
  match: [
    'tell me',
    'what (has |s )?(brought|brings?) you',
    'how can i help',
    'what can i (do|help)',
    'in your own words',
    'what seems to be',
    'what s been (going on|happening)',
    'what has been (going on|happening)',
  ],
  modelQuestion: 'Can you tell me in your own words what has brought you in today?',
  hint: 'Start broad and let the patient tell their story.',
  why: 'An open start surfaces the patient’s agenda and often half the history in one go.',
  defaultAnswer: 'Well, it’s the problem I mentioned — I wanted to get it checked out.',
});

export const ice = item({
  id: 'ice',
  label: 'ICE',
  match: [
    'what do you think',
    'worr',
    'concern',
    'expect',
    'hoping',
    'hope (we|i|you)',
    'idea',
    'thoughts (on|about)',
    'anything in particular.*(mind|worr)',
    'what would you like',
  ],
  modelQuestion:
    'What do you think might be going on? Is there anything in particular worrying you, and what were you hoping we could do today?',
  hint: 'Ideas, concerns and expectations.',
  why: 'ICE is marked in almost every UK OSCE station and changes how you explain the plan.',
  defaultAnswer: 'I’m not really sure what it is — I just want to know it’s nothing serious.',
});

/* ------------------------------------------------------------------ */
/* SOCRATES                                                             */
/* ------------------------------------------------------------------ */

const S = 'SOCRATES';

export const socrates: ChecklistItem[] = [
  item({
    id: 'site',
    label: 'Site',
    group: S,
    match: [
      '\\bwhere\\b(?!.*\\b(spread|go|goes|move|moves|travel|radiat|else|anywhere)\\b)',
      '\\bsite\\b',
      'point to',
      'which (part|side|area)',
      'locat',
      'show me where',
    ],
    modelQuestion: 'Where exactly is the pain? Can you point to it?',
    hint: 'Where is it?',
    why: 'Site narrows the organ: RUQ biliary, RIF appendix, epigastric peptic/pancreatic.',
  }),
  item({
    id: 'onset',
    label: 'Onset',
    group: S,
    match: [
      'when did',
      'when.*(start|begin|began)',
      '(did|does) (it|the pain|this) (start|begin)',
      'start(ed)? (suddenly|gradually|all of a sudden|quickly|slowly)',
      'began|begin',
      'onset',
      'come on|came on',
      'sudden|gradual',
      'first notic',
      'how long (have|has|ago)',
      'how long.*(had|been)',
    ],
    modelQuestion: 'When did it start, and did it come on suddenly or gradually?',
    hint: 'When and how did it begin?',
    why: 'Sudden onset points to perforation, rupture or ischaemia; gradual to inflammation.',
  }),
  item({
    id: 'character',
    label: 'Character',
    group: S,
    match: [
      'describe',
      'what (does|is) (it|the pain) (feel )?like',
      'feel like',
      'sharp|dull|stabbing|burning|cramp|colick|aching|throbbing|tight',
      '(kind|type|sort) of pain',
      'nature',
    ],
    modelQuestion: 'How would you describe the pain — sharp, dull, crampy, burning?',
    hint: 'What does it feel like?',
    why: 'Colicky pain suggests a hollow organ (bowel, ureter, biliary); constant suggests inflammation.',
  }),
  item({
    id: 'radiation',
    label: 'Radiation',
    group: S,
    match: ['radiat', 'spread', '(go|goes|move|moves|travel|travels|shoot|shoots)( anywhere| else| to| into| through)', 'anywhere else'],
    modelQuestion: 'Does the pain move or spread anywhere else?',
    hint: 'Does it go anywhere?',
    why: 'Shoulder tip = diaphragm irritation; back = pancreas or aorta; loin to groin = renal colic.',
  }),
  item({
    id: 'associated',
    label: 'Associated',
    group: S,
    match: [
      'other symptoms',
      'anything else',
      'associat',
      'along with',
      'accompan',
      'noticed any(thing)? (else|other)',
      'nause|vomit|being sick|been sick|fever|temperature|diarr|constipat|bowel|urin',
    ],
    modelQuestion: 'Have you noticed any other symptoms alongside the pain, like sickness, fever or a change in your bowels?',
    hint: 'What comes with it?',
    why: 'Associated symptoms separate surgical from medical causes before you examine.',
  }),
  item({
    id: 'timing',
    label: 'Timing',
    group: S,
    match: [
      'constant|continuous|all the time',
      'come and go|comes and goes|on and off|intermittent',
      'how long (does|do|did) (it|they|each|the)',
      'last for',
      'pattern',
      'episod',
      'time of day',
      'getting (worse|better)|changed since',
    ],
    modelQuestion: 'Is the pain there all the time or does it come and go? Has it changed since it started?',
    hint: 'Constant or intermittent? Changing?',
    why: 'Pain that migrates or escalates over hours is a classic surgical pattern.',
  }),
  item({
    id: 'exacerbating',
    label: 'Exacerbating / relieving',
    group: S,
    match: [
      'worse|better',
      'relie|eases?|easing',
      'aggravat|exacerbat|trigger',
      'make(s)? it',
      'anything (help|make|made)',
      'helps?\\b',
      'painkiller|paracetamol|ibuprofen',
      'position|moving|movement|cough',
      'eating|food|meal',
    ],
    modelQuestion: 'Does anything make it better or worse — moving, eating, painkillers?',
    hint: 'What makes it better or worse?',
    why: 'Worse on movement or coughing suggests peritonism; worse after fatty food suggests biliary.',
  }),
  item({
    id: 'severity',
    label: 'Severity',
    group: S,
    match: ['out of (10|ten)', 'scale', 'how (bad|severe|strong|painful)', 'sever', 'rate (it|the|your)', 'score', 'worst pain'],
    modelQuestion: 'On a scale of 0 to 10, with 10 the worst pain imaginable, how bad is it?',
    hint: 'How bad is it?',
    why: 'Severity tracks progress and guides analgesia; pain out of proportion suggests ischaemia.',
  }),
];

export const previousEpisodes = item({
  id: 'previous',
  label: 'Previous episodes',
  weight: 'extra',
  match: ['before', 'previous', 'first time', 'similar', 'ever had', 'happened (before|again)'],
  modelQuestion: 'Have you ever had anything like this before?',
  hint: 'Has this happened before?',
  why: 'Recurrent episodes suggest a chronic process (biliary colic, IBD flares).',
  defaultAnswer: 'No, this is the first time.',
});

/* ------------------------------------------------------------------ */
/* Drug history — shared                                                */
/* ------------------------------------------------------------------ */

const DH = 'Drug history';

export const dhCurrent = item({
  id: 'dh_current',
  label: 'Current medicines',
  group: DH,
  match: [
    'medic',
    'tablet',
    '\\bpills?\\b',
    'prescri',
    '\\bmeds\\b',
    'take (anything|any)',
    'taking (anything|any)',
    'regular(ly)? (take|treatment)',
    'on any',
  ],
  modelQuestion: 'Are you taking any medicines at the moment, prescribed or otherwise?',
  hint: 'What do they take regularly?',
  why: 'Start broad, then go medicine by medicine.',
  defaultAnswer: 'No, I don’t take any regular medicines.',
});

export const dhDose = item({
  id: 'dh_dose',
  label: 'Dose & frequency',
  group: DH,
  match: [
    'dose',
    'how (much|many)',
    'how often (do|should|are) you (take|taking|meant)',
    '\\bmg\\b',
    'milligram',
    'strength',
    'times a day',
    'once a day',
    'frequen',
  ],
  modelQuestion: 'What dose do you take, and how often?',
  hint: 'Dose and frequency for each.',
  why: 'Dose matters for side effects and toxicity — and patients often take medicines differently from the label.',
  defaultAnswer: 'I’m not on anything regular, so nothing to tell you there.',
});

export const dhAdherence = item({
  id: 'dh_adherence',
  label: 'Adherence',
  group: DH,
  match: [
    'miss',
    'forget|forgot',
    'adheren|complian',
    'manage to take',
    'every day',
    'stopp?ed (taking|it|them)',
    'skip',
    'how often do you (actually )?take',
    'take (it|them) (as|regularly)',
  ],
  modelQuestion: 'Lots of people find it hard to take tablets every day. How often would you say you miss a dose?',
  hint: 'Normalise it, then ask about missed doses.',
  why: 'Non-adherence is common, usually hidden, and changes the plan entirely. Normalising it gets an honest answer.',
  defaultAnswer: 'I don’t have anything regular to take.',
});

export const dhSideEffects = item({
  id: 'dh_side_effects',
  label: 'Side effects',
  group: DH,
  match: ['side effect', 'side-effect', 'problems? with (it|the|them|your)', 'agree with you', 'any (bad )?reaction', 'unwanted'],
  modelQuestion: 'Have you had any side effects or problems with your medicines?',
  hint: 'Ask open, then specific.',
  why: 'Side effects are the commonest reason people stop medicines.',
  defaultAnswer: 'No problems, no.',
});

export const dhOtc = item({
  id: 'dh_otc',
  label: 'OTC / herbal',
  group: DH,
  match: [
    'over the counter',
    '\\botc\\b',
    'herbal',
    'supplement',
    'vitamin',
    'bought',
    'chemist|pharmacy|shop',
    'st john',
    'alternative|natural remed',
  ],
  modelQuestion: 'Do you take anything you’ve bought yourself — over-the-counter, herbal remedies or supplements?',
  hint: 'Bought medicines and herbal remedies.',
  why: 'Patients rarely volunteer OTC or herbal products — NSAIDs and St John’s wort cause real harm.',
  defaultAnswer: 'No, nothing like that.',
});

export const dhAllergies = item({
  id: 'dh_allergies',
  label: 'Allergies',
  group: DH,
  match: ['allerg', 'reaction to (any|a) (medic|drug|tablet)'],
  modelQuestion: 'Do you have any allergies to medicines? What happened when you reacted?',
  hint: 'Allergies — and what the reaction was.',
  why: 'Always clarify the reaction: rash or anaphylaxis versus a side effect such as nausea.',
  defaultAnswer: 'No allergies that I know of.',
});

export const dhRecreational = item({
  id: 'dh_recreational',
  label: 'Recreational drugs',
  group: DH,
  weight: 'extra',
  match: [
    'recreational',
    'street drugs',
    'illicit',
    'cannabis|cocaine|\\bweed\\b|ecstasy|mdma|amphetamine|speed',
    'substance',
    'drugs? (that|which) (are|aren t) prescribed',
    'any drugs',
  ],
  modelQuestion: 'Some people use recreational drugs — is that something you’ve ever done?',
  hint: 'Recreational drugs, asked without judgement.',
  why: 'Stimulants cause palpitations; cannabis and alcohol affect mood and interact with medicines.',
  defaultAnswer: 'No, never.',
});

export const alcohol = item({
  id: 'alcohol',
  label: 'Alcohol',
  weight: 'extra',
  match: ['alcohol', 'drink', 'units', 'pints|wine|beer|spirits|vodka'],
  modelQuestion: 'How much alcohol do you drink in a typical week?',
  hint: 'Quantify alcohol in units.',
  why: 'Alcohol drives pancreatitis, AF and low mood, and interacts with many medicines.',
  defaultAnswer: 'Just the odd drink at weekends, a few units.',
});

export const smoking = item({
  id: 'smoking',
  label: 'Smoking',
  weight: 'extra',
  match: ['smok', 'cigarett', 'vape|vaping', 'tobacco'],
  modelQuestion: 'Do you smoke or vape?',
  hint: 'Smoking and vaping.',
  why: 'Smoking worsens Crohn’s disease and is a cardiovascular risk factor.',
  defaultAnswer: 'No, I’ve never smoked.',
});

/* ------------------------------------------------------------------ */
/* Investigations library — shared match patterns                      */
/* ------------------------------------------------------------------ */

export const IX: Record<string, { label: string; match: string[]; category: string }> = {
  obs: {
    label: 'Observations / NEWS2',
    match: ['\\bobs\\b', 'observation', 'news', 'vital', 'heart rate|blood pressure|temperature|sats'],
    category: 'Bedside',
  },
  urine_dip: {
    label: 'Urine dipstick',
    match: ['urine dip', 'urinalysis', 'dipstick', 'dip (the )?urine', 'urine (test|sample)'],
    category: 'Bedside',
  },
  upt: { label: 'Urine pregnancy test', match: ['pregnan', '\\bhcg\\b', 'upt'], category: 'Bedside' },
  ecg: { label: '12-lead ECG', match: ['\\becg\\b', 'electrocardio', '\\bekg\\b'], category: 'Bedside' },
  fbc: {
    label: 'Full blood count',
    match: ['\\bfbc\\b', 'full blood count', 'blood count', 'haemoglobin|hemoglobin|\\bhb\\b', 'white cell|\\bwcc\\b'],
    category: 'Bloods',
  },
  crp: { label: 'CRP', match: ['\\bcrp\\b', 'c reactive', 'esr', 'inflammatory markers'], category: 'Bloods' },
  ue: {
    label: 'U&Es',
    match: [
      '\\bu (and )?es?\\b',
      '\\bues?\\b',
      'urea',
      'electrolyte',
      'renal function',
      'kidney function',
      'creatinine',
      'sodium',
      'potassium',
      'egfr',
    ],
    category: 'Bloods',
  },
  lft: { label: 'LFTs', match: ['\\blft', 'liver function', 'bilirubin', '\\balp\\b', 'alt\\b', 'albumin'], category: 'Bloods' },
  amylase: { label: 'Amylase / lipase', match: ['amylase', 'lipase'], category: 'Bloods' },
  gs: {
    label: 'Group & save',
    match: ['group (and )?save', '\\bg (and )?s\\b', 'crossmatch|cross match', 'blood group'],
    category: 'Bloods',
  },
  cultures: { label: 'Blood cultures', match: ['blood culture', 'cultures'], category: 'Bloods' },
  tft: {
    label: 'TFTs',
    match: ['\\btft', 'thyroid function', '\\btsh\\b', '\\bt4\\b', 'thyroxine level', 'thyroid (test|blood)'],
    category: 'Bloods',
  },
  glucose: { label: 'Glucose / HbA1c', match: ['glucose', 'hba1c', 'a1c', 'sugar'], category: 'Bloods' },
  calcium: { label: 'Calcium', match: ['calcium', 'bone profile'], category: 'Bloods' },
  haematinics: {
    label: 'Haematinics (ferritin, B12, folate)',
    match: ['haematinic', 'ferritin', 'b12', 'folate', 'iron (studies|levels)'],
    category: 'Bloods',
  },
  coeliac: {
    label: 'Coeliac serology (tTG-IgA)',
    match: ['coeliac|celiac', 'ttg', 'tissue transglutaminase', 'ema\\b'],
    category: 'Bloods',
  },
  lipids: { label: 'Lipids', match: ['lipid', 'cholesterol'], category: 'Bloods' },
  prolactin: { label: 'Prolactin', match: ['prolactin'], category: 'Bloods' },
  magnesium: { label: 'Magnesium', match: ['magnesium', '\\bmg\\b level'], category: 'Bloods' },
  calprotectin: { label: 'Faecal calprotectin', match: ['calprotectin', '\\bfcp\\b'], category: 'Stool' },
  stool_mcs: {
    label: 'Stool culture + C. difficile',
    match: ['stool (culture|sample|mc|micro)', 'c ?diff', 'clostridi', 'stool test'],
    category: 'Stool',
  },
  fit: { label: 'FIT (faecal immunochemical test)', match: ['\\bfit\\b', 'faecal immuno', 'occult blood'], category: 'Stool' },
  us_abdo: { label: 'Abdominal ultrasound', match: ['ultrasound', '\\buss\\b', '\\bus\\b (abdo|scan)', 'sonograph'], category: 'Imaging' },
  tvus: {
    label: 'Transvaginal ultrasound',
    match: ['transvaginal', '\\btvus\\b', 'tv ultrasound', 'pelvic ultrasound'],
    category: 'Imaging',
  },
  ct_ap: { label: 'CT abdomen/pelvis', match: ['\\bct\\b', 'computed tomog', 'cat scan'], category: 'Imaging' },
  mrcp: { label: 'MRCP', match: ['mrcp', 'magnetic resonance cholang'], category: 'Imaging' },
  colonoscopy: {
    label: 'Colonoscopy with biopsies',
    match: ['colonoscop', 'endoscop', 'scope', 'ileocolonoscop', 'biops'],
    category: 'Referral',
  },
  echo: { label: 'Echocardiogram', match: ['echo', 'tte\\b', 'heart ultrasound'], category: 'Imaging' },
  holter: {
    label: 'Ambulatory ECG (Holter / event recorder)',
    match: ['holter', 'ambulatory', '24 ?h(ou)?r', '48 ?h', '7 day', 'event recorder', 'loop recorder', 'patch monitor', 'zio'],
    category: 'Bedside',
  },
  cxr: { label: 'Chest X-ray', match: ['chest x ?ray', '\\bcxr\\b'], category: 'Imaging' },
  trab: {
    label: 'TSH receptor antibodies',
    match: ['trab', 'tsh receptor', 'receptor antibod', 'thyroid antibod', 'anti tpo|tpo'],
    category: 'Bloods',
  },
  phq9: {
    label: 'PHQ-9 / GAD-7',
    match: ['phq', 'gad ?7', 'questionnaire', 'hads', 'rating scale', 'severity score'],
    category: 'Bedside',
  },
  uds: { label: 'Urine drug screen', match: ['drug screen', 'tox(icology)? screen', 'urine drug'], category: 'Bedside' },
  weight_bmi: { label: 'Weight, height, BMI, waist', match: ['weight', 'height', '\\bbmi\\b', 'waist'], category: 'Bedside' },
  bp: { label: 'Blood pressure & pulse', match: ['blood pressure', '\\bbp\\b', 'pulse'], category: 'Bedside' },
};

/** Build a case's investigation item from the shared library */
export const ix = (id: keyof typeof IX, weight: Weight, why: string, reasonMatch?: string[]): ReasonItem => ({
  id,
  label: IX[id].label,
  match: IX[id].match,
  category: IX[id].category,
  weight,
  why,
  reasonMatch,
});

/** Build any other reasoning item */
export const r = (
  id: string,
  label: string,
  weight: Weight,
  match: string[],
  why: string,
  reasonMatch?: string[],
  category?: string,
): ReasonItem => ({ id, label, weight, match, why, reasonMatch, category });

/** The plan shown before a Viva block */
export const VIVA_FLOW = [
  'Answer in headlines first, then expand: one point per line.',
  'For "why" questions, give the mechanism, then the consequence.',
  'With results: say what is abnormal, the likely cause, then what you would do.',
  'If you are unsure, reason aloud from first principles: examiners reward structure.',
];
