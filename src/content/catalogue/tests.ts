/**
 * Investigations the syllabus drills can ask for.
 *
 *   id | label | category | patterns (regex, separated by ;)
 *
 * Patterns are matched against the student's answer after it is normalised
 * (lower case, punctuation turned into spaces), as everywhere else in the app.
 */
export const TESTS_TABLE = String.raw`
obs | Observations (NEWS2) | Bedside | \bobs\b; observation; \bnews ?2?\b; vital sign
ecg | 12-lead ECG | Bedside | \becg\b; \bekg\b; electrocardio
holter | Holter / event monitor | Bedside | holter; ambulatory (ecg|monitor); event (monitor|recorder); loop recorder; patch monitor; 24 ?h(ou)?r? (ecg|tape|monitor)
abpm | Ambulatory or home BP monitoring | Bedside | \babpm\b; ambulatory (bp|blood pressure); home (bp|blood pressure)
bp | Blood pressure | Bedside | blood pressure; \bbp\b
lying_standing | Lying and standing blood pressure | Bedside | lying (and )?standing; postural (bp|blood pressure|drop); orthostatic (bp|blood pressure|test)
urine_dip | Urine dipstick | Bedside | dipstick; urinalysis; urine dip; dip (the )?urine
urine_mcs | Urine culture | Bedside | urine (mc ?s|culture|micro|sample); \bmsu\b; midstream
urine_pcr | Urine protein:creatinine ratio | Bedside | protein ?(to )?creatinine; \bacr\b; albumin ?(to )?creatinine; urine protein; proteinuria
upt | Pregnancy test | Bedside | pregnan; \bupt\b; urine hcg
cbg | Capillary blood glucose | Bedside | capillary (blood )?glucose; \bcbg\b; \bbm\b; finger ?prick; blood (glucose|sugar)
peak_flow | Peak flow | Bedside | peak (expiratory )?flow; \bpefr?\b
abg | Arterial blood gas | Bedside | \babg\b; arterial (blood )?gas; blood gas; \bvbg\b
bmi | Weight, height and BMI | Bedside | weigh; height; \bbmi\b; waist
phq9 | PHQ-9 | Bedside | \bphq; depression (questionnaire|score|scale)
gad7 | GAD-7 | Bedside | gad ?7; anxiety (questionnaire|score|scale)
audit | AUDIT questionnaire | Bedside | \baudit\b; \bcage\b; alcohol (screen|questionnaire)
uds | Urine drug screen | Bedside | drug screen; tox\w* screen; urine drugs?
cognitive | Cognitive assessment (MoCA, ACE-III, 6CIT) | Bedside | cognit\w* (test|assess|screen|exam); \bmoca\b; \bace ?(iii|3)\b; \bmmse\b; \b6 ?cit\b; \bamts?\b
four_at | 4AT or CAM delirium screen | Bedside | \b4 ?at\b; \bcam\b; confusion assessment
sleep_diary | Sleep diary | Bedside | sleep diary
bladder_diary | Bladder diary | Bedside | bladder diary; frequency volume chart
dix_hallpike | Dix–Hallpike test | Bedside | dix ?hall ?pike; hallpike
hints | HINTS examination | Bedside | \bhints\b; head impulse
throat_swab | Throat swab | Bedside | throat swab; \bcentor\b; feverpain; rapid strep
viral_swab | Viral swab (PCR) | Bedside | viral (swab|pcr); (flu|influenza|measles|nose and throat) (swab|test|pcr); saliva (swab|test)
wound_swab | Wound swab | Bedside | wound swab; swab (of )?(the )?wound
ctg | CTG | Bedside | \bctg\b; cardiotocogra; fetal (heart|monitoring)
abpi | ABPI | Bedside | \babpi\b; ankle brachial
cfs_score | Clinical Frailty Scale | Bedside | frailty (scale|score|assessment); rockwood
hpylori | H. pylori test (breath or stool antigen) | Bedside | pylori; urea breath; stool antigen; \bclo test\b
fbc | Full blood count | Bloods | \bfbc\b; full blood count; blood count; haemoglobin(?! electro); \bhb\b; white (cell|count); \bwcc\b; platelet; neutrophil
crp | CRP / ESR | Bloods | \bcrp\b; c reactive; \besr\b; inflammatory marker
ue | U&Es | Bloods | \bu ?(and )?e ?s?\b; urea; electrolyte; renal function; kidney function; creatinine(?! ratio); \begfr\b; sodium; potassium
lft | LFTs | Bloods | \blfts?\b; liver function; bilirubin; \balt\b; \balp\b; transaminase
albumin | Serum albumin | Bloods | serum albumin; \balbumin\b(?! ?(to )?creat)
amylase | Amylase / lipase | Bloods | amylase; lipase
gs | Group and save | Bloods | group (and )?save; crossmatch; cross match; blood group
coag | Clotting screen (INR) | Bloods | clotting; \bcoag; \binr\b; \baptt\b; fibrinogen
cultures | Blood cultures | Bloods | blood culture; \bcultures\b
lactate | Lactate | Bloods | lactate
troponin | Troponin | Bloods | troponin; \btrop\b
ddimer | D-dimer | Bloods | d ?dimer
bnp | NT-proBNP | Bloods | \bbnp\b; nt ?pro ?bnp; natriuretic
glucose | Glucose / HbA1c | Bloods | hba1c; \ba1c\b; (fasting|plasma|random|serum) glucose; glucose level
ogtt | Oral glucose tolerance test | Bloods | \bogtt\b; glucose tolerance
ketones | Blood ketones | Bloods | ketone
osmolality | Serum and urine osmolality | Bloods | osmolal
water_dep | Water deprivation test | Specialist | water deprivation; desmopressin (test|challenge)
tft | Thyroid function tests | Bloods | \btfts?\b; thyroid function; \btsh\b(?! receptor); \bf?t4\b; \bf?t3\b
trab | TSH receptor antibodies | Bloods | \btrab\b; tsh receptor; thyroid stimulating (immuno|antibod); \btsi\b
tpo | Thyroid peroxidase antibodies | Bloods | \btpo\b; thyroid peroxidase; thyroid antibod
calcium | Calcium / bone profile | Bloods | calcium; bone profile
pth | Parathyroid hormone | Bloods | \bpth\b; parathyroid hormone
vitd | Vitamin D | Bloods | vitamin d; vit d; \bvitd\b
magnesium | Magnesium | Bloods | magnesium
haematinics | Haematinics (ferritin, B12, folate) | Bloods | haematinic; ferritin; \bb12\b; folate; iron (studies|levels|profile)
iron_studies | Iron studies (ferritin, transferrin saturation) | Bloods | transferrin; iron (studies|profile|levels); ferritin
if_ab | Intrinsic factor antibodies | Bloods | intrinsic factor; parietal cell
film | Blood film | Bloods | blood film; (peripheral )?(blood )?smear; \bfilm\b
haemolysis | Haemolysis screen (reticulocytes, LDH, haptoglobin, DAT) | Bloods | reticulocyte; retics; haptoglobin; \bldh\b; \bdat\b; coombs; haemolysis screen
hb_electro | Haemoglobin electrophoresis | Bloods | h(a)?emoglobin electrophoresis; electrophoresis (of )?h(a)?emoglobin; \bhplc\b; sickle (test|screen|solubility)
spep | Serum protein electrophoresis and light chains | Bloods | protein electrophoresis; \bspep\b; paraprotein; bence ?jones; light chain
jak2 | JAK2 mutation | Bloods | jak ?2
sbr | Serum bilirubin (split) | Bloods | split bilirubin; serum bilirubin; \bsbr\b; transcutaneous; conjugated
bile_acids | Bile acids | Bloods | bile acid
cortisol | 9 am cortisol / short Synacthen test | Bloods | (9 ?am|morning|serum|random) cortisol; synacthen; \bacth\b
dex | Dexamethasone suppression test | Bloods | dexamethasone suppression; \bdst\b; dex(amethasone)? test; urin\w* (free )?cortisol
arr | Aldosterone:renin ratio | Bloods | aldosterone; renin
metanephrines | Plasma metanephrines | Bloods | metanephrine; catecholamine
prolactin | Prolactin | Bloods | prolactin
lh_fsh | LH, FSH and oestradiol | Bloods | \blh\b; \bfsh\b; oestradiol; estradiol; gonadotrophin
testosterone | Testosterone | Bloods | testosterone
igf1 | IGF-1 (then OGTT with growth hormone) | Bloods | \bigf; growth hormone; \bgh\b
lipids | Lipid profile | Bloods | lipid; cholesterol
ck | Creatine kinase | Bloods | \bck\b; creatine kinase; \bcpk\b
urate | Serum urate | Bloods | \burate; uric acid
rf | Rheumatoid factor and anti-CCP | Bloods | rheumatoid factor; \brf\b; anti ?ccp; \bccp\b; citrullinated
ana | ANA, anti-dsDNA and complement | Bloods | \bana\b; antinuclear; ds ?dna; complement; \bc3\b; \bc4\b
anca | ANCA | Bloods | \banca\b
ama | Anti-mitochondrial antibodies | Bloods | mitochondrial; \bama\b
achr | Acetylcholine receptor antibodies | Bloods | acetylcholine receptor; \bachr\b
psa | PSA | Bloods | \bpsa\b; prostate specific
ca125 | CA-125 | Bloods | ca ?125
afp | Tumour markers (AFP, beta-hCG, LDH) | Bloods | \bafp\b; alpha ?feto; tumou?r marker
bhcg | Serum beta-hCG | Bloods | serum (beta )?hcg; beta hcg; \bbhcg\b; quantitative hcg; \bhcg\b
hiv_test | HIV test | Bloods | \bhiv\b
hep_serology | Hepatitis serology | Bloods | hepatitis (serology|screen|virology|b|c|a)\b; \bhbsag\b; anti ?hcv; \bhcv\b; \bhbv\b; viral (hepatitis )?screen; liver screen
monospot | Monospot / EBV serology | Bloods | monospot; paul bunnell; heterophile; \bebv\b
syphilis_serology | Syphilis serology | Bloods | syphilis (serology|test|screen|blood); \btpha\b; \btppa\b; \brpr\b; \bvdrl\b; treponem
malaria_film | Malaria films (thick and thin) | Bloods | thick (and )?thin; malaria (film|smear|test|screen|rdt|antigen); rapid diagnostic test
paracetamol_level | Paracetamol level (from 4 hours) | Bloods | paracetamol (level|concentration); serum paracetamol
salicylate_level | Salicylate level | Bloods | salicylate (level|concentration); aspirin level
lithium_level | Lithium level | Bloods | lithium (level|concentration); serum lithium
cohb | Carboxyhaemoglobin (COHb) | Bloods | carboxy; \bcohb\b
tryptase | Mast cell tryptase | Bloods | tryptase
stool | Stool culture / C. difficile toxin | Stool | stool (culture|sample|mc|micro|test|specimen|toxin); c ?diff; clostridi; ova cysts
calprotectin | Faecal calprotectin | Stool | calprotectin
fit | FIT (faecal immunochemical test) | Stool | \bfit\b; faecal immuno; occult blood; \bfob\b
elastase | Faecal elastase | Stool | elastase
ttg | Coeliac serology (tTG-IgA) | Bloods | coeliac (serology|screen|antibod|blood); \bttg\b; tissue transglutaminase; \bema\b; endomysial
cxr | Chest X-ray | Imaging | chest x ?ray; \bcxr\b; chest radiograph; chest film
axr | Abdominal X-ray | Imaging | abdo\w* x ?ray; \baxr\b
xray | X-ray of the affected area | Imaging | \bx ?rays?\b; radiograph; plain film
skeletal_survey | Skeletal survey (with a safeguarding referral) | Imaging | skeletal survey; safeguarding
ct_head | CT head | Imaging | \bct (head|brain)\b; head ct; ct scan (of )?(the )?(head|brain)
ct_orbit | CT orbits and sinuses | Imaging | ct (of )?(the )?(orbit|sinus)
ct_ap | CT abdomen and pelvis | Imaging | \bct (abdo|abdomen|a ?p\b|chest abdo|c ?a ?p\b|tap\b); ct scan (of )?(the )?(abdo|abdomen|tummy)
ct_chest | CT chest (staging CT) | Imaging | \bct (chest|thorax|c ?a ?p\b); ct scan (of )?(the )?chest; staging ct
ct_kub | CT KUB (non-contrast) | Imaging | \bct kub\b; non ?contrast ct; ct (of )?(the )?kidneys?
ct_urogram | CT urogram | Imaging | ct urogra; \bctu\b
ct_angio | CT angiogram | Imaging | \bct angio; \bcta\b; \bct aort
ctpa | CT pulmonary angiogram | Imaging | \bctpa\b; ct pulmonary; pulmonary angio
ct_coronary | CT coronary angiography | Imaging | ct coronary; \bctca\b; coronary angio
hrct | High-resolution CT chest | Imaging | \bhrct\b; high res
mri | MRI | Imaging | \bmri\b; magnetic resonance(?! cholang)
mri_spine | Urgent MRI of the whole spine | Imaging | mri (of )?(the )?(whole )?(spine|back|lumbar|cervical|thoracic); spinal mri; whole spine
mrcp | MRCP | Imaging | \bmrcp\b; magnetic resonance cholang
us_abdo | Abdominal ultrasound | Imaging | abdo\w* (ultrasound|us|uss|scan); (ruq|liver|gallbladder|biliary) (ultrasound|us|uss|scan); \buss\b; ultrasound
us_kub | Renal tract ultrasound | Imaging | (renal|kidney|bladder|kub) (ultrasound|us|uss|scan); renal tract (ultrasound|us|uss|scan); bladder scan
tvus | Pelvic / transvaginal ultrasound | Imaging | transvaginal; \btv ?us\b; \btvs\b; pelvic (ultrasound|us|uss|scan)
us_scrotal | Scrotal ultrasound | Imaging | (scrot\w*|testic\w*) (ultrasound|us|uss|scan|doppler); ultrasound (of )?(the )?(scrotum|testis|testes|testicle)
us_neck | Neck ultrasound (± fine needle aspiration) | Imaging | (neck|thyroid) (ultrasound|us|uss|scan); \bfna\b; fine needle
us_hip | Hip ultrasound | Imaging | hip (ultrasound|us|uss|scan)
us_obs | Obstetric ultrasound | Imaging | (obstetric|pregnancy|dating|growth|fetal|foetal) (ultrasound|us|uss|scan); ultrasound (of )?(the )?(baby|fetus|pregnancy|placenta); placental (site|localisation)
doppler | Duplex / Doppler ultrasound | Imaging | doppler; duplex; compression (ultrasound|us)
echo | Echocardiogram | Imaging | \becho\b; echocardio; \btte\b; \btoe\b
dexa | DEXA scan | Imaging | \bdexa\b; \bdxa\b; bone (density|densitometry)
bone_scan | Isotope bone scan | Imaging | bone scan; isotope; scintigra
barium | Barium swallow | Imaging | barium
triple | Triple assessment (examination, imaging, core biopsy) | Imaging | triple assess; mammogra; breast (ultrasound|us|imaging); core biopsy
oct | OCT scan | Imaging | \boct\b; optical coherence
spirometry | Spirometry (FEV1/FVC) | Specialist | spirometr; \bfev ?1\b; \bfvc\b; lung function; \bpfts?\b
feno | FeNO | Specialist | \bfeno\b; exhaled nitric oxide
sleep_study | Sleep study (overnight oximetry or polysomnography) | Specialist | sleep study; polysomnog; overnight oximetry; epworth
sweat_test | Sweat test | Specialist | sweat (test|chloride)
karyotype | Genetic testing | Specialist | karyotyp; genetic (test|testing|screen); chromosom; microarray; \bhfe\b; gene test
ige | Allergy testing (skin prick or specific IgE) | Specialist | skin prick; \bige\b; \brast\b; allergy (test|testing)
patch_test | Patch testing | Specialist | patch test
manometry | Oesophageal manometry | Specialist | manometr
ogd | Gastroscopy (OGD) | Specialist | \bogd\b; gastroscop; (upper gi |oesophago ?gastro ?duodeno)?endoscop; upper gi scope
colonoscopy | Colonoscopy | Specialist | colonoscop; lower gi (endoscop|scope); flexi\w* sig; sigmoidoscop
proctoscopy | Proctoscopy | Specialist | proctoscop; anoscop
cystoscopy | Cystoscopy | Specialist | cystoscop
bronchoscopy | Bronchoscopy (± biopsy) | Specialist | bronchoscop; \bebus\b
nasendoscopy | Flexible nasendoscopy | Specialist | nasendoscop; laryngoscop; scope (of )?(the )?(throat|larynx|nose)
ercp | ERCP | Specialist | \bercp\b
biopsy | Biopsy for histology | Specialist | biops; histolog
lymph_biopsy | Lymph node biopsy | Specialist | (lymph )?node biops; excision biops
bm_biopsy | Bone marrow biopsy | Specialist | bone marrow
temporal_biopsy | Temporal artery ultrasound or biopsy | Specialist | temporal artery; \btab\b; halo sign
lp | Lumbar puncture | Specialist | lumbar puncture; \blp\b; \bcsf\b
eeg | EEG | Specialist | \beeg\b; electroenceph
ncs | Nerve conduction studies / EMG | Specialist | nerve conduction; \bncs\b; \bemg\b; electromyog
joint_asp | Joint aspiration (crystals, Gram stain, culture) | Specialist | (joint|synovial|knee) (aspirat|fluid|tap); aspirat\w* (of )?(the )?joint; arthrocentesis; crystal
pleural_tap | Pleural aspiration (fluid analysis) | Specialist | pleural (tap|aspirat|fluid); thoracocentesis; light s criteria
afb | Sputum for TB (smear, culture, PCR) | Specialist | \bafb\b; acid fast; ziehl; sputum (smear|for tb|mycobact|afb); tb (culture|pcr|test); \bigra\b; interferon gamma; quantiferon; mantoux
sputum | Sputum culture | Bedside | sputum (culture|sample|mc|micro|specimen)
skin_scrape | Skin scrapings or swab (microscopy and culture) | Specialist | scraping; skin (sample|swab|culture); \bkoh\b; wood s lamp; lesion swab
dermoscopy | Dermoscopy | Specialist | dermoscop; dermatoscop
colposcopy | Colposcopy | Specialist | colposcop
smear | Cervical screening (HPV test) | Specialist | smear; cervical screen; \bhpv\b; liquid based
hysteroscopy | Hysteroscopy ± endometrial biopsy | Specialist | hysteroscop; endometrial (biopsy|sampl); pipelle
laparoscopy | Diagnostic laparoscopy | Specialist | laparoscop
naat | NAAT swab (chlamydia and gonorrhoea) | Specialist | \bnaat\b; nucleic acid; (chlamydia|gonorrh\w*|sti) (test|swab|screen|naat|pcr); (endocervical|urethral|vulvovaginal|first void|first catch) (swab|urine|sample); \bpcr\b
hvs | Vaginal swab (microscopy and pH) | Specialist | (high )?vaginal swab; \bhvs\b; wet mount; vaginal ph; whiff
hsv_pcr | Swab for herpes (HSV PCR) | Specialist | \bhsv\b; herpes (swab|pcr|test)
semen | Semen analysis | Specialist | semen; sperm count
pernasal | Per-nasal swab (pertussis PCR) | Specialist | per ?nasal; nasopharyngeal (swab|aspirate); pertussis (pcr|swab|serology|test|antibod)
audiometry | Pure tone audiometry | Specialist | audiometr; audiogram; hearing test; tympanometr
slit_lamp | Slit lamp with fluorescein | Specialist | slit ?lamp; fluorescein
tonometry | Eye pressure (tonometry) | Specialist | intraocular pressure; \biop\b; tonometr; eye pressure
fundoscopy | Dilated fundoscopy | Specialist | fundoscop; ophthalmoscop; fundus; retinal (exam|photo|screen); dilated (eye|fundus)
visual_fields | Visual field testing | Specialist | visual field; perimetr
compartment_pressure | Compartment pressure measurement | Specialist | compartment pressure
exploration | Urgent surgical exploration | Specialist | explor; theatre; \bsurgery\b; surgical review
`;
