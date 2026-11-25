import { r } from '../common';
import type { VivaQuestion } from '../types';

/**
 * Viva questions for the low mood patients.
 * tier 1 recall · tier 2 explain why (+ examiner probe) · tier 3 data and what-ifs.
 * Verify against NICE NG222, CG185, the BNF and AUDIT guidance before release.
 */
export const lowMoodViva: Record<string, VivaQuestion[]> = {
  depression_new: [
    {
      id: 'dep-criteria',
      tier: 1,
      prompt: 'What are the core symptoms of depression, and how long must symptoms last?',
      items: [
        r('mood', 'Low mood', 'core', ['low mood|depressed mood|\\bsad'], 'Most of the day, most days.'),
        r(
          'anhedonia',
          'Loss of interest or pleasure (anhedonia)',
          'core',
          ['anhedon|interest|pleasure|enjoy'],
          'Often more telling than sadness.',
        ),
        r(
          'duration',
          'Most days, for at least 2 weeks',
          'core',
          ['2 weeks|two weeks|fortnight|14 days'],
          'The minimum for a depressive episode.',
        ),
        r('energy', 'Low energy (a core symptom in ICD-10)', 'extra', ['energy|fatigue|tired'], 'ICD-10 lists three core symptoms.'),
      ],
    },
    {
      id: 'dep-phq9',
      tier: 1,
      prompt: 'What does the PHQ-9 measure, and which score marks "more severe" depression in NICE NG222?',
      items: [
        r(
          'measures',
          'Severity of depressive symptoms over the last 2 weeks (9 items, scored 0–27)',
          'core',
          ['severity|symptom|0 ?27|\\b27\\b'],
          'Each item scores 0–3.',
        ),
        r(
          'cutoff',
          '16 or more = more severe',
          'core',
          ['\\b16\\b|sixteen'],
          'NICE NG222 uses a PHQ-9 of 16 or more for more severe depression.',
        ),
        r(
          'track',
          'Repeat it to track response to treatment',
          'extra',
          ['track|monitor|response|repeat'],
          'A falling score shows progress.',
        ),
      ],
    },
    {
      id: 'dep-combination',
      tier: 2,
      prompt: 'Why combine CBT with an antidepressant for her, rather than use either alone?',
      items: [
        r(
          'evidence',
          'For more severe depression, NICE NG222 rates the combination as most effective',
          'core',
          ['most effective|more effective|\\bnice\\b|combination|better|evidence'],
          'The strongest first-line option.',
        ),
        r(
          'mechanisms',
          'Therapy tackles thoughts and behaviours; medication helps biological symptoms',
          'core',
          ['thought|behavio|cognitive|biolog|sleep|energy'],
          'Different targets.',
        ),
        r(
          'relapse',
          'CBT skills lower the risk of relapse after stopping medication',
          'extra',
          ['relapse|skills|long ?term|recurr'],
          'Skills persist; tablets stop.',
        ),
        r(
          'choice',
          'Her preference still decides: shared decision-making',
          'extra',
          ['prefer|choice|shared'],
          'NICE puts preference at the centre.',
        ),
      ],
      probe: {
        prompt: "She'd rather not take tablets. What then?",
        items: [
          r(
            'therapy',
            'Offer individual CBT or behavioural activation alone',
            'core',
            ['\\bcbt\\b|behavioural activation|\\bba\\b|therapy|psycholog'],
            'A valid NICE option.',
          ),
          r(
            'revisit',
            'Review progress and revisit medication if she does not improve',
            'core',
            ['review|revisit|reconsider|if (she|no)'],
            'The decision is not final.',
          ),
          r(
            'safety',
            'Keep a safety plan in place: she has suicidal thoughts',
            'core',
            ['safety|crisis|\\brisk'],
            'Whatever the treatment.',
          ),
        ],
      },
    },
    {
      id: 'dep-jittery',
      tier: 3,
      prompt: 'Ten days after starting sertraline she feels "jittery", is sleeping badly, and her mood is unchanged. What do you advise?',
      items: [
        r(
          'common',
          'Early activation is a common side effect and usually settles in 1–2 weeks',
          'core',
          ['activation|common|settle|side effect|usually'],
          'Reassure, and review.',
        ),
        r(
          'early',
          'Too early to judge: it takes about 4 weeks to work',
          'core',
          ['too early|4 weeks|four weeks|takes? time|\\bweeks'],
          'Do not switch yet.',
        ),
        r(
          'risk',
          'Ask about suicidal thoughts: activation can raise risk',
          'redflag',
          ['suicid|\\brisk|self ?harm|thoughts'],
          'Especially early in treatment.',
        ),
        r(
          'tips',
          'Take it in the morning; sleep hygiene; review again soon',
          'extra',
          ['morning|sleep hygiene|review|follow ?up'],
          'Practical steps.',
        ),
      ],
    },
  ],

  ssri_adherence: [
    {
      id: 'ssri-discontinuation',
      tier: 1,
      prompt: 'What is antidepressant discontinuation syndrome, and how do you avoid it?',
      items: [
        r(
          'symptoms',
          'Dizziness, "brain zaps", irritability, anxiety, flu-like symptoms, poor sleep',
          'core',
          ['dizz|zap|electric|irritab|anxi|\\bflu|sleep'],
          'Starts within days of stopping or missing doses.',
        ),
        r(
          'shorthalf',
          'Worst with short half-life drugs: paroxetine, venlafaxine',
          'core',
          ['paroxetine|venlafaxine|short half'],
          'Levels fall fastest.',
        ),
        r('taper', 'Avoid it by tapering slowly, not stopping suddenly', 'core', ['taper|gradual|slow'], 'Over weeks, sometimes months.'),
        r('fluoxetine', 'Least with fluoxetine (long half-life)', 'extra', ['fluoxetine|long half'], 'It tapers itself.'),
      ],
    },
    {
      id: 'ssri-sexual',
      tier: 1,
      prompt: 'Which antidepressants are less likely to cause sexual dysfunction?',
      items: [
        r('mirtazapine', 'Mirtazapine', 'core', ['mirtazapine'], 'But sedation and weight gain are common.'),
        r('others', 'Vortioxetine or agomelatine', 'extra', ['vortioxetine|agomelatine'], 'Agomelatine needs liver function monitoring.'),
      ],
      distractors: [
        { label: 'Paroxetine', match: ['paroxetine'], whyNot: 'Paroxetine is one of the worst for sexual side effects.' },
        { label: 'Venlafaxine', match: ['venlafaxine'], whyNot: 'SNRIs cause sexual dysfunction at rates similar to SSRIs.' },
      ],
    },
    {
      id: 'ssri-alcohol',
      tier: 2,
      prompt: 'Why does his alcohol use matter for his antidepressant treatment?',
      items: [
        r(
          'mood',
          'Alcohol is a depressant: it worsens mood and blunts the response to treatment',
          'core',
          ['depressant|worsen|mood|response'],
          'Treat both together.',
        ),
        r('risk', 'It increases impulsivity and suicide risk', 'core', ['impuls|suicid|\\brisk'], 'A key risk factor.'),
        r(
          'interaction',
          'It adds sedation (e.g. with mirtazapine) and makes overdose more dangerous',
          'core',
          ['sedat|drows|overdose|interact'],
          'Especially with sedating drugs.',
        ),
        r(
          'adherence',
          'Heavy drinking undermines adherence',
          'extra',
          ['adheren|forget|\\bmiss'],
          'Missed doses, then discontinuation symptoms.',
        ),
      ],
      probe: {
        prompt: 'He asks if he can just stop drinking completely tomorrow. What do you say?',
        items: [
          r(
            'withdrawal',
            'Check for dependence first: stopping suddenly can cause withdrawal seizures or delirium tremens',
            'redflag',
            ['withdraw|seizure|delirium|\\bdts?\\b|dependen'],
            'Sudden cessation can be dangerous.',
          ),
          r(
            'plan',
            'If dependent, plan a medically assisted withdrawal',
            'core',
            ['assisted|detox|\\bplan|chlordiazepoxide|gradual'],
            'With specialist support.',
          ),
          r(
            'support',
            'Refer to alcohol services; consider thiamine',
            'extra',
            ['alcohol service|specialist|refer|thiamine'],
            'Prevents Wernicke’s encephalopathy.',
          ),
        ],
      },
    },
    {
      id: 'ssri-bloods',
      tier: 3,
      prompt: 'Interpret these results.',
      data: 'AUDIT score 21 · GGT 180 U/L · ALT 52 U/L · MCV 104 fL',
      items: [
        r(
          'audit',
          'AUDIT 20 or more: possible alcohol dependence',
          'core',
          ['dependen|\\b20\\b|\\b21\\b|possible'],
          'Scores: 8–15 increasing risk, 16–19 higher risk, 20+ possible dependence.',
        ),
        r(
          'markers',
          'Raised GGT and macrocytosis fit heavy drinking',
          'core',
          ['\\bggt\\b|macrocyt|\\bmcv\\b|alcohol'],
          'Supportive, not diagnostic.',
        ),
        r(
          'refer',
          'Refer to specialist alcohol services; assess withdrawal risk before he cuts down',
          'core',
          ['refer|specialist|alcohol service|withdraw'],
          'Safety first.',
        ),
        r(
          'other',
          'Check B12, folate and thyroid as other causes of macrocytosis',
          'extra',
          ['\\bb12\\b|folate|thyroid|\\btft'],
          'Do not assume alcohol.',
        ),
      ],
    },
  ],

  bipolar: [
    {
      id: 'bp-mania',
      tier: 1,
      prompt: 'How do you distinguish hypomania from mania?',
      items: [
        r(
          'duration',
          'Duration: hypomania at least 4 days, mania at least 1 week',
          'core',
          ['4 days|four days|1 week|one week|7 days|a week'],
          'DSM-5 thresholds.',
        ),
        r(
          'impairment',
          'Mania causes marked impairment or needs hospital admission',
          'core',
          ['impair|hospital|admi|function|severe'],
          'Hypomania does not.',
        ),
        r('psychosis', 'Psychotic features mean mania by definition', 'core', ['psycho|delusion|hallucin'], 'Whatever the duration.'),
      ],
    },
    {
      id: 'bp-lithium-se',
      tier: 1,
      prompt: 'What are the side effects of lithium?',
      items: [
        r('tremor', 'Fine tremor', 'core', ['tremor'], 'A coarse tremor suggests toxicity.'),
        r(
          'renal',
          'Polyuria and thirst (nephrogenic diabetes insipidus); CKD long term',
          'core',
          ['polyuria|thirst|polydipsia|diabetes insipidus|renal|kidney|\\bckd\\b'],
          'Monitor eGFR.',
        ),
        r('thyroid', 'Hypothyroidism', 'core', ['\\bhypothyroid|underactive thyroid'], 'Check TFTs every 6 months.'),
        r('other', 'Weight gain, hyperparathyroidism (raised calcium)', 'extra', ['weight|parathyroid|calcium'], 'Check calcium too.'),
        r(
          'pregnancy',
          "Teratogenic: cardiac malformations such as Ebstein's anomaly",
          'extra',
          ['ebstein|teratogen|pregnan|cardiac malformation'],
          'Plan pregnancies with a specialist.',
        ),
      ],
    },
    {
      id: 'bp-nsaids',
      tier: 2,
      prompt: 'Once he is on lithium, why must he avoid NSAIDs and dehydration?',
      items: [
        r(
          'narrow',
          'Lithium has a narrow therapeutic index and is cleared by the kidneys',
          'core',
          ['narrow|therapeutic|kidney|renal|excret|clear'],
          'Small changes in clearance matter.',
        ),
        r(
          'drugs',
          'NSAIDs (and ACE inhibitors, ARBs, thiazides) reduce lithium clearance, so levels rise',
          'core',
          ['nsaid|ibuprofen|\\bace\\b|ace inhibitor|\\barb|thiazide|diuretic'],
          'Check before any new prescription.',
        ),
        r(
          'fluids',
          'Dehydration (vomiting, diarrhoea, heat) raises levels: toxicity',
          'core',
          ['dehydrat|vomit|diarr|heat|fluid'],
          'Sick-day advice matters.',
        ),
      ],
      probe: {
        prompt: 'What monitoring does lithium need?',
        items: [
          r('timing', 'Levels 12 hours after the dose', 'core', ['12 ?h|twelve'], 'A trough level.'),
          r(
            'frequency',
            'Weekly after starting and after each dose change, then every 3 months',
            'core',
            ['weekly|3 months|three months|every week'],
            'Then every 6 months for many people after the first year.',
          ),
          r(
            'bloods',
            'Kidney function, thyroid function and calcium every 6 months',
            'core',
            ['renal|kidney|\\bu ?e|egfr|thyroid|\\btft|calcium|6 months'],
            'Plus weight.',
          ),
          r('target', 'Usual target 0.6–0.8 mmol/L', 'extra', ['0 ?6|0 ?8|target'], 'NICE CG185.'),
        ],
      },
    },
    {
      id: 'bp-toxicity',
      tier: 3,
      prompt: 'Six months into lithium, what is happening, and what do you do?',
      data: 'Lithium level 1.8 mmol/L (12-hour) · coarse tremor, vomiting, confusion · started ibuprofen for back pain last week',
      items: [
        r('toxicity', 'Lithium toxicity', 'redflag', ['toxic'], 'A medical emergency.'),
        r(
          'cause',
          'Likely precipitated by ibuprofen (reduced clearance), worsened by vomiting',
          'core',
          ['ibuprofen|nsaid|clearance|vomit|dehydrat'],
          'Find and remove the cause.',
        ),
        r('stop', 'Stop lithium and the ibuprofen', 'core', ['stop|withhold|omit'], 'Immediately.'),
        r(
          'admit',
          'Admit: IV fluids, U&E and repeat levels, monitoring',
          'core',
          ['admit|hospital|iv fluid|fluid|\\bu ?e|repeat'],
          'Levels can keep rising.',
        ),
        r('dialysis', 'Haemodialysis if severe or with kidney impairment', 'extra', ['dialys'], 'Specialist decision.'),
      ],
    },
  ],
};
