import { r } from '../common';
import type { VivaQuestion } from '../types';

/**
 * Viva questions for the palpitations patients.
 * tier 1 recall · tier 2 explain why (+ examiner probe) · tier 3 data and what-ifs.
 * Verify against NICE, the BNF and the Resuscitation Council before release.
 */
export const palpitationsViva: Record<string, VivaQuestion[]> = {
  graves: [
    {
      id: 'graves-signs',
      tier: 1,
      prompt: "Which signs are specific to Graves' disease, rather than to any cause of hyperthyroidism?",
      items: [
        r(
          'eyes',
          'Thyroid eye disease: proptosis, ophthalmoplegia, chemosis',
          'core',
          ['\\beye|proptosis|exophthalm|ophthalmopleg|chemosis'],
          'Autoimmune inflammation behind the eye.',
        ),
        r('myx', 'Pretibial myxoedema', 'core', ['pretibial|myxoedema|myxedema'], 'Autoimmune skin infiltration.'),
        r('acro', 'Thyroid acropachy (finger clubbing)', 'core', ['acropachy|clubbing'], 'Rare, but specific.'),
        r(
          'goitre',
          'A diffuse goitre, sometimes with a bruit',
          'extra',
          ['diffuse|bruit|goitre'],
          'TSH-receptor antibodies stimulate the whole gland.',
        ),
      ],
      distractors: [
        { label: 'Fine tremor', match: ['tremor'], whyNot: 'Any cause of thyrotoxicosis gives a tremor.' },
        {
          label: 'Lid lag',
          match: ['lid lag'],
          whyNot: 'Lid lag comes from sympathetic overactivity, so it appears in any thyrotoxicosis.',
        },
      ],
    },
    {
      id: 'graves-carbimazole',
      tier: 1,
      prompt: 'What are the important side effects of carbimazole?',
      items: [
        r(
          'agran',
          'Agranulocytosis: a sore throat or fever means stop it and check an FBC',
          'redflag',
          ['agranulocyt|neutropen|sore throat|white cells'],
          'Rare but life-threatening.',
        ),
        r('rash', 'Rash and itching (common)', 'core', ['rash|itch|prurit'], 'The commonest side effect.'),
        r('liver', 'Liver injury (cholestatic jaundice)', 'extra', ['liver|hepat|jaund|cholest'], 'Rare.'),
        r(
          'pregnancy',
          'Harmful in early pregnancy (propylthiouracil is used in the first trimester)',
          'extra',
          ['teratogen|pregnan|trimester|\\bptu\\b|propylthiouracil'],
          'Carbimazole is linked to congenital abnormalities.',
        ),
      ],
    },
    {
      id: 'graves-bb',
      tier: 2,
      prompt: 'Why is propranolol used in thyrotoxicosis, and when would you avoid it?',
      items: [
        r(
          'symptoms',
          'Blocks the adrenergic effects: tremor, palpitations, anxiety, sweating',
          'core',
          ['adrenergic|sympath|tremor|palpitat|symptom'],
          'Thyroid hormone sensitises tissues to catecholamines.',
        ),
        r(
          'bridge',
          'Gives quick relief while antithyroid drugs take weeks to work',
          'core',
          ['quick|fast|weeks|while|bridge|until'],
          'Carbimazole takes 4–8 weeks to restore normal levels.',
        ),
        r('asthma', 'Avoid in asthma', 'core', ['asthma'], 'Non-selective beta-blockade can cause bronchospasm.'),
        r('t3', 'Also reduces peripheral T4-to-T3 conversion', 'extra', ['conversion|\\bt3\\b|peripheral'], 'A modest extra benefit.'),
      ],
      probe: {
        prompt: 'She has asthma. What would you use instead?',
        items: [
          r(
            'ccb',
            'A rate-limiting calcium channel blocker: diltiazem or verapamil',
            'core',
            ['diltiazem|verapamil|calcium channel'],
            'Slows the heart without bronchospasm.',
          ),
        ],
      },
    },
    {
      id: 'graves-tfts',
      tier: 3,
      prompt: 'Two months into carbimazole, interpret her thyroid function.',
      data: 'At diagnosis: TSH < 0.01 mU/L, free T4 38 pmol/L, TRAb positive · Now: TSH < 0.01 mU/L, free T4 9 pmol/L (range 12–22)',
      items: [
        r(
          'lag',
          'TSH lags behind: it can stay suppressed for months',
          'core',
          ['\\blag|suppress|slow|months|behind'],
          'The pituitary takes time to recover.',
        ),
        r(
          'over',
          'Free T4 is now low: she is over-treated',
          'core',
          ['over ?treat|too much|hypothyroid|\\blow\\b'],
          'She is becoming hypothyroid.',
        ),
        r(
          'reduce',
          'Reduce the carbimazole dose (or switch to block-and-replace)',
          'core',
          ['reduce|lower|decrease|block and replace|levothyrox'],
          'Titrate to free T4.',
        ),
        r(
          'guide',
          'Use free T4, not TSH, to guide early dosing',
          'extra',
          ['free t4|\\bft4\\b|\\bt4\\b'],
          'TSH is unreliable early in treatment.',
        ),
      ],
    },
  ],

  af_amiodarone: [
    {
      id: 'af-chads',
      tier: 1,
      prompt: 'What is the CHA₂DS₂-VASc score, and what is his?',
      items: [
        r(
          'what',
          'Estimates stroke risk in AF, to decide on anticoagulation',
          'core',
          ['stroke', 'anticoag'],
          'Paired with a bleeding-risk score (ORBIT in NICE NG196).',
        ),
        r(
          'components',
          'Heart failure, hypertension, age, diabetes, stroke or TIA, vascular disease, sex',
          'core',
          ['heart failure|hypertension|diabetes|vascular|\\btia\\b|\\bsex\\b|\\bage\\b'],
          'Age 75+ and previous stroke score 2 each.',
        ),
        r(
          'score',
          'His score is 2 (hypertension, age 65–74): anticoagulate',
          'core',
          ['\\b2\\b|\\btwo\\b'],
          'NICE NG196: offer anticoagulation at 2 or more.',
        ),
      ],
    },
    {
      id: 'af-doac',
      tier: 1,
      prompt: 'How do DOACs such as apixaban differ from warfarin?',
      items: [
        r('inr', 'No routine INR monitoring', 'core', ['\\binr\\b|monitor'], 'Predictable effect.'),
        r('fixed', 'Fixed doses, with fewer food and drug interactions', 'core', ['fixed|food|diet|interact'], 'Simpler to take.'),
        r(
          'renal',
          'Doses depend on kidney function, age and weight',
          'core',
          ['renal|kidney|creatinine|egfr|clearance'],
          'Check U&E before starting and regularly after.',
        ),
        r(
          'reversal',
          'Specific reversal agents (andexanet alfa; idarucizumab for dabigatran)',
          'extra',
          ['revers|andexanet|idarucizumab|antidote'],
          'For life-threatening bleeding.',
        ),
        r(
          'valves',
          'Not for mechanical valves or moderate-to-severe mitral stenosis',
          'extra',
          ['valve|mitral'],
          'Warfarin is still used there.',
        ),
      ],
    },
    {
      id: 'af-amio-thyroid',
      tier: 2,
      prompt: 'Why can amiodarone cause both hypothyroidism and thyrotoxicosis?',
      items: [
        r('iodine', 'It is about 37% iodine by weight', 'core', ['iodine'], 'A huge iodine load.'),
        r(
          'hypo',
          'The iodine load can shut down hormone synthesis (Wolff–Chaikoff effect): hypothyroidism',
          'core',
          ['wolff|chaikoff|shut|inhibit|hypothyroid'],
          'Commoner in iodine-sufficient areas such as the UK.',
        ),
        r(
          'hyper',
          'Or drive excess synthesis (type 1), or cause a destructive thyroiditis (type 2): thyrotoxicosis',
          'core',
          ['type 1|type 2|thyroiditis|destruct|excess|basedow|thyrotox'],
          'Two mechanisms with different treatments.',
        ),
      ],
      probe: {
        prompt: 'How do type 1 and type 2 amiodarone-induced thyrotoxicosis differ in treatment?',
        items: [
          r(
            't1',
            'Type 1 (excess synthesis, often with underlying thyroid disease): carbimazole',
            'core',
            ['type 1|carbimazole|thionamide|antithyroid'],
            'Block hormone production.',
          ),
          r('t2', 'Type 2 (destructive thyroiditis): prednisolone', 'core', ['type 2|prednisolone|steroid'], 'Damp down the inflammation.'),
          r(
            'tests',
            'Thyroid ultrasound with colour-flow Doppler, or an uptake scan, helps tell them apart',
            'extra',
            ['doppler|uptake|ultrasound|scan'],
            'Often mixed in practice: specialist care.',
          ),
        ],
      },
    },
    {
      id: 'af-ecg',
      tier: 3,
      prompt: 'Interpret this ECG. What does it mean for his medicines?',
      data: 'Irregularly irregular narrow-complex tachycardia at 140/min · no P waves · QTc 510 ms',
      items: [
        r('af', 'AF with a fast ventricular rate', 'core', ['\\baf\\b|atrial fib|irregular'], 'Rate control is needed.'),
        r('qt', 'Prolonged QTc (an amiodarone effect)', 'core', ['\\bqt|prolong'], 'Over 500 ms is high risk.'),
        r(
          'avoid',
          'Avoid other QT-prolonging drugs (e.g. clarithromycin, citalopram, ondansetron)',
          'core',
          ['avoid|clarithromycin|macrolide|citalopram|ondansetron|other qt'],
          'Check every new prescription.',
        ),
        r(
          'electrolytes',
          'Check and correct potassium and magnesium',
          'core',
          ['potassium|magnesium|electrolyte|\\bk\\b|\\bmg\\b'],
          'Low levels add to the risk.',
        ),
        r('torsades', 'Risk of torsades de pointes', 'extra', ['torsade|polymorphic'], 'Polymorphic VT that can degenerate into VF.'),
      ],
    },
  ],

  svt: [
    {
      id: 'svt-wpw',
      tier: 1,
      prompt: 'What does Wolff–Parkinson–White look like on a resting ECG, and why?',
      items: [
        r('pr', 'Short PR interval', 'core', ['short pr'], 'Conduction bypasses the AV-node delay.'),
        r('delta', 'Delta wave: a slurred upstroke of the QRS', 'core', ['delta|slur'], 'Early activation of ventricular muscle.'),
        r('broad', 'Broad QRS', 'extra', ['broad|wide'], 'Fusion of two activation fronts.'),
        r(
          'pathway',
          'An accessory pathway (bundle of Kent) bypasses the AV node, so the ventricles are pre-excited',
          'core',
          ['accessory|kent|bypass|pre ?excit'],
          'The anatomical cause.',
        ),
      ],
    },
    {
      id: 'svt-adverse',
      tier: 1,
      prompt: 'What are the adverse features in a patient with a tachyarrhythmia?',
      items: [
        r(
          'shock',
          'Shock: hypotension, pallor, sweating, cold extremities, confusion',
          'core',
          ['shock|hypotens|low bp|blood pressure'],
          'Resuscitation Council UK.',
        ),
        r('syncope', 'Syncope', 'core', ['syncop|faint|loss of consciousness|collapse'], 'Transient loss of cerebral perfusion.'),
        r(
          'ischaemia',
          'Myocardial ischaemia: chest pain or ECG changes',
          'core',
          ['ischaem|chest pain'],
          'The heart cannot meet its own demand.',
        ),
        r('hf', 'Severe heart failure', 'core', ['heart failure|pulmonary oedema'], 'Pulmonary oedema or raised JVP.'),
      ],
    },
    {
      id: 'svt-mechanism',
      tier: 2,
      prompt: 'Why do vagal manoeuvres and adenosine terminate AVNRT?',
      items: [
        r(
          'reentry',
          'AVNRT is a re-entry circuit that runs through the AV node',
          'core',
          ['re ?entr|circuit|loop'],
          'Two pathways within or near the AV node.',
        ),
        r(
          'block',
          'Both briefly slow or block AV-node conduction, which breaks the circuit',
          'core',
          ['\\bblock|slow|av node|atrioventricular'],
          'Break one link and the loop stops.',
        ),
        r(
          'halflife',
          'Adenosine has a half-life of seconds, so the effect is brief',
          'extra',
          ['half ?life|seconds|brief|short'],
          'Give it as a rapid bolus with a flush.',
        ),
      ],
      probe: {
        prompt: 'Why is adenosine avoided in asthma?',
        items: [
          r(
            'bronchospasm',
            'It can cause bronchospasm',
            'core',
            ['bronchospasm|bronchoconstrict|wheeze|airway'],
            'Via adenosine receptors in the airways.',
          ),
          r('verapamil', 'Use IV verapamil instead', 'core', ['verapamil'], 'If there are no contraindications.'),
        ],
      },
    },
    {
      id: 'svt-preexcited',
      tier: 3,
      prompt: 'Her resting ECG shows a delta wave. During her next episode, this is the ECG. What is happening, and what must you avoid?',
      data: 'Irregular broad-complex tachycardia at 230/min · varying QRS width · BP 112/70',
      items: [
        r(
          'preaf',
          'Pre-excited AF: AF conducting down the accessory pathway',
          'redflag',
          ['pre ?excit|accessory|\\bwpw\\b'],
          'Very fast ventricular rates are possible.',
        ),
        r(
          'avoid',
          'Avoid AV-node blockers (adenosine, verapamil, diltiazem, digoxin, beta-blockers): they can trigger VF',
          'redflag',
          ['avoid|adenosine|verapamil|digoxin|nodal|beta|\\bvf\\b'],
          'Blocking the AV node pushes more impulses down the pathway.',
        ),
        r(
          'treat',
          'Stable: specialist advice; unstable: synchronised DC cardioversion',
          'core',
          ['cardiover|dccv|dc shock|specialist|cardiolog|flecainide|procainamide'],
          'Expert help early.',
        ),
        r('ablation', 'Then refer for accessory pathway ablation', 'extra', ['ablat'], 'Curative.'),
      ],
    },
  ],
};
