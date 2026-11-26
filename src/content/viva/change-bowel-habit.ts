import { r } from '../common';
import type { VivaQuestion } from '../types';

/**
 * Viva questions for the change in bowel habit patients.
 * tier 1 recall · tier 2 explain why (+ examiner probe) · tier 3 data and what-ifs.
 * Verify against NICE NG12 / DG56 (FIT), CG61 (IBS), NG20 (coeliac) and the BNF before release.
 */
export const bowelHabitViva: Record<string, VivaQuestion[]> = {
  crc: [
    {
      id: 'crc-refer',
      tier: 1,
      prompt: 'When should someone with lower GI symptoms be referred on the suspected cancer pathway for colorectal cancer?',
      items: [
        r(
          'fit',
          'A FIT result of 10 µg Hb/g or more',
          'core',
          ['\\bfit\\b|faecal immuno|10 ?(micrograms|µg|ug)|\\b10\\b'],
          'NICE DG56 (2023): FIT guides referral for people with symptoms.',
        ),
        r('mass', 'A rectal or abdominal mass, or an anal mass or ulcer', 'core', ['mass|lump|ulcer'], 'Refer regardless of FIT.'),
        r(
          'symptoms',
          'Change in bowel habit, rectal bleeding, weight loss, iron deficiency anaemia or abdominal pain: do a FIT',
          'core',
          ['change in bowel|bowel habit|bleed|weight loss|anaemi|abdominal pain'],
          'Offer FIT first in primary care.',
        ),
        r(
          'concern',
          'Strong clinical concern despite a negative FIT',
          'extra',
          ['concern|despite|negative fit|gut feeling|ongoing symptoms'],
          'A low FIT doesn’t exclude referral if worrying symptoms persist.',
        ),
      ],
      distractors: [
        {
          label: 'Age over 40 with any change in bowel habit',
          match: ['over 40'],
          whyNot: 'Age thresholds were replaced by FIT-guided referral.',
        },
      ],
    },
    {
      id: 'crc-staging',
      tier: 1,
      prompt: 'How is a rectal cancer staged?',
      items: [
        r('ct', 'CT chest, abdomen and pelvis for distant spread', 'core', ['\\bct\\b|computed tomog'], 'Liver and lung metastases.'),
        r(
          'mri',
          'MRI pelvis for local staging (T stage, nodes, the circumferential margin)',
          'core',
          ['\\bmri\\b|magnetic'],
          'Decides on neoadjuvant treatment.',
        ),
        r(
          'colonoscopy',
          'Complete colonoscopy for synchronous tumours',
          'core',
          ['colonoscop|synchronous|whole colon'],
          'About 3–5% have a second tumour.',
        ),
        r('tnm', 'TNM staging', 'core', ['\\btnm\\b|\\bt ?stage|nodes|metast'], 'Dukes’ is the older system.'),
        r('cea', 'CEA as a baseline', 'extra', ['\\bcea\\b|carcinoembryonic'], 'For follow-up after treatment.'),
      ],
    },
    {
      id: 'crc-cea',
      tier: 2,
      prompt: 'Why isn’t CEA used to diagnose colorectal cancer?',
      items: [
        r(
          'sens',
          'It isn’t sensitive: often normal in early cancer',
          'core',
          ['sensitiv|normal in early|early (cancer|disease)|miss'],
          'A normal CEA doesn’t exclude cancer.',
        ),
        r(
          'spec',
          'It isn’t specific: raised in smokers, IBD, liver disease, pancreatitis',
          'core',
          ['specific|smok|liver|inflamm|ibd|pancreat|false positive'],
          'Too many false positives.',
        ),
        r(
          'use',
          'It is used to monitor for recurrence after treatment',
          'core',
          ['monitor|recurren|follow ?up|surveillance|baseline'],
          'Falls after curative surgery.',
        ),
      ],
      probe: {
        prompt: 'His CEA was 12 before surgery and 2 at six weeks. A year later it is 9. What do you do?',
        items: [
          r('recur', 'Suspect recurrence', 'core', ['recurren|relapse|metast'], 'A rising CEA after a normal value.'),
          r('ct', 'Restage with CT chest, abdomen and pelvis', 'core', ['\\bct\\b|imaging|pet|scan'], 'Look for liver or lung metastases.'),
          r('repeat', 'Repeat the CEA to confirm the trend', 'extra', ['repeat|trend|recheck'], 'Smoking and other causes raise it too.'),
          r(
            'mdt',
            'Back to the MDT: liver or lung metastases may still be resectable',
            'core',
            ['\\bmdt\\b|multidisciplinary|resect|surg'],
            'Isolated metastases can be cured.',
          ),
        ],
      },
    },
    {
      id: 'crc-bloods',
      tier: 3,
      prompt: 'His bloods at the GP. Interpret them.',
      data: 'Hb 98 g/L (130–180) · MCV 71 fL (80–100) · ferritin 8 µg/L (30–400) · platelets 452 ×10⁹/L (150–400) · CRP 12 mg/L (<5)',
      items: [
        r(
          'ida',
          'Microcytic anaemia with low ferritin: iron deficiency',
          'core',
          ['iron deficien|microcyt|ferritin|\\bida\\b'],
          'Ferritin under 30 confirms iron deficiency.',
        ),
        r(
          'loss',
          'In a man over 60, assume chronic GI blood loss: colorectal cancer until proven otherwise',
          'redflag',
          ['blood loss|bleed|cancer|malignan|tumou?r'],
          'Needs urgent investigation of the lower (and upper) GI tract.',
        ),
        r('plt', 'Reactive thrombocytosis', 'extra', ['thrombocyt|platelet'], 'Iron deficiency and cancer both raise platelets.'),
        r(
          'treat',
          'Treat the iron deficiency (IV iron before surgery)',
          'core',
          ['iron|ferrous|infusion|replace'],
          'Correcting anaemia improves surgical outcomes.',
        ),
      ],
      distractors: [
        {
          label: 'Anaemia of chronic disease',
          match: ['chronic disease'],
          whyNot: 'Ferritin is high or normal in anaemia of chronic disease; here it is 8.',
        },
      ],
    },
  ],

  ibs: [
    {
      id: 'ibs-criteria',
      tier: 1,
      prompt: 'How do you make a positive diagnosis of IBS (NICE)?',
      items: [
        r(
          'pain',
          'Abdominal pain relieved by opening the bowels, or linked to a change in frequency or form',
          'core',
          ['reliev|defecat|opening (the |her |your )?bowels|frequency|form'],
          'The core feature.',
        ),
        r('duration', 'Symptoms for at least 6 months', 'core', ['6 months|six months'], 'Distinguishes it from transient upsets.'),
        r(
          'two',
          'Plus two of: abnormal passage (straining, urgency, incomplete emptying), bloating, worse after eating, mucus',
          'core',
          ['bloat|mucus|urgen|straining|incomplete|after eating'],
          'NICE CG61 criteria.',
        ),
        r(
          'tests',
          'With no red flags and normal FBC, ESR or CRP and coeliac serology',
          'core',
          ['red flag|fbc|crp|esr|coeliac|normal (blood|test)'],
          'Then stop investigating.',
        ),
      ],
    },
    {
      id: 'ibs-redflags',
      tier: 1,
      prompt: 'Which features in someone with bowel symptoms mean it isn’t IBS until proven otherwise?',
      items: [
        r('bleed', 'Rectal bleeding', 'redflag', ['bleed|blood'], ''),
        r('weight', 'Unexplained weight loss', 'core', ['weight'], ''),
        r('night', 'Symptoms that wake them at night', 'core', ['night|nocturnal|wake'], 'Functional symptoms don’t wake people.'),
        r('age', 'New symptoms after 60, or women 50+ (ovarian cancer: CA-125)', 'core', ['60|50|older|age|ovar|ca ?125'], 'NICE NG12.'),
        r('fh', 'Family history of bowel or ovarian cancer', 'extra', ['family'], ''),
        r('anaemia', 'Anaemia, raised inflammatory markers or a mass', 'core', ['anaemi|inflamm|crp|mass|lump'], ''),
      ],
    },
    {
      id: 'ibs-calprotectin',
      tier: 2,
      prompt: 'Why measure faecal calprotectin in her?',
      items: [
        r(
          'neut',
          'It is a protein from neutrophils in the gut wall: a marker of bowel inflammation',
          'core',
          ['neutroph|inflamm|white cell'],
          '',
        ),
        r(
          'distinguish',
          'It separates inflammatory bowel disease from IBS',
          'core',
          ['ibd|inflammatory bowel|distinguish|separate|tell apart|ibs'],
          'NICE DG11.',
        ),
        r('avoid', 'A normal result avoids an unnecessary colonoscopy', 'core', ['colonoscop|avoid|unnecessary|endoscop'], ''),
      ],
      probe: {
        prompt: 'What else can raise calprotectin?',
        items: [
          r('nsaid', 'NSAIDs and PPIs', 'core', ['nsaid|ibuprofen|naproxen|ppi|omeprazole|proton'], ''),
          r('infect', 'Gastrointestinal infection', 'core', ['infect|gastroenteritis'], ''),
          r('cancer', 'Colorectal cancer and polyps', 'core', ['cancer|polyp|tumou?r'], ''),
          r('divert', 'Diverticulitis', 'extra', ['diverticul'], ''),
        ],
      },
    },
    {
      id: 'ibs-results',
      tier: 3,
      prompt: 'Her results are back. Interpret them and say what you would do.',
      data: 'FBC normal · CRP 2 mg/L · tTG-IgA negative, total IgA normal · faecal calprotectin 22 µg/g (<50)',
      items: [
        r('normal', 'No evidence of inflammation or anaemia', 'core', ['normal|no (evidence of )?inflamm|no anaemi'], ''),
        r('coeliac', 'Coeliac disease excluded (total IgA is normal, so the test is valid)', 'core', ['coeliac|iga'], ''),
        r('calpro', 'Calprotectin under 50: IBD very unlikely', 'core', ['calprotectin|ibd|inflammatory bowel'], ''),
        r(
          'ibs',
          'Supports a positive diagnosis of IBS: no colonoscopy needed',
          'core',
          ['\\bibs\\b|irritable|no colonoscop|positive diagnosis'],
          '',
        ),
        r('mx', 'Start first-line management and safety-net', 'core', ['diet|antispasmod|safety ?net|manage|treat'], ''),
      ],
    },
  ],

  coeliac: [
    {
      id: 'coeliac-associations',
      tier: 1,
      prompt: 'Which conditions are associated with coeliac disease?',
      items: [
        r('t1dm', 'Type 1 diabetes', 'core', ['type 1|t1dm|diabet'], ''),
        r('thyroid', 'Autoimmune thyroid disease', 'core', ['thyroid|hashimoto|graves'], ''),
        r(
          'dh',
          'Dermatitis herpetiformis',
          'core',
          ['dermatitis herpetiformis|herpetiform|\\bdh\\b'],
          'An itchy blistering rash on the elbows, knees and buttocks.',
        ),
        r('iga', 'IgA deficiency', 'extra', ['iga def'], 'Makes tTG-IgA falsely negative.'),
        r('downs', 'Down’s and Turner syndromes', 'extra', ['down|turner'], ''),
        r(
          'liver',
          'Autoimmune liver disease (PBC, autoimmune hepatitis)',
          'extra',
          ['\\bpbc\\b|primary biliary|autoimmune hepat|liver'],
          '',
        ),
      ],
      distractors: [
        {
          label: 'Ulcerative colitis',
          match: ['ulcerative'],
          whyNot: 'Not a recognised association; PSC is linked with UC, not coeliac disease.',
        },
      ],
    },
    {
      id: 'coeliac-complications',
      tier: 1,
      prompt: 'What are the complications of untreated coeliac disease?',
      items: [
        r('anaemia', 'Anaemia: iron, folate and B12 deficiency', 'core', ['anaemi|iron|folate|b12'], ''),
        r('bone', 'Osteoporosis and osteomalacia', 'core', ['osteopor|osteomalac|bone'], ''),
        r(
          'lymphoma',
          'Enteropathy-associated T-cell lymphoma and small bowel cancer',
          'redflag',
          ['lymphoma|eatl|t ?cell|small bowel (cancer|adenocarc)'],
          '',
        ),
        r('spleen', 'Hyposplenism (offer pneumococcal vaccination)', 'extra', ['splen|pneumococc'], ''),
        r('fertility', 'Subfertility and poor pregnancy outcomes', 'extra', ['fertil|pregnan|miscarr'], ''),
        r('neuro', 'Neuropathy and ataxia', 'extra', ['neuropath|ataxia'], ''),
      ],
    },
    {
      id: 'coeliac-gluten',
      tier: 2,
      prompt: 'Why must she keep eating gluten until her tests are done?',
      items: [
        r(
          'antibodies',
          'The antibodies need ongoing gluten exposure',
          'core',
          ['antibod|serolog|ttg'],
          'They fall within weeks of stopping.',
        ),
        r('villi', 'The villous atrophy heals off gluten, so the biopsy can look normal', 'core', ['villous|villi|biops|heal'], ''),
        r('falseneg', 'Stopping first gives false-negative results', 'core', ['false negative|false neg|miss'], ''),
        r(
          'advice',
          'Eat gluten in more than one meal a day for at least 6 weeks before testing',
          'extra',
          ['6 weeks|six weeks|more than one meal'],
          'NICE NG20.',
        ),
      ],
      probe: {
        prompt: 'Why do you also check her total IgA?',
        items: [
          r('def', 'IgA deficiency is more common in coeliac disease', 'core', ['iga def|deficien'], ''),
          r('false', 'It makes tTG-IgA falsely negative', 'core', ['false|negative'], ''),
          r('igg', 'If IgA deficient, use IgG-based tests (IgG tTG, EMA or DGP)', 'core', ['igg'], ''),
        ],
      },
    },
    {
      id: 'coeliac-bloods',
      tier: 3,
      prompt: 'Her blood results. Interpret them.',
      data: 'Hb 104 g/L (115–165) · MCV 79 fL (80–100) · ferritin 6 µg/L · folate 2.1 µg/L (>3) · corrected calcium 2.12 mmol/L (2.2–2.6) · ALP 160 U/L (30–130) · ALT 54 U/L (<40) · tTG-IgA >128 U/mL (<7) · total IgA normal',
      items: [
        r('iron', 'Iron and folate deficiency: malabsorption from the duodenum and jejunum', 'core', ['iron|folate|malabsor'], ''),
        r(
          'bone',
          'Low calcium with a raised ALP: vitamin D deficiency and osteomalacia',
          'core',
          ['calcium|alp|vitamin d|osteomalac|bone'],
          '',
        ),
        r(
          'alt',
          'Mildly raised ALT: common in coeliac disease, often settles on a gluten-free diet',
          'extra',
          ['\\balt\\b|transaminas|liver'],
          '',
        ),
        r('ttg', 'Strongly positive tTG with normal IgA: coeliac disease very likely', 'core', ['ttg|coeliac|positive'], ''),
        r('biopsy', 'Confirm with duodenal biopsies at OGD', 'core', ['biops|\\bogd\\b|endoscop|duoden'], ''),
      ],
    },
  ],
};
