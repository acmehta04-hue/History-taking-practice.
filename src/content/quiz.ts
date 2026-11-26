import type { Distractor } from './types';

/**
 * Extra wrong options for the Guided multiple-choice quiz.
 *
 * A quiz needs enough wrong options that "tick everything" fails, but a typed
 * answer should only be called wrong when it really is. So these appear only in
 * the quiz (Guided level), never when judging typed answers in the chat.
 * Each one must be clearly wrong for this patient, with the reason.
 *
 * Keyed by case id, then section id. Tests check every key is a real case and
 * section, and that no option is one of the model answers.
 */
type Opt = [label: string, whyNot: string];

const QUIZ: Record<string, Record<string, Opt[]>> = {
  /* ---------------- Abdominal pain ---------------- */
  appendicitis: {
    ddx: [
      ['Acute pancreatitis', 'Severe epigastric pain going through to the back, usually with gallstones or alcohol. Neither fits here.'],
      ['Diverticulitis', 'Usually left iliac fossa pain in people over 50. Rare at 22.'],
    ],
    ix: [['Coeliac serology', 'For chronic diarrhoea, bloating or anaemia, not an 18-hour acute abdomen.']],
    mx: [
      [
        'Withhold analgesia until a surgeon has examined',
        'An old myth: analgesia does not mask peritonism, and nobody should be left in pain.',
      ],
      ['Urgent colonoscopy', 'No role in suspected appendicitis, and bowel preparation could be harmful.'],
    ],
  },
  cholecystitis: {
    ddx: [
      ['Ovarian torsion', 'Sudden one-sided iliac fossa pain with vomiting, not RUQ pain going to the shoulder after a fatty meal.'],
      ['Diverticulitis', 'Left iliac fossa pain with a change in bowel habit; this is RUQ pain after fatty meals.'],
      ['Irritable bowel syndrome', 'A long-term pattern that never causes fever, rigors and a raised CRP.'],
    ],
    ix: [['Coeliac serology', 'For chronic diarrhoea, bloating or anaemia, not two days of acute RUQ pain with fever.']],
    mx: [
      [
        'IV co-amoxiclav',
        'She is allergic to penicillin, and co-amoxiclav contains amoxicillin. Check local guidelines for an alternative.',
      ],
      ['Urgent ERCP', 'For stones in the bile duct (jaundice, cholangitis, a dilated duct). She has none of these.'],
      ['Delay cholecystectomy for 6 weeks until it settles', 'NICE: offer laparoscopic cholecystectomy within 1 week of diagnosis.'],
    ],
  },
  crohns: {
    ddx: [
      ['Acute cholecystitis', 'Acute RUQ pain with fever after fatty food, not three months of diarrhoea and weight loss.'],
      ['Diverticular disease', 'A condition of older people, and usually left-sided. She is 24.'],
      ['Ectopic pregnancy', 'Acute pain with a missed period; it does not cause three months of diarrhoea.'],
    ],
    ix: [['Amylase', 'For acute pancreatitis. Her picture is chronic diarrhoea and weight loss.']],
    mx: [
      [
        'Mesalazine first line',
        'Aminosalicylates are first line in ulcerative colitis. In Crohn’s disease, a corticosteroid induces remission.',
      ],
      [
        'Treat as infective colitis and review in 3 months',
        'Three months of night-time diarrhoea, blood and weight loss needs urgent investigation, not watch and wait.',
      ],
    ],
  },
  ectopic: {
    ddx: [
      ['Acute cholecystitis', 'RUQ pain after fatty food. She has iliac fossa pain, spotting and a missed period.'],
      ['Diverticulitis', 'Left iliac fossa pain in older people with fever and a change in bowel habit, not bleeding in early pregnancy.'],
      ['Irritable bowel syndrome', 'Long-standing and eased by opening the bowels. It never causes shoulder-tip pain or fainting.'],
    ],
    ix: [
      ['Abdominal X-ray', 'No role: it will not show a pregnancy or blood in the pelvis.'],
      ['MRI pelvis', 'Too slow for a possible bleeding ectopic. Transvaginal ultrasound is the test.'],
    ],
    mx: [
      [
        'Repeat hCG in 48 hours as an outpatient',
        'She is faint with shoulder-tip pain, so this may be a rupture. She needs urgent gynaecology review now.',
      ],
      ['Mifepristone and misoprostol', 'That is medical management of miscarriage, not of an ectopic pregnancy.'],
    ],
  },

  /* ---------------- Change in bowel habit ---------------- */
  crc: {
    ddx: [
      [
        'Irritable bowel syndrome',
        'New symptoms after 50 with blood, weight loss and anaemia are red flags. IBS is diagnosed in people without them.',
      ],
      ['Gallstones (biliary colic)', 'Episodes of RUQ pain after fatty meals, not rectal bleeding and tenesmus.'],
      ['Anal fissure', 'Bright red blood on the paper with sharp pain on opening the bowels. It does not cause weight loss.'],
    ],
    ix: [['H. pylori breath test', 'For dyspepsia. It does not explain rectal bleeding or a change in bowel habit.']],
    mx: [
      ['Start loperamide and review in 3 months', 'Hides the symptoms and delays an urgent cancer referral.'],
      ['Routine gastroenterology referral', 'Rectal bleeding, weight loss and anaemia at 68 need the urgent suspected cancer pathway.'],
    ],
  },
  ibs: {
    ddx: [
      ['Acute appendicitis', 'An acute illness over a day or two. She has had symptoms for 14 months.'],
      ['Gallstones (biliary colic)', 'Episodes of RUQ pain after fatty meals, not crampy lower pain eased by opening the bowels.'],
      ['Hirschsprung’s disease', 'Presents in newborns or young children with severe constipation.'],
    ],
    mx: [
      ['Codeine for the pain', 'Opioids worsen constipation and can make bowel pain worse. Antispasmodics are used instead.'],
      ['Urgent colonoscopy', 'Not needed when the history fits IBS, there are no red flags and the tests are normal.'],
    ],
  },
  coeliac: {
    ddx: [
      ['Acute appendicitis', 'Acute pain over a day or two. She has six months of fatty stools.'],
      ['Diverticular disease', 'A condition of older people. It does not cause fatty stools.'],
      ['Gallstones (biliary colic)', 'Episodes of RUQ pain after fatty meals, not steatorrhoea, weight loss and an itchy rash.'],
    ],
    ix: [
      ['CA-125', 'An ovarian cancer marker for persistent bloating in women over 50. She is 34 with a malabsorption picture.'],
      ['Barium enema', 'Outdated, and it looks at the colon. Coeliac disease affects the small bowel.'],
    ],
    mx: [
      [
        'Pancreatic enzyme replacement',
        'For pancreatic insufficiency. Her fatty stools come from coeliac disease and settle on a gluten-free diet.',
      ],
      ['Short course of oral steroids', 'Not used in uncomplicated coeliac disease. The gluten-free diet is the treatment.'],
    ],
  },
  crc_results: {
    journey: [
      ['Liver metastases: palliative care only', 'The CT shows no distant spread (M0). This is potentially curable.'],
      [
        'Say it is probably nothing until the MDT has met',
        'He asked directly. Answer honestly and kindly; false reassurance destroys trust.',
      ],
      ['Blood transfusion to correct the anaemia', 'He is stable with iron deficiency. IV iron before surgery is the usual plan.'],
    ],
  },
  crc_leak: {
    journey: [
      ['Recheck observations in 4 hours', 'A NEWS2 of 8 needs an emergency response now, not a recheck.'],
      ['Oral antibiotics and review in the morning', 'Sepsis needs IV antibiotics within the hour and a senior review now.'],
      ['Furosemide for the low urine output', 'He is septic and dry. Give fluid, not a diuretic.'],
    ],
  },
  crc_sbo: {
    journey: [
      ['Gastroenteritis', 'Green vomiting, a swollen tummy and no wind or stool is obstruction, not infection.'],
      ['Start laxatives', 'Never give laxatives in suspected bowel obstruction.'],
      ['Send home with antiemetics', 'Small bowel obstruction needs admission: drip and suck, and a surgical review.'],
    ],
  },

  /* ---------------- Palpitations ---------------- */
  graves: {
    ddx: [
      ['Hypothyroidism', 'Causes weight gain, cold intolerance and a slow pulse: the opposite of her picture.'],
      ['Complete heart block', 'Causes a slow pulse and fainting, not a resting rate of 110.'],
      [
        'Ventricular tachycardia',
        'A broad-complex rhythm, usually with structural heart disease. Not six weeks of a regular rate of 110 with weight loss.',
      ],
    ],
    ix: [['Coronary angiography', 'Nothing suggests coronary disease. Her fast heart rate comes from the thyroid.']],
    mx: [
      ['Amiodarone for the heart rate', 'Contains iodine and can itself cause thyroid disease. A beta-blocker controls the symptoms.'],
      [
        'Digoxin for the tachycardia',
        'This is a sinus tachycardia from thyrotoxicosis. Treat the thyroid and use a beta-blocker for symptoms.',
      ],
    ],
  },
  af_amiodarone: {
    ddx: [
      ['Vasovagal syncope', 'A brief faint with a warning, not hours of irregular palpitations.'],
      ['Hypoglycaemia', 'Causes sweating and palpitations in people on insulin or a sulfonylurea. He takes neither.'],
      ['Complete heart block', 'Causes a slow pulse and fainting, not fast irregular palpitations.'],
    ],
    ix: [
      ['CT pulmonary angiogram', 'No pleuritic pain, low oxygen or DVT signs. His breathlessness fits fast AF.'],
      ['Exercise tolerance test', 'Not a test for palpitations from AF.'],
    ],
    mx: [['Start digoxin and stop the beta-blocker', 'A beta-blocker is first line for rate control in an active person.']],
  },
  svt: {
    ddx: [
      ['Complete heart block', 'Causes a slow pulse, not 190 a minute.'],
      ['Vasovagal syncope', 'A faint with a warning after standing or pain, not sudden runs of a regular pulse at 190.'],
      [
        'Aortic stenosis',
        'Exertional breathlessness, chest pain and fainting in older people. She is 26 with a normal heart between episodes.',
      ],
    ],
    ix: [['Coronary angiography', 'Nothing suggests coronary disease. These are re-entry episodes in a young heart.']],
    mx: [
      ['Propranolol to prevent episodes', 'She has asthma: avoid non-selective beta-blockers.'],
      ['Long-term amiodarone', 'Too toxic for a young person with a curable arrhythmia. Catheter ablation is offered.'],
    ],
  },

  /* ---------------- Low mood ---------------- */
  depression_new: {
    ddx: [
      ['Schizophrenia', 'No hallucinations, delusions or thought disorder.'],
      ['Dementia', 'Poor concentration is common in depression. At 32 with a two-month history, dementia is very unlikely.'],
      ['Obsessive–compulsive disorder', 'Intrusive thoughts with rituals. She describes low mood, loss of interest and guilt.'],
    ],
    ix: [
      ['CT head', 'No focal neurology, headache or cognitive decline to suggest a structural cause.'],
      ['EEG', 'Only for suspected seizures or encephalopathy, not depression.'],
      ['Dexamethasone suppression test', 'A test for Cushing’s syndrome. Nothing in her history suggests it.'],
    ],
    mx: [['Refer for ECT', 'Reserved for severe, life-threatening or treatment-resistant depression.']],
  },
  ssri_adherence: {
    ddx: [
      ['Schizophrenia', 'No psychotic features.'],
      ['Dementia', 'He is 45 with a clear reason for relapse and no cognitive history.'],
      [
        'Serotonin syndrome',
        'Agitation, tremor, fever and clonus after starting or combining serotonergic drugs. He has been missing doses, not adding them.',
      ],
    ],
    ix: [
      ['CT head', 'No focal neurology or cognitive features.'],
      ['EEG', 'Not part of the depression work-up.'],
      ['Serum sertraline level', 'Not a routine test. Ask about adherence instead.'],
    ],
    mx: [['Prescribe a benzodiazepine', 'Not a treatment for depression, and risky alongside alcohol.']],
  },
  bipolar: {
    ddx: [
      ['Schizophrenia', 'His episodes are mood episodes, with no persistent hallucinations or delusions between them.'],
      ['Dementia', 'Very unlikely at 26. Poor concentration here comes from depression.'],
      ['Obsessive–compulsive disorder', 'Rituals and intrusive thoughts, not episodes of high and low mood.'],
    ],
    ix: [
      ['CT head', 'Only with neurological signs, or a first episode of mania late in life.'],
      ['EEG', 'Not part of the work-up unless seizures are suspected.'],
      ['Lithium level now', 'He is not on lithium yet. Levels are taken 12 hours after a dose once it is started.'],
    ],
    mx: [['Long-term benzodiazepine for sleep', 'Dependence risk, and not a treatment for bipolar depression.']],
  },

  /* ---------------- Drug prescriptions ---------------- */
  w_af: {
    prescribe: [
      ['Target INR 3.5', 'That target is for clots despite anticoagulation, or some mechanical valves. For AF it is 2.5.'],
      ['Twice daily', 'Warfarin is taken once a day, usually at 6 pm so the dose can change after a daytime INR.'],
    ],
  },
  w_dvt: {
    prescribe: [
      [
        'Stop enoxaparin when warfarin starts',
        'Warfarin can promote clotting in the first days. Overlap until the INR is 2 or more for 24 hours, and at least 5 days.',
      ],
      ['Target INR 3.5', 'For a first DVT the target is 2.5 (range 2–3).'],
    ],
  },
  m_new: {
    prescribe: [
      ['1 g twice daily from day 1', 'Start low and build up over weeks to limit gut side effects.'],
      ['Take on an empty stomach', 'Take with or just after food to reduce nausea and diarrhoea.'],
    ],
  },
  m_ckd: {
    prescribe: [
      ['Avoid metformin: eGFR is under 60', 'Metformin can be used down to an eGFR of 30. Review the dose below 45.'],
      ['1 g twice daily from day 1', 'Start low, build up slowly, and keep checking kidney function.'],
      ['Stop ramipril', 'Ramipril protects her kidneys and treats her blood pressure. Keep it.'],
    ],
  },
  l_young: {
    prescribe: [
      [
        '25 micrograms',
        'That cautious start is for older people or heart disease. A fit adult starts on about 1.6 micrograms/kg (here 100 micrograms).',
      ],
      ['Take with the iron tablet', 'Iron reduces absorption. Separate them by 4 hours.'],
      ['Twice daily', 'Levothyroxine is taken once a day.'],
    ],
  },
  l_older: {
    prescribe: [
      ['Take with the calcium tablet', 'Calcium reduces absorption. Separate them by 4 hours.'],
      ['Increase by 50 micrograms every week', 'With angina, increase slowly: 25 micrograms every 4–6 weeks, guided by TSH.'],
    ],
  },
  p_copd: {
    prescribe: [
      ['40 mg for 14 days, then taper', 'For a COPD exacerbation, 30 mg for 5 days. No taper is needed.'],
      ['Take at night', 'Take in the morning: it follows the body’s cortisol rhythm and disturbs sleep less.'],
      ['Stop metformin while on steroids', 'Keep metformin. Check glucose, because steroids raise it.'],
    ],
  },
  p_pmr: {
    prescribe: [
      ['40–60 mg', 'That dose is for giant cell arteritis. Polymyalgia responds to 15 mg.'],
      ['Stop after 1 week if better', 'Polymyalgia needs a slow taper over 1–2 years. Stopping suddenly risks relapse and adrenal crisis.'],
      ['Take at night', 'Take in the morning: it follows the body’s cortisol rhythm and disturbs sleep less.'],
    ],
  },
  x_ra: {
    prescribe: [
      ['Folic acid on the same day as methotrexate', 'Give folic acid on a different day from the methotrexate.'],
      ['Methotrexate 10 mg tablets', 'Use one strength only, 2.5 mg tablets, to avoid dosing errors.'],
    ],
  },
  x_psoriasis: {
    prescribe: [
      ['10 mg once daily', 'Methotrexate is taken once a week. Daily dosing has killed patients.'],
      [
        'Continue ibuprofen 400 mg three times daily unchanged',
        'NSAIDs reduce methotrexate clearance. Review the need and monitor closely.',
      ],
      ['Folic acid on the same day as methotrexate', 'Give folic acid on a different day from the methotrexate.'],
    ],
  },
  a_fracture: {
    prescribe: [
      ['70 mg once daily', 'The 70 mg tablet is taken once a week.'],
      [
        'Take with breakfast and a cup of tea',
        'Take on an empty stomach with a full glass of plain water, 30 minutes before food or drink, and stay upright.',
      ],
      ['Take calcium at the same time', 'Calcium stops alendronic acid being absorbed. Take it at a different time of day.'],
    ],
  },
  a_steroid: {
    prescribe: [
      [
        'Wait for a DEXA scan before starting',
        'At 72 on long-term steroids, start bone protection straight away without waiting for a scan.',
      ],
      ['70 mg once daily', 'The 70 mg tablet is taken once a week.'],
      ['Take with breakfast', 'Take on an empty stomach with plain water, 30 minutes before food, and stay upright.'],
    ],
  },
};

/** Quiz-only wrong options for one case and section */
export function quizExtras(caseId: string, sectionId: string): Distractor[] {
  return (QUIZ[caseId]?.[sectionId] ?? []).map(([label, whyNot]) => ({ label, match: [], whyNot }));
}

/** For the tests */
export const quizKeys = () => Object.entries(QUIZ).flatMap(([caseId, s]) => Object.keys(s).map((sectionId) => ({ caseId, sectionId })));
