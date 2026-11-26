import { r } from '../common';
import type { DrugProfile } from '../types';
import { ONCE_WEEKLY, ideas, point, rxDose, rxDrug, rxFreq, rxOral, teachBack } from './build';

/** Verify doses, monitoring and contraception advice against the current BNF and BSR DMARD guideline before release. */
export const methotrexate: DrugProfile = {
  id: 'methotrexate',
  name: 'Methotrexate',
  drugClass: 'Antimetabolite (folate antagonist), DMARD',
  areaId: 'msk',
  summary:
    'Low-dose methotrexate is given ONCE A WEEK for rheumatoid arthritis, psoriasis and Crohn’s disease. Taking it daily by mistake has killed people, so the prescription, the tablets (2.5 mg only) and the counselling must all make the weekly day clear.',
  keyPoints: [
    'Methotrexate inhibits dihydrofolate reductase. Weekly low-dose methotrexate is the first-line DMARD for rheumatoid arthritis; folic acid 5 mg once a week, on a different day, reduces side effects.',
    'Serious toxicity: bone marrow suppression, liver fibrosis, pneumonitis and mucositis. Trimethoprim and co-trimoxazole (also antifolates), NSAIDs and poor renal function raise the risk. Teratogenic: both men and women need contraception.',
    'FBC, U&E and LFTs before starting, every 1–2 weeks until stable, then every 2–3 months. A sore throat, fever, mouth ulcers, bruising or new breathlessness needs urgent review.',
  ],
  verify: ['BNF: methotrexate', 'BSR guideline on DMARD therapy', 'NPSA/MHRA alerts on oral methotrexate'],
  viva: {
    uses: [
      {
        id: 'mtx-uses',
        tier: 1,
        prompt: 'What is methotrexate used for, and how is it given?',
        items: [
          r('ra', 'Rheumatoid arthritis: the first-line DMARD', 'core', ['rheumat|\\bra\\b|dmard'], ''),
          r('psoriasis', 'Psoriasis and psoriatic arthritis', 'core', ['psoria'], ''),
          r('crohns', 'Crohn’s disease and other inflammatory disease', 'extra', ['crohn|ibd|inflammatory'], ''),
          r(
            'weekly',
            'Once a week, on the same day each week',
            'redflag',
            ['once (a )?week|weekly|same day'],
            'Daily dosing errors are fatal.',
          ),
          r('high', 'High doses in cancer chemotherapy and for ectopic pregnancy', 'extra', ['cancer|chemo|leuka?em|ectopic'], ''),
        ],
      },
      {
        id: 'mtx-folate',
        tier: 2,
        prompt: 'Why is folic acid prescribed with methotrexate?',
        items: [
          r(
            'dhfr',
            'Methotrexate inhibits dihydrofolate reductase, blocking folate metabolism',
            'core',
            ['dihydrofolate|dhfr|folate|antifolate'],
            '',
          ),
          r(
            'se',
            'Folic acid reduces side effects: mouth ulcers, nausea, liver toxicity',
            'core',
            ['ulcer|mucositis|nause|\\bgi\\b|liver|marrow|side effect'],
            '',
          ),
          r(
            'dose',
            '5 mg once a week, on a different day from the methotrexate',
            'core',
            ['5 ?mg|different day|another day|not (on )?the same day'],
            '',
          ),
        ],
        probe: {
          prompt: 'What is folinic acid used for?',
          items: [
            r('rescue', 'Methotrexate toxicity or overdose (rescue)', 'core', ['toxic|overdose|rescue'], ''),
            r('bypass', 'It bypasses the blocked enzyme', 'core', ['bypass|already (reduced|active)|reduced form|doesn ?t need'], ''),
          ],
        },
      },
    ],
    safety: [
      {
        id: 'mtx-se',
        tier: 1,
        prompt: 'What are the serious side effects of methotrexate?',
        items: [
          r(
            'marrow',
            'Bone marrow suppression (infection, bleeding, anaemia)',
            'redflag',
            ['marrow|pancytopen|neutropen|myelosuppress'],
            '',
          ),
          r('liver', 'Liver toxicity and fibrosis', 'core', ['liver|hepat|fibros|cirrho'], ''),
          r('lung', 'Pneumonitis: new cough or breathlessness', 'core', ['pneumonit|lung|cough|breathless|pulmonary'], ''),
          r('mucositis', 'Mucositis and mouth ulcers', 'core', ['mucosit|mouth ulcer|stomatit'], ''),
          r('terato', 'Teratogenic: contraception for men and women', 'core', ['teratogen|pregnan|contracept'], ''),
        ],
      },
      {
        id: 'mtx-interact',
        tier: 2,
        prompt: 'Why must you never prescribe trimethoprim to someone on methotrexate?',
        items: [
          r('antifolate', 'Trimethoprim is also an antifolate', 'core', ['antifolate|folate|dihydrofolate'], ''),
          r(
            'marrow',
            'Together they can cause severe bone marrow suppression',
            'redflag',
            ['marrow|pancytopen|neutropen|myelosuppress'],
            '',
          ),
          r(
            'cotrim',
            'Co-trimoxazole is even worse (trimethoprim plus sulfamethoxazole)',
            'extra',
            ['co ?trimoxazole|septrin|sulfamethoxazole'],
            '',
          ),
          r(
            'alt',
            'Another antibiotic instead, e.g. nitrofurantoin for a UTI (if renal function allows)',
            'core',
            ['nitrofurantoin|another|alternative|different antibiotic'],
            '',
          ),
        ],
        probe: {
          prompt: 'Which other drugs raise methotrexate toxicity?',
          items: [
            r('nsaid', 'NSAIDs (reduce renal excretion)', 'core', ['nsaid|ibuprofen|naproxen|diclofenac'], ''),
            r('renal', 'Anything that worsens renal function', 'core', ['renal|kidney|\\baki\\b|dehydrat'], ''),
            r('ppi', 'High-dose PPIs and penicillins', 'extra', ['ppi|omeprazole|penicillin|amoxicill'], ''),
          ],
        },
      },
    ],
    monitoring: [
      {
        id: 'mtx-monitor',
        tier: 1,
        prompt: 'How is methotrexate monitored?',
        items: [
          r('baseline', 'Baseline FBC, U&E, LFTs (and a chest X-ray)', 'core', ['baseline|before|chest x ?ray|\\bcxr\\b'], ''),
          r(
            'bloods',
            'Bloods every 1–2 weeks until stable, then every 2–3 months',
            'core',
            ['fbc|lft|blood|2 ?(to|-)? ?3 months|1 ?(to|-)? ?2 weeks'],
            '',
          ),
          r('shared', 'Shared care with rheumatology and a monitoring booklet', 'extra', ['shared care|rheumatolog|booklet|record'], ''),
          r('symptoms', 'Ask about toxicity symptoms at every review', 'extra', ['symptom|sore throat|ulcer|cough|bruis'], ''),
        ],
      },
      {
        id: 'mtx-data',
        tier: 3,
        prompt: 'Interpret these results and say what you would do.',
        data: 'On methotrexate 15 mg weekly. WCC 2.1 ×10⁹/L (4–11), neutrophils 0.9 (2–7.5), platelets 88 (150–400). Sore throat; temperature 38.2 °C.',
        items: [
          r(
            'toxic',
            'Neutropenia and thrombocytopenia: methotrexate toxicity',
            'core',
            ['neutropen|marrow|pancytopen|thrombocytopen|toxic'],
            '',
          ),
          r(
            'sepsis',
            'Possible neutropenic sepsis: urgent assessment, cultures, IV antibiotics',
            'redflag',
            ['neutropenic sepsis|sepsis|antibiotic|culture|admit|urgent'],
            '',
          ),
          r('stop', 'Stop the methotrexate and discuss with rheumatology', 'core', ['stop|withhold|omit|rheumatolog'], ''),
          r('folinic', 'Folinic acid rescue if toxicity is severe', 'extra', ['folinic|leucovorin|calcium folinate'], ''),
          r(
            'cause',
            'The cause: new drugs (trimethoprim), renal impairment, dose errors',
            'core',
            ['trimethoprim|renal|kidney|dose error|daily|cause'],
            '',
          ),
        ],
      },
    ],
  },
  counsel: [
    ideas('x_ideas', 'methotrexate'),
    point(
      'x_what',
      'What it does',
      [
        'slow(s)? (down )?(the|your) (immune|arthritis|disease)|disease ?modif|calm(s)? (the|your) immune|protect(s)? (your )?joints|damage to (your )?joints',
      ],
      'Methotrexate calms your immune system down, which slows the arthritis and protects your joints from damage.',
      'People take medicines they understand.',
    ),
    point(
      'x_weekly',
      'ONCE A WEEK',
      ['once (a )?week|weekly|same day (each|every) week|only (on )?one day'],
      'This is the most important thing: you take it ONCE A WEEK, on the same day each week, never daily.',
      'Daily dosing errors have been fatal.',
      { weight: 'redflag' },
    ),
    point(
      'x_folic',
      'Folic acid on another day',
      ['folic acid|folate'],
      'You’ll also take folic acid once a week on a different day: it reduces side effects.',
      'Folic acid reduces mucositis, GI upset and liver toxicity.',
    ),
    point(
      'x_onset',
      'How long it takes',
      ['weeks|months|take time|6 ?(to|-)? ?12 weeks|3 months'],
      'It takes 6 to 12 weeks to work, so keep going even if you don’t notice a difference at first.',
      'Early stopping is common.',
      { weight: 'extra' },
    ),
    point(
      'x_bloods',
      'Regular blood tests',
      ['blood test|monitor|check (your )?(blood|liver)'],
      'You’ll need regular blood tests, every week or two at first and then every few months, to check your blood count, liver and kidneys.',
      'Toxicity is often silent until bloods show it.',
    ),
    point(
      'x_warning',
      'Warning signs',
      ['sore throat|mouth ulcer|bruis|bleed|fever|infection|breathless|cough'],
      'Get help the same day if you have a sore throat, fever, mouth ulcers, unusual bruising or bleeding, or new breathlessness or cough.',
      'Signs of marrow suppression or pneumonitis.',
      { weight: 'redflag' },
    ),
    point(
      'x_alcohol',
      'Alcohol',
      ['alcohol|drink|units'],
      'Keep alcohol well within 14 units a week, because methotrexate and alcohol both affect the liver.',
      'Combined liver toxicity.',
    ),
    point(
      'x_interact',
      'Other medicines',
      ['trimethoprim|other (medicine|medication|tablet)|ibuprofen|nsaid|pharmacist|antibiotic|tell'],
      'Some medicines are dangerous with it, especially the antibiotic trimethoprim. Always say you take methotrexate, and check with a pharmacist before taking anything new, including ibuprofen.',
      'Antifolate and NSAID interactions.',
    ),
    point(
      'x_pregnancy',
      'Pregnancy',
      ['pregnan|contracept|baby'],
      'It can harm a baby, so use reliable contraception, and talk to us well before trying for a baby: it has to be stopped months beforehand.',
      'Teratogenic in men and women.',
      { tag: 'fertile', defaultAnswer: 'Okay.' },
    ),
    point(
      'x_vaccine',
      'Vaccines',
      ['vaccin|flu jab|jab|live vaccine'],
      'Have the yearly flu jab and the pneumococcal vaccine, and avoid live vaccines.',
      'Immunosuppression.',
      { weight: 'extra' },
    ),
    teachBack('x_teachback'),
  ],
  patients: [
    {
      id: 'x_ra',
      indication: 'Rheumatoid arthritis',
      difficulty: 1,
      tags: ['fertile'],
      patient: {
        name: 'Hannah Clarke',
        age: 38,
        sex: 'female',
        setting: 'Rheumatology clinic',
        opening: 'The rheumatologist wants me to start methotrexate. I looked it up and it says it’s a chemotherapy drug?',
      },
      summary:
        'Hannah Clarke, 38. New rheumatoid arthritis (anti-CCP positive) despite NSAIDs. Weight 66 kg. FBC, LFTs and U&E normal; eGFR over 90; chest X-ray normal. Combined pill for contraception. Drinks about 6 units a week. No known drug allergies.',
      answers: {
        x_ideas: 'I read it’s a chemotherapy drug. That scared me.',
        x_weekly: 'Once a week. I’d have taken it every day like my other tablets!',
        x_pregnancy: 'We might want another baby in a couple of years.',
        x_teachback:
          'Three tablets every Wednesday, never daily, folic acid on Saturdays, blood tests, and get help the same day if I get a sore throat, ulcers or bruising.',
      },
      concerns: [
        { itemId: 'x_weekly', text: 'So I take it every day, like my other tablets?' },
        { itemId: 'x_pregnancy', text: 'We might want another baby in a couple of years. Is that okay?' },
        { itemId: 'x_alcohol', text: 'Can I still have a glass of wine at the weekend?' },
      ],
      rx: [
        rxDrug('Methotrexate', ['methotrexate']),
        rxDose('7.5 mg (three 2.5 mg tablets)', ['7 ?5 ?mg|7 point 5'], 'BSR: start 7.5–15 mg weekly. Prescribe 2.5 mg tablets only.'),
        rxOral,
        rxFreq('ONCE WEEKLY on Wednesdays (day written in full)', ONCE_WEEKLY, 'The day of the week is written on the prescription.'),
        r('rx_folic', 'Folic acid 5 mg once weekly, not on a methotrexate day', 'core', ['folic'], '', undefined, 'Prescription'),
      ],
      rxDistractors: [
        {
          label: 'Methotrexate 7.5 mg once daily',
          match: ['once daily|every day|\\bod\\b|daily'],
          whyNot: 'Daily methotrexate is a never event: it is weekly.',
        },
      ],
      review: [
        {
          id: 'mtx-alt',
          label: 'Two weeks in',
          prompt: 'Two weeks in: ALT 128 U/L (under 40), FBC normal, eGFR over 90. She feels well. What do you do?',
          items: [
            r(
              'withhold',
              'ALT over 100: withhold methotrexate and discuss with rheumatology',
              'core',
              ['withhold|stop|omit|hold|rheumatolog|discuss'],
              'BSR.',
            ),
            r(
              'ask',
              'Ask about alcohol, paracetamol and other liver-toxic drugs or remedies',
              'core',
              ['alcohol|drink|paracetamol|other drug|herbal'],
              '',
            ),
            r('repeat', 'Repeat LFTs within 1–2 weeks', 'core', ['repeat|recheck|lft|1 ?(to|-)? ?2 weeks'], ''),
            r('restart', 'Restart at a lower dose once LFTs settle, if the team agrees', 'extra', ['restart|lower dose|reduce'], ''),
          ],
        },
      ],
      pearl:
        'Methotrexate is weekly: write the day on the prescription, prescribe 2.5 mg tablets only, add folic acid 5 mg weekly on a different day, and monitor FBC, LFTs and U&E.',
    },
    {
      id: 'x_psoriasis',
      indication: 'Severe psoriasis',
      difficulty: 2,
      patient: {
        name: 'Michael Barnes',
        age: 55,
        sex: 'male',
        setting: 'Dermatology clinic',
        opening: 'My psoriasis is everywhere and the creams aren’t touching it. The consultant says this tablet could help.',
      },
      summary:
        'Michael Barnes, 55. Severe chronic plaque psoriasis despite topical treatment and phototherapy. Weight 92 kg. eGFR 64, LFTs normal, FBC normal. Takes ibuprofen 400 mg three times daily for back pain and ramipril 5 mg once daily. Drinks about 20 units a week. No known drug allergies.',
      answers: {
        x_ideas: 'Not much. Is it strong?',
        x_alcohol: 'I’ll have to cut down then. I’m on about twenty units a week.',
        x_interact: 'I take ibuprofen every day for my back. I’ll ask about that.',
        x_teachback:
          'Once a week on Mondays, folic acid on Thursdays, blood tests, no trimethoprim, ask before ibuprofen, cut the drinking, and get help if I get a sore throat or bruising.',
      },
      concerns: [
        { itemId: 'x_interact', text: 'I take ibuprofen for my back. Is that still okay?' },
        { itemId: 'x_bloods', text: 'Why do I need so many blood tests?' },
        { itemId: 'x_warning', text: 'What should I look out for?' },
      ],
      rx: [
        rxDrug('Methotrexate', ['methotrexate']),
        rxDose(
          '10 mg (four 2.5 mg tablets)',
          ['\\b10 ?mg|ten'],
          'Typical starting dose for psoriasis is 5–15 mg weekly (check the local protocol).',
        ),
        rxOral,
        rxFreq('ONCE WEEKLY on Mondays (day written in full)', ONCE_WEEKLY, ''),
        r('rx_folic', 'Folic acid 5 mg once weekly, not on a methotrexate day', 'core', ['folic'], '', undefined, 'Prescription'),
      ],
      review: [
        {
          id: 'mtx-trimethoprim',
          label: 'Six weeks later',
          prompt:
            'An out-of-hours GP gave him trimethoprim for a UTI. A week later he has mouth ulcers and bruising. What is happening and what do you do?',
          items: [
            r(
              'toxicity',
              'Methotrexate toxicity: bone marrow suppression from the trimethoprim interaction',
              'redflag',
              ['marrow|toxic|pancytopen|neutropen|trimethoprim'],
              '',
            ),
            r('fbc', 'Urgent FBC, U&E and LFTs; stop both drugs', 'core', ['fbc|urgent|stop|bloods'], ''),
            r(
              'admit',
              'Admit if neutropenic or bleeding: folinic acid rescue, sepsis care',
              'core',
              ['admit|folinic|hospital|antibiotic|sepsis'],
              '',
            ),
            r('report', 'Report it (Yellow Card) and add an alert to his record', 'extra', ['yellow card|report|alert|record'], ''),
          ],
        },
      ],
      pearl:
        'Trimethoprim plus methotrexate can cause fatal bone marrow suppression. Daily NSAIDs and reduced renal function raise methotrexate levels too.',
    },
  ],
};
