import { alcohol, item, openQuestion, r } from '../common';
import { lowMood } from '../presentations/low-mood';
import {
  type CaseFile,
  type ChecklistItem,
  type Distractor,
  type Presentation,
  type Purpose,
  PURPOSE_NAMES,
  type ReasonItem,
  type Weight,
} from '../types';

/**
 * Deep dive: Depression (UKMLA condition) → sertraline.
 *  Set 1 "Why?"   — purpose-led history: each question tagged exclude / risk factor / severity
 *  Set 2 "Ladder" — investigations, then first / second / third line, then choose the drug
 *  Set 3 "Counsel"— a counselling session for sertraline; the patient asks back
 *  Set 4 "PSA"    — write the prescription, review interactions, monitoring, data, viva
 *
 * Sets 1–2 reuse the low mood patients (Laura, Michael, Tom). Sets 3–4 use
 * Laura plus two prescribing patients (Jade, 19; Arthur, 74).
 * Clinical content: verify against NICE NG222 and the BNF before release.
 */

const base = (id: string): CaseFile => {
  const c = lowMood.cases.find((x) => x.id === id);
  if (!c) throw new Error(`low-mood case ${id} not found`);
  return c;
};

const fromLowMood = (sectionId: string, itemId: string): ChecklistItem => {
  const it = lowMood.sections.find((s) => s.id === sectionId)?.checklist?.find((i) => i.id === itemId);
  if (!it) throw new Error(`low-mood item ${sectionId}/${itemId} not found`);
  return it;
};

/** Tag a history item with what it's for */
const why = (it: ChecklistItem, purpose: Purpose, target: string, weight?: Weight): ChecklistItem => ({
  ...it,
  purpose,
  target,
  group: PURPOSE_NAMES[purpose],
  weight: weight ?? (it.weight === 'redflag' ? 'redflag' : 'core'),
});

/* ------------------------------------------------------------------ */
/* Set 1 — targeted history: why are you asking?                        */
/* ------------------------------------------------------------------ */

const whyChecklist: ChecklistItem[] = [
  openQuestion,
  why(fromLowMood('hpc', 'mood_onset'), 'severity', 'Duration: most days for 2+ weeks makes it a depressive episode'),
  why(fromLowMood('hpc', 'mood_function'), 'severity', 'Impact on work and home grades the severity'),
  why(fromLowMood('hpc', 'mood_sleep'), 'severity', 'Biological symptoms (sleep, appetite) count towards severity'),
  why(fromLowMood('risk', 'risk_si'), 'severity', 'Suicidal thoughts: risk to self sets the urgency'),
  why(fromLowMood('risk', 'risk_plan'), 'severity', 'Plans or intent mean same-day crisis care'),
  why(fromLowMood('hpc', 'mood_mania'), 'exclude', 'Bipolar disorder: an antidepressant alone can trigger mania'),
  why(fromLowMood('hpc', 'mood_psychosis'), 'exclude', 'Psychotic depression: needs urgent specialist care'),
  why(
    item({
      id: 'dd_organic',
      label: 'Physical symptoms',
      match: [
        '\\bcold\\b',
        'weight gain|put on weight|gained weight',
        'constipat',
        'dry skin|\\bhair\\b',
        'thyroid',
        'breathless|\\bpale\\b|anaemi',
        'heavy periods',
        'physical (symptoms|changes)',
      ],
      modelQuestion:
        'Have you noticed any physical changes, like feeling the cold, putting on weight, constipation, or feeling breathless and pale?',
      hint: 'Physical symptoms that could explain it.',
      why: 'Hypothyroidism and anaemia mimic depression; treat the cause.',
      defaultAnswer: 'No, nothing physical that I have noticed.',
    }),
    'exclude',
    'Organic causes: hypothyroidism, anaemia',
  ),
  why(
    item({
      id: 'dd_drugs',
      label: 'Medicines and drugs',
      match: ['medic', 'tablet', 'steroid|prednis', 'isotretinoin|roaccutane|acne', 'recreational|cannabis|\\bweed\\b|cocaine|\\bdrugs\\b'],
      modelQuestion: 'Are you taking any medicines, such as steroids or acne tablets, or using any recreational drugs?',
      hint: 'Medicines and substances that lower mood.',
      why: 'Steroids, isotretinoin and cannabis can all lower mood.',
      defaultAnswer: 'No medicines, and no drugs.',
    }),
    'exclude',
    'Drug- or substance-induced low mood (steroids, isotretinoin, cannabis)',
  ),
  why(
    // narrower than the PPH block's patterns, so "ever felt high?" isn't counted as this
    {
      ...fromLowMood('pph', 'pph_previous'),
      match: [
        'before',
        'previous',
        'past (episode|history)',
        'ever (had|been|felt) (like this|this (low|way|bad)|depressed|low)',
        'first time',
      ],
    },
    'risk',
    'Previous episodes: the strongest predictor of another',
  ),
  why(
    item({
      id: 'dd_fh',
      label: 'Family history',
      match: ['family', 'run in', 'parents|\\bmum\\b|\\bdad\\b|mother|father|brother|sister|relative'],
      modelQuestion: 'Has anyone in your family had depression or bipolar disorder, or taken their own life?',
      hint: 'Mental illness and suicide in the family.',
      why: 'A family history of depression, bipolar disorder or suicide raises risk, and bipolar in a relative means looking harder for highs.',
      defaultAnswer: 'Not that I know of.',
    }),
    'risk',
    'Family history of depression, bipolar disorder or suicide',
  ),
  why(fromLowMood('hpc', 'mood_trigger'), 'risk', 'Life events: job loss, bereavement, a relationship ending'),
  why(
    item({
      id: 'dd_social',
      label: 'Support and living situation',
      match: [
        'live with|living (with|alone|on your own)|on your own|\\balone\\b',
        'support',
        'friends',
        'partner|\\bwife\\b|husband',
        'lonely|isolat',
        'turn to',
      ],
      modelQuestion: 'Who do you live with, and who can you turn to for support?',
      hint: 'Support and isolation.',
      why: 'Isolation raises both depression and suicide risk; support shapes the safety plan.',
      defaultAnswer: 'I have a few people around.',
    }),
    'risk',
    'Isolation and little support',
  ),
  why(
    item({
      id: 'dd_chronic',
      label: 'Long-term illness or pain',
      match: [
        'long ?term',
        'chronic',
        'ongoing',
        'medical (history|conditions?|problems)',
        'physical (health|illness|conditions?|problems)',
        'illness',
        '\\bpain\\b',
      ],
      modelQuestion: 'Do you have any long-term physical health conditions, or ongoing pain?',
      hint: 'Physical illness and pain.',
      why: 'Chronic illness and pain raise the risk of depression and change drug choices.',
      defaultAnswer: 'No, I am physically well.',
    }),
    'risk',
    'Long-term physical illness or pain',
  ),
  why(alcohol, 'risk', 'Alcohol: worsens mood and raises suicide risk'),
];

/* ------------------------------------------------------------------ */
/* Set 3 — counselling: starting sertraline                             */
/* ------------------------------------------------------------------ */

const G = {
  setup: 'Set up',
  what: 'What and how',
  se: 'Side effects',
  safety: 'Safety',
  life: 'Interactions and lifestyle',
  follow: 'Follow-up',
};
const tagged = (tag: string) => (c: CaseFile) => !!c.tags?.includes(tag);

const counselChecklist: ChecklistItem[] = [
  item({
    id: 'cs_ideas',
    label: 'What they know and fear',
    group: G.setup,
    weight: 'extra',
    match: [
      'what do you (already )?know',
      'have you (heard|read|taken|had|been on)',
      'how do you feel about',
      'any (worries|concerns)',
      'what (have you been|were you) told',
      'what are your thoughts',
      'anything (worrying|you re worried)',
    ],
    modelQuestion: 'Before I explain, what do you already know about sertraline, and is there anything worrying you about starting it?',
    hint: 'Start from their ideas and concerns.',
    why: 'Explaining from what they already believe makes the rest stick.',
    defaultAnswer: 'Not much, just that it’s an antidepressant.',
  }),
  item({
    id: 'cs_what',
    label: 'What it is and how it works',
    group: G.what,
    match: [
      'antidepress',
      '\\bssri',
      'serotonin',
      'chemical',
      'messenger',
      'lift (your )?mood',
      'help (with )?(your )?(mood|depression|low mood)',
    ],
    modelQuestion:
      'Sertraline is an antidepressant, an SSRI. It raises a chemical messenger called serotonin in the brain, which helps lift your mood over time.',
    hint: 'Plain-English mechanism.',
    why: 'People take medicines they understand.',
    defaultAnswer: 'Okay, so it works on the chemicals in my brain.',
  }),
  item({
    id: 'cs_how',
    label: 'How to take it',
    group: G.what,
    match: [
      'once (a|per|every) day',
      'once daily',
      'every (day|morning|evening|night)',
      'each (day|morning|evening|night)',
      'one (tablet|a day)',
      'same time',
      'with or without food',
      'in the morning',
    ],
    modelQuestion:
      'Take one tablet once a day, at the same time each day. The morning is best if it affects your sleep. You can take it with or without food.',
    hint: 'When and how often.',
    why: 'A simple routine protects adherence.',
    defaultAnswer: 'One a day, same time. Got it.',
  }),
  item({
    id: 'cs_dose',
    label: 'Starting dose, and that it may go up',
    group: G.what,
    match: ['50 ?mg', 'fifty', '\\bdose', 'go up', 'increase (it|the dose)'],
    modelQuestion: 'We’ll start with 50 mg, and if it isn’t helping enough after a few weeks we can increase the dose.',
    hint: 'Dose and the plan to adjust it.',
    why: 'Expecting a dose change stops people thinking it has failed.',
    defaultAnswer: 'So it might go up later. Okay.',
  }),
  item({
    id: 'cs_onset',
    label: 'Takes 2–4 weeks to work',
    group: G.what,
    match: [
      '(2|two) ?(to|or)? ?(4|four) weeks',
      'few weeks',
      'couple of weeks',
      'takes? (a )?(while|time|few weeks|weeks)',
      'not (straight|right) away',
      'won t work (straight|right) away',
      'weeks (to|before)',
      'start(s)? to work|start working',
      'kick in',
    ],
    modelQuestion: 'It usually takes 2 to 4 weeks to start working, so keep taking it even if you don’t notice a difference at first.',
    hint: 'When will it help?',
    why: 'The commonest reason people stop early is expecting it to work at once.',
    defaultAnswer: 'Oh, I thought it would work straight away. Okay.',
  }),
  item({
    id: 'cs_se_common',
    label: 'Common early side effects',
    group: G.se,
    match: ['nause', '\\bsick\\b', 'stomach|tummy', 'diarr', 'headache', 'side effect', 'dry mouth', 'sweat', 'weight'],
    modelQuestion:
      'Some people get side effects in the first week or two, like feeling sick, an upset stomach or headaches. They usually settle.',
    hint: 'What to expect early on.',
    why: 'Warned-about side effects are tolerated; surprises lead to stopping.',
    defaultAnswer: 'Okay, as long as they settle.',
  }),
  item({
    id: 'cs_se_anxiety',
    label: 'Feeling more anxious at first',
    group: G.se,
    weight: 'extra',
    match: ['anxious', 'anxiety', 'agitat', 'jitter', 'restless', 'on edge', 'insomnia', 'sleep'],
    modelQuestion: 'For the first week or two some people feel more anxious or restless, or sleep badly. Let me know if that happens.',
    hint: 'Early activation.',
    why: 'Activation is common early, and worth reviewing.',
    defaultAnswer: 'Good to know. I’m anxious enough already.',
  }),
  item({
    id: 'cs_se_sexual',
    label: 'Sexual side effects',
    group: G.se,
    match: ['\\bsex', 'libido', 'orgasm', 'erect', 'ejaculat', 'intima', 'bedroom'],
    modelQuestion:
      'Some people notice changes in their sex life, like less interest or difficulty reaching orgasm. It’s common, so please tell me if it happens. There are options.',
    hint: 'Raise it yourself; patients rarely do.',
    why: 'A common, rarely volunteered reason for stopping.',
    defaultAnswer: 'Oh, okay. I’m glad you mentioned it.',
  }),
  item({
    id: 'cs_se_bleeding',
    label: 'Bruising and bleeding',
    group: G.se,
    weight: 'extra',
    match: ['bleed', 'bruis', 'blood thinn'],
    modelQuestion: 'It can make you bruise or bleed a little more easily, especially with ibuprofen or aspirin.',
    hint: 'Bleeding risk.',
    why: 'SSRIs impair platelet function; the risk rises with NSAIDs and anticoagulants.',
    defaultAnswer: 'I’ll look out for that.',
  }),
  item({
    id: 'cs_suicidality',
    label: 'Worse thoughts: get help',
    group: G.safety,
    weight: 'redflag',
    match: [
      'suicid',
      'harm(ing)? (yourself|themselves)',
      'hurt(ing)? (yourself|themselves)',
      'dark(er)? thoughts',
      'feel(ing)? worse',
      'worse before',
      'samaritans',
      '\\b111\\b',
      'crisis',
    ],
    modelQuestion:
      'A few people feel worse or have thoughts of harming themselves when they start, especially early on. If that happens, contact us straight away, or call 111 or the Samaritans.',
    hint: 'The safety-net that must not be missed.',
    why: 'Antidepressants can increase suicidal thinking early on, particularly under 25.',
    defaultAnswer: 'Okay. I’d ring you if that happened.',
  }),
  item({
    id: 'cs_stopping',
    label: 'Don’t stop suddenly',
    group: G.safety,
    match: [
      'stop(ping)? (it |taking (it|them) )?(suddenly|abruptly|all at once)',
      'don t (just )?stop',
      'do not (just )?stop',
      'withdraw',
      'discontinu',
      'taper',
      'gradual',
      'come off|coming off',
    ],
    modelQuestion:
      'Please don’t stop it suddenly, even once you’re well. That can cause dizziness and flu-like symptoms. When the time comes, we’ll reduce it gradually together.',
    hint: 'Discontinuation symptoms.',
    why: 'Sudden stopping causes discontinuation symptoms and relapse.',
    defaultAnswer: 'So I shouldn’t just stop it. Okay.',
  }),
  item({
    id: 'cs_not_addictive',
    label: 'Not addictive',
    group: G.safety,
    weight: 'extra',
    match: ['addict', 'dependen', 'hooked', 'habit ?forming', 'crave'],
    modelQuestion:
      'It isn’t addictive and you won’t crave it, but stopping suddenly can cause withdrawal-type symptoms, which is why we taper it.',
    hint: 'A very common worry.',
    why: 'Fear of addiction is a frequent reason for refusing antidepressants.',
    defaultAnswer: 'That’s a relief.',
  }),
  item({
    id: 'cs_duration',
    label: 'Continue 6+ months after feeling better',
    group: G.follow,
    match: ['6 months', 'six months', 'months after', 'keep (on )?taking (it|them) for', 'how long (you|you ll) (need|be on)'],
    modelQuestion: 'Once you feel better, we usually continue it for at least 6 months to stop the depression coming back.',
    hint: 'How long to stay on it.',
    why: 'Stopping early doubles the relapse rate.',
    defaultAnswer: 'Six months after I feel better. Okay.',
  }),
  item({
    id: 'cs_interactions',
    label: 'Other medicines and remedies',
    group: G.life,
    match: [
      'st john',
      'interact',
      'other (medicines|medications|tablets)',
      'herbal',
      'over the counter',
      'ibuprofen|naproxen|nsaid|anti ?inflammator|aspirin',
      'tramadol',
      'triptan',
      'pharmacist',
    ],
    modelQuestion:
      'Check with a pharmacist before taking other medicines. Don’t take St John’s wort with it, and try to avoid ibuprofen-type painkillers.',
    hint: 'Interactions.',
    why: 'St John’s wort, triptans and tramadol risk serotonin syndrome; NSAIDs add bleeding risk.',
    defaultAnswer: 'Okay, I’ll check first.',
  }),
  item({
    id: 'cs_alcohol',
    label: 'Alcohol',
    group: G.life,
    weight: 'extra',
    match: ['alcohol', '\\bdrink', '\\bwine\\b', '\\bbeer\\b', '\\bpints?\\b'],
    modelQuestion: 'It’s best to avoid alcohol, or keep it low: it worsens low mood and can make you drowsy with the tablets.',
    hint: 'Alcohol advice.',
    why: 'Alcohol worsens depression and adds sedation.',
    defaultAnswer: 'Fair enough.',
  }),
  item({
    id: 'cs_review',
    label: 'When you will see them again',
    group: G.follow,
    match: [
      'review',
      'follow ?up',
      'see you again',
      'see you (in|next)',
      'come back',
      'appointment',
      'check in',
      '\\bbook',
      'ring you|call you',
    ],
    modelQuestion: 'I’d like to see you again soon to check how you’re getting on. Let’s book the appointment now.',
    hint: 'Follow-up.',
    why: 'NICE: review within 2 weeks of starting (1 week if under 25 or at higher risk).',
    defaultAnswer: 'Okay, I’ll book it on the way out.',
  }),
  item({
    id: 'cs_teachback',
    label: 'Check understanding (teach-back)',
    group: G.follow,
    match: [
      '(can|could) you (tell|explain|repeat|summari[sz]e|go over)',
      'in your own words',
      'just to check',
      'summari[sz]e',
      'recap',
      'make sense',
      'what (will|would) you do',
    ],
    modelQuestion: 'Just so I know I’ve explained it well, could you tell me how you’ll take it and what you’d do if you felt worse?',
    hint: 'Ask them to say it back.',
    why: 'Teach-back catches misunderstandings before they cause harm.',
    defaultAnswer: 'So: one a day, give it a few weeks, don’t stop suddenly, and ring you if I feel worse.',
  }),
  item({
    id: 'cs_leaflet',
    label: 'Written information',
    group: G.follow,
    weight: 'extra',
    match: ['leaflet', 'written', 'website', 'nhs (website|app)', 'read (more|about)'],
    modelQuestion: 'I’ll give you a leaflet as well, and the NHS website has good information.',
    hint: 'Something to take away.',
    why: 'People forget most of what they hear in a consultation.',
    defaultAnswer: 'Thanks, that’ll help.',
  }),
  /* patient-specific */
  item({
    id: 'cs_sjw',
    label: 'Stop St John’s wort',
    group: G.life,
    match: ['st john'],
    modelQuestion:
      'Please stop the St John’s wort: with sertraline it can cause a dangerous reaction, and it can also make your pill less effective.',
    hint: 'She is taking a herbal remedy.',
    why: 'St John’s wort plus an SSRI risks serotonin syndrome, and it induces liver enzymes that make the combined pill less reliable.',
    appliesTo: tagged('sjw'),
  }),
  item({
    id: 'cs_sodium',
    label: 'Low sodium: blood tests',
    group: G.safety,
    match: ['sodium', '\\bsalt\\b', 'blood test', '\\bbloods\\b'],
    modelQuestion:
      'Because you take a water tablet, sertraline can lower your sodium. We’ll do a blood test before you start and again soon after, and tell us if you feel confused or very drowsy.',
    hint: 'He is older and on a thiazide.',
    why: 'Older age plus a thiazide is the classic set-up for SSRI-associated hyponatraemia.',
    appliesTo: tagged('older-thiazide'),
  }),
  item({
    id: 'cs_nsaid',
    label: 'Swap naproxen for paracetamol',
    group: G.life,
    match: ['naproxen', 'paracetamol', 'anti ?inflammator', '\\bnsaid', 'stomach (protect|lining)', '\\bppi\\b|omeprazole|lansoprazole'],
    modelQuestion:
      'Naproxen and sertraline together raise the risk of bleeding from the stomach, so let’s swap the naproxen for paracetamol.',
    hint: 'He takes an NSAID.',
    why: 'SSRI plus NSAID markedly raises the risk of upper GI bleeding.',
    appliesTo: tagged('nsaid'),
  }),
  item({
    id: 'cs_review_1wk',
    label: 'See them within a week (under 25)',
    group: G.follow,
    match: ['(1|one|a) week', '7 days|seven days', 'next week', 'few days'],
    modelQuestion: 'Because you’re under 25, I’d like to see you again within a week of starting.',
    hint: 'Her age changes the review date.',
    why: 'Under 25s have a higher risk of suicidal thoughts early in treatment.',
    appliesTo: tagged('under25'),
  }),
  item({
    id: 'cs_serotonin',
    label: 'Sumatriptan: serotonin syndrome warning',
    group: G.safety,
    match: ['serotonin syndrome', 'sumatriptan|triptan', 'migraine'],
    modelQuestion:
      'You can still use sumatriptan, but together they can rarely cause serotonin syndrome, so stop and get urgent help if you become shaky, sweaty, hot or confused.',
    hint: 'She takes a triptan.',
    why: 'Triptans plus SSRIs can rarely cause serotonin syndrome; she needs to know the warning signs.',
    appliesTo: tagged('triptan'),
  }),
];

/* ------------------------------------------------------------------ */
/* Set 4 — prescribing                                                  */
/* ------------------------------------------------------------------ */

const sertralineRx: ReasonItem[] = [
  r('rx_drug', 'Sertraline', 'core', ['sertraline'], 'Use the approved (generic) name.'),
  r('rx_dose', '50 mg', 'core', ['\\b50 ?mg|fifty'], 'Start at 50 mg; increase in 50 mg steps if needed (maximum 200 mg).'),
  r('rx_route', 'Oral', 'core', ['\\boral|orally|by mouth|\\bpo\\b'], 'Route in full.'),
  r(
    'rx_freq',
    'Once daily',
    'core',
    ['once (a |per )?day|once daily|\\bod\\b|\\bdaily|every (morning|day)|\\bmane\\b|in the morning'],
    'Once a day.',
  ),
];

const tca: Distractor = {
  label: 'Amitriptyline 25 mg at night',
  match: ['amitriptyline', 'tricyclic', '\\btca\\b'],
  whyNot: 'Tricyclics are dangerous in overdose and cause anticholinergic side effects.',
};

/* ------------------------------------------------------------------ */
/* Patients                                                             */
/* ------------------------------------------------------------------ */

const lauraBase = base('depression_new');
const laura: CaseFile = {
  ...lauraBase,
  tags: [...(lauraBase.tags ?? []), 'sjw'],
  answers: {
    ...lauraBase.answers,
    dd_organic: 'No, nothing like that. I’m not feeling the cold, and my periods are normal.',
    dd_drugs: 'Just the pill, and the St John’s wort I bought. No recreational drugs.',
    dd_fh: 'My mum had postnatal depression after my brother was born, I think.',
    dd_social: 'I live alone with my cat. My sister lives nearby and pops in.',
    dd_chronic: 'No, I’ve always been healthy.',
    alcohol: 'A glass of wine most nights to help me sleep.',
    cs_ideas: 'Only what I’ve read online: that some people feel worse at first?',
    cs_sjw: 'Oh, I didn’t know it could affect my pill. I’ll stop it.',
    cs_not_addictive: 'That’s a relief. I was worried I’d get hooked.',
    cs_onset: 'A few weeks. Okay, I’ll be patient.',
    cs_alcohol: 'Fair enough. I’ll cut back.',
    cs_duration: 'Six months after I feel better. Okay.',
    cs_teachback: 'One tablet each morning, give it a few weeks, don’t stop suddenly, no St John’s wort, and ring you if I feel worse.',
  },
  concerns: [
    { itemId: 'cs_not_addictive', text: 'Will I get addicted to it? I don’t want to be on tablets forever.' },
    { itemId: 'cs_onset', text: 'How long until I start to feel better?' },
    { itemId: 'cs_sjw', text: 'Can I keep taking my St John’s wort as well?' },
    { itemId: 'cs_alcohol', text: 'Can I still have a glass of wine in the evening?' },
  ],
  openings: {
    counsel: 'The doctor said sertraline would help. I’m a bit nervous about starting tablets, to be honest.',
  },
  summaries: {
    prescribe:
      'Laura Mitchell, 32. More severe depression (PHQ-9 19); she has agreed to start an SSRI alongside CBT. Weight 61 kg, no other illnesses. Medicines: Microgynon 30 (combined pill) and St John’s wort bought online. No known drug allergies.',
  },
  reasoning: { ...lauraBase.reasoning, ladder: lauraBase.reasoning.ix, prescribe: sertralineRx },
  distractors: {
    ...lauraBase.distractors,
    prescribe: [
      { label: 'Sertraline 200 mg once daily', match: ['200 ?mg'], whyNot: 'Start at 50 mg; 200 mg is the maximum.' },
      { ...tca, whyNot: 'Tricyclics are dangerous in overdose, and she has suicidal thoughts.' },
    ],
  },
  followUps: {
    ladder: [
      {
        id: 'ladder-first',
        label: 'Severity, then first line',
        prompt: 'How severe is her depression in NICE NG222 terms, and what is first line for her?',
        items: [
          r(
            'severity',
            'More severe depression',
            'core',
            ['more severe', 'moderate'],
            'Two months of most symptoms, marked functional impact, PHQ-9 16 or more.',
          ),
          r(
            'combo',
            'Individual CBT combined with an antidepressant',
            'core',
            [
              'combin',
              '\\bcbt\\b.*(and|with|plus).*(ssri|antidepress|sertraline|medic)',
              '(ssri|antidepress|sertraline).*(and|with|plus).*(cbt|therap)',
            ],
            'NICE NG222: the most effective first-line option for more severe depression.',
          ),
          r(
            'alts',
            'Or, by preference: CBT or behavioural activation alone, or an antidepressant alone',
            'extra',
            ['behavioural activation', '\\bba\\b', '\\balone\\b', 'prefer'],
            'Offer a choice: her preference matters.',
          ),
        ],
      },
      {
        id: 'ladder-second',
        label: 'Second line',
        prompt: 'After 4 weeks on sertraline 50 mg she has improved very little. What next?',
        items: [
          r(
            'check',
            'Check adherence, side effects, and that she has had long enough',
            'core',
            ['adheren', 'side effect', 'taking it|long enough|4 weeks'],
            'Most "non-response" is under-dosing, non-adherence or impatience.',
          ),
          r(
            'increase',
            'Increase the dose (e.g. sertraline 100 mg)',
            'core',
            ['increase', '100 ?mg', 'higher dose|titrat|up the dose'],
            'Optimise the dose first if tolerated.',
          ),
          r(
            'switch',
            'Or switch: another SSRI, or another class such as mirtazapine',
            'core',
            [
              'switch',
              'another ssri|different (ssri|class)',
              'mirtazapine|venlafaxine|duloxetine|\\bsnri|citalopram|escitalopram|fluoxetine',
            ],
            'NICE NG222 second-line options.',
          ),
          r('therapy', 'Make sure CBT is under way', 'extra', ['\\bcbt\\b|therap|psycholog|talking'], 'Combination beats either alone.'),
        ],
      },
      {
        id: 'ladder-third',
        label: 'Third line',
        prompt: 'She has not responded to two antidepressants at adequate doses. What now?',
        items: [
          r(
            'refer',
            'Refer to secondary care (psychiatry)',
            'core',
            ['refer', 'psychiatr|secondary care|\\bcmht\\b|specialist'],
            'Treatment-resistant depression needs specialist input.',
          ),
          r(
            'augment',
            'Specialist augmentation: an antipsychotic (e.g. aripiprazole, quetiapine) or lithium',
            'core',
            ['augment', 'aripiprazole|quetiapine|olanzapine|antipsychotic', 'lithium'],
            'NICE NG222 third-line options.',
          ),
          r(
            'ect',
            'ECT for severe, life-threatening depression or when a rapid response is needed',
            'extra',
            ['\\bect\\b', 'electroconvulsive'],
            'Highly effective in severe depression.',
          ),
          r(
            'review_dx',
            'Review the diagnosis: bipolar? organic? alcohol or drugs?',
            'extra',
            ['diagnos', 'bipolar', 'organic|thyroid', 'alcohol|substance'],
            'Treatment resistance is a prompt to re-think the diagnosis.',
          ),
        ],
      },
      {
        id: 'ladder-choice',
        label: 'Your choice',
        prompt: 'Which antidepressant will you start today, and at what dose? You’ll counsel her on it next.',
        items: [
          r(
            'ssri',
            'An SSRI: sertraline 50 mg once daily',
            'core',
            ['sertraline', '\\bssri', 'citalopram|escitalopram|fluoxetine'],
            'SSRIs are first line: well tolerated and safer in overdose than older antidepressants.',
            ['overdose', 'toler|side effect|safe'],
          ),
        ],
        distractors: [
          tca,
          {
            label: 'Diazepam for sleep',
            match: ['diazepam|benzo|zopiclone'],
            whyNot: 'Dependence risk, and not a treatment for depression.',
          },
        ],
      },
    ],
    prescribe: [
      {
        id: 'rx-review',
        label: 'Prescription review',
        prompt: 'Her medicines are Microgynon 30 and St John’s wort, 2 tablets a day. What do you need to do before she starts sertraline?',
        items: [
          r(
            'stop_sjw',
            'Stop St John’s wort: serotonin syndrome risk with an SSRI',
            'core',
            ['st john'],
            'Herbal, but a serious interaction.',
            ['serotonin'],
          ),
          r(
            'cocp',
            'St John’s wort also makes the pill less effective (enzyme induction): use extra contraception',
            'core',
            ['less effective|less reliable|enzyme induc|induc(es|er|tion)|contracepti(ve|on) fail|extra contracept|condoms'],
            'Ask about contraception with every enzyme inducer.',
          ),
          r(
            'no_int',
            'Sertraline itself has no important interaction with the pill',
            'extra',
            ['no (significant |major |important )?interaction|doesn t interact|does not interact|safe with|fine with|continue (the )?pill'],
            'Keep the pill.',
          ),
        ],
      },
      {
        id: 'rx-monitoring',
        label: 'Drug monitoring',
        prompt: 'What monitoring and follow-up will you arrange for her?',
        items: [
          r('review', 'Review within 2 weeks (sooner if risk rises)', 'core', ['2 weeks|two weeks|fortnight'], 'NICE NG222.'),
          r('risk', 'Ask about suicidal thoughts at every review', 'core', ['\\brisk|suicid|safety'], 'Especially early on.'),
          r('phq', 'PHQ-9 to track response', 'extra', ['\\bphq|score|questionnaire'], 'Measure, don’t guess.'),
          r(
            'no_bloods',
            'No routine blood tests are needed for her',
            'extra',
            ['no (routine )?(blood|monitoring)|not (routinely )?needed|not routine'],
            'Sodium only if symptomatic or at higher risk.',
          ),
        ],
      },
      {
        id: 'rx-viva-moa',
        label: 'Viva',
        prompt: 'Explain how sertraline works, and why it takes weeks to help.',
        items: [
          r(
            'sert',
            'It blocks the serotonin transporter (SERT), so more serotonin stays in the synapse',
            'core',
            ['reuptake|transporter|\\bsert\\b|serotonin'],
            'The immediate action.',
          ),
          r(
            'delay',
            'Benefit lags by 2–4 weeks: receptor adaptation and neuroplasticity',
            'core',
            ['delay|\\blag|\\bweeks|adapt|desensiti|downregul|neuroplastic|autoreceptor'],
            'Downstream change, not the reuptake block itself.',
          ),
        ],
        distractors: [
          {
            label: 'Inhibits monoamine oxidase',
            match: ['monoamine oxidase', '\\bmaoi?\\b'],
            whyNot: 'That is how MAOIs work (e.g. phenelzine).',
          },
          { label: 'Blocks dopamine D2 receptors', match: ['\\bd2\\b', 'dopamine'], whyNot: 'That is how antipsychotics work.' },
        ],
      },
    ],
  },
};

const michaelBase = base('ssri_adherence');
const michael: CaseFile = {
  ...michaelBase,
  answers: {
    ...michaelBase.answers,
    mood_trigger: 'Work’s been stressful since the restructure, and I’ve been drinking more.',
    dd_organic: 'Not really. The GP did some bloods last year that were fine.',
    dd_drugs: 'Only the sertraline, when I take it. No drugs.',
    dd_fh: 'My dad was a heavy drinker. I don’t think anyone was diagnosed with depression.',
    dd_social: 'I live with my wife and our two teenagers. Things are tense at home.',
    dd_chronic: 'No long-term conditions.',
    alcohol: 'Probably 30 units a week, if I’m honest.',
  },
  reasoning: { ...michaelBase.reasoning, ladder: michaelBase.reasoning.ix },
  distractors: { ...michaelBase.distractors, ladder: michaelBase.distractors?.ix ?? [] },
  followUps: {
    ...michaelBase.followUps,
    ladder: [
      {
        id: 'ladder-where',
        label: 'Where is he on the ladder?',
        prompt:
          'He responded to sertraline, then relapsed after taking it on and off because of sexual side effects. What’s the next step?',
        items: [
          r(
            'adherence',
            'Address the non-adherence and the side effect behind it',
            'core',
            ['adheren', 'side effect|sexual'],
            'Intentional non-adherence has a reason: fix that.',
          ),
          r(
            'switch',
            'Switch antidepressant (e.g. mirtazapine), following BNF switching advice',
            'core',
            ['switch', 'mirtazapine|vortioxetine|agomelatine|another|different'],
            'Less sexual dysfunction.',
          ),
          r('therapy', 'Add CBT', 'core', ['\\bcbt\\b|therap|psycholog'], 'Combination for a recurrent episode.'),
          r(
            'alcohol',
            'Tackle alcohol (AUDIT, brief intervention)',
            'core',
            ['alcohol|audit|drink'],
            '30 units a week undermines everything else.',
          ),
        ],
      },
      {
        id: 'ladder-fails',
        label: 'If the switch fails',
        prompt: 'Eight weeks later he is still no better on an adequate dose of mirtazapine. Next?',
        items: [
          r(
            'optimise',
            'Check adherence and optimise the dose',
            'core',
            ['adheren|optimi|increase|dose'],
            'First, make sure the trial was adequate.',
          ),
          r('refer', 'Refer to psychiatry', 'core', ['refer|psychiatr|specialist|secondary'], 'Two failed antidepressants.'),
          r(
            'augment',
            'Specialist augmentation (antipsychotic or lithium)',
            'extra',
            ['augment|aripiprazole|quetiapine|lithium|antipsychotic'],
            'NICE NG222 third line.',
          ),
          r(
            'rethink',
            'Re-think the diagnosis and the alcohol',
            'extra',
            ['diagnos|alcohol|bipolar'],
            'Alcohol may be driving the depression.',
          ),
        ],
      },
      {
        id: 'ladder-duration',
        label: 'How long?',
        prompt: 'Once he is well again, how long should he stay on treatment, and why?',
        items: [
          r('six', 'At least 6 months after remission', 'core', ['6 months|six months'], 'The minimum for any episode.'),
          r(
            'longer',
            'Longer (around 2 years) because this is a recurrent episode',
            'core',
            ['2 years|two years|longer|recurr'],
            'Recurrent depression has a high relapse risk.',
          ),
          r('taper', 'Then taper slowly when stopping', 'extra', ['taper|gradual|slowly'], 'Avoids discontinuation symptoms.'),
        ],
      },
    ],
  },
};

const tomBase = base('bipolar');
const tom: CaseFile = {
  ...tomBase,
  answers: {
    ...tomBase.answers,
    mood_trigger: 'My PhD deadline, and I split up with my girlfriend in the summer.',
    dd_organic: 'No, physically I feel fine, just exhausted.',
    dd_drugs: 'I smoke weed at weekends. No prescribed medicines at the moment.',
    dd_fh: 'My uncle on my dad’s side had manic depression. Bipolar, I suppose.',
    dd_social: 'I share a flat with two other PhD students. I’ve been avoiding them.',
    dd_chronic: 'No, nothing.',
    alcohol: 'A few pints at the weekend.',
  },
  reasoning: { ...tomBase.reasoning, ladder: tomBase.reasoning.ix },
  distractors: { ...tomBase.distractors, ladder: tomBase.distractors?.ix ?? [] },
  followUps: {
    ladder: [
      {
        id: 'ladder-trap',
        label: 'The trap',
        prompt: 'Laura got sertraline. Why must Tom not start an antidepressant on its own?',
        items: [
          r(
            'bipolar',
            'He has bipolar disorder: a previous hypomanic or manic episode',
            'core',
            ['bipolar', 'mani|hypomani|\\bhigh\\b'],
            'The week of reduced sleep, racing thoughts and overspending.',
          ),
          r(
            'switch',
            'An antidepressant alone can trigger mania, as fluoxetine did',
            'redflag',
            ['trigger|switch|precipitat|induce|tip', 'fluoxetine'],
            'The reason to screen for highs before every antidepressant.',
          ),
          r(
            'refer',
            'Refer to specialist mental health services',
            'core',
            ['refer', 'psychiatr|\\bcmht\\b|specialist|secondary'],
            'NICE CG185.',
          ),
        ],
      },
      {
        id: 'ladder-bipolar-first',
        label: 'First line (specialist)',
        prompt: 'What are the NICE first-line options for bipolar depression?',
        items: [
          r('olz_flx', 'Fluoxetine combined with olanzapine', 'core', ['olanzapine'], 'The antipsychotic protects against a manic switch.'),
          r('quet', 'Quetiapine on its own', 'core', ['quetiapine'], 'An alternative first-line option.'),
          r('next', 'If no response: olanzapine alone, or lamotrigine', 'extra', ['lamotrigine'], 'NICE CG185.'),
        ],
      },
      {
        id: 'ladder-longterm',
        label: 'Long term',
        prompt: 'Which long-term mood stabiliser, and what do you check before starting it?',
        items: [
          r('lithium', 'Lithium (first-line long-term)', 'core', ['lithium'], 'NICE CG185.'),
          r(
            'renal',
            'Kidney function: U&E and eGFR',
            'core',
            ['\\bu (and )?es?\\b', 'renal|kidney|egfr|creatinine'],
            'Lithium is renally cleared.',
          ),
          r('thyroid', 'Thyroid function', 'core', ['\\btft|thyroid'], 'Lithium causes hypothyroidism.'),
          r('calcium', 'Calcium', 'extra', ['calcium'], 'Hyperparathyroidism.'),
          r(
            'baseline',
            'Weight or BMI, and an ECG if there is cardiovascular risk',
            'extra',
            ['weight|\\bbmi\\b', '\\becg\\b'],
            'Baselines for later comparison.',
          ),
        ],
      },
    ],
  },
};

const jade: CaseFile = {
  id: 'jade',
  diagnosis: 'Depression in a 19-year-old with migraine: starting sertraline',
  difficulty: 2,
  tags: ['under25', 'triptan'],
  patient: {
    name: 'Jade Morgan',
    age: 19,
    sex: 'female',
    setting: 'University GP practice',
    opening: 'I’m starting sertraline today. My mum’s worried about me being on antidepressants at my age.',
  },
  summary:
    'Jade Morgan, 19, first-year student. More severe depression (PHQ-9 17); she would like to start an antidepressant while waiting for CBT. Migraine without aura, using sumatriptan 50 mg about twice a month. Contraceptive implant. No known drug allergies. Weight 58 kg.',
  answers: {
    cs_ideas: 'I’ve read a bit online. Some of it was scary.',
    cs_se_common: 'Okay. As long as it’s not loads of weight.',
    cs_serotonin: 'So I can still use it, but stop and get help if I feel shaky and hot.',
    cs_suicidality: 'Okay, that’s good to know. I’d tell my mum, too.',
    cs_alcohol: 'Fine. Maybe not the big nights out, then.',
    cs_review_1wk: 'Next week. Okay, I’m around on Thursdays.',
    cs_teachback: 'One a day, give it a few weeks, be careful with the sumatriptan, and ring if I feel worse.',
  },
  concerns: [
    { itemId: 'cs_se_common', text: 'Will it make me put on weight?' },
    { itemId: 'cs_serotonin', text: 'I take sumatriptan for migraines. Is that okay with it?' },
    { itemId: 'cs_suicidality', text: 'My friend said these made her feel worse at first. Is that true?' },
    { itemId: 'cs_alcohol', text: 'Can I still drink at uni?' },
  ],
  reasoning: { prescribe: sertralineRx },
  distractors: {
    prescribe: [
      {
        label: 'Paroxetine 20 mg once daily',
        match: ['paroxetine'],
        whyNot: 'Paroxetine has the worst discontinuation symptoms and is linked to heart defects in early pregnancy.',
      },
      {
        label: 'Venlafaxine 75 mg once daily',
        match: ['venlafaxine'],
        whyNot: 'An SNRI: usually after an SSRI, and more toxic in overdose.',
      },
    ],
  },
  followUps: {
    prescribe: [
      {
        id: 'rx-triptan',
        label: 'Prescription review',
        prompt: 'She uses sumatriptan 50 mg for migraine, about twice a month. Is that a problem?',
        items: [
          r(
            'ss_risk',
            'Small risk of serotonin syndrome (triptan plus SSRI)',
            'core',
            ['serotonin'],
            'Both increase serotonergic activity.',
          ),
          r(
            'caution',
            'Not a reason to avoid either: use together with caution',
            'core',
            ['caution|can (still )?(use|take)|not (absolutely )?contraindicat|allowed|okay|ok to'],
            'The combination is commonly used.',
          ),
          r(
            'counsel',
            'Teach her the warning symptoms: agitation, tremor, sweating, fever',
            'core',
            ['agitat|tremor|sweat|fever|twitch|confus|symptom'],
            'Early recognition is what keeps it safe.',
          ),
        ],
      },
      {
        id: 'rx-review-young',
        label: 'Drug monitoring',
        prompt: 'When will you review her, and why?',
        items: [
          r('week', 'Within 1 week: she is under 25', 'redflag', ['(1|one|a) week|7 days|seven days'], 'NICE NG222.', [
            'under 25|\\bage\\b|young',
          ]),
          r(
            'why',
            'Antidepressants can increase suicidal thoughts early on in under-25s',
            'core',
            ['suicid|self ?harm|dark thoughts|worse thoughts'],
            'The reason for the early review.',
          ),
          r(
            'plan',
            'A crisis plan and how to get help between reviews',
            'core',
            ['crisis|safety ?(plan|net)|samaritans|\\b111\\b|get help'],
            'Written and shared.',
          ),
        ],
      },
      {
        id: 'rx-serotonin-syndrome',
        label: 'Data interpretation',
        prompt: 'Four days after starting, she has taken sumatriptan twice today. What is this, and what do you do?',
        data: 'HR 118 · BP 148/90 · temperature 38.4 °C · agitated, sweating, tremor · hyperreflexia with inducible clonus',
        items: [
          r(
            'ss',
            'Serotonin syndrome',
            'redflag',
            ['serotonin'],
            'Altered mental state, autonomic instability and neuromuscular excitability.',
          ),
          r('stop', 'Stop sertraline and sumatriptan', 'core', ['stop|withhold|discontinu'], 'Remove the serotonergic drugs.'),
          r('hosp', 'Urgent hospital assessment', 'core', ['hospital|admit|a ?e|emergency|999|urgent'], 'It can progress quickly.'),
          r(
            'support',
            'Supportive care: fluids, cooling, benzodiazepines for agitation',
            'extra',
            ['fluid|cool|benzo|diazepam|lorazepam|support'],
            'Most cases settle within 24 hours.',
          ),
          r('cypro', 'Severe cases: cyproheptadine (specialist)', 'extra', ['cyproheptadine'], 'A serotonin antagonist.'),
        ],
      },
      {
        id: 'rx-viva-under18',
        label: 'Viva',
        prompt: 'If she were 16, which antidepressant would NICE recommend, and how would care differ?',
        items: [
          r('flx', 'Fluoxetine', 'core', ['fluoxetine'], 'The antidepressant with the best evidence in young people.'),
          r(
            'camhs',
            'Only alongside psychological therapy, started by a specialist (CAMHS)',
            'core',
            ['camhs|specialist|child and adolescent', 'therap|\\bcbt\\b|psycholog'],
            'NICE NG134.',
          ),
        ],
      },
    ],
  },
  pearl:
    'Under 25, review within a week of starting an antidepressant. Serotonin syndrome is a triad: altered mental state, autonomic instability, and neuromuscular excitability (clonus, hyperreflexia).',
};

const arthur: CaseFile = {
  id: 'arthur',
  diagnosis: 'Depression in an older man on a thiazide and an NSAID: starting sertraline',
  difficulty: 3,
  tags: ['older-thiazide', 'nsaid'],
  patient: {
    name: 'Arthur Jenkins',
    age: 74,
    sex: 'male',
    setting: 'GP surgery',
    opening: 'My GP wants me to start this sertraline for my mood. I already take a lot of tablets, mind.',
  },
  summary:
    'Arthur Jenkins, 74. More severe depression since his wife died 18 months ago; he has agreed to start sertraline. Lives alone. Hypertension and knee osteoarthritis. Medicines: bendroflumethiazide 2.5 mg each morning, amlodipine 5 mg once daily, naproxen 500 mg twice daily. eGFR 68. Sodium 136 mmol/L. No known drug allergies.',
  answers: {
    cs_ideas: 'My daughter thinks I need them. I’m not convinced tablets fix grief.',
    cs_what: 'So it’s not a sleeping tablet, then.',
    cs_sodium: 'Blood tests before and after. I’ll tell my daughter about the confusion thing.',
    cs_nsaid: 'Paracetamol it is. My knees won’t thank you.',
    cs_se_common: 'Feeling sick I can cope with.',
    cs_review: 'Right, I’ll make the appointment on the way out.',
    cs_suicidality: 'I’ll ring if things get darker. I live on my own, you see.',
    cs_teachback: 'One in the morning, a blood test for the salt, no naproxen, and come back to see you.',
  },
  concerns: [
    { itemId: 'cs_sodium', text: 'Is it all right with my water tablet?' },
    { itemId: 'cs_nsaid', text: 'And I take naproxen for my knees. Can I carry on with that?' },
    { itemId: 'cs_se_common', text: 'At my age, what side effects should I watch out for?' },
    { itemId: 'cs_review', text: 'Do I need to come back, or just carry on with them?' },
  ],
  reasoning: { prescribe: sertralineRx },
  distractors: {
    prescribe: [
      {
        label: 'Citalopram 40 mg once daily',
        match: ['citalopram'],
        whyNot: 'Over 65, citalopram is capped at 20 mg a day because of QT prolongation, and the plan is sertraline.',
      },
      { ...tca, whyNot: 'Anticholinergic: falls, confusion and urinary retention in older people, and dangerous in overdose.' },
    ],
  },
  followUps: {
    prescribe: [
      {
        id: 'rx-interactions-older',
        label: 'Prescription review',
        prompt:
          'He takes bendroflumethiazide 2.5 mg each morning and naproxen 500 mg twice daily. Which combinations concern you, and what will you do? One point per line.',
        items: [
          r(
            'nsaid_bleed',
            'SSRI plus NSAID: higher risk of GI bleeding',
            'core',
            ['bleed|haemorrh|ulcer'],
            'SSRIs impair platelet function; NSAIDs injure the mucosa.',
          ),
          r(
            'nsaid_action',
            'Stop the naproxen (paracetamol or a topical NSAID instead), or add a PPI if it must continue',
            'core',
            ['stop (the )?naproxen|paracetamol|topical|\\bppi\\b|omeprazole|lansoprazole|gastro ?protect'],
            'Remove or protect.',
          ),
          r(
            'thiazide_na',
            'SSRI plus thiazide in an older man: hyponatraemia risk',
            'core',
            ['sodium|hyponatr'],
            'Both cause hyponatraemia; age adds to it.',
          ),
          r(
            'na_check',
            'Check sodium before starting and again soon after',
            'core',
            ['check|monitor|baseline|measure|bloods|\\bu ?e'],
            'Catch it before he becomes confused.',
          ),
        ],
      },
      {
        id: 'rx-hyponatraemia',
        label: 'Data interpretation',
        prompt: 'Three weeks later he is drowsy and confused. What is happening, and what do you do?',
        data: 'Na 124 mmol/L (135–145) · K 3.9 mmol/L · creatinine 88 µmol/L',
        items: [
          r(
            'hypona',
            'Hyponatraemia from SSRI-associated SIADH, made worse by the thiazide',
            'redflag',
            ['hyponatr', 'siadh|low sodium'],
            'A recognised SSRI adverse effect in older people.',
          ),
          r(
            'admit',
            'Same-day hospital assessment: he is confused',
            'core',
            ['admit|hospital|same ?day|urgent|a ?e|emergency'],
            'Symptomatic hyponatraemia.',
          ),
          r('stop', 'Stop sertraline and bendroflumethiazide', 'core', ['stop|withhold|discontinu'], 'Remove both causes.'),
          r(
            'workup',
            'Assess fluid status; serum and urine osmolality, urine sodium',
            'extra',
            ['fluid status|volume|osmolal|urine sodium'],
            'Confirms SIADH and excludes other causes.',
          ),
          r(
            'slow',
            'Correct slowly to avoid osmotic demyelination',
            'extra',
            ['slow|osmotic|demyelin|pontine'],
            'Rapid correction can cause permanent brain injury.',
          ),
        ],
      },
      {
        id: 'rx-viva-citalopram',
        label: 'Viva',
        prompt: 'Why sertraline rather than citalopram for him?',
        items: [
          r(
            'qt',
            'Citalopram prolongs the QT interval, and is capped at 20 mg a day over 65',
            'core',
            ['\\bqt', '20 ?mg|maximum|\\bcap'],
            'MHRA advice.',
          ),
          r(
            'evidence',
            'Sertraline has good safety evidence in older people and in heart disease',
            'extra',
            ['older|elderly|cardiac|heart|safe'],
            'Often the SSRI of choice here.',
          ),
        ],
      },
    ],
  },
  pearl:
    'In older people, think sodium and bleeding before you prescribe an SSRI: thiazides and NSAIDs make both worse. Citalopram is capped at 20 mg a day over 65 because of the QT interval.',
};

/* ------------------------------------------------------------------ */

const HISTORY_PATIENTS = ['depression_new', 'ssri_adherence', 'bipolar'];
const TREATMENT_PATIENTS = ['depression_new', 'jade', 'arthur'];

export const depressionDive: Presentation = {
  id: 'dd-depression',
  kind: 'deepdive',
  title: 'Depression',
  specialtyId: 'psych',
  ukmla: ['Mental health', 'Clinical pharmacology and therapeutics', 'Prescribing'],
  deepDive: {
    condition: 'Depression',
    treatment: 'Sertraline',
    source: 'low-mood',
    blurb: 'From a purpose-led history to the management ladder, then counselling and prescribing sertraline.',
  },
  sections: [
    {
      id: 'why',
      title: 'Targeted history: why are you asking?',
      short: 'Why?',
      kind: 'interview',
      tagPurpose: true,
      blurb: 'Ask what matters, and tag each question: exclude, risk factor, or severity.',
      targetSeconds: 300,
      checklist: whyChecklist,
      caseIds: HISTORY_PATIENTS,
      teach: ['risk-assessment', 'depression-ladder'],
      flow: [
        'Open, then establish the episode: how long, and how much it affects life.',
        'Severity and safety: biological symptoms, suicidal thoughts, plans.',
        'Exclude: highs (bipolar), voices (psychosis), physical causes (thyroid, anaemia), medicines and drugs.',
        'Risk factors: previous episodes, family history, life events, support, long-term illness, alcohol.',
        'Every question should have a reason you could say out loud.',
      ],
    },
    {
      id: 'ladder',
      title: 'Investigations and the management ladder',
      short: 'Ladder',
      kind: 'reasoning',
      blurb: 'Tests with reasons, then first, second and third line, then choose the drug.',
      targetSeconds: 300,
      prompt: 'First, which investigations would you request, and why? One per line.',
      caseIds: HISTORY_PATIENTS,
      teach: ['depression-ladder', 'bipolar'],
      flow: [
        'Exclude organic causes with targeted bloods, and grade severity with the PHQ-9.',
        'NICE NG222 splits less severe from more severe depression: first line depends on it.',
        'Second line optimises the dose or switches; third line is specialist.',
        'Choose a specific drug and dose, and know why it beats the alternatives.',
      ],
    },
    {
      id: 'counsel',
      title: 'Counselling: starting sertraline',
      short: 'Counsel',
      kind: 'counsel',
      blurb: 'Explain the treatment, answer what the patient asks back, check understanding.',
      targetSeconds: 420,
      checklist: counselChecklist,
      caseIds: TREATMENT_PATIENTS,
      teach: ['ssris', 'adherence'],
      flow: [
        'Start with what they know and what worries them.',
        'What it is and how it works, in plain words.',
        'How to take it: the dose, once a day, the same time each day.',
        'When it works (2–4 weeks) and the common early side effects.',
        'Safety: worsening thoughts mean get help; never stop suddenly.',
        'Interactions, alcohol, and how long to continue.',
        'Book the follow-up, then check understanding with teach-back.',
      ],
    },
    {
      id: 'prescribe',
      title: 'Prescribing and PSA questions',
      short: 'PSA',
      kind: 'reasoning',
      blurb: 'Write the prescription, review interactions, plan monitoring, interpret results.',
      targetSeconds: 360,
      prompt: 'Write the prescription on one line: drug, dose, route, frequency.',
      caseIds: TREATMENT_PATIENTS,
      teach: ['psa', 'ssris'],
      flow: [
        'Check allergies, weight, kidney function and the full medicines list first.',
        'Write drug, dose, route and frequency: approved name, units in full.',
        'Review every interaction: bleeding, serotonin syndrome, sodium, QT.',
        'Plan the monitoring: what, when, and who acts on it.',
        'With results: say what is abnormal, the likely cause, then what you will do.',
      ],
    },
  ],
  combos: [],
  cases: [laura, michael, tom, jade, arthur],
};
