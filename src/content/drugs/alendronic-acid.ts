import { r } from '../common';
import type { DrugProfile } from '../types';
import { ONCE_WEEKLY, ideas, point, rxDose, rxDrug, rxFreq, rxOral, teachBack } from './build';

/** Verify against the current BNF, NOGG and NICE guidance before release. */
export const alendronicAcid: DrugProfile = {
  id: 'alendronic-acid',
  name: 'Alendronic acid',
  drugClass: 'Bisphosphonate',
  areaId: 'msk',
  summary:
    'A bisphosphonate for osteoporosis, taken as 70 mg once a week. It has to be taken properly (first thing, empty stomach, plain water, upright for 30 minutes) or it is poorly absorbed and damages the oesophagus.',
  keyPoints: [
    'Bisphosphonates bind to bone mineral and are taken up by osteoclasts, inhibiting bone resorption. First-line for osteoporosis and for bone protection on long-term steroids.',
    'Oesophagitis and ulcers if taken wrongly; rare osteonecrosis of the jaw (dental check first) and atypical femoral fractures. Correct low calcium and vitamin D before starting.',
    'Check calcium, vitamin D and renal function first (avoid if eGFR is under 35). Review after 5 years: a drug holiday may suit lower-risk patients.',
  ],
  verify: ['BNF: alendronic acid', 'National Osteoporosis Guideline Group (NOGG)', 'NICE CKS: osteoporosis'],
  viva: {
    uses: [
      {
        id: 'aln-uses',
        tier: 1,
        prompt: 'When is alendronic acid used?',
        items: [
          r('osteo', 'Osteoporosis, especially after a fragility fracture', 'core', ['osteopor|fragility|fracture'], ''),
          r('steroid', 'Bone protection on long-term corticosteroids', 'core', ['steroid|prednisolone|glucocorticoid'], ''),
          r('risk', 'High fracture risk on FRAX or a T-score of −2.5 or lower', 'core', ['frax|dexa|t ?score|2 ?5|fracture risk'], ''),
          r('paget', 'Paget’s disease (other bisphosphonates are usually used)', 'extra', ['paget'], ''),
        ],
      },
      {
        id: 'aln-mech',
        tier: 2,
        prompt: 'How do bisphosphonates work?',
        items: [
          r('bind', 'They bind to hydroxyapatite in bone', 'core', ['hydroxyapatite|bind|bone mineral|bone surface'], ''),
          r(
            'osteoclast',
            'Osteoclasts take them up and are inhibited, so bone resorption falls',
            'core',
            ['osteoclast|resorption|breakdown'],
            '',
          ),
          r('density', 'Bone density rises and fracture risk falls', 'core', ['density|fracture'], ''),
        ],
        probe: {
          prompt: 'Why must it be taken on an empty stomach with plain water, staying upright?',
          items: [
            r(
              'absorb',
              'Absorption is very poor (under 1%) and falls further with food, calcium or other drinks',
              'core',
              ['absor|food|calcium|milk|coffee|juice'],
              '',
            ),
            r(
              'upright',
              'Staying upright for 30 minutes stops it sitting in the oesophagus',
              'core',
              ['upright|30 min|oesophag|lie down'],
              '',
            ),
          ],
        },
      },
    ],
    safety: [
      {
        id: 'aln-se',
        tier: 1,
        prompt: 'What are the side effects of alendronic acid?',
        items: [
          r('oes', 'Oesophagitis, oesophageal ulcers and strictures', 'core', ['oesophag|heartburn|reflux|swallow|ulcer'], ''),
          r('jaw', 'Osteonecrosis of the jaw (rare): a dental check before starting', 'core', ['jaw|osteonecrosis|dental'], ''),
          r('femur', 'Atypical femoral fractures with long-term use (thigh or groin pain)', 'core', ['atypical|femoral|thigh|groin'], ''),
          r('calcium', 'Hypocalcaemia', 'core', ['hypocalc|calcium'], ''),
          r('ear', 'Osteonecrosis of the ear canal (very rare)', 'extra', ['\\bear\\b'], ''),
        ],
      },
      {
        id: 'aln-ci',
        tier: 2,
        prompt: 'Who shouldn’t take oral alendronic acid?',
        items: [
          r('oes', 'Oesophageal problems: stricture, achalasia, delayed emptying', 'core', ['oesophag|stricture|achalasia|swallow'], ''),
          r('upright', 'People who can’t stay upright for 30 minutes', 'core', ['upright|sit|stand|30 min|bedbound'], ''),
          r('calcium', 'Low calcium (correct it first)', 'core', ['hypocalc|low calcium|calcium'], ''),
          r('renal', 'eGFR under 35', 'core', ['egfr|renal|kidney|35'], ''),
          r('preg', 'Pregnancy and breastfeeding', 'extra', ['pregnan|breastfeed'], ''),
        ],
        probe: {
          prompt: 'What would you use instead if she can’t take it by mouth?',
          items: [
            r('zol', 'IV zoledronic acid once a year', 'core', ['zoledron|aclasta|intravenous|\\biv\\b'], ''),
            r('dmab', 'Denosumab injection every 6 months', 'core', ['denosumab|prolia'], ''),
            r(
              'other',
              'Risedronate, raloxifene or specialist anabolic drugs (teriparatide)',
              'extra',
              ['risedronate|raloxifene|teriparatide|romosozumab|\\bhrt\\b'],
              '',
            ),
          ],
        },
      },
    ],
    monitoring: [
      {
        id: 'aln-monitor',
        tier: 1,
        prompt: 'What should be checked before and during treatment?',
        items: [
          r('cad', 'Calcium and vitamin D before starting (correct any deficiency first)', 'core', ['calcium|vitamin d'], ''),
          r('renal', 'Renal function', 'core', ['renal|kidney|egfr|u ?(and|&)? ?e'], ''),
          r('dental', 'A dental check-up', 'core', ['dental|dentist|teeth'], ''),
          r('review', 'A review at 5 years: consider a drug holiday', 'core', ['5 years|five years|holiday|review'], ''),
        ],
      },
      {
        id: 'aln-data',
        tier: 3,
        prompt: 'Interpret these results. Can she start alendronic acid today?',
        data: 'DEXA: lumbar spine T-score −2.9, femoral neck −2.6. Corrected calcium 2.05 mmol/L (2.2–2.6). Vitamin D 18 nmol/L (deficient under 25). eGFR 62.',
        items: [
          r('osteo', 'Osteoporosis (T-score −2.5 or lower)', 'core', ['osteopor|t ?score|2 ?5'], ''),
          r('lowca', 'Low calcium from vitamin D deficiency', 'core', ['low calcium|hypocalc|vitamin d|deficien'], ''),
          r(
            'first',
            'Correct the vitamin D first (a loading course), then start alendronic acid',
            'core',
            ['load|replace|correct|first|before'],
            '',
          ),
          r('risk', 'Starting with low calcium risks symptomatic hypocalcaemia', 'core', ['hypocalc|tetany|risk|worsen'], ''),
          r('supp', 'Calcium and vitamin D supplements alongside', 'extra', ['adcal|supplement'], ''),
        ],
      },
    ],
  },
  counsel: [
    ideas('a_ideas', 'alendronic acid'),
    point(
      'a_what',
      'What it does',
      ['strengthen|protect (your )?bones|bone (loss|density|thinning)|fracture|osteopor|break'],
      'It strengthens your bones by slowing down the cells that break bone down, so you’re less likely to break one.',
      'People take medicines they understand.',
    ),
    point(
      'a_weekly',
      'Once a week',
      ['once (a )?week|weekly|same day'],
      'You take one tablet once a week, on the same day each week.',
      'A weekly dose is easy to forget or double.',
    ),
    point(
      'a_how',
      'First thing, plain water',
      ['empty stomach|first thing|on waking|full glass|plain water|tap water|before (breakfast|food|eating|other)'],
      'Take it first thing in the morning on an empty stomach, swallowed whole with a full glass of plain tap water: not tea, coffee, juice or milk.',
      'Absorption is tiny and easily blocked.',
      { weight: 'redflag' },
    ),
    point(
      'a_upright',
      'Stay upright for 30 minutes',
      ['upright|don ?t lie|sit up|stand|30 min|half an hour'],
      'Then stay sitting or standing, and don’t eat, drink or take other tablets, for at least 30 minutes.',
      'Prevents oesophagitis.',
      { weight: 'redflag' },
    ),
    point(
      'a_se',
      'Heartburn: stop and tell us',
      ['heartburn|indigestion|swallow|chest pain|side effect'],
      'If you get heartburn, pain on swallowing or chest pain, stop it and let us know.',
      'Early sign of oesophageal injury.',
    ),
    point(
      'a_jaw',
      'Teeth and jaw',
      ['\\bjaw|dental|dentist|teeth'],
      'Keep up with the dentist and tell them you take it. Jaw problems are very rare.',
      'Osteonecrosis of the jaw.',
    ),
    point(
      'a_calcium',
      'Calcium and vitamin D',
      ['calcium|vitamin d|adcal'],
      'Keep taking calcium and vitamin D, but at a different time of day.',
      'Bisphosphonates need calcium and vitamin D on board, but not at the same time.',
    ),
    point(
      'a_duration',
      'How long',
      ['5 years|five years|review|holiday|how long'],
      'We usually review it after 5 years.',
      'Some patients can then take a break.',
      { weight: 'extra' },
    ),
    point(
      'a_thigh',
      'Thigh or groin pain',
      ['thigh|groin'],
      'If you get new aching in your thigh or groin, tell us.',
      'Atypical femoral fracture warning.',
      { weight: 'extra' },
    ),
    teachBack('a_teachback'),
  ],
  patients: [
    {
      id: 'a_fracture',
      indication: 'Osteoporosis after a wrist fracture',
      difficulty: 1,
      patient: {
        name: 'Margaret Lewis',
        age: 74,
        sex: 'female',
        setting: 'Fracture liaison clinic',
        opening: 'The scan showed thin bones after I broke my wrist. They want me on a weekly tablet?',
      },
      summary:
        'Margaret Lewis, 74. Fragility fracture of the distal radius. DEXA: femoral neck T-score −2.8. Corrected calcium 2.34 mmol/L, vitamin D 58 nmol/L, eGFR 70. No reflux or swallowing problems; teeth checked last month. Drinks tea first thing every morning. No known drug allergies.',
      answers: {
        a_ideas: 'My friend said these tablets can rot your jaw!',
        a_how: 'Not even with my cup of tea? Oh dear.',
        a_teachback:
          'One tablet every Sunday when I get up, with a big glass of water, then stay up for half an hour before my tea, and calcium later on.',
      },
      concerns: [
        { itemId: 'a_how', text: 'Can I take it with my morning cup of tea?' },
        { itemId: 'a_jaw', text: 'My friend said they can rot your jaw!' },
        { itemId: 'a_duration', text: 'How long do I have to take it for?' },
      ],
      rx: [
        rxDrug('Alendronic acid', ['alendron']),
        rxDose('70 mg', ['\\b70 ?mg|seventy'], ''),
        rxOral,
        rxFreq('Once weekly, on the same day each week', ONCE_WEEKLY, ''),
        r(
          'rx_calcium',
          'Calcium and vitamin D (e.g. Adcal-D3), at a different time of day',
          'extra',
          ['adcal|calcium|vitamin d|colecalciferol'],
          '',
          undefined,
          'Prescription',
        ),
      ],
      review: [
        {
          id: 'aln-heartburn',
          label: 'Three months later',
          prompt: 'After 3 months she has heartburn and pain on swallowing. What do you do?',
          items: [
            r('stop', 'Stop the alendronic acid: possible oesophagitis or ulcer', 'core', ['stop|oesophag|ulcer'], ''),
            r(
              'technique',
              'Check how she takes it (lying down? with tea?)',
              'core',
              ['how (she|you) take|technique|upright|water|lying'],
              '',
            ),
            r('scope', 'Endoscopy if swallowing problems persist', 'core', ['endoscop|\\bogd\\b|refer|dysphagia'], ''),
            r('switch', 'Switch to IV zoledronic acid or denosumab', 'core', ['zoledron|denosumab|switch|alternative|risedron'], ''),
          ],
        },
      ],
      pearl:
        'Alendronic acid 70 mg once weekly: first thing, empty stomach, full glass of plain water, upright for 30 minutes. Heartburn or painful swallowing means stop it.',
    },
    {
      id: 'a_steroid',
      indication: 'Bone protection on long-term steroids',
      difficulty: 2,
      patient: {
        name: 'Joan Fletcher',
        age: 72,
        sex: 'female',
        setting: 'GP surgery',
        opening: 'I’m on steroids for my polymyalgia, and now another tablet for my bones. I have breakfast in bed most days, mind.',
      },
      summary:
        'Joan Fletcher, 72. Polymyalgia rheumatica, on prednisolone 15 mg once daily, expected for over a year. No previous fractures. Corrected calcium 2.35 mmol/L, vitamin D 64 nmol/L, eGFR 70. Takes amlodipine 5 mg once daily. No known drug allergies.',
      answers: {
        a_ideas: 'My sister broke her hip on steroids.',
        a_upright: 'So no breakfast in bed on bone tablet day. I can manage that.',
        a_teachback: 'Every Monday, first thing, water only, sit up for half an hour, calcium later, and stop it if I get heartburn.',
      },
      concerns: [
        { itemId: 'a_upright', text: 'I have my breakfast in bed. Is that all right?' },
        { itemId: 'a_calcium', text: 'Do I still need my calcium tablets?' },
        { itemId: 'a_se', text: 'Are there side effects?' },
      ],
      rx: [
        rxDrug('Alendronic acid', ['alendron']),
        rxDose('70 mg', ['\\b70 ?mg|seventy'], ''),
        rxOral,
        rxFreq('Once weekly, on the same day each week', ONCE_WEEKLY, ''),
        r(
          'rx_calcium',
          'Calcium and vitamin D supplement daily, at a different time',
          'core',
          ['adcal|calcium|vitamin d|colecalciferol'],
          '',
          undefined,
          'Prescription',
        ),
      ],
      review: [
        {
          label: 'Before starting',
          prompt: 'Before she starts, what do you check and ask?',
          items: [
            r('cad', 'Calcium and vitamin D levels', 'core', ['calcium|vitamin d'], ''),
            r('renal', 'Renal function (avoid if eGFR is under 35)', 'core', ['renal|kidney|egfr'], ''),
            r('dental', 'Dental health: see a dentist first if dental work is needed', 'core', ['dental|dentist|teeth'], ''),
            r(
              'oes',
              'Oesophageal problems, and whether she can stay upright for 30 minutes',
              'core',
              ['oesophag|swallow|reflux|upright|30 min'],
              '',
            ),
          ],
        },
      ],
      pearl: 'Starting long-term steroids at 65 or over: bone protection from day one, without waiting for a DEXA scan.',
    },
  ],
};
