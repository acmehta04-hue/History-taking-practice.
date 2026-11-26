import { r } from '../common';
import type { DrugProfile } from '../types';
import { ONCE_DAILY, ideas, point, rxDose, rxDrug, rxFreq, rxOral, teachBack } from './build';

/** Verify doses, targets and reversal against the current BNF and BSH guidance before release. */
export const warfarin: DrugProfile = {
  id: 'warfarin',
  name: 'Warfarin',
  drugClass: 'Vitamin K antagonist (oral anticoagulant)',
  areaId: 'haem',
  summary:
    'An oral anticoagulant monitored with the INR. DOACs have replaced it for most people, but it is still used for mechanical heart valves, AF with moderate or severe mitral stenosis, antiphospholipid syndrome and severe renal impairment.',
  keyPoints: [
    'Warfarin stops vitamin K being recycled, so the liver makes less of clotting factors II, VII, IX and X. It takes days to work and briefly makes blood more likely to clot, so a new clot needs heparin cover until the INR is 2 or more for 24 hours (and at least 5 days).',
    'Bleeding is the main risk. Warfarin interacts with almost everything: enzyme inhibitors (clarithromycin, fluconazole, metronidazole, amiodarone) raise the INR; inducers (rifampicin, carbamazepine, St John’s wort) lower it. Check every new medicine.',
    'Target INR 2.5 (range 2–3) for most indications, higher for some mechanical valves. INR over 8 without bleeding: stop warfarin and give oral vitamin K; major bleeding needs IV vitamin K and prothrombin complex concentrate.',
  ],
  verify: [
    'BNF: warfarin sodium',
    'BNF: phytomenadione',
    'British Society for Haematology: oral anticoagulation with warfarin',
    'MHRA: DOACs in antiphospholipid syndrome',
  ],
  viva: {
    uses: [
      {
        id: 'warf-uses',
        tier: 1,
        prompt: 'When is warfarin still the anticoagulant of choice?',
        items: [
          r(
            'valves',
            'Mechanical heart valves (DOACs are contraindicated)',
            'core',
            ['valve|mechanical|prosthetic'],
            'DOACs caused more clots and bleeds in valve trials.',
          ),
          r('ms', 'AF with moderate or severe mitral stenosis', 'core', ['mitral|valvular'], 'DOAC trials excluded these patients.'),
          r(
            'aps',
            'Antiphospholipid syndrome (especially triple positive)',
            'core',
            ['antiphospholipid|\\baps\\b'],
            'MHRA: DOACs are not recommended.',
          ),
          r(
            'renal',
            'Severe renal impairment, or when DOACs aren’t suitable',
            'extra',
            ['renal|kidney|egfr|creatinine clearance|interact|cost|prefer'],
            '',
          ),
        ],
        distractors: [
          {
            label: 'Acute coronary syndrome',
            match: ['acute coronary|\\bacs\\b|heart attack'],
            whyNot: 'ACS is treated with antiplatelets (aspirin plus ticagrelor or clopidogrel).',
          },
        ],
      },
      {
        id: 'warf-mechanism',
        tier: 2,
        prompt: 'How does warfarin work, and why does it take days to work?',
        items: [
          r(
            'vkor',
            'It blocks vitamin K epoxide reductase, so vitamin K can’t be recycled',
            'core',
            ['vitamin k|epoxide|vkor|reductase'],
            '',
          ),
          r(
            'factors',
            'The liver makes less of clotting factors II, VII, IX and X',
            'core',
            ['clotting factor|factors|2 7 9|ii vii ix'],
            '',
          ),
          r(
            'halflife',
            'Factors already made take days to clear (factor II lasts about 3 days)',
            'core',
            ['half ?li[fv]e|days to|already made|clear|existing'],
            '',
          ),
          r(
            'procoag',
            'Proteins C and S fall first, so it is briefly prothrombotic',
            'extra',
            ['protein c|protein s|prothrombotic|procoagulant'],
            'Hence heparin cover for a new clot.',
          ),
        ],
        probe: {
          prompt: 'So how do you start warfarin in someone with a new DVT?',
          items: [
            r('lmwh', 'Treatment-dose LMWH alongside warfarin', 'core', ['lmwh|heparin|enoxaparin|dalteparin|tinzaparin'], ''),
            r(
              'overlap',
              'At least 5 days of overlap, and until the INR is 2 or more for 24 hours',
              'core',
              ['5 days|five days|until (the )?inr|24 h|overlap'],
              '',
            ),
            r('load', 'Warfarin by a loading protocol with frequent INRs', 'extra', ['load|protocol|nomogram|daily inr|frequent'], ''),
          ],
        },
      },
    ],
    safety: [
      {
        id: 'warf-se',
        tier: 1,
        prompt: 'What are the main risks and cautions with warfarin?',
        items: [
          r('bleed', 'Bleeding, including intracranial haemorrhage', 'redflag', ['bleed|haemorrhag'], 'The main risk.'),
          r(
            'preg',
            'Teratogenic: avoid in pregnancy (switch to LMWH)',
            'core',
            ['teratogen|pregnan'],
            'Warfarin embryopathy, especially weeks 6–12.',
          ),
          r('falls', 'Falls and heavy alcohol use raise the bleeding risk', 'core', ['fall|alcohol'], ''),
          r('necrosis', 'Skin necrosis and purple toes (rare)', 'extra', ['necrosis|purple toe'], ''),
        ],
      },
      {
        id: 'warf-interactions',
        tier: 2,
        prompt: 'Why do so many drugs interact with warfarin?',
        items: [
          r(
            'cyp',
            'It is metabolised by liver cytochrome P450 enzymes (mainly CYP2C9)',
            'core',
            ['p450|cyp|cytochrome|liver enzyme|metaboli'],
            '',
          ),
          r(
            'inhib',
            'Enzyme inhibitors raise the INR: clarithromycin, fluconazole, metronidazole, amiodarone',
            'core',
            ['inhibit|clarithro|erythro|fluconazole|metronidazole|amiodarone|raise'],
            '',
          ),
          r(
            'induc',
            'Enzyme inducers lower the INR: rifampicin, carbamazepine, phenytoin, St John’s wort',
            'core',
            ['induc|rifampicin|carbamazepine|phenytoin|st john|lower'],
            '',
          ),
          r(
            'nsaid',
            'Antiplatelets and NSAIDs add to bleeding without changing the INR',
            'core',
            ['nsaid|aspirin|ibuprofen|antiplatelet|clopidogrel'],
            '',
          ),
          r(
            'diet',
            'Vitamin K in the diet matters too: big changes in green vegetables, cranberry juice',
            'extra',
            ['vitamin k|green|diet|cranberry'],
            '',
          ),
        ],
        probe: {
          prompt: 'He needs an antibiotic for a chest infection. What do you do about his warfarin?',
          items: [
            r(
              'avoid',
              'Avoid strong enzyme inhibitors such as clarithromycin if there is an alternative',
              'core',
              ['clarithro|macrolide|inhibitor|alternative|avoid'],
              '',
            ),
            r(
              'check',
              'Check the INR within a few days of starting any antibiotic',
              'core',
              ['check (the |his )?inr|inr (check|in)|monitor|few days|3 ?(to|-)? ?5 days'],
              'Most antibiotics raise it.',
            ),
            r('tell', 'Tell the anticoagulation clinic', 'extra', ['clinic|tell|inform|anticoagulation'], ''),
          ],
        },
      },
    ],
    monitoring: [
      {
        id: 'warf-monitor',
        tier: 1,
        prompt: 'How is warfarin monitored, and what are the targets?',
        items: [
          r('inr', 'INR, with a target of 2.5 (range 2–3) for most indications', 'core', ['\\binr\\b|2 ?5|2 (to|-) ?3'], ''),
          r(
            'higher',
            'A higher target for some mechanical valves or clots on warfarin',
            'core',
            ['higher|3 ?5|3 (to|-) ?4|mechanical|recurrent'],
            '',
          ),
          r('freq', 'INR often at the start, then up to every 12 weeks once stable', 'core', ['start|often|frequent|stable|12 weeks'], ''),
          r('book', 'An anticoagulant record book and alert card', 'extra', ['book|alert card|record'], ''),
        ],
      },
      {
        id: 'warf-inr',
        tier: 3,
        prompt: 'His INR is 8.2 and he has no bleeding. What do you do?',
        data: 'INR 8.2 (target 2.5). No bleeding. He started clarithromycin 4 days ago for a chest infection.',
        items: [
          r('stop', 'Stop (omit) the warfarin', 'core', ['stop|omit|withhold|hold'], ''),
          r(
            'vitk',
            'Oral vitamin K (phytomenadione) 1–5 mg',
            'core',
            ['vitamin k|phytomenadione|konakion'],
            'BNF: INR over 8 without bleeding.',
          ),
          r(
            'recheck',
            'Recheck the INR the next day; restart when it is below 5',
            'core',
            ['recheck|repeat|next day|24 h|restart|below 5|under 5'],
            '',
          ),
          r(
            'cause',
            'The cause: clarithromycin, an enzyme inhibitor (switch it if you can)',
            'core',
            ['clarithro|antibiotic|inhibit|interact|cause'],
            '',
          ),
          r(
            'bleeding',
            'If he were bleeding: IV vitamin K and prothrombin complex concentrate',
            'extra',
            ['prothrombin|\\bpcc\\b|beriplex|octaplex|iv vitamin k|intravenous'],
            '',
          ),
        ],
      },
    ],
  },
  counsel: [
    ideas('w_ideas', 'warfarin'),
    point(
      'w_what',
      'What it does',
      [
        'thin(s|ner|ning)? (your |the )?blood|blood thinner|anticoagul',
        'stops? (your )?blood (from )?clott|slower to clot|prevent (a )?(stroke|clot)',
      ],
      'Warfarin is an anticoagulant, sometimes called a blood thinner. It makes your blood slower to clot, which lowers the risk of a stroke or another clot.',
      'People take medicines they understand.',
    ),
    point(
      'w_dose',
      'How to take it',
      ['same time|each (day|evening)|every (day|evening)|6 ?pm|evening|dose (will|may|can) change|colou?r|strength'],
      'You take it once a day at the same time, usually in the evening. The dose changes with your blood tests, and the tablets are different colours for different strengths.',
      'Dose changes and tablet colours cause most errors.',
    ),
    point(
      'w_inr',
      'INR blood tests',
      ['\\binr\\b|blood test|clinic|monitor'],
      'You’ll need regular INR blood tests: often at first, then less often once your dose is steady. We aim for an INR of about 2.5.',
      'The INR decides the dose.',
    ),
    point(
      'w_bleed',
      'Bleeding: when to get help',
      ['bleed|blood in (your )?(urine|wee|poo|stool)|black (poo|stool)|bruis|nosebleed|head injury|bang (your )?head|vomit(ing)? blood'],
      'Get help urgently if you have bleeding that won’t stop, blood in your urine, black stools, vomit blood, or if you bang your head.',
      'The safety-net that must not be missed.',
      { weight: 'redflag' },
    ),
    point(
      'w_interact',
      'Other medicines',
      ['other (medicine|medication|tablet)|interact|antibiotic|ibuprofen|aspirin|nsaid|st john|herbal|pharmacist|over the counter'],
      'Many medicines affect warfarin, including antibiotics, ibuprofen and herbal remedies. Check with a pharmacist before starting anything, and tell anyone who treats you that you take it.',
      'Interactions are the commonest cause of a high INR.',
    ),
    point(
      'w_diet',
      'Alcohol and diet',
      ['alcohol|drink|diet|green (veg|vegetable)|vitamin k|cranberry|grapefruit'],
      'Keep alcohol low and steady, avoid cranberry juice, and keep your diet consistent: big changes in green vegetables change your INR.',
      'Binges and diet changes swing the INR.',
      { weight: 'extra' },
    ),
    point(
      'w_card',
      'Record book and alert card',
      ['yellow book|alert card|\\bcard\\b|record book|book'],
      'You’ll get a record book for your doses and INRs, and an alert card to carry with you.',
      'Other clinicians need to know.',
      { weight: 'extra' },
    ),
    point(
      'w_pregnancy',
      'Pregnancy',
      ['pregnan|contracept|baby'],
      'Warfarin can harm a baby, so use reliable contraception and tell us straight away if you might be pregnant: we would switch you to injections.',
      'Warfarin is teratogenic.',
      { tag: 'fertile', defaultAnswer: 'Okay.' },
    ),
    teachBack('w_teachback'),
  ],
  patients: [
    {
      id: 'w_af',
      indication: 'AF with mitral stenosis',
      difficulty: 1,
      patient: {
        name: 'Frank Morris',
        age: 76,
        sex: 'male',
        setting: 'Cardiology clinic',
        opening: 'The doctor says I need a blood thinner for my heart rhythm. My neighbour says it’s rat poison!',
      },
      summary:
        'Frank Morris, 76. Atrial fibrillation with moderate to severe mitral stenosis, so warfarin rather than a DOAC. Weight 80 kg, eGFR 58, baseline INR 1.1, platelets normal. Medicines: bisoprolol 5 mg once daily, atorvastatin 20 mg at night. About 20 units of alcohol a week. No known drug allergies.',
      answers: {
        w_ideas: 'Only that it’s rat poison. My neighbour told me!',
        w_diet: 'Ah. I do like my beer at the weekend. I’ll keep it steady.',
        w_interact: 'I take glucosamine and fish oil from the health shop. I’ll ask the pharmacist.',
        w_teachback:
          'One tablet in the evening at whatever dose the clinic says, blood tests, nothing new without asking, steady on the beer, and get help if I bleed or bang my head.',
      },
      concerns: [
        { itemId: 'w_bleed', text: 'What if I fall over? I’m a bit wobbly these days.' },
        { itemId: 'w_inr', text: 'How often will I need these blood tests?' },
        { itemId: 'w_interact', text: 'Can I still take my glucosamine and fish oil?' },
      ],
      rx: [
        rxDrug('Warfarin', ['warfarin']),
        rxDose(
          'Dose by a slow-start protocol, adjusted to the INR',
          ['protocol|nomogram|slow|load|according to (the )?inr|as per (the )?inr|adjust|\\d+ ?mg'],
          'Use the local initiation protocol; slower starts suit older outpatients.',
        ),
        rxOral,
        rxFreq('Once daily at 6 pm', [...ONCE_DAILY, '6 ?pm|18 ?00'], 'The same time each day, so the INR reflects a steady dose.'),
        r(
          'rx_target',
          'Target INR 2.5 (range 2–3), written on the chart',
          'core',
          ['target|2 ?5|2 (to|-) ?3'],
          'Every warfarin prescription states the target.',
          undefined,
          'Prescription',
        ),
      ],
      rxDistractors: [
        {
          label: 'Apixaban 5 mg twice daily',
          match: ['apixaban|rivaroxaban|edoxaban|dabigatran|\\bdoac\\b'],
          whyNot: 'DOACs are not recommended with moderate or severe mitral stenosis.',
        },
      ],
      review: [
        {
          id: 'warf-high',
          label: 'Two months later',
          prompt: 'His INR is 8.2. He feels well, with no bleeding. He started clarithromycin 4 days ago. What do you do?',
          items: [
            r('stop', 'Stop the warfarin', 'core', ['stop|omit|withhold|hold'], ''),
            r('vitk', 'Oral vitamin K 1–5 mg', 'core', ['vitamin k|phytomenadione'], ''),
            r(
              'recheck',
              'Recheck the INR the next day; restart when it is below 5',
              'core',
              ['recheck|repeat|next day|restart|below 5|under 5'],
              '',
            ),
            r(
              'switch',
              'Switch the clarithromycin if there is an alternative',
              'core',
              ['clarithro|switch|alternative|antibiotic|doxycycl|amoxicill'],
              '',
            ),
          ],
        },
        {
          label: 'Alcohol',
          prompt: 'He asks whether he can keep drinking about 20 units a week. What do you advise?',
          items: [
            r(
              'limit',
              'Keep within 14 units a week, spread out, with no binges',
              'core',
              ['14|cut (down|back)|reduce|less|spread|binge'],
              '',
            ),
            r('why', 'Alcohol changes the INR and raises the risk of bleeding and falls', 'core', ['inr|bleed|fall|liver'], ''),
            r('tell', 'Tell the clinic if his drinking changes', 'extra', ['tell|clinic|change'], ''),
          ],
        },
      ],
      pearl:
        'Not every AF patient can have a DOAC: moderate or severe mitral stenosis and mechanical valves still need warfarin. Write the target INR on every prescription.',
    },
    {
      id: 'w_dvt',
      indication: 'DVT with antiphospholipid syndrome',
      difficulty: 2,
      tags: ['fertile'],
      patient: {
        name: 'Joanne Carter',
        age: 44,
        sex: 'female',
        setting: 'Ambulatory care unit',
        opening: 'They’ve said I need warfarin for this clot. My mum was on it and she was always at the hospital for blood tests.',
      },
      summary:
        'Joanne Carter, 44. New left femoral DVT on ultrasound. Known antiphospholipid syndrome (triple positive), so a DOAC is not suitable. Weight 72 kg, eGFR over 90, baseline INR 1.0, platelets normal. Started treatment-dose enoxaparin this morning. No other medicines. No known drug allergies.',
      answers: {
        w_ideas: 'My mum was on it. She had to have loads of blood tests.',
        w_interact: 'So paracetamol for my period pains instead. Okay.',
        w_pregnancy: 'Oh. We were thinking about trying for a baby next year…',
        w_teachback:
          'One tablet in the evening at the dose they tell me, keep the injections going until the INR is right, INR tests, no ibuprofen, and get help if I bleed or bang my head.',
      },
      concerns: [
        { itemId: 'w_bleed', text: 'What if I cut myself shaving my legs? Will it keep bleeding?' },
        { itemId: 'w_interact', text: 'Can I still take ibuprofen for my period pains?' },
        { itemId: 'w_pregnancy', text: 'Is it safe if I get pregnant?' },
      ],
      rx: [
        rxDrug('Warfarin', ['warfarin']),
        rxDose(
          'Loading dose by protocol, adjusted to the INR',
          ['protocol|nomogram|load|according to (the )?inr|as per (the )?inr|adjust|\\d+ ?mg'],
          'Follow the local loading protocol.',
        ),
        rxOral,
        rxFreq('Once daily at 6 pm', [...ONCE_DAILY, '6 ?pm|18 ?00'], ''),
        r(
          'rx_lmwh',
          'Continue enoxaparin until the INR is 2 or more for 24 hours (at least 5 days)',
          'core',
          ['lmwh|heparin|enoxaparin|dalteparin|tinzaparin'],
          'Warfarin takes days to work and is briefly prothrombotic.',
          undefined,
          'Prescription',
        ),
        r('rx_target', 'Target INR 2.5 (range 2–3)', 'extra', ['target|2 ?5|2 (to|-) ?3'], '', undefined, 'Prescription'),
      ],
      rxDistractors: [
        {
          label: 'Rivaroxaban',
          match: ['rivaroxaban|apixaban|edoxaban|dabigatran|\\bdoac\\b'],
          whyNot: 'MHRA: DOACs are not recommended in antiphospholipid syndrome, especially triple positive.',
        },
      ],
      review: [
        {
          label: 'Day 3',
          prompt: 'Day 3: her INR is 1.6. What happens to the enoxaparin and the warfarin?',
          items: [
            r('lmwh', 'Continue enoxaparin: the INR isn’t yet 2 or more for 24 hours', 'core', ['continue|enoxaparin|lmwh|heparin'], ''),
            r('warf', 'Continue warfarin, dosed by the loading protocol', 'core', ['warfarin|protocol|nomogram|dose'], ''),
            r('inr', 'Recheck the INR in 1–2 days', 'core', ['recheck|repeat|check (the |her )?inr|1 ?(to|-)? ?2 days|tomorrow|daily'], ''),
          ],
        },
        {
          id: 'warf-pregnancy',
          label: 'Planning a pregnancy',
          prompt: 'She and her partner hope to have a baby next year. What do you advise?',
          items: [
            r(
              'terato',
              'Warfarin is teratogenic, especially in weeks 6–12',
              'core',
              ['teratogen|harm|birth defect|embryopathy|6 ?(to|-) ?12'],
              '',
            ),
            r(
              'contra',
              'Reliable contraception now, avoiding oestrogen (it raises clot risk)',
              'core',
              ['contracept|coil|\\biud|progest|implant|avoid (the )?(combined|oestrogen)'],
              '',
            ),
            r(
              'plan',
              'Plan ahead with haematology and obstetrics: switch to LMWH before 6 weeks',
              'core',
              ['lmwh|heparin|switch|plan|specialist|haematolog|obstetric'],
              '',
            ),
          ],
        },
      ],
      pearl:
        'Warfarin takes days to work and briefly makes the blood more likely to clot (protein C falls first): overlap with LMWH for at least 5 days and until the INR is 2 or more for 24 hours.',
    },
  ],
};
