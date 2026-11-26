import { r } from '../common';
import type { DrugProfile } from '../types';
import { ONCE_DAILY, ideas, point, rxDose, rxDrug, rxFreq, rxOral, teachBack } from './build';

/** Verify doses and steroid safety advice against the current BNF, NICE NG115, BTS/SIGN and BSR guidance before release. */
export const prednisolone: DrugProfile = {
  id: 'prednisolone',
  name: 'Prednisolone',
  drugClass: 'Oral corticosteroid (glucocorticoid)',
  areaId: 'resp',
  summary:
    'An oral corticosteroid: anti-inflammatory and immunosuppressive. Short courses treat exacerbations of asthma and COPD; longer courses treat PMR, GCA and inflammatory disease, where side effects and adrenal suppression matter.',
  keyPoints: [
    'Typical doses: acute asthma 40–50 mg once daily for at least 5 days; COPD exacerbation 30 mg once daily for 5 days; PMR 15 mg daily, then a slow taper; GCA 40–60 mg daily. Give it in the morning with food.',
    'Long-term side effects: high glucose, high blood pressure, mood change and insomnia, infection (including severe chickenpox), peptic ulcer with NSAIDs, osteoporosis, Cushingoid features and adrenal suppression.',
    'Over 3 weeks (or high doses, or repeated courses): taper rather than stop, carry a steroid card (and an emergency card if adrenal insufficiency is likely), follow sick day rules, and give bone protection when indicated.',
  ],
  verify: [
    'BNF: prednisolone',
    'NICE NG115: COPD',
    'BTS/SIGN asthma guideline',
    'BSR guidelines: PMR and GCA',
    'NHS steroid emergency card guidance',
  ],
  viva: {
    uses: [
      {
        id: 'pred-uses',
        tier: 1,
        prompt: 'Give examples of when prednisolone is used, with typical doses.',
        items: [
          r('asthma', 'Acute asthma: 40–50 mg once daily for at least 5 days', 'core', ['asthma'], 'BTS/SIGN.'),
          r('copd', 'COPD exacerbation: 30 mg once daily for 5 days', 'core', ['copd'], 'NICE NG115.'),
          r('pmr', 'Polymyalgia rheumatica: 15 mg daily, then a slow taper', 'core', ['polymyalgia|\\bpmr\\b'], ''),
          r(
            'gca',
            'Giant cell arteritis: 40–60 mg daily (IV methylprednisolone if vision is affected)',
            'core',
            ['giant cell|\\bgca\\b|temporal arter'],
            '',
          ),
          r(
            'other',
            'Flares of IBD, rheumatoid arthritis and other inflammatory disease',
            'extra',
            ['ibd|crohn|colitis|rheumat|nephrotic|flare|autoimmun'],
            '',
          ),
        ],
      },
      {
        id: 'pred-mechanism',
        tier: 2,
        prompt: 'How do glucocorticoids reduce inflammation, and why do they raise blood glucose?',
        items: [
          r(
            'receptor',
            'Glucocorticoid receptors inside cells change gene transcription',
            'core',
            ['receptor|gene|transcription|nucle'],
            '',
          ),
          r(
            'inflam',
            'Inflammatory genes (cytokines, prostaglandins) are switched off and immune cells suppressed',
            'core',
            ['cytokine|prostaglandin|phospholipase|inflamm|immune|lymphocyt'],
            '',
          ),
          r(
            'glucose',
            'Gluconeogenesis and insulin resistance rise, so glucose rises',
            'core',
            ['gluconeogen|insulin resist|glucose|liver'],
            '',
          ),
        ],
        probe: {
          prompt: 'Why must a long course be tapered rather than stopped?',
          items: [
            r(
              'hpa',
              'The HPA axis is suppressed: less ACTH, and the adrenals atrophy',
              'core',
              ['acth|hpa|adrenal|suppress|atroph|pituitar'],
              '',
            ),
            r(
              'crisis',
              'Stopping suddenly can cause an adrenal crisis',
              'redflag',
              ['adrenal crisis|addisonian|crisis|collapse|shock'],
              '',
            ),
            r(
              'when',
              'Taper after more than 3 weeks, over 40 mg a day, or repeated courses',
              'core',
              ['3 weeks|three weeks|40 ?mg|repeat|taper|wean'],
              '',
            ),
          ],
        },
      },
    ],
    safety: [
      {
        id: 'pred-se',
        tier: 1,
        prompt: 'List the side effects of long-term prednisolone.',
        items: [
          r('glucose', 'High glucose and diabetes', 'core', ['glucose|diabet|hyperglyc|sugar'], ''),
          r('bone', 'Osteoporosis and fractures; avascular necrosis', 'core', ['osteopor|bone|fracture|avascular'], ''),
          r(
            'infection',
            'Infections, including severe chickenpox and TB reactivation',
            'core',
            ['infect|immunosuppress|chickenpox|varicella|\\btb\\b'],
            '',
          ),
          r('mood', 'Mood change, insomnia, psychosis', 'core', ['mood|insomni|sleep|psychos|euphori|depress'], ''),
          r(
            'cushing',
            'High blood pressure, fluid retention, weight gain, Cushingoid features',
            'core',
            ['hypertens|blood pressure|fluid|weight|cushing|moon'],
            '',
          ),
          r(
            'other',
            'Peptic ulcers (with NSAIDs), cataracts, glaucoma, thin skin, proximal myopathy',
            'extra',
            ['ulcer|cataract|glaucoma|skin|bruis|myopath'],
            '',
          ),
        ],
      },
      {
        id: 'pred-bone',
        tier: 2,
        prompt: 'Why and how do you protect bones in someone starting long-term steroids?',
        items: [
          r('why', 'Steroids reduce bone formation and calcium absorption', 'core', ['osteoblast|formation|bone|calcium absor'], ''),
          r(
            'who',
            'Age 65+ or a past fragility fracture, on 7.5 mg or more for 3 months: start straight away',
            'core',
            ['65|fragility|7 ?5|3 months|three months|straight away|immediately'],
            '',
          ),
          r(
            'what',
            'A bisphosphonate (alendronic acid 70 mg weekly) with calcium and vitamin D',
            'core',
            ['bisphosphonate|alendron|calcium|vitamin d|adcal'],
            '',
          ),
          r('younger', 'Under 65: assess risk with FRAX and DEXA', 'extra', ['frax|dexa|bone density|under 65'], ''),
        ],
        probe: {
          prompt: 'She is on 40 mg, has never had chickenpox, and her grandson has it. What do you do?',
          items: [
            r(
              'risk',
              'She is at risk of severe, disseminated varicella',
              'redflag',
              ['severe|disseminat|pneumonit|varicella|chickenpox'],
              '',
            ),
            r('igg', 'Check varicella antibodies (VZV IgG) urgently', 'core', ['antibod|vzv|igg|serolog|immun'], ''),
            r(
              'pep',
              'Post-exposure prophylaxis if not immune (antivirals or immunoglobulin, per UKHSA)',
              'core',
              ['vzig|immunoglobulin|aciclovir|valaciclovir|prophyla|antiviral'],
              '',
            ),
          ],
        },
      },
    ],
    monitoring: [
      {
        id: 'pred-card',
        tier: 1,
        prompt: 'What safety measures does someone on long-term prednisolone need?',
        items: [
          r('card', 'A steroid treatment card', 'core', ['steroid card|blue card|treatment card'], ''),
          r('emergency', 'An NHS steroid emergency card if adrenal suppression is likely', 'core', ['emergency card|red card'], ''),
          r(
            'sick',
            'Sick day rules: double the dose with fever or illness; injectable hydrocortisone if vomiting',
            'core',
            ['sick day|double|fever|hydrocortisone|vomit'],
            '',
          ),
          r(
            'monitor',
            'Monitor blood pressure, glucose, weight and mood',
            'core',
            ['blood pressure|\\bbp\\b|glucose|hba1c|weight|mood'],
            '',
          ),
          r('bone', 'Bone protection when indicated', 'extra', ['bone|bisphosphonate|alendron|dexa'], ''),
        ],
      },
      {
        id: 'pred-glucose',
        tier: 3,
        prompt: 'What does this show, and what do you do?',
        data: 'Day 4 of prednisolone 40 mg each morning. Capillary glucose 6.1 mmol/L before breakfast and 17.8 before the evening meal. HbA1c last year 41 mmol/mol. He is thirsty.',
        items: [
          r(
            'steroid',
            'Steroid-induced hyperglycaemia: highest in the afternoon and evening',
            'core',
            ['steroid ?induced|hyperglyc|high (sugar|glucose)|steroid'],
            '',
          ),
          r(
            'monitor',
            'Check glucose before lunch and the evening meal; ketones if very high',
            'core',
            ['capillary|\\bcbg\\b|monitor|check|ketone'],
            '',
          ),
          r(
            'treat',
            'If repeatedly over 12: gliclazide in the morning, or insulin',
            'core',
            ['gliclazide|sulfonylurea|sulphonylurea|insulin'],
            'JBDS guidance.',
          ),
          r('review', 'Use the shortest course and lowest dose that works', 'extra', ['shortest|lowest|duration|reduce|stop'], ''),
        ],
      },
    ],
  },
  counsel: [
    ideas('p_ideas', 'steroids'),
    point(
      'p_what',
      'What it does',
      ['steroid|reduc(e|es|ing) (the )?inflammation|swelling|calm(s)? (down )?(the|your) (immune|inflamm|airway)'],
      'Prednisolone is a steroid: it calms down the inflammation in your airways (or joints) quickly.',
      'People take medicines they understand.',
    ),
    point(
      'p_how',
      'Morning, with food',
      ['in the morning|with (or after )?(breakfast|food)|all (the tablets )?(at|in) one go|single dose|once (a |per )?day'],
      'Take all the tablets together once a day in the morning, with breakfast.',
      'Morning dosing mimics the body’s rhythm; food protects the stomach.',
    ),
    point(
      'p_se',
      'Side effects',
      ['side effect|appetite|sleep|mood|sugar|weight|indigestion|stomach'],
      'Common side effects are a bigger appetite, trouble sleeping, mood changes, indigestion and higher blood sugar.',
      'Forewarned patients worry less.',
    ),
    point(
      'p_dont_stop',
      'Don’t stop suddenly',
      ['don ?t stop|do not stop|suddenly|taper|reduce slowly|wean|gradually'],
      'If you’re on them for more than a few weeks, don’t stop suddenly: we reduce the dose slowly.',
      'Stopping suddenly can cause an adrenal crisis.',
      { weight: 'redflag' },
    ),
    point(
      'p_card',
      'Steroid card',
      ['steroid card|\\bcard\\b|carry'],
      'You’ll get a steroid card to carry, so anyone treating you in an emergency knows.',
      'Emergency teams need to know about adrenal suppression.',
    ),
    point(
      'p_sick',
      'Sick day rules',
      ['sick day|unwell|fever|vomit|double|\\bill\\b'],
      'If you’re unwell with a fever, you may need a higher dose: contact us. If you’re vomiting and can’t keep tablets down, get help urgently.',
      'Illness raises steroid needs.',
    ),
    point(
      'p_infection',
      'Infections',
      ['infection|chickenpox|shingles|measles|vaccin'],
      'Steroids lower your resistance to infection. If you’ve never had chickenpox and you’re near someone with chickenpox or shingles, tell us straight away.',
      'Severe varicella on steroids can be fatal.',
    ),
    point(
      'p_bone',
      'Protecting your bones',
      ['bone|calcium|vitamin d|alendron|osteopor'],
      'Long courses can thin your bones, so you’ll take a weekly bone-protecting tablet with calcium and vitamin D.',
      'Bone protection for 65+ on long-term steroids.',
      { tag: 'long-term' },
    ),
    teachBack('p_teachback'),
  ],
  patients: [
    {
      id: 'p_copd',
      indication: 'COPD exacerbation',
      difficulty: 1,
      patient: {
        name: 'Alan Brooks',
        age: 67,
        sex: 'male',
        setting: 'Acute medical unit',
        opening: 'They said I need steroids for my chest. Aren’t they the ones bodybuilders take?',
      },
      summary:
        'Alan Brooks, 67. Infective exacerbation of COPD; improving on nebulisers and antibiotics. Weight 74 kg. Type 2 diabetes on metformin 1 g twice daily (HbA1c 52 mmol/mol). Also takes tiotropium and a budesonide/formoterol inhaler. No known drug allergies.',
      answers: {
        p_ideas: 'Aren’t steroids what bodybuilders take?',
        p_se: 'Will they mess up my sugars? I’ve got diabetes.',
        p_teachback: 'Six tablets each morning with breakfast for five days, check my sugars more, and come back if I get worse.',
      },
      concerns: [
        { itemId: 'p_what', text: 'Aren’t these the steroids bodybuilders use?' },
        { itemId: 'p_se', text: 'Will they affect my diabetes?' },
        { itemId: 'p_how', text: 'Do I take them all at once?' },
      ],
      rx: [
        rxDrug('Prednisolone', ['prednisolone']),
        rxDose('30 mg', ['\\b30 ?mg|thirty'], 'NICE NG115: 30 mg once daily for 5 days in an exacerbation.'),
        rxOral,
        rxFreq('Once daily in the morning', [...ONCE_DAILY], 'Morning, with food.'),
        r(
          'rx_duration',
          'For 5 days (no taper needed)',
          'core',
          ['5 days|five days|no (need to )?taper'],
          'Short courses can stop without tapering.',
          undefined,
          'Prescription',
        ),
      ],
      review: [
        {
          label: 'Diabetes on steroids',
          prompt: 'He has type 2 diabetes. What extra advice and monitoring does he need?',
          items: [
            r(
              'cbg',
              'Check capillary glucose more often, especially before the evening meal',
              'core',
              ['capillary|\\bcbg\\b|check|monitor|glucose|sugar'],
              '',
            ),
            r(
              'treat',
              'If glucose stays over 12, he may need gliclazide or insulin for a while',
              'core',
              ['gliclazide|insulin|sulfonylurea|treat|extra'],
              '',
            ),
            r('symptoms', 'Watch for thirst and passing more urine', 'extra', ['thirst|urine|symptom'], ''),
          ],
        },
      ],
      pearl:
        'COPD exacerbation: prednisolone 30 mg once daily for 5 days. Expect higher glucose in the afternoon and evening in people with diabetes.',
    },
    {
      id: 'p_pmr',
      indication: 'Polymyalgia rheumatica',
      difficulty: 2,
      tags: ['long-term'],
      patient: {
        name: 'Joan Fletcher',
        age: 72,
        sex: 'female',
        setting: 'GP surgery',
        opening: 'My shoulders are so stiff I can’t get my coat on. The doctor thinks it’s polymyalgia and wants me on steroids.',
      },
      summary:
        'Joan Fletcher, 72. Polymyalgia rheumatica: bilateral shoulder and hip girdle pain and stiffness, CRP 48. No headache, jaw pain or visual symptoms. Weight 62 kg. No previous fractures. Takes amlodipine 5 mg once daily. Calcium 2.35 mmol/L, vitamin D 64 nmol/L, eGFR 70. No known drug allergies.',
      answers: {
        p_ideas: 'My sister was on steroids for years and broke her hip.',
        p_bone: 'So a bone tablet too. My sister wasn’t given that.',
        p_teachback:
          'Fifteen milligrams every morning with breakfast, never stop suddenly, carry the card, the bone tablet once a week, and tell you about chickenpox.',
      },
      concerns: [
        { itemId: 'p_bone', text: 'My sister broke her hip on steroids. Will that happen to me?' },
        { itemId: 'p_dont_stop', text: 'How long will I need them? Can I stop when I feel better?' },
        { itemId: 'p_infection', text: 'My grandson has chickenpox at the moment. Is that a problem?' },
      ],
      rx: [
        rxDrug('Prednisolone', ['prednisolone']),
        rxDose('15 mg', ['\\b15 ?mg|fifteen'], 'BSR: 12.5–25 mg daily, typically 15 mg.'),
        rxOral,
        rxFreq('Once daily in the morning', [...ONCE_DAILY], ''),
        r(
          'rx_bone',
          'Alendronic acid 70 mg once weekly, with calcium and vitamin D',
          'core',
          ['alendron|bisphosphonate|calcium|vitamin d|adcal'],
          'Bone protection from the start at 65+.',
          undefined,
          'Prescription',
        ),
      ],
      review: [
        {
          id: 'pred-taper',
          label: 'Tapering',
          prompt: 'After 3 weeks her symptoms have gone and the CRP is normal. How do you reduce the dose?',
          items: [
            r('step1', 'Slowly: 12.5 mg for 3 weeks, then 10 mg for 4–6 weeks', 'core', ['12 ?5|10 ?mg|slowly|taper|wean|gradual'], 'BSR.'),
            r('step2', 'Then by 1 mg every 4–8 weeks', 'core', ['1 ?mg|4 ?(to|-)? ?8 weeks'], ''),
            r('relapse', 'Watch for relapse; most need 1–2 years of treatment', 'extra', ['relapse|flare|1 ?(to|-)? ?2 years|years'], ''),
          ],
        },
        {
          label: 'New symptoms',
          prompt: 'Two months later she has a new headache and blurred vision in one eye. What now?',
          items: [
            r(
              'gca',
              'Giant cell arteritis until proven otherwise',
              'redflag',
              ['giant cell|\\bgca\\b|temporal arter'],
              'Visual loss can be permanent.',
            ),
            r(
              'steroid',
              'High-dose steroids now (IV methylprednisolone with visual symptoms)',
              'core',
              ['methylpred|high ?dose|iv steroid|60 ?mg|increase'],
              '',
            ),
            r('same', 'Same-day ophthalmology and rheumatology review', 'core', ['ophthalm|rheumatolog|same ?day|urgent'], ''),
            r('ix', 'CRP or ESR, and temporal artery ultrasound or biopsy', 'core', ['crp|esr|temporal artery|biops|ultrasound'], ''),
          ],
        },
      ],
      pearl:
        'PMR: prednisolone 15 mg, then a slow taper over 1–2 years. Over 65 on long-term steroids: start bone protection straight away. New headache or visual symptoms mean GCA until proven otherwise.',
    },
  ],
};
