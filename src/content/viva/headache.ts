import { r } from '../common';
import type { VivaQuestion } from '../types';

/**
 * Viva questions for the headache patients.
 * tier 1 recall · tier 2 explain why (+ examiner probe) · tier 3 data and what-ifs.
 * Verify against NICE CG150, NICE NG228, BSR 2020 GCA guideline, the ABN/BMJ IIH
 * consensus (2018), UKMEC and the BNF before release.
 */
export const headacheViva: Record<string, VivaQuestion[]> = {
  migraine_aura: [
    {
      id: 'mig-criteria',
      tier: 1,
      prompt: 'Which features make a headache migraine rather than tension-type headache?',
      items: [
        r('unilateral', 'One-sided', 'core', ['one sided|unilateral|one side'], 'Tension-type is bilateral.'),
        r('pulsating', 'Throbbing or pulsating', 'core', ['throbb|pulsat|pound'], 'Tension-type is pressing or tightening.'),
        r(
          'activity',
          'Worse with routine activity',
          'core',
          ['activity|movement|moving|exertion'],
          'People with migraine lie still; tension-type is not worsened by activity.',
        ),
        r('nausea', 'Nausea or vomiting', 'core', ['nause|vomit'], 'Absent in tension-type headache.'),
        r('photo', 'Sensitivity to light and noise', 'core', ['light|photo|noise|phono'], 'Both together point to migraine.'),
        r('duration', 'Lasts 4 to 72 hours', 'extra', ['4 ?(to|-) ?72|72 hours|hours'], 'Untreated attack length (ICHD-3).'),
      ],
    },
    {
      id: 'mig-cocp',
      tier: 2,
      prompt: 'Why is the combined pill a problem for her?',
      items: [
        r(
          'stroke',
          'Stroke risk: aura plus oestrogen raises the risk of ischaemic stroke',
          'core',
          ['stroke|ischaem'],
          'Both independently raise it; together the risk is unacceptable.',
        ),
        r(
          'ukmec',
          'UKMEC 4: an absolute contraindication',
          'core',
          ['ukmec|absolute|contraindicat|category 4'],
          'For migraine with aura at any age.',
        ),
        r(
          'switch',
          'Switch to progestogen-only or non-hormonal contraception',
          'core',
          ['progestogen|progesterone|implant|\\bius\\b|coil|\\bpop\\b|non hormonal|copper'],
          'Implant, IUS, copper coil or progestogen-only pill.',
        ),
      ],
      probe: {
        prompt: 'She would also like something to prevent attacks. What would you offer, and what must you check first?',
        items: [
          r(
            'propranolol',
            'Propranolol (not if she has asthma)',
            'core',
            ['propranolol|beta ?blocker'],
            'A first-line option in NICE CG150.',
          ),
          r('amitriptyline', 'Amitriptyline', 'core', ['amitriptyline'], 'Also helps sleep; sedation and dry mouth.'),
          r(
            'topiramate',
            'Topiramate: teratogenic, so only with highly effective contraception and a negative pregnancy test',
            'core',
            ['topiramate|teratogen|pregnan|contracept'],
            'MHRA 2024: Pregnancy Prevention Programme for topiramate.',
          ),
          r('review', 'Review after a few months with a headache diary', 'extra', ['review|diary|month'], 'Judge the response fairly.'),
        ],
      },
    },
    {
      id: 'mig-moh',
      tier: 3,
      prompt: 'A year later she brings this diary. What is going on, and what do you do?',
      data: 'Headache diary, last month: headache on 18 days · co-codamol on 16 days · sumatriptan on 6 days',
      items: [
        r(
          'moh',
          'Medication overuse headache',
          'core',
          ['overuse|rebound'],
          'Headache on 15 or more days a month with regular overuse of acute medicines.',
        ),
        r(
          'stop',
          'Stop the overused medicines abruptly, for at least a month',
          'core',
          ['stop|withdraw|abrupt'],
          'NICE CG150: stop them all at once rather than taper (opioids may need a slower withdrawal).',
        ),
        r(
          'worse',
          'Warn her the headache may worsen before it improves',
          'core',
          ['worse|before (it )?improv'],
          'Withdrawal symptoms for a week or two.',
        ),
        r('prophylaxis', 'Start or review prophylaxis', 'extra', ['prophyla|prevent'], 'Helps her through withdrawal.'),
        r('follow', 'Review in 4 to 8 weeks', 'extra', ['review|follow|4 ?(to|-) ?8|weeks'], 'Check the diary again.'),
      ],
    },
  ],

  sah: [
    {
      id: 'sah-rule-out',
      tier: 1,
      prompt: 'How do you rule out a subarachnoid haemorrhage, and how does timing change it?',
      items: [
        r(
          'ct6',
          'CT head within 6 hours: a normal scan rules it out',
          'core',
          ['\\bct\\b|scan|6 hours|six hours'],
          'NICE NG228: near 100% sensitive in the first 6 hours.',
        ),
        r(
          'lp12',
          'LP at least 12 hours after onset, if a CT done after 6 hours is normal',
          'core',
          ['\\blp\\b|lumbar|12 hours|twelve'],
          'Time for red cells to break down into bilirubin.',
        ),
        r(
          'xantho',
          'Xanthochromia on the LP confirms it',
          'core',
          ['xanthochrom|bilirubin|yellow'],
          'Distinguishes SAH from a traumatic tap.',
        ),
        r('cta', 'CT angiography to find the aneurysm', 'extra', ['angiogra|\\bcta\\b|aneurysm'], 'Once SAH is confirmed.'),
      ],
    },
    {
      id: 'sah-nimodipine',
      tier: 2,
      prompt: 'Why do we give nimodipine after a subarachnoid haemorrhage?',
      items: [
        r(
          'vasospasm',
          'Prevents delayed cerebral ischaemia from vasospasm',
          'core',
          ['vasospasm|spasm|delayed cerebral|ischaem|\\bdci\\b'],
          'Vasospasm peaks at days 4 to 14.',
        ),
        r('outcome', 'Improves outcome: less death and disability', 'core', ['outcome|disab|death|mortal'], 'The only drug shown to help.'),
        r('dose', '60 mg every 4 hours for 21 days', 'extra', ['60 ?mg|4 hour|21 days'], 'By mouth or nasogastric tube.'),
        r('bp', 'Watch for low blood pressure', 'extra', ['hypotens|low blood pressure|\\bbp\\b'], 'Hypotension worsens ischaemia.'),
      ],
      probe: {
        prompt: 'Which other complications do you watch for in the first two weeks?',
        items: [
          r('rebleed', 'Rebleeding', 'core', ['rebleed|re ?bleed'], 'Highest in the first 24 hours: secure the aneurysm early.'),
          r('hydro', 'Hydrocephalus', 'core', ['hydroceph'], 'Falling GCS; may need an external ventricular drain.'),
          r('sodium', 'Hyponatraemia', 'core', ['sodium|hyponatr|salt wasting|siadh'], 'Don’t fluid restrict.'),
          r('seizures', 'Seizures', 'extra', ['seizure|fit'], 'In the early phase.'),
          r(
            'cardiac',
            'Cardiac: arrhythmias and stress cardiomyopathy',
            'extra',
            ['cardiac|arrhythm|heart|takotsubo'],
            'Catecholamine surge.',
          ),
        ],
      },
    },
    {
      id: 'sah-csf',
      tier: 3,
      prompt: 'His CT was delayed until 9 hours and was normal. Interpret this LP, done at 14 hours.',
      data: 'Opening pressure 22 cmH2O · red cells: tube 1 8,200, tube 4 7,900 ×10⁶/L · xanthochromia present on spectrophotometry · protein and glucose normal',
      items: [
        r(
          'sah',
          'Subarachnoid haemorrhage: xanthochromia confirms it',
          'core',
          ['subarachnoid|\\bsah\\b|xanthochrom'],
          'Bilirubin from broken-down red cells, so the blood was there before the LP.',
        ),
        r(
          'not_tap',
          'Red cells don’t clear between tubes, so not a traumatic tap',
          'core',
          ['tap|clear|tube|traumatic'],
          'A traumatic tap clears from tube 1 to tube 4.',
        ),
        r('next', 'Next: CT angiography and neurosurgery', 'core', ['angiogra|\\bcta\\b|neurosurg'], 'Find and secure the aneurysm.'),
      ],
    },
  ],

  gca: [
    {
      id: 'gca-features',
      tier: 1,
      prompt: 'What are the features of giant cell arteritis?',
      items: [
        r('age', 'Age over 50 with a new headache', 'core', ['over 50|age|new headache|older'], 'Almost never under 50.'),
        r('jaw', 'Jaw claudication', 'core', ['jaw|claudic|chew'], 'The most specific symptom.'),
        r('scalp', 'Scalp tenderness', 'core', ['scalp|tender|comb|hair'], 'Over the inflamed temporal artery.'),
        r(
          'vision',
          'Visual disturbance: amaurosis fugax, diplopia, loss of vision',
          'core',
          ['vision|visual|amaurosis|diplopia|blind'],
          'The emergency.',
        ),
        r('pmr', 'Polymyalgia symptoms', 'extra', ['polymyalgia|\\bpmr\\b|shoulder|stiff'], 'Up to half have both.'),
        r(
          'systemic',
          'Systemic: fatigue, weight loss, fever',
          'extra',
          ['fatigue|tired|weight|fever|systemic'],
          'Can be the only features.',
        ),
      ],
    },
    {
      id: 'gca-steroids-first',
      tier: 2,
      prompt: 'Why start steroids before the biopsy?',
      items: [
        r(
          'blindness',
          'Blindness: ischaemic optic neuropathy, usually permanent',
          'core',
          ['blind|vision|sight|optic'],
          'The posterior ciliary arteries are affected.',
        ),
        r(
          'biopsy_window',
          'Biopsy stays positive for about 2 weeks after starting steroids',
          'core',
          ['2 weeks|two weeks|stays positive|still positive'],
          'So there is no reason to wait.',
        ),
        r(
          'skip',
          'Skip lesions: a negative biopsy doesn’t exclude GCA',
          'extra',
          ['skip|negative|patchy'],
          'Treat on the clinical picture if suspicion is high.',
        ),
      ],
      probe: {
        prompt: 'What will you tell her about being on steroids long term?',
        items: [
          r(
            'taper',
            'Taper slowly over 1 to 2 years',
            'core',
            ['taper|1 ?(to|-) ?2 years|years|slow'],
            'Relapses are common if tapered fast.',
          ),
          r(
            'card',
            'Carry a steroid card; never stop suddenly; sick-day rules',
            'core',
            ['card|suddenly|abrupt|sick ?day|adrenal'],
            'Adrenal suppression.',
          ),
          r('bone', 'Bone protection', 'core', ['bone|bisphosph|alendron|osteopor|calcium'], 'Over 65 or long-term steroids.'),
          r(
            'side',
            'Side effects: raised glucose and BP, weight gain, mood, infections',
            'core',
            ['glucose|diabet|blood pressure|weight|mood|infection|side effect'],
            'Her diabetes will need watching.',
          ),
        ],
      },
    },
    {
      id: 'gca-bloods',
      tier: 3,
      prompt: 'Interpret her bloods.',
      data: 'ESR 86 mm/h · CRP 74 mg/L · Hb 108 g/L, MCV 86 fL · platelets 512 ×10⁹/L · ALP 168 U/L (30–130)',
      items: [
        r(
          'inflam',
          'Raised ESR and CRP support GCA',
          'core',
          ['esr|crp|inflamm|raised'],
          'Normal markers make GCA much less likely but don’t exclude it.',
        ),
        r('anaemia', 'Normocytic anaemia of chronic inflammation', 'core', ['normocytic|anaemi|chronic'], 'Common in GCA.'),
        r('platelets', 'Raised platelets: reactive', 'core', ['platelet|thrombocyt'], 'Thrombocytosis supports GCA.'),
        r('alp', 'Raised ALP is common in GCA', 'extra', ['\\balp\\b|alkaline|liver'], 'Usually settles with treatment.'),
        r(
          'act',
          'Treat now: steroids and same-day referral',
          'core',
          ['steroid|prednisolone|treat|refer'],
          'The results don’t change the plan.',
        ),
      ],
    },
  ],

  iih: [
    {
      id: 'iih-features',
      tier: 1,
      prompt: 'What are the features of idiopathic intracranial hypertension?',
      items: [
        r('who', 'Young woman with obesity or recent weight gain', 'core', ['woman|women|obes|weight|bmi'], 'The typical patient.'),
        r(
          'headache',
          'Daily headache, worse lying down and in the morning',
          'core',
          ['headache|lying|morning'],
          'Raised pressure features.',
        ),
        r('tvo', 'Transient visual obscurations', 'core', ['obscur|grey|vision|visual'], 'Seconds of greying, often on standing.'),
        r('tinnitus', 'Pulsatile tinnitus', 'core', ['tinnitus|whoosh'], 'Very suggestive.'),
        r('papilloedema', 'Papilloedema', 'core', ['papilloed|swollen disc|optic disc'], 'The key sign.'),
        r(
          'sixth',
          'Sixth nerve palsy (horizontal double vision)',
          'extra',
          ['sixth|vi nerve|\\b6th\\b|abducens|double|diplopia'],
          'A false localising sign of raised pressure.',
        ),
      ],
    },
    {
      id: 'iih-image-first',
      tier: 2,
      prompt: 'Why must she be imaged before the lumbar puncture?',
      items: [
        r(
          'mass',
          'Exclude a mass or hydrocephalus: an LP could cause herniation',
          'core',
          ['mass|tumou?r|hydroceph|herniat|coning'],
          'Papilloedema means raised pressure of unknown cause.',
        ),
        r(
          'cvst',
          'Exclude venous sinus thrombosis with MR venography',
          'core',
          ['venous|thromb|cvst|venogra|mrv'],
          'A key mimic, especially on the combined pill.',
        ),
        r('exclusion', 'IIH is a diagnosis of exclusion', 'extra', ['exclusion|exclude'], 'Normal imaging is part of the criteria.'),
      ],
      probe: {
        prompt: 'What do you expect the lumbar puncture to show in IIH?',
        items: [
          r(
            'pressure',
            'Raised opening pressure, over 25 cmH2O',
            'core',
            ['opening pressure|25|raised pressure|high pressure'],
            'Measured lying on her side, relaxed.',
          ),
          r(
            'normal',
            'Normal CSF contents',
            'core',
            ['normal (csf|contents|constituents|cells|protein)'],
            'Cells, protein and glucose normal.',
          ),
          r('relief', 'Headache may ease briefly after the LP', 'extra', ['eas|relie|better|improv'], 'Temporary only.'),
        ],
      },
    },
    {
      id: 'iih-drugs',
      tier: 3,
      prompt: 'She asks whether any of her medicines caused this, and what will help.',
      data: 'Medicines: doxycycline 100 mg once daily (3 months) · combined pill · paracetamol and ibuprofen on about 25 days a month',
      items: [
        r(
          'doxy',
          'Doxycycline (a tetracycline) can cause it: stop it',
          'core',
          ['doxycycl|tetracycl'],
          'Others: retinoids and vitamin A, lithium, steroid withdrawal.',
        ),
        r(
          'overuse',
          'Daily painkillers are adding medication overuse headache',
          'core',
          ['overuse|rebound|painkiller|25 days'],
          'Cut down to break the cycle.',
        ),
        r('weight', 'Weight loss is the main treatment', 'core', ['weight|diet|bariatric'], 'Can bring remission.'),
        r(
          'acetazolamide',
          'Acetazolamide: tingling, taste change and kidney stones',
          'extra',
          ['acetazolamide|diamox'],
          'Started by the specialist.',
        ),
        r(
          'pill',
          'The combined pill: review while clots are excluded',
          'extra',
          ['pill|cocp|oestrogen|contracept'],
          'A clot risk, not a proven cause of IIH.',
        ),
      ],
    },
  ],
};
