import { r } from '../common';
import type { DrugProfile } from '../types';
import { ONCE_DAILY, ideas, point, rxDose, rxDrug, rxFreq, rxOral, teachBack } from './build';

/** Verify doses and monitoring against the current BNF and NICE NG145 before release. */
export const levothyroxine: DrugProfile = {
  id: 'levothyroxine',
  name: 'Levothyroxine',
  drugClass: 'Thyroid hormone (synthetic T4)',
  areaId: 'endo',
  summary:
    'Synthetic T4 for hypothyroidism. Taken once a day on an empty stomach; the dose is adjusted to the TSH 6–8 weeks after each change. Start low in older people and those with heart disease.',
  keyPoints: [
    'Levothyroxine is synthetic T4, converted to active T3 in the tissues. Full replacement is about 1.6 micrograms/kg/day; start at 25 micrograms (or lower) in older people or those with ischaemic heart disease.',
    'Too much causes thyrotoxicosis: palpitations, AF, weight loss and, over years, osteoporosis. Calcium, iron, antacids and PPIs reduce absorption: take it on an empty stomach, 4 hours apart from them.',
    'Check TSH 6–8 weeks after starting or changing the dose (T4 has a half-life of about a week), then yearly. In pregnancy, increase the dose as soon as pregnancy is confirmed.',
  ],
  verify: ['BNF: levothyroxine sodium', 'NICE NG145: thyroid disease', 'British Thyroid Association guidance'],
  viva: {
    uses: [
      {
        id: 'levo-uses',
        tier: 1,
        prompt: 'What is levothyroxine used for?',
        items: [
          r(
            'hypo',
            'Primary hypothyroidism (autoimmune, after radioiodine or thyroidectomy)',
            'core',
            ['hypothyr|underactive|hashimoto|radio ?iodine|thyroidectomy'],
            '',
          ),
          r('bar', 'Block-and-replace with carbimazole in Graves’ disease', 'extra', ['block (and|&) replace|carbimazole|graves'], ''),
          r('cancer', 'TSH suppression after thyroid cancer surgery', 'extra', ['cancer|suppress'], ''),
          r(
            'subclin',
            'Some subclinical hypothyroidism (TSH over 10, or planning pregnancy)',
            'extra',
            ['subclinical|over 10|above 10|pregnan'],
            '',
          ),
        ],
        distractors: [
          { label: 'Weight loss', match: ['weight loss|slimming|lose weight'], whyNot: 'Never for weight loss: it causes thyrotoxicosis.' },
        ],
      },
      {
        id: 'levo-start',
        tier: 2,
        prompt: 'Why do you start an 82-year-old with angina on a low dose?',
        items: [
          r(
            'demand',
            'Thyroid hormone raises heart rate and myocardial oxygen demand',
            'core',
            ['heart rate|oxygen demand|workload|cardiac|myocard'],
            '',
          ),
          r('risk', 'A full dose can trigger angina, MI or AF', 'core', ['angina|\\bmi\\b|infarct|\\baf\\b|arrhythm|ischaem'], ''),
          r('slow', '25 micrograms (or less), increased slowly every 4–6 weeks', 'core', ['25|12 ?5|low|slow|gradual|titrat'], ''),
        ],
        probe: {
          prompt: 'And for a fit 30-year-old?',
          items: [
            r(
              'full',
              'Near full replacement: about 1.6 micrograms/kg (often 50–100 micrograms)',
              'core',
              ['1 ?6|full|100|50|per kg|weight'],
              '',
            ),
            r('tsh', 'Then adjust the dose to the TSH', 'core', ['tsh|titrat|adjust'], ''),
          ],
        },
      },
    ],
    safety: [
      {
        id: 'levo-se',
        tier: 1,
        prompt: 'What happens if the dose is too high?',
        items: [
          r(
            'thyrotox',
            'Thyrotoxic symptoms: palpitations, tremor, sweating, weight loss, diarrhoea',
            'core',
            ['palpitat|tremor|sweat|weight loss|diarrh|thyrotox|hyperthyr|anxi'],
            '',
          ),
          r('af', 'Atrial fibrillation', 'core', ['\\baf\\b|atrial fib|arrhythm'], ''),
          r('bone', 'Osteoporosis with long-term over-replacement', 'core', ['osteopor|bone'], ''),
          r('angina', 'Angina in people with heart disease', 'extra', ['angina|chest pain'], ''),
        ],
      },
      {
        id: 'levo-absorb',
        tier: 2,
        prompt: 'Why should she take it on an empty stomach, away from her calcium and iron?',
        items: [
          r(
            'bind',
            'Calcium, iron, antacids and PPIs bind it or reduce its absorption',
            'core',
            ['bind|absor|chelat|calcium|iron|antacid|ppi|omeprazole'],
            '',
          ),
          r('food', 'Food reduces absorption too', 'core', ['food|empty stomach|breakfast'], ''),
          r(
            'timing',
            'Take it 30–60 minutes before breakfast, 4 hours apart from calcium or iron',
            'core',
            ['30|60|4 hours|four hours|separate|apart|before breakfast'],
            '',
          ),
          r('same', 'Taking it the same way every day keeps the TSH steady', 'extra', ['same (way|time)|consisten'], ''),
        ],
        probe: {
          prompt: 'Which conditions increase her levothyroxine needs?',
          items: [
            r('preg', 'Pregnancy: increase the dose as soon as it is confirmed', 'core', ['pregnan'], ''),
            r('malabs', 'Malabsorption, e.g. coeliac disease', 'core', ['coeliac|malabsor'], ''),
            r(
              'inducers',
              'Enzyme inducers: carbamazepine, phenytoin, rifampicin',
              'extra',
              ['carbamazepine|phenytoin|rifampicin|induc'],
              '',
            ),
          ],
        },
      },
    ],
    monitoring: [
      {
        id: 'levo-monitor',
        tier: 1,
        prompt: 'How is levothyroxine monitored?',
        items: [
          r(
            'tsh',
            'TSH 6–8 weeks after starting or any dose change',
            'core',
            ['6 ?(to|-)? ?8 weeks|tsh|six to eight'],
            'T4 has a half-life of about 7 days.',
          ),
          r('annual', 'Then once a year when stable', 'core', ['annual|yearly|12 months|every year|once a year'], ''),
          r('aim', 'Aim for a TSH in the reference range, with symptoms resolved', 'core', ['reference|normal|range|symptom'], ''),
        ],
      },
      {
        id: 'levo-data',
        tier: 3,
        prompt: 'Interpret her results and say what you would do.',
        data: 'On levothyroxine 100 micrograms: TSH 0.05 mU/L (0.4–4.0), free T4 26 pmol/L (9–25). She has palpitations.',
        items: [
          r(
            'over',
            'Over-replaced: low TSH with a high free T4',
            'core',
            ['over ?replace|too (much|high)|suppress|low tsh|thyrotox|iatrogenic'],
            '',
          ),
          r('reduce', 'Reduce the dose (e.g. to 75 micrograms)', 'core', ['reduce|lower|decrease|cut|75'], ''),
          r('ecg', 'ECG to look for AF', 'core', ['ecg|\\baf\\b|atrial'], ''),
          r('recheck', 'Recheck TSH in 6–8 weeks', 'core', ['recheck|repeat|6 ?(to|-)? ?8 weeks'], ''),
          r('how', 'Ask how she takes it (missed then doubled doses?)', 'extra', ['how (she|you) take|adheren|double|timing|missed'], ''),
        ],
      },
    ],
  },
  counsel: [
    ideas('l_ideas', 'levothyroxine'),
    point(
      'l_what',
      'What it does',
      ['replac(e|es|ing) (the )?hormone|thyroid hormone|isn ?t making enough|underactive|top(s|ping)? up'],
      'Your thyroid isn’t making enough hormone. Levothyroxine replaces it, a bit like topping up what your body is missing.',
      'People take medicines they understand.',
    ),
    point(
      'l_how',
      'Empty stomach, every morning',
      ['empty stomach|before (breakfast|food|eating)|30 (to|-)? ?60 min|on waking|first thing'],
      'Take it first thing every morning on an empty stomach, with water, 30 to 60 minutes before breakfast or coffee.',
      'Food and coffee reduce absorption.',
    ),
    point(
      'l_spacing',
      'Separate from calcium and iron',
      ['calcium|iron|antacid|indigestion|4 hours|four hours|apart|separate'],
      'Keep it 4 hours apart from calcium, iron or indigestion remedies, because they stop it being absorbed.',
      'A common cause of a stubbornly high TSH.',
    ),
    point(
      'l_lifelong',
      'Usually lifelong',
      ['lifelong|for life|long ?term|rest of your life|forever'],
      'For most people it is lifelong, so it’s worth getting into a routine.',
      'Stopping brings symptoms back.',
    ),
    point(
      'l_onset',
      'How quickly it works',
      ['few weeks|several weeks|take (some )?time|gradual|months'],
      'You should start to feel better over a few weeks, but it can take a few months to get the dose right.',
      'Sets expectations.',
      { weight: 'extra' },
    ),
    point(
      'l_bloods',
      'Blood tests',
      ['blood test|\\btsh\\b|6 ?(to|-)? ?8 weeks|check (your )?(thyroid|level)'],
      'We’ll check a blood test 6 to 8 weeks after starting or any dose change, then once a year.',
      'The TSH decides the dose.',
    ),
    point(
      'l_too_much',
      'Signs of too much',
      ['palpitat|racing|shak|tremor|sweat|too (much|high)|chest pain'],
      'If your heart races, you get chest pain or you feel shaky and sweaty, tell us: the dose may be too high.',
      'Over-replacement causes AF and angina.',
      { weight: 'redflag' },
    ),
    point(
      'l_pregnancy',
      'Pregnancy',
      ['pregnan|baby'],
      'If you become pregnant, tell us straight away: you’ll need a higher dose, which protects the baby’s development.',
      'Untreated hypothyroidism affects fetal brain development.',
      { tag: 'fertile', defaultAnswer: 'Okay.' },
    ),
    point(
      'l_exempt',
      'Free prescriptions',
      ['free prescription|exempt|exemption|pay for'],
      'You’re entitled to free prescriptions for all your medicines: ask for a medical exemption certificate.',
      'Hypothyroidism qualifies for medical exemption in England.',
      { weight: 'extra' },
    ),
    teachBack('l_teachback'),
  ],
  patients: [
    {
      id: 'l_young',
      indication: 'Hashimoto’s hypothyroidism',
      difficulty: 1,
      tags: ['fertile'],
      patient: {
        name: 'Emma Wilson',
        age: 31,
        sex: 'female',
        setting: 'GP surgery',
        opening: 'So my thyroid is underactive. I’m just glad there’s a reason I’ve been so tired.',
      },
      summary:
        'Emma Wilson, 31. Hashimoto’s hypothyroidism: TSH 28 mU/L, free T4 7 pmol/L, TPO antibodies positive. Weight 64 kg, no heart disease. Takes ferrous sulfate 200 mg once daily for iron deficiency. Hoping to conceive in the next year. No known drug allergies.',
      answers: {
        l_ideas: 'My mum takes it. She says she still feels tired some days.',
        l_spacing: 'I take my iron tablet in the morning too, so I’ll move it to the evening.',
        l_pregnancy: 'We’re hoping to try for a baby next year, so that’s good to know.',
        l_teachback:
          'First thing every morning with water, nothing for 30 minutes, iron in the evening, a blood test in 6 to 8 weeks, and tell you as soon as I’m pregnant.',
      },
      concerns: [
        { itemId: 'l_lifelong', text: 'Will I need to take this forever?' },
        { itemId: 'l_pregnancy', text: 'We want a baby next year. Is that okay on this?' },
        { itemId: 'l_spacing', text: 'I take iron tablets in the morning too. Can I take them together?' },
      ],
      rx: [
        rxDrug('Levothyroxine', ['levothyrox']),
        rxDose(
          '100 micrograms',
          ['\\b100 ?(micrograms?|mcg|µg|ug)|\\b100\\b'],
          'About 1.6 micrograms/kg for a young person without heart disease (64 kg).',
        ),
        rxOral,
        rxFreq('Once daily, before breakfast', [...ONCE_DAILY, 'before breakfast|empty stomach'], ''),
        r(
          'rx_spacing',
          'Separate from ferrous sulfate by 4 hours',
          'extra',
          ['ferrous|iron|4 hours|four hours|separate|apart'],
          '',
          undefined,
          'Prescription',
        ),
      ],
      review: [
        {
          id: 'levo-preg',
          label: 'Pregnant',
          prompt: 'She phones: she is 5 weeks pregnant. What do you do?',
          items: [
            r('increase', 'Increase the dose straight away (often by 25–50 micrograms)', 'core', ['increase|raise|up the dose|25|50'], ''),
            r(
              'tft',
              'TFTs now and every 4–6 weeks, against pregnancy-specific ranges',
              'core',
              ['tsh|t4|tft|4 ?(to|-)? ?6 weeks|monitor|trimester'],
              '',
            ),
            r('refer', 'Let the antenatal and endocrine teams know', 'core', ['refer|antenatal|obstetric|endocrin|midwife'], ''),
            r(
              'why',
              'Untreated hypothyroidism affects the baby’s brain development and raises miscarriage risk',
              'extra',
              ['brain|neuro|miscarr|develop'],
              '',
            ),
          ],
        },
      ],
      pearl:
        'Levothyroxine needs rise early in pregnancy: increase the dose as soon as pregnancy is confirmed and check TFTs every 4–6 weeks.',
    },
    {
      id: 'l_older',
      indication: 'Hypothyroidism with angina',
      difficulty: 2,
      patient: {
        name: 'Edward Price',
        age: 82,
        sex: 'male',
        setting: 'GP surgery',
        opening: 'The doctor says my thyroid’s gone slow. I’ve got enough tablets as it is, to be honest.',
      },
      summary:
        'Edward Price, 82. Primary hypothyroidism: TSH 12 mU/L, free T4 8 pmol/L. Stable angina on bisoprolol 2.5 mg once daily, aspirin 75 mg once daily and a GTN spray. Calcium and vitamin D (Adcal-D3) twice daily. No known drug allergies.',
      answers: {
        l_ideas: 'I don’t know much. Is it another tablet for life?',
        l_spacing: 'I take my calcium with breakfast. I’ll move it to lunchtime and teatime.',
        l_teachback:
          'One small tablet first thing with water, calcium later in the day, a blood test in 6 weeks, and ring you if my chest pain gets worse.',
      },
      concerns: [
        { itemId: 'l_too_much', text: 'Is it safe with my heart?' },
        { itemId: 'l_onset', text: 'How long before I feel less tired?' },
        { itemId: 'l_spacing', text: 'Can I take it with my calcium tablet at breakfast?' },
      ],
      rx: [
        rxDrug('Levothyroxine', ['levothyrox']),
        rxDose('25 micrograms', ['\\b25 ?(micrograms?|mcg|µg|ug)|\\b25\\b'], 'Start low in older people and in ischaemic heart disease.'),
        rxOral,
        rxFreq('Once daily, before breakfast', [...ONCE_DAILY, 'before breakfast|empty stomach'], ''),
        r(
          'rx_titrate',
          'Increase by 25 micrograms every 4–6 weeks according to TSH and symptoms',
          'extra',
          ['increase|titrat|4 ?(to|-)? ?6 weeks|every 4'],
          '',
          undefined,
          'Prescription',
        ),
      ],
      rxDistractors: [
        {
          label: 'Levothyroxine 100 micrograms',
          match: ['100 ?(micrograms?|mcg|µg)'],
          whyNot: 'A full dose can provoke angina or AF at 82 with heart disease.',
        },
      ],
      review: [
        {
          label: 'Four weeks later',
          prompt: 'Four weeks after starting, his angina comes on sooner on the stairs. What do you do?',
          items: [
            r(
              'hold',
              'Hold the increase or reduce the dose: the thyroxine is raising cardiac workload',
              'core',
              ['hold|reduce|lower|slow|cardiac|workload|oxygen demand'],
              '',
            ),
            r('assess', 'Assess the angina: ECG, and troponin if it might be unstable', 'core', ['ecg|troponin|acs|unstable|assess'], ''),
            r(
              'optimise',
              'Optimise anti-anginal treatment and involve cardiology',
              'core',
              ['beta ?block|bisoprolol|gtn|nitrate|cardiol|anti ?angin|optimi'],
              '',
            ),
            r('smaller', 'Titrate more slowly in smaller steps (12.5–25 micrograms)', 'extra', ['12 ?5|slow|smaller|gradual'], ''),
          ],
        },
      ],
      pearl:
        'In older people and ischaemic heart disease, start levothyroxine at 25 micrograms (or 12.5) and titrate slowly: a full dose can provoke angina, MI or AF.',
    },
  ],
};
