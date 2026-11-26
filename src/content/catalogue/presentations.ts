/**
 * Presentations from the MLA content map, and the conditions each could be.
 *
 *   id | Title | areas | causes
 *
 * Causes are condition ids (conditions-*.ts). Prefix ! = must not miss,
 * ? = also consider; no prefix = core. Put must-not-miss causes first.
 * A presentation whose id matches a hand-written presentation
 * (src/content/presentations) links to its full history drills.
 */
export const PRESENTATIONS_TABLE = String.raw`
chest-pain | Chest pain | cardio acute resp | !acs !pe !aortic-dissection !pneumothorax !oesophageal-rupture angina pericarditis gord pneumonia msk-chest ?panic-disorder ?shingles ?biliary-colic ?peptic-ulcer ?myocarditis
breathlessness | Breathlessness | resp cardio acute | !pe !pneumothorax !anaphylaxis !acs asthma copd heart-failure pneumonia pleural-effusion anaemia ?ild ?lung-cancer ?panic-disorder ?dka ?pulmonary-hypertension
palpitations | Palpitations | cardio endo | !vt af svt ectopics atrial-flutter hyperthyroidism panic-disorder anaemia adverse-drug ?phaeo ?hypoglycaemia ?hocm
syncope | Blackouts and faints | cardio neuro acute | !vt !heart-block !aortic-stenosis !hocm !pe vasovagal postural-hypotension epilepsy ?hypoglycaemia ?sah
peripheral-oedema | Peripheral oedema and ankle swelling | cardio renal | !dvt heart-failure nephrotic cirrhosis adverse-drug varicose-veins ?hypothyroidism ?pre-eclampsia ?cellulitis
hypertension | Hypertension | cardio renal endo gp | !pre-eclampsia essential-htn ckd ?conns ?cushings ?phaeo ?osa ?adverse-drug
murmur | Heart murmur | cardio child | !endocarditis aortic-stenosis mitral-regurgitation aortic-regurgitation mitral-stenosis ?hocm ?innocent-murmur
claudication | Limb claudication | cardio surgery | !acute-limb-ischaemia pad spinal-stenosis
painful-leg | Acute painful or swollen leg | surgery cardio msk | !acute-limb-ischaemia !dvt !compartment-syndrome !necrotising-fasciitis cellulitis bakers-cyst ?radiculopathy ?gout
low-bp | Low blood pressure (shock) | acute cardio | !sepsis !anaphylaxis !haemorrhage !acs !pe !tamponade !addisons dehydration ?adverse-drug ?pneumothorax
cardiac-arrest | Cardiorespiratory arrest: reversible causes | acute | hypoxia haemorrhage hyperkalaemia hypokalaemia hypothermia acs pe pneumothorax tamponade toxins
decreased-consciousness | Decreased consciousness | acute neuro | !hypoglycaemia !stroke !sah !meningitis !subdural !extradural !opioid-toxicity !sepsis !dka epilepsy hhs ?encephalitis ?liver-failure ?co-poisoning ?hyponatraemia ?wernicke
fever | Fever | infection acute | !sepsis !meningitis !neutropenic-sepsis !malaria pneumonia uti pyelonephritis cellulitis ?endocarditis ?tb ?glandular-fever ?hiv ?lymphoma ?influenza
returning-traveller | Fever in a returning traveller | infection | !malaria !typhoid !dengue viral-hepatitis infectious-diarrhoea pneumonia ?hiv ?tb
poisoning | Poisoning and overdose | acute psych | !paracetamol-od !tca-od !co-poisoning opioid-toxicity salicylate-od ?lithium-toxicity
head-injury | Head injury | acute neuro surgery | !extradural !subdural !skull-fracture !sah concussion ?nai
allergic | Allergic reaction | acute derm | !anaphylaxis !angioedema urticaria contact-dermatitis allergic-rhinitis ?atopic-eczema ?cows-milk-allergy
weight-loss | Weight loss | gp cancer gastro endo | !malignancy hyperthyroidism diabetes depression crohns uc coeliac ?tb ?hiv ?anorexia-nervosa ?addisons
night-sweats | Night sweats | cancer infection | !lymphoma !tb !hiv menopause hyperthyroidism ?leukaemia ?endocarditis ?adverse-drug
neck-lump | Neck lump | ent cancer endo | !head-neck-cancer !lymphoma thyroid-nodule reactive-lymph glandular-fever ?branchial-cyst ?thyroglossal-cyst ?salivary-stone ?tb
breast-lump | Breast lump | surgery cancer womens | !breast-cancer fibroadenoma breast-cyst mastitis ?fat-necrosis ?lipoma
bone-pain | Bone pain | cancer msk | !bone-metastases !myeloma osteoporosis osteomalacia pagets ?osteomyelitis ?sickle-cell
oncology-emergency | Unwell patient with cancer | cancer palliative acute | !neutropenic-sepsis !mscc !hypercalcaemia !svco !tumour-lysis pe ?adverse-drug ?brain-tumour
palliative-nausea | Nausea and vomiting in advanced illness | palliative | !bowel-obstruction adverse-drug constipation hypercalcaemia brain-tumour aki ?gad
terminal-agitation | Agitation at the end of life | palliative | uncontrolled-pain urinary-retention constipation opioid-toxicity hypercalcaemia ?alcohol-withdrawal ?gad
palliative-breathlessness | Breathlessness in advanced cancer | palliative resp | !svco !pe pleural-effusion pneumonia anaemia ?heart-failure ?panic-disorder
anaemia | Anaemia | haem gastro gp | !colorectal-cancer iron-deficiency b12-deficiency folate-deficiency ckd ?haemolytic-anaemia ?thalassaemia ?sickle-cell ?myeloma ?coeliac ?hypothyroidism ?leukaemia
bruising | Bruising and bleeding | haem | !leukaemia !itp !dic !nai adverse-drug haemophilia vwd ?cirrhosis
organomegaly | Big liver or spleen | haem gastro | !lymphoma !leukaemia myeloproliferative cirrhosis glandular-fever heart-failure ?malaria ?haemolytic-anaemia ?viral-hepatitis
petechial-rash | Petechial rash | child haem infection | !meningitis !leukaemia !itp hsp ?nai
abdominal-pain | Acute abdominal pain | gastro surgery acute womens | !aaa !ectopic !perforation !mesenteric-ischaemia !acs appendicitis cholecystitis biliary-colic pancreatitis bowel-obstruction diverticular renal-colic pyelonephritis ?dka ?ovarian-torsion ?pid ?gastroenteritis
chronic-abdo-pain | Chronic abdominal pain | gastro gp | !colorectal-cancer !pancreatic-cancer !ovarian-cancer ibs crohns uc peptic-ulcer coeliac biliary-colic diverticular ?chronic-pancreatitis ?endometriosis ?mesenteric-ischaemia
dyspepsia | Dyspepsia | gastro gp | !gastric-cancer !oesophageal-cancer gord peptic-ulcer adverse-drug ?biliary-colic ?acs
dysphagia | Swallowing problems | gastro ent neuro | !oesophageal-cancer !head-neck-cancer gord achalasia pharyngeal-pouch stroke ?mnd ?myasthenia
vomiting | Nausea and vomiting | gastro acute womens | !bowel-obstruction !dka !brain-tumour !acs gastroenteritis hyperemesis adverse-drug pancreatitis vestibular-neuritis ?aki ?hypercalcaemia ?cholecystitis
diarrhoea | Diarrhoea | gastro infection | !c-diff !colorectal-cancer gastroenteritis infectious-diarrhoea crohns uc ibs coeliac adverse-drug ?hyperthyroidism ?constipation
change-bowel-habit | Change in bowel habit | gastro cancer surgery | !colorectal-cancer ibs crohns uc coeliac diverticular adverse-drug ?hypothyroidism ?hyperthyroidism ?ovarian-cancer
rectal-bleeding | Rectal bleeding | gastro surgery | !colorectal-cancer haemorrhoids anal-fissure diverticular uc crohns ?angiodysplasia ?infectious-diarrhoea ?mesenteric-ischaemia ?anal-cancer
haematemesis | Upper GI bleeding | gastro acute | !varices peptic-ulcer mallory-weiss gord ?gastric-cancer ?oesophageal-cancer ?adverse-drug
jaundice | Jaundice | gastro surgery | !cholangitis !pancreatic-cancer !liver-failure cbd-stones alcoholic-hepatitis viral-hepatitis cirrhosis adverse-drug gilberts ?haemolytic-anaemia ?pbc ?psc ?cholangiocarcinoma ?hcc
ascites | Ascites | gastro | !ovarian-cancer !hcc cirrhosis heart-failure nephrotic ?pancreatitis ?tb
perianal | Perianal pain or itch | gastro surgery | haemorrhoids anal-fissure perianal-abscess anal-fistula ?pilonidal ?anal-cancer ?crohns
abdominal-mass | Abdominal mass | gastro surgery cancer | !aaa !colorectal-cancer !ovarian-cancer !renal-cancer fibroids ovarian-cyst urinary-retention ?pkd
abdominal-distension | Abdominal distension | gastro surgery imaging | !bowel-obstruction !volvulus !colorectal-cancer cirrhosis constipation ibs ?ovarian-cancer ?ileus
groin-lump | Lump in the groin | surgery | !femoral-hernia inguinal-hernia reactive-lymph lipoma ?lymphoma
constipation | Constipation | gastro gp older | !colorectal-cancer !bowel-obstruction constipation adverse-drug hypothyroidism hypercalcaemia ibs ?cauda-equina ?parkinsons ?hirschsprung
dysuria | Painful urination | renal sexual infection | !pyelonephritis uti chlamydia gonorrhoea prostatitis ?vulvovaginal-candidiasis ?genital-herpes ?mycoplasma
haematuria | Blood in the urine | renal cancer | !bladder-cancer !renal-cancer !prostate-cancer uti renal-colic glomerulonephritis bph ?pkd ?adverse-drug
loin-pain | Loin pain | renal surgery | !aaa renal-colic pyelonephritis mechanical-back-pain ?shingles ?renal-cancer
lower-urinary | Lower urinary tract symptoms | renal gp older | !prostate-cancer bph uti overactive-bladder ?bladder-cancer ?diabetes ?prostatitis
scrotal | Scrotal pain or lump | renal surgery | !testicular-torsion !testicular-cancer epididymo-orchitis hydrocele varicocele epididymal-cyst inguinal-hernia ?mumps
kidney-injury | Acute kidney injury | renal acute | !sepsis dehydration adverse-drug urinary-retention heart-failure ?glomerulonephritis ?rhabdomyolysis ?myeloma ?renal-colic
incontinence | Urinary incontinence | renal womens older | !cauda-equina stress-incontinence overactive-bladder urinary-retention uti ?adverse-drug ?constipation ?diabetes
erectile | Erectile dysfunction | gp renal sexual | pad diabetes adverse-drug depression hypogonadism ?alcohol-use-disorder ?ms
polydipsia | Thirst and passing a lot of urine | endo renal | !dka !hhs diabetes hypercalcaemia diabetes-insipidus ?adverse-drug
fatigue | Tiredness | gp haem endo psych | !malignancy anaemia hypothyroidism depression diabetes ckd ?coeliac ?osa ?cfs ?addisons ?glandular-fever
weight-gain | Weight gain | endo gp | obesity hypothyroidism adverse-drug ?cushings ?pcos ?heart-failure ?nephrotic ?depression
low-sodium | Hyponatraemia | endo renal acute | adverse-drug siadh heart-failure cirrhosis dehydration ?addisons ?hypothyroidism
high-calcium | Hypercalcaemia | endo cancer | !bone-metastases !myeloma primary-hyperpara ?sarcoidosis ?adverse-drug
high-potassium | Hyperkalaemia | renal acute | aki ckd adverse-drug ?addisons ?rhabdomyolysis ?dka ?tumour-lysis
amenorrhoea | Absent periods | womens endo | pregnancy pcos hypothalamic-amenorrhoea prolactinoma ?hypothyroidism ?poi ?anorexia-nervosa ?menopause
heavy-periods | Heavy menstrual bleeding | womens gp | !endometrial-cancer fibroids adenomyosis endometrial-polyp hypothyroidism vwd ?adverse-drug
pelvic-pain | Pelvic pain | womens surgery | !ectopic !ovarian-torsion pid endometriosis ovarian-cyst appendicitis uti ?fibroids ?ibs ?miscarriage
early-bleeding | Bleeding in early pregnancy | womens | !ectopic miscarriage ?molar ?cervical-ectropion
late-bleeding | Bleeding in later pregnancy | womens | !placental-abruption !placenta-praevia !vasa-praevia !uterine-rupture ?cervical-ectropion
pph | Bleeding after birth | womens | uterine-atony genital-trauma retained-products dic
pmb | Postmenopausal bleeding | womens cancer | !endometrial-cancer atrophic-vaginitis endometrial-polyp endometrial-hyperplasia adverse-drug ?cervical-cancer
vaginal-discharge | Vaginal discharge | womens sexual | bv vulvovaginal-candidiasis chlamydia gonorrhoea trichomonas ?cervical-cancer ?cervical-ectropion
pelvic-mass | Pelvic mass | womens cancer | !ovarian-cancer fibroids ovarian-cyst pregnancy urinary-retention ?endometriosis ?colorectal-cancer
subfertility | Difficulty conceiving | womens | pcos male-factor endometriosis pid hypothalamic-amenorrhoea ?poi ?hypothyroidism ?prolactinoma
bp-pregnancy | High blood pressure in pregnancy | womens cardio | !pre-eclampsia gestational-htn essential-htn ?ckd
vulval | Vulval itch or soreness | womens derm sexual | !vulval-cancer vulvovaginal-candidiasis lichen-sclerosus contact-dermatitis genital-herpes ?genital-warts
painful-sex | Pain during sex | womens sexual | endometriosis pid atrophic-vaginitis vaginismus vulvovaginal-candidiasis ?ovarian-cyst
pruritus | Itch (pruritus) | derm gastro haem | !lymphoma scabies atopic-eczema urticaria ckd iron-deficiency pbc ?myeloproliferative ?obstetric-cholestasis ?pancreatic-cancer
acute-rash | Acute rash | derm infection acute | !meningitis !sjs urticaria chickenpox measles cellulitis contact-dermatitis adverse-drug ?scabies ?impetigo ?erythema-multiforme ?shingles ?scarlet-fever
chronic-rash | Chronic rash | derm | atopic-eczema psoriasis contact-dermatitis seborrhoeic-dermatitis tinea ?lichen-planus ?bullous-pemphigoid ?sle ?scabies
facial-rash | Facial rash | derm | !shingles acne rosacea seborrhoeic-dermatitis contact-dermatitis impetigo sle ?cellulitis
skin-lesion | Changing skin lesion | derm cancer | !melanoma !scc bcc seb-keratosis actinic-keratosis naevus
skin-ulcer | Skin ulcer | derm cardio surgery | !scc venous-ulcer arterial-ulcer diabetic-foot pressure-ulcer ?pyoderma
skin-lump | Lump under the skin | derm surgery | !sarcoma lipoma epidermoid-cyst skin-abscess ?reactive-lymph
sore-throat | Sore throat | ent infection gp | !quinsy !epiglottitis tonsillitis glandular-fever urti ?scarlet-fever ?head-neck-cancer ?adverse-drug
earache | Earache | ent child gp | !mastoiditis otitis-media otitis-externa ?cholesteatoma ?shingles
hearing-loss | Hearing loss | ent older | !sudden-snhl !acoustic-neuroma ear-wax presbycusis glue-ear otosclerosis menieres ?cholesteatoma ?adverse-drug
vertigo | Dizziness and vertigo | ent neuro | !stroke bppv vestibular-neuritis menieres ?acoustic-neuroma ?migraine ?postural-hypotension
hoarseness | Hoarse voice | ent cancer | !head-neck-cancer !lung-cancer laryngitis hypothyroidism gord
red-eye | Red eye | eyes | !acute-glaucoma !anterior-uveitis !scleritis !keratitis conjunctivitis episcleritis subconj blepharitis ?corneal-abrasion
sudden-vision-loss | Sudden loss of vision | eyes neuro | !crao !gca !retinal-detachment !stroke crvo vitreous-haemorrhage optic-neuritis tia ?acute-glaucoma ?amd
gradual-vision-loss | Gradual loss of vision | eyes older | cataract amd poag diabetic-retinopathy ?pituitary-tumour
diplopia | Double vision | neuro eyes | !pcom-aneurysm !stroke !brain-tumour myasthenia thyroid-eye-disease ms diabetes ?orbital-cellulitis ?iih
headache | Headache | neuro gp acute | !sah !meningitis !gca !brain-tumour !cvst tension-headache migraine cluster-headache medication-overuse ?sinusitis ?acute-glaucoma ?iih ?co-poisoning ?trigeminal-neuralgia
seizures | Fits and seizures | neuro acute | !hypoglycaemia !alcohol-withdrawal !brain-tumour !encephalitis !pre-eclampsia epilepsy vasovagal dissociative-seizures ?hyponatraemia ?adverse-drug ?stroke
limb-weakness | Limb weakness | neuro | !stroke !mscc !gbs tia ms mnd myasthenia ?brain-tumour ?hypokalaemia ?cauda-equina
facial-weakness | Facial weakness | neuro ent | !stroke bells-palsy shingles ?lyme ?ms ?myasthenia
tremor | Tremor | neuro older | essential-tremor parkinsons hyperthyroidism adverse-drug alcohol-withdrawal ?gad ?ms
numbness | Numbness and tingling | neuro msk | !ms !stroke !gbs carpal-tunnel cervical-radiculopathy peripheral-neuropathy b12-deficiency ?hypocalcaemia ?panic-disorder
memory-loss | Memory loss | older psych neuro | !subdural alzheimers vascular-dementia lewy-body depression hypothyroidism b12-deficiency ?ftd ?nph ?brain-tumour ?alcohol-use-disorder ?delirium
confusion | Acute confusion | older acute psych | !hypoglycaemia !sepsis !stroke !subdural uti pneumonia adverse-drug constipation urinary-retention hyponatraemia alcohol-withdrawal ?hypercalcaemia ?wernicke ?encephalitis
falls | Falls in an older person | older msk | !heart-block mechanical-fall postural-hypotension adverse-drug uti parkinsons oa ?cataract ?stroke ?vasovagal ?hypoglycaemia
low-mood | Low mood | psych gp | !bipolar depression alcohol-use-disorder hypothyroidism ?postnatal-depression ?substance-misuse ?adverse-drug ?alzheimers
anxiety | Anxiety | psych gp | gad panic-disorder ocd ptsd phobia hyperthyroidism ?alcohol-withdrawal ?depression ?adverse-drug ?phaeo
elated-mood | Elated mood | psych | bipolar substance-misuse adverse-drug hyperthyroidism ?schizophrenia ?brain-tumour ?ftd
hallucinations | Hallucinations | psych neuro older | schizophrenia substance-misuse alcohol-withdrawal delirium lewy-body ?bipolar ?depression ?adverse-drug ?epilepsy
self-harm | Self-harm and suicidal thoughts | psych | depression personality-disorder substance-misuse alcohol-use-disorder ptsd ?schizophrenia ?bipolar ?anorexia-nervosa
eating | Eating or weight concerns | psych child | anorexia-nervosa bulimia-nervosa binge-eating ?depression ?ocd ?hyperthyroidism ?coeliac ?crohns ?diabetes
behaviour-change | Behaviour or personality change | psych neuro older | !brain-tumour !encephalitis !subdural ftd delirium substance-misuse bipolar ?schizophrenia ?huntingtons
sleep | Sleep problems | psych gp | insomnia depression gad osa adverse-drug ?alcohol-use-disorder ?bph ?menopause ?hyperthyroidism
acute-joint | Hot swollen joint | msk acute | !septic-arthritis gout pseudogout reactive-arthritis ?ra ?haemophilia ?psoriatic-arthritis
chronic-joint | Chronic joint pain or stiffness | msk gp older | oa ra psoriatic-arthritis gout pmr ankylosing-spondylitis ?fibromyalgia ?sle ?haemochromatosis
back-pain | Back pain | msk gp neuro | !cauda-equina !mscc !aaa mechanical-back-pain radiculopathy osteoporosis ?ankylosing-spondylitis ?spinal-stenosis ?pyelonephritis ?myeloma
neck-pain | Neck pain or stiffness | msk neuro | !meningitis !sah cervical-spondylosis cervical-radiculopathy ?pmr ?ra
muscle-pain | Muscle pain and weakness | msk | !rhabdomyolysis pmr adverse-drug hypothyroidism influenza fibromyalgia ?polymyositis ?osteomalacia
hip-pain | Hip pain in an older adult | msk older surgery | !nof-fracture !septic-arthritis oa bursitis radiculopathy ?bone-metastases ?pmr
child-limp | Limp in a child | child msk | !septic-arthritis !sufe !nai transient-synovitis perthes ?ddh ?jia ?osteomyelitis ?leukaemia
child-fever | Fever in a child | child infection | !meningitis !sepsis !kawasaki uti otitis-media tonsillitis urti ?pneumonia ?chickenpox ?measles ?septic-arthritis
child-breathing | Breathing difficulty in a child | child resp | !epiglottitis !inhaled-fb bronchiolitis croup asthma pneumonia ?whooping-cough ?cystic-fibrosis ?anaphylaxis
child-vomiting | Vomiting in a baby or child | child gastro | !pyloric-stenosis !intussusception !volvulus !dka gastroenteritis infant-reflux ?uti ?meningitis ?appendicitis ?cows-milk-allergy
crying-baby | Crying baby | child | !nai !intussusception !uti infant-colic infant-reflux cows-milk-allergy ?otitis-media ?inguinal-hernia ?testicular-torsion
neonatal-jaundice | Jaundice in a newborn | child | !haemolytic-disease !biliary-atresia physiological-jaundice ?sepsis ?hypothyroidism
developmental-delay | Developmental delay | child | cerebral-palsy down-syndrome autism learning-disability ?glue-ear ?dmd ?hypothyroidism ?nai
child-behaviour | Behaviour difficulties in a child | child psych | !nai adhd autism glue-ear learning-disability ?epilepsy ?gad
child-seizure | Fits in a child | child neuro | !meningitis !hypoglycaemia febrile-convulsion epilepsy ?nai
genital-ulcer | Genital ulcers or lumps | sexual | genital-herpes syphilis genital-warts ?behcets
urethral-discharge | Urethral discharge | sexual | gonorrhoea chlamydia mycoplasma trichomonas ?uti
postop-fever | Fever after surgery | periop surgery | !anastomotic-leak !dvt !pe pneumonia atelectasis uti ssi ?transfusion-reaction ?adverse-drug
postop-oliguria | Low urine output after surgery | periop renal | !haemorrhage !sepsis dehydration urinary-retention aki ?adverse-drug ?rhabdomyolysis
postop-distension | Distension and vomiting after surgery | periop surgery | !bowel-obstruction !anastomotic-leak ileus hypokalaemia adverse-drug ?urinary-retention
lung-mass | Mass on a chest X-ray | imaging resp cancer | !lung-cancer !tb pneumonia ?sarcoidosis ?lymphoma ?gpa
effusion | Pleural effusion | resp imaging | !lung-cancer !mesothelioma !pe heart-failure pneumonia ?tb ?nephrotic ?cirrhosis ?pancreatitis ?ra
cough | Cough | resp gp infection | !lung-cancer !tb urti asthma copd gord pneumonia adverse-drug sinusitis ?bronchiectasis ?heart-failure ?ild ?whooping-cough
haemoptysis | Haemoptysis | resp cancer | !lung-cancer !pe !tb pneumonia bronchiectasis ?gpa ?mitral-stenosis ?adverse-drug
wheeze | Wheeze | resp | !anaphylaxis !inhaled-fb asthma copd heart-failure ?bronchiectasis ?lung-cancer
`;
