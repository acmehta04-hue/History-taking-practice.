import { r } from '../common';
import type { DrugProfile } from '../types';
import { ONCE_DAILY, ideas, point, rxDose, rxDrug, rxFreq, rxOral, teachBack } from './build';

/** Verify doses and renal thresholds against the current BNF and NICE NG28 before release. */
export const metformin: DrugProfile = {
  id: 'metformin',
  name: 'Metformin',
  drugClass: 'Biguanide',
  areaId: 'endo',
  summary:
    'First-line for type 2 diabetes. It lowers the liver’s glucose output and improves insulin sensitivity; it doesn’t cause weight gain or, on its own, hypoglycaemia. Start low and go slow to limit GI side effects.',
  keyPoints: [
    'Metformin reduces hepatic gluconeogenesis and increases peripheral insulin sensitivity. It doesn’t stimulate insulin release, so on its own it doesn’t cause hypoglycaemia, and it is weight neutral.',
    'GI upset is common: start at 500 mg once daily with food and increase slowly, or use modified release. Lactic acidosis is rare: stop it when acutely unwell or dehydrated (sick day rules), and around iodinated contrast if renal function is poor.',
    'Check eGFR before starting and at least yearly: review the dose below 45 and stop below 30 mL/min/1.73 m². Long-term use can cause vitamin B12 deficiency.',
  ],
  verify: [
    'BNF: metformin hydrochloride',
    'NICE NG28: type 2 diabetes in adults',
    'Royal College of Radiologists: metformin and iodinated contrast',
  ],
  viva: {
    uses: [
      {
        id: 'met-uses',
        tier: 1,
        prompt: 'When is metformin used?',
        items: [
          r('t2dm', 'First-line drug for type 2 diabetes', 'core', ['type 2|t2dm|first ?line|diabet'], 'NICE NG28.'),
          r('pcos', 'Polycystic ovary syndrome (off-label)', 'extra', ['pcos|polycystic'], 'Insulin resistance.'),
          r(
            'prevent',
            'Preventing type 2 diabetes in high-risk adults (off-label)',
            'extra',
            ['prevent|pre ?diabet|high risk'],
            'When lifestyle change isn’t enough.',
          ),
        ],
        distractors: [{ label: 'Type 1 diabetes, on its own', match: ['type 1'], whyNot: 'Type 1 diabetes needs insulin.' }],
      },
      {
        id: 'met-mechanism',
        tier: 2,
        prompt: 'How does metformin work, and why doesn’t it cause hypoglycaemia on its own?',
        items: [
          r('liver', 'Less glucose made by the liver (gluconeogenesis)', 'core', ['liver|hepatic|gluconeogen'], ''),
          r('sens', 'Better insulin sensitivity in muscle', 'core', ['sensitiv|insulin resist|uptake|muscle'], ''),
          r(
            'nosecrete',
            'No extra insulin secretion, so glucose doesn’t fall below normal',
            'core',
            ['no (extra )?(insulin )?secret|doesn ?t (increase|stimulate|release)|not a secretagogue'],
            '',
          ),
          r('weight', 'Weight neutral', 'extra', ['weight'], ''),
        ],
        probe: {
          prompt: 'So when can someone on metformin become hypoglycaemic?',
          items: [
            r('combo', 'When it is combined with a sulfonylurea or insulin', 'core', ['sulfonylurea|sulphonylurea|gliclazide|insulin'], ''),
            r('meals', 'Alcohol or missed meals on those drugs', 'extra', ['alcohol|missed meal|not eating|fast'], ''),
          ],
        },
      },
    ],
    safety: [
      {
        id: 'met-se',
        tier: 1,
        prompt: 'What are the side effects of metformin?',
        items: [
          r(
            'gi',
            'GI upset: nausea, diarrhoea, abdominal pain, metallic taste',
            'core',
            ['\\bgi\\b|gastro|nause|diarrh|stomach|abdom|taste'],
            'Start low and go slow.',
          ),
          r(
            'lactic',
            'Lactic acidosis (rare but serious)',
            'redflag',
            ['lactic'],
            'Risk rises with renal failure, hypoxia and dehydration.',
          ),
          r('b12', 'Vitamin B12 deficiency with long-term use', 'core', ['b12|cobalamin'], 'Check if anaemia or neuropathy.'),
        ],
      },
      {
        id: 'met-sickday',
        tier: 2,
        prompt: 'Why do we tell patients to stop metformin when they are acutely unwell?',
        items: [
          r(
            'renal',
            'Dehydration and AKI reduce its clearance (it is renally excreted)',
            'core',
            ['dehydrat|\\baki\\b|kidney|renal|excret|accumulat|clearance'],
            '',
          ),
          r('lactic', 'Accumulation, with poor perfusion, raises the risk of lactic acidosis', 'core', ['lactic|acidosis'], ''),
          r(
            'rules',
            'Sick day rules: stop it during vomiting, diarrhoea or fever; restart 24–48 hours after eating and drinking normally',
            'core',
            ['sick day|vomit|diarrh|fever|restart|24 ?(to|-)? ?48'],
            '',
          ),
        ],
        probe: {
          prompt: 'He is having a CT with iodinated contrast. What do you do about his metformin?',
          items: [
            r('egfr', 'Check his eGFR first', 'core', ['egfr|renal function|kidney function|creatinine|u ?(and|&)? ?e'], ''),
            r(
              'hold',
              'Withhold it for 48 hours after contrast if eGFR is under 30 or he has an AKI',
              'core',
              ['48|withhold|stop|hold|omit'],
              '',
            ),
            r('restart', 'Restart once renal function is stable', 'core', ['restart|recheck|stable'], ''),
          ],
        },
      },
    ],
    monitoring: [
      {
        id: 'met-monitor',
        tier: 1,
        prompt: 'What do you check before and during metformin treatment?',
        items: [
          r('egfr', 'eGFR before starting, then at least yearly', 'core', ['egfr|renal|kidney|creatinine|u ?(and|&)? ?e'], ''),
          r('thresholds', 'Review the dose below 45; stop below 30', 'core', ['45|30|review the dose|reduce|stop'], ''),
          r('hba1c', 'HbA1c every 3–6 months until stable', 'core', ['hba1c|a1c|glycated'], ''),
          r('b12', 'Vitamin B12 if there are symptoms of deficiency', 'extra', ['b12'], ''),
        ],
      },
      {
        id: 'met-data',
        tier: 3,
        prompt: 'What do you do with his metformin?',
        data: 'eGFR has fallen from 52 to 28 mL/min/1.73 m² over a year. HbA1c 54 mmol/mol on metformin 1 g twice daily.',
        items: [
          r('stop', 'Stop metformin (eGFR under 30)', 'core', ['stop|discontinu|withdraw'], ''),
          r('cause', 'Repeat the eGFR and look for a cause of the decline', 'core', ['repeat|recheck|cause|why|ckd|aki'], ''),
          r(
            'alt',
            'Another agent: a DPP-4 inhibitor (linagliptin needs no dose change), insulin, or an SGLT2 inhibitor if eligible',
            'core',
            ['dpp|gliptin|insulin|sglt|flozin|gliclazide|another agent|alternative'],
            '',
          ),
          r(
            'target',
            'HbA1c 54 is above target',
            'extra',
            ['above|target|48|53'],
            'Target 48 on metformin alone; 53 on drugs that can cause hypos.',
          ),
        ],
      },
    ],
  },
  counsel: [
    ideas('m_ideas', 'metformin'),
    point(
      'm_what',
      'What it does',
      ['lower(s)? (your )?(blood )?(sugar|glucose)|blood sugar|glucose|diabet'],
      'Metformin helps your body use insulin better and stops your liver making too much sugar, so it lowers your blood sugar.',
      'People take medicines they understand.',
    ),
    point(
      'm_how',
      'Take it with food',
      ['with (or (just )?after )?(your )?(breakfast|food|meal|evening meal)|after (food|eating)'],
      'Take it with your breakfast or straight after: food makes stomach upset less likely.',
      'Food reduces GI side effects.',
    ),
    point(
      'm_slow',
      'Start low, go slow',
      ['start (on )?(a )?low|500|increase (it )?(slowly|gradually)|build (it )?up|every (week|1 ?(to|-)? ?2 weeks)'],
      'We start with one 500 mg tablet a day and build up slowly over a few weeks.',
      'Slow titration is the main way to avoid diarrhoea.',
    ),
    point(
      'm_gi',
      'Stomach side effects',
      ['stomach|tummy|nause|diarrh|upset|settle|side effect'],
      'Some people get an upset stomach or diarrhoea at first. It usually settles; if it doesn’t, there is a slow-release version.',
      'Forewarned patients are more likely to persist.',
    ),
    point(
      'm_hypo',
      'Won’t cause hypos on its own',
      ['hypo|go (too )?low|low blood sugar|won ?t (make|cause)'],
      'On its own, metformin won’t make your blood sugar go too low.',
      'A common fear, especially for drivers.',
      { weight: 'extra' },
    ),
    point(
      'm_sick',
      'Sick day rules',
      ['sick day|vomit|diarrh\\w* and vomit|unwell|dehydrat|stop (taking )?(it )?(if|when|while)|being sick'],
      'If you’re being sick, have diarrhoea or a fever and can’t keep fluids down, stop it until you’re eating and drinking normally again.',
      'Prevents lactic acidosis during dehydration and AKI.',
      { weight: 'redflag' },
    ),
    point(
      'm_review',
      'Checks',
      ['blood test|kidney|hba1c|check|review|3 months|three months'],
      'We’ll check your HbA1c in about 3 months, and your kidney function at least once a year.',
      'Dose decisions depend on both.',
    ),
    point(
      'm_lifestyle',
      'Diet and activity',
      ['diet|exercise|activity|weight|lifestyle|walk|education course'],
      'Tablets work best alongside diet and activity changes. There’s a free course about living with diabetes too.',
      'Structured education is recommended for everyone with type 2 diabetes.',
      { weight: 'extra' },
    ),
    teachBack('m_teachback'),
  ],
  patients: [
    {
      id: 'm_new',
      indication: 'New type 2 diabetes',
      difficulty: 1,
      patient: {
        name: 'Tariq Ahmed',
        age: 56,
        sex: 'male',
        setting: 'GP surgery',
        opening: 'The nurse says my sugar test was high and I need tablets. I drive deliveries for a living, so I’m a bit worried.',
      },
      summary:
        'Tariq Ahmed, 56. New type 2 diabetes: HbA1c 62 mmol/mol (repeat 60). BMI 31, eGFR 78, LFTs normal. Delivery driver. No other medicines. No known drug allergies.',
      answers: {
        m_ideas: 'My dad had diabetes and had to inject himself. I don’t want that.',
        m_hypo: 'That’s a relief: I drive all day.',
        m_teachback:
          'One tablet with breakfast to start, building up slowly, the runs should settle, stop it if I’m being sick, and a blood test in three months.',
      },
      concerns: [
        { itemId: 'm_hypo', text: 'Will it make me go hypo while I’m driving?' },
        { itemId: 'm_gi', text: 'My brother said it gave him the runs.' },
        { itemId: 'm_review', text: 'How will I know if it’s working?' },
      ],
      rx: [
        rxDrug('Metformin', ['metformin']),
        rxDose('500 mg', ['\\b500 ?mg|\\b500\\b'], 'Start low to limit GI side effects.'),
        rxOral,
        rxFreq('Once daily with breakfast', [...ONCE_DAILY, 'with (breakfast|food|a meal)'], 'With food.'),
        r(
          'rx_titrate',
          'Increase by 500 mg every 1–2 weeks as tolerated (usual dose 1 g twice daily)',
          'extra',
          ['increase|titrat|build up|1 ?g twice|2 ?g'],
          '',
          undefined,
          'Prescription',
        ),
      ],
      rxDistractors: [
        {
          label: 'Gliclazide 80 mg once daily',
          match: ['gliclazide|sulfonylurea|sulphonylurea'],
          whyNot: 'Not first-line, causes weight gain and hypos (a problem for a driver).',
        },
      ],
      review: [
        {
          label: 'Three months later',
          prompt: 'At 3 months his HbA1c is 51 mmol/mol, eGFR 76, and the mild diarrhoea is settling. What now?',
          items: [
            r(
              'increase',
              'HbA1c above his 48 target: increase the dose as tolerated',
              'core',
              ['increase|titrat|higher dose|above target|48'],
              '',
            ),
            r(
              'mr',
              'Modified-release metformin if GI side effects persist',
              'core',
              ['modified ?release|\\bmr\\b|slow release|extended release'],
              '',
            ),
            r(
              'lifestyle',
              'Diet, activity and structured education',
              'core',
              ['diet|exercise|activity|weight|lifestyle|education|desmond'],
              '',
            ),
            r('repeat', 'Repeat the HbA1c in 3–6 months', 'extra', ['3 ?(to|-)? ?6 months|repeat|recheck'], ''),
          ],
        },
      ],
      pearl:
        'Metformin first, started low (500 mg once daily with food) and built up slowly. HbA1c target 48 mmol/mol on metformin alone; 53 once on a drug that can cause hypoglycaemia.',
    },
    {
      id: 'm_ckd',
      indication: 'Type 2 diabetes with CKD',
      difficulty: 2,
      patient: {
        name: 'Grace Okoye',
        age: 68,
        sex: 'female',
        setting: 'GP surgery',
        opening: 'I’ve got diabetes now as well as my kidney problem. Are these tablets going to damage my kidneys more?',
      },
      summary:
        'Grace Okoye, 68. New type 2 diabetes, HbA1c 58 mmol/mol. CKD stage 3a: eGFR 48 (stable for 2 years), urine ACR 8 mg/mmol. Hypertension on ramipril 10 mg once daily and amlodipine 5 mg once daily. No known drug allergies.',
      answers: {
        m_ideas: 'I worry anything new will hurt my kidneys.',
        m_sick: 'So if I get a tummy bug, I stop it for a day or two. Should I stop my ramipril too?',
        m_teachback: 'One with breakfast, building up slowly, stop it if I’m being sick, and kidney blood tests more often.',
      },
      concerns: [
        { itemId: 'm_review', text: 'Will you keep an eye on my kidneys?' },
        { itemId: 'm_sick', text: 'What if I get a tummy bug?' },
        { itemId: 'm_gi', text: 'Are there side effects I should know about?' },
      ],
      rx: [
        rxDrug('Metformin', ['metformin']),
        rxDose('500 mg', ['\\b500 ?mg|\\b500\\b'], 'eGFR 48: start as normal, review the dose if it falls below 45.'),
        rxOral,
        rxFreq('Once daily with breakfast', [...ONCE_DAILY, 'with (breakfast|food|a meal)'], ''),
        r(
          'rx_monitor',
          'Check eGFR every 3–6 months (it is under 60)',
          'extra',
          ['egfr|renal|kidney|3 ?(to|-)? ?6 months|monitor'],
          '',
          undefined,
          'Monitoring',
        ),
      ],
      review: [
        {
          id: 'met-ckd-review',
          label: 'A year later',
          prompt: 'A year later her eGFR is 41 and her HbA1c is 50. What do you do?',
          items: [
            r(
              'reduce',
              'Reduce the metformin: eGFR 30–44 means a maximum of 1 g a day',
              'core',
              ['reduce|lower|halve|1 ?g|1000|maximum|review the dose'],
              'BNF.',
            ),
            r('monitor', 'Recheck renal function every 3–6 months', 'core', ['recheck|monitor|3 ?(to|-)? ?6 months|egfr|renal'], ''),
            r(
              'sglt2',
              'Consider an SGLT2 inhibitor for kidney protection, if eligible',
              'extra',
              ['sglt|flozin|dapagliflozin|empagliflozin|canagliflozin'],
              'NICE NG28 and CKD guidance.',
            ),
            r('sick', 'Remind her of sick day rules (metformin, ramipril)', 'core', ['sick day|vomit|dehydrat|ramipril|ace'], ''),
          ],
        },
      ],
      pearl:
        'In CKD, metformin is still first-line while eGFR is 45 or more; review the dose (maximum 1 g a day) at 30–44, and stop below 30. Sick day rules matter even more with an ACE inhibitor too.',
    },
  ],
};
