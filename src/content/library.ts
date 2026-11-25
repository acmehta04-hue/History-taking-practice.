import type { LibraryCard } from './types';

/**
 * Teaching cards shown after sets and in the Library tab.
 * Content is educational and written from NICE / BNF guidance as understood at
 * the time of writing. Every card lists where to verify it. Have a clinician
 * review any change before release (see docs/CONTENT_GUIDE.md).
 */
export const library: LibraryCard[] = [
  {
    id: 'socrates',
    title: 'SOCRATES, properly',
    kicker: 'Pain history framework',
    specialtyId: 'gastro',
    minutes: 3,
    blocks: [
      {
        heading: 'What each letter is for',
        points: [
          'Site — localises the organ. RUQ: biliary. Epigastric: peptic, pancreatic. RIF: appendix, ovary. Loin: kidney.',
          'Onset — sudden (seconds to minutes) suggests perforation, rupture, torsion or ischaemia; gradual suggests inflammation.',
          'Character — colicky means a hollow organ (bowel, ureter, biliary); constant means inflammation or peritonism.',
          'Radiation — to the shoulder tip: diaphragm irritation (blood, pus). Through to the back: pancreas or aorta. Loin to groin: ureteric colic.',
          'Associated symptoms — fever, vomiting, bowel and urinary change, PV bleeding.',
          'Timing — constant or intermittent; migration (appendicitis); duration over 24 h (cholecystitis rather than colic).',
          'Exacerbating / relieving — movement and coughing (peritonism), food (biliary, mesenteric ischaemia), leaning forward (pancreatitis).',
          'Severity — 0–10 to track change; pain out of proportion to exam suggests mesenteric ischaemia.',
        ],
      },
      {
        heading: 'Make it flow',
        points: [
          'Start open and let the patient talk — you will get half of SOCRATES for free.',
          'Fill the gaps in order, so you never lose your place.',
          'Summarise back: “So, 18 hours of pain that started around your belly button and moved to the right…”',
          'Finish with ICE before moving on to the systems review.',
        ],
      },
    ],
    verify: ['Any OSCE history-taking text; local teaching'],
  },
  {
    id: 'abdo-red-flags',
    title: 'Abdominal pain: red flags & first tests',
    kicker: 'Acute abdomen',
    specialtyId: 'gastro',
    minutes: 4,
    blocks: [
      {
        heading: 'Do not miss',
        points: [
          'Pregnancy test in anyone who could be pregnant — ectopic pregnancy until proven otherwise.',
          'Haemodynamic instability, peritonism or rigidity: senior review now.',
          'Over 50 with abdominal/back pain and collapse: ruptured AAA.',
          'Fever, RUQ pain and jaundice: cholangitis (Charcot’s triad).',
          'Haematemesis or melaena: upper GI bleed — risk-stratify (Glasgow–Blatchford).',
          'Weight loss, iron-deficiency anaemia, dysphagia, change in bowel habit in older adults: suspected cancer pathways (NICE NG12).',
        ],
      },
      {
        heading: 'Investigations — with the reason',
        points: [
          'FBC — anaemia (bleeding), raised WCC (infection/inflammation).',
          'CRP — inflammation; trend matters more than one value.',
          'U&E — dehydration, AKI, baseline before contrast and fluids.',
          'LFTs — obstructive pattern (bilirubin, ALP, GGT) suggests a duct stone.',
          'Amylase/lipase — pancreatitis (>3× upper limit of normal).',
          'Venous gas with lactate — ischaemia or sepsis.',
          'Urine dip — UTI, haematuria in renal colic.',
          'Erect CXR — free air under the diaphragm in perforation.',
          'Ultrasound — first line for biliary and gynae pathology.',
          'CT abdomen/pelvis — most adult acute abdomens when the diagnosis is unclear.',
          'Faecal calprotectin — IBD versus IBS in young adults (NICE DG11).',
          'FIT — suspected colorectal cancer in primary care (NICE DG56).',
        ],
      },
    ],
    verify: ['NICE NG12 (suspected cancer)', 'NICE DG11 (faecal calprotectin)', 'NICE DG56 (FIT)', 'Local acute surgical guidelines'],
  },
  {
    id: 'adherence',
    title: 'Adherence: ask, classify, act',
    kicker: 'Medicines optimisation',
    specialtyId: 'psych',
    minutes: 4,
    blocks: [
      {
        heading: 'Ask without blame',
        points: [
          '“Lots of people find it hard to take tablets every day. How often would you say you miss a dose?”',
          'Ask what they actually take, not what is on the list.',
          'Ask what they think the medicine is for, and what worries them about it.',
        ],
      },
      {
        heading: 'Classify',
        points: [
          'Unintentional — forgetting, complex regimens, poor dexterity or eyesight, cost, supply problems.',
          'Intentional — side effects, beliefs (“I don’t need it when I feel fine”), fear of dependence, stigma.',
          'Most non-adherence is a rational decision from the patient’s point of view. Find the reason.',
        ],
      },
      {
        heading: 'Options to offer',
        points: [
          'Simplify — once daily, fewer tablets, combination products.',
          'Routines and reminders — link to brushing teeth, phone alarms, apps.',
          'Pharmacist — New Medicine Service, structured medication review.',
          'Adapted packaging — only for a specific practical problem, not routinely (NICE CG76).',
          'Side effects — change dose or timing, switch drug, or treat the side effect.',
          'Beliefs — explain the benefits, address concerns, use shared decision-making. Accept an informed choice to decline.',
          'Long-acting options where appropriate — e.g. depot antipsychotics, with consent.',
          'Cost — prescription prepayment certificate (England).',
          'Follow up, and check understanding with teach-back.',
        ],
      },
    ],
    verify: ['NICE CG76 Medicines adherence', 'NICE NG5 Medicines optimisation'],
  },
  {
    id: 'palpitations-approach',
    title: 'Palpitations: history to monitor',
    kicker: 'Cardiology',
    specialtyId: 'cardio',
    minutes: 3,
    blocks: [
      {
        heading: 'Red flags — same-day or urgent referral',
        points: [
          'Palpitations with syncope or presyncope.',
          'Palpitations on exertion.',
          'Family history of sudden cardiac death under 40, or inherited cardiac conditions.',
          'Known structural heart disease or heart failure.',
          'Abnormal ECG: pre-excitation, long QT, Brugada pattern, heart block, broad-complex tachycardia.',
        ],
      },
      {
        heading: 'Choosing the monitor',
        points: [
          'Daily symptoms → 24–48 hour Holter.',
          'Weekly or monthly → event recorder or patch (7–14 days).',
          'Rare symptoms with syncope → implantable loop recorder (specialist).',
          'Patient-captured smartphone or watch ECGs are useful — ask to see them.',
        ],
      },
      {
        heading: 'Bloods — with the reason',
        points: [
          'TFTs — thyrotoxicosis causes AF and sinus tachycardia.',
          'U&E and magnesium — electrolyte disturbance provokes arrhythmia.',
          'FBC — anaemia causes a compensatory tachycardia.',
        ],
      },
    ],
    verify: ['NICE CKS Palpitations', 'NICE NG196 Atrial fibrillation'],
  },
  {
    id: 'hyperthyroidism',
    title: 'Hyperthyroidism in 4 minutes',
    kicker: 'Endocrinology',
    specialtyId: 'cardio',
    minutes: 4,
    blocks: [
      {
        heading: 'Screen in the history',
        points: [
          'Heat intolerance, sweating, weight loss with increased appetite, tremor.',
          'Palpitations, anxiety, irritability, poor sleep.',
          'Increased bowel frequency, oligomenorrhoea.',
          'Graves’-specific: eye disease (grittiness, staring, diplopia), pretibial myxoedema, acropachy.',
        ],
      },
      {
        heading: 'Causes',
        points: [
          'Graves’ disease (most common), toxic multinodular goitre, toxic adenoma.',
          'Thyroiditis — subacute (painful), postpartum, painless.',
          'Drugs — amiodarone, excess levothyroxine, iodine contrast.',
        ],
      },
      {
        heading: 'Investigations and management',
        points: [
          'TSH (suppressed) with free T4 ± T3; TSH receptor antibodies for Graves’.',
          'Beta-blocker (e.g. propranolol) for symptoms.',
          'Refer to endocrinology. Carbimazole first-line antithyroid drug; propylthiouracil in the first trimester.',
          'Carbimazole safety-net: sore throat, fever or mouth ulcers → stop and get an urgent FBC (agranulocytosis).',
          'Definitive: radioactive iodine (not in pregnancy or active eye disease) or thyroidectomy.',
          'Thyroid storm — fever, tachycardia, confusion — is an emergency.',
        ],
      },
    ],
    verify: ['NICE NG145 Thyroid disease', 'BNF: carbimazole'],
  },
  {
    id: 'amiodarone',
    title: 'Amiodarone: the monitoring drug',
    kicker: 'Clinical pharmacology',
    specialtyId: 'cardio',
    minutes: 3,
    blocks: [
      {
        heading: 'Mechanism',
        points: [
          'Class III antiarrhythmic: blocks potassium channels and prolongs repolarisation (QT). It also has class I, II and IV effects.',
          'Very long half-life (about 50 days) — effects and toxicity persist for months after stopping.',
          'About 37% iodine by weight — hence its thyroid effects.',
        ],
      },
      {
        heading: 'Adverse effects',
        points: [
          'Thyroid — hypothyroidism or thyrotoxicosis.',
          'Lungs — pneumonitis and fibrosis.',
          'Liver — hepatotoxicity.',
          'Skin and eyes — photosensitivity, blue-grey skin, corneal microdeposits; optic neuropathy (rare).',
          'Heart — bradycardia, QT prolongation. Also peripheral neuropathy.',
        ],
      },
      {
        heading: 'Monitoring and interactions',
        points: [
          'Baseline: TFTs, LFTs, U&E (potassium), CXR, ECG.',
          'TFTs and LFTs every 6 months.',
          'Interactions: warfarin (INR rises), digoxin (levels rise), simvastatin (myopathy — dose limit), other QT-prolonging drugs.',
          'Counsel: sun protection, report breathlessness, cough or visual change.',
        ],
      },
    ],
    verify: ['BNF: amiodarone', 'MHRA Drug Safety Updates'],
  },
  {
    id: 'ssris',
    title: 'SSRIs: mechanism to counselling',
    kicker: 'Psychopharmacology',
    specialtyId: 'psych',
    minutes: 5,
    blocks: [
      {
        heading: 'Mechanism',
        points: [
          'Selectively inhibit the serotonin transporter (SERT) on presynaptic neurones, increasing 5-HT in the synapse.',
          'Reuptake block is immediate, but mood benefit takes 2–4 weeks — thought to reflect downstream adaptation (5-HT1A autoreceptor desensitisation, neuroplasticity).',
        ],
      },
      {
        heading: 'Side effects',
        points: [
          'Early and usually transient: nausea, GI upset, headache, jitteriness or anxiety, insomnia.',
          'Sexual dysfunction — reduced libido, delayed orgasm or ejaculation, erectile difficulty. Common and rarely volunteered.',
          'Hyponatraemia (SIADH) — especially older people and those on diuretics.',
          'Bleeding — impaired platelet function; risk rises with NSAIDs, aspirin and anticoagulants (consider a PPI).',
          'QT prolongation — citalopram and escitalopram have dose limits.',
          'Increased suicidal thinking and agitation early in treatment, especially under 25.',
          'Emotional blunting.',
        ],
      },
      {
        heading: 'Interactions and syndromes',
        points: [
          'Serotonin syndrome with MAOIs, triptans, tramadol, St John’s wort, linezolid: agitation, hyperthermia, clonus, hyperreflexia.',
          'Discontinuation symptoms: dizziness, “brain zaps”, irritability, flu-like symptoms. Worst with paroxetine (short half-life), least with fluoxetine. Taper gradually.',
        ],
      },
      {
        heading: 'Choosing',
        points: [
          'Sertraline — commonly chosen, including in cardiac disease.',
          'Fluoxetine — the antidepressant used for under-18s (alongside therapy, specialist-led).',
          'Citalopram/escitalopram — mind the QT.',
          'Paroxetine — worst discontinuation symptoms; avoid in pregnancy.',
        ],
      },
      {
        heading: 'Counselling checklist',
        points: [
          'Takes 2–4 weeks to work; early side effects usually settle in 1–2 weeks.',
          'Not addictive, but do not stop suddenly.',
          'Seek help urgently if mood or suicidal thoughts worsen.',
          'Review within 2 weeks (1 week if under 25 or at increased risk).',
          'Continue at least 6 months after feeling better.',
        ],
      },
    ],
    verify: ['BNF: selective serotonin reuptake inhibitors', 'NICE NG222 Depression in adults', 'NICE CKS Depression'],
  },
  {
    id: 'depression-ladder',
    title: 'Depression: first, second, third line',
    kicker: 'NICE NG222',
    specialtyId: 'psych',
    minutes: 4,
    blocks: [
      {
        heading: 'Less severe (PHQ-9 under 16)',
        points: [
          'First line: guided self-help, group CBT or group behavioural activation.',
          'Also: individual CBT/BA, group exercise, mindfulness, interpersonal therapy, counselling.',
          'Antidepressants are not routinely first line unless the person prefers them.',
        ],
      },
      {
        heading: 'More severe (PHQ-9 16 or more)',
        points: [
          'First line: individual CBT combined with an antidepressant (usually an SSRI).',
          'Alternatives: individual CBT or BA alone, or an antidepressant alone, according to preference.',
        ],
      },
      {
        heading: 'If no or partial response',
        points: [
          'Check adherence, side effects, dose and duration (at least 4 weeks at a therapeutic dose).',
          'Second line: increase the dose, switch to another SSRI or another class (e.g. mirtazapine, an SNRI), or add psychological therapy.',
          'Third line (specialist): augmentation with an antipsychotic (e.g. aripiprazole, quetiapine) or lithium; ECT for severe, life-threatening depression or when a rapid response is needed.',
        ],
      },
      {
        heading: 'Throughout',
        points: [
          'Risk assessment and safety-netting at every review.',
          'Continue the antidepressant at least 6 months after remission; longer if at high risk of relapse.',
          'Refer to secondary care for high risk, psychotic features or treatment resistance.',
        ],
      },
    ],
    verify: ['NICE NG222 Depression in adults (2022)', 'NICE CKS Depression'],
  },
  {
    id: 'risk-assessment',
    title: 'Suicide risk: asking well',
    kicker: 'Psychiatry',
    specialtyId: 'psych',
    minutes: 4,
    blocks: [
      {
        heading: 'Structure',
        points: [
          'Signpost and normalise: “I ask everyone who feels this low…”',
          'Thoughts → frequency → plans → intent → preparations and final acts → access to means.',
          'Previous self-harm or attempts (method, lethality, regret at survival).',
          'Protective factors and support; risk to others and dependants; self-neglect.',
        ],
      },
      {
        heading: 'Features that raise concern',
        points: [
          'A specific plan, intent, preparations or access to lethal means.',
          'Previous attempts, especially high-lethality ones.',
          'Hopelessness; psychosis or command hallucinations.',
          'Substance misuse; recent loss; isolation; chronic pain or illness.',
          'Recent discharge from psychiatric inpatient care.',
        ],
      },
      {
        heading: 'What NICE says',
        points: [
          'Do not use risk tools or scales to predict suicide or decide who gets treatment (NICE NG225).',
          'Do a holistic, needs-based assessment and agree a collaborative safety plan.',
          'Asking directly about suicide does not increase risk.',
        ],
      },
    ],
    verify: ['NICE NG225 Self-harm (2022)', 'NICE CKS Suicide risk'],
  },
  {
    id: 'antipsychotic-monitoring',
    title: 'Antipsychotics: baselines & monitoring',
    kicker: 'Physical health in psychiatry',
    specialtyId: 'psych',
    minutes: 3,
    blocks: [
      {
        heading: 'Baseline before starting',
        points: [
          'Weight (plotted), height, BMI and waist circumference.',
          'Pulse and blood pressure.',
          'Fasting glucose or HbA1c, and lipids.',
          'Prolactin.',
          'ECG if the drug’s SPC requires it, if there are cardiovascular risk factors or a relevant family history, or on admission.',
          'Movement disorder assessment; diet, activity and smoking status.',
        ],
      },
      {
        heading: 'Ongoing',
        points: [
          'Weight weekly for the first 6 weeks, then at 12 weeks, 1 year, and annually.',
          'Pulse, BP, glucose/HbA1c and lipids at 12 weeks, 1 year, and annually.',
          'Clozapine: FBC weekly for 18 weeks, fortnightly to 1 year, then monthly (agranulocytosis). Watch for constipation and myocarditis.',
        ],
      },
      {
        heading: 'Emergencies',
        points: ['Neuroleptic malignant syndrome: fever, rigidity, autonomic instability, confusion, raised CK.'],
      },
    ],
    verify: ['NICE CG178 Psychosis and schizophrenia in adults', 'NICE CG185 Bipolar disorder', 'BNF: antipsychotics'],
  },
  {
    id: 'lithium',
    title: 'Lithium: levels, baselines, toxicity',
    kicker: 'Psychopharmacology',
    specialtyId: 'psych',
    minutes: 3,
    blocks: [
      {
        heading: 'Before starting',
        points: [
          'U&E and eGFR, TFTs, calcium, weight/BMI, FBC.',
          'ECG if there are cardiovascular risk factors.',
          'Pregnancy status and contraception.',
        ],
      },
      {
        heading: 'Levels',
        points: [
          'Take levels 12 hours after the dose.',
          'Weekly after starting and after each dose change until stable; then every 3 months for the first year; then every 6 months (every 3 months in higher-risk groups).',
          'Usual target 0.6–0.8 mmol/L.',
          'Renal function, TFTs, calcium and weight every 6 months.',
        ],
      },
      {
        heading: 'Toxicity and interactions',
        points: [
          'Toxicity: coarse tremor, vomiting, diarrhoea, ataxia, dysarthria, confusion, seizures.',
          'Levels rise with dehydration, NSAIDs, ACE inhibitors/ARBs and thiazide diuretics.',
          'Side effects: fine tremor, polyuria and polydipsia (nephrogenic DI), hypothyroidism, hyperparathyroidism, weight gain, CKD long term.',
          'Counsel: keep the lithium record book, stay hydrated, avoid OTC NSAIDs, stick to one brand.',
        ],
      },
    ],
    verify: ['NICE CG185 Bipolar disorder', 'BNF: lithium', 'NPSA lithium safety guidance'],
  },
  {
    id: 'bipolar',
    title: 'Bipolar disorder: what changes',
    kicker: 'Psychiatry',
    specialtyId: 'psych',
    minutes: 3,
    blocks: [
      {
        heading: 'Recognise',
        points: [
          'Hypomania: elevated or irritable mood with increased energy for at least 4 days, without psychosis or severe impairment (DSM-5).',
          'Mania: at least 1 week, or any duration if hospitalised; psychotic features make it mania.',
          'A high on an antidepressant is a red flag for bipolar disorder.',
        ],
      },
      {
        heading: 'Treat (specialist-led)',
        points: [
          'Suspected bipolar disorder → refer to specialist mental health services.',
          'Acute mania: stop any antidepressant; an antipsychotic (haloperidol, olanzapine, quetiapine or risperidone) first line.',
          'Bipolar depression: fluoxetine with olanzapine, or quetiapine alone; then olanzapine alone or lamotrigine.',
          'Long term: lithium first line.',
          'Valproate: MHRA restrictions — two specialists must agree for new patients under 55; never in anyone who could become pregnant unless the Pregnancy Prevention Programme is in place.',
          'Annual physical health check, psychoeducation, mood diary, early warning signs.',
        ],
      },
    ],
    verify: ['NICE CG185 Bipolar disorder', 'MHRA valproate safety measures (2024)'],
  },
  {
    id: 'psa',
    title: 'Prescribing Safety Assessment: habits that score',
    kicker: 'Prescribing',
    specialtyId: 'psych',
    minutes: 4,
    blocks: [
      {
        heading: 'What it tests',
        points: [
          'Eight question types: prescribing, prescription review, planning management, communicating information, calculation skills, adverse drug reactions, drug monitoring, and data interpretation.',
          'It is open-book: you use the BNF throughout, so practise finding things in it quickly.',
        ],
      },
      {
        heading: 'Writing a prescription',
        points: [
          'Check allergies (and the reaction), weight, kidney function and the full medicines list first.',
          'Approved (generic) name, dose, route, frequency, and a start date or duration where relevant.',
          'Write units and micrograms in full; never use a trailing zero (5 mg, not 5.0 mg).',
          'One drug, one decision: if you stop something, say why.',
        ],
      },
      {
        heading: 'SSRI interactions to know',
        points: [
          'Bleeding: NSAIDs, aspirin, anticoagulants. Avoid the combination or add a PPI.',
          'Serotonin syndrome: triptans, tramadol, St John’s wort, MAOIs, linezolid.',
          'Hyponatraemia: older age, thiazide diuretics. Check sodium.',
          'QT prolongation: citalopram and escitalopram (dose limits), with other QT-prolonging drugs.',
        ],
      },
      {
        heading: 'Data interpretation',
        points: [
          'Say what is abnormal, the most likely cause (often the drug), the risk, then the action.',
          'Ask whether the drug should be stopped, reduced, or continued with monitoring.',
        ],
      },
    ],
    verify: ['BNF', 'The PSA practice papers', 'MHRA Drug Safety Updates'],
  },
];

export const libraryById = Object.fromEntries(library.map((c) => [c.id, c]));
