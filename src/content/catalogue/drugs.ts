/**
 * Drugs to know for the UKMLA and the Prescribing Safety Assessment.
 *
 *   id | name | class | area
 *
 * An id that matches a drug profile in src/content/drugs has full drills;
 * the rest are listed as coming soon. Check the list against the current
 * MLA content map and PSA blueprint.
 */
export const DRUGS_TABLE = String.raw`
aspirin | Aspirin | Antiplatelet | cardio
clopidogrel | Clopidogrel | Antiplatelet (P2Y12 inhibitor) | cardio
ticagrelor | Ticagrelor | Antiplatelet (P2Y12 inhibitor) | cardio
warfarin | Warfarin | Vitamin K antagonist | haem
apixaban | Apixaban | Direct oral anticoagulant | haem
rivaroxaban | Rivaroxaban | Direct oral anticoagulant | haem
enoxaparin | Enoxaparin | Low molecular weight heparin | haem
heparin | Unfractionated heparin | Anticoagulant | haem
atorvastatin | Atorvastatin | Statin | cardio
ramipril | Ramipril | ACE inhibitor | cardio
losartan | Losartan | Angiotensin II receptor blocker | cardio
amlodipine | Amlodipine | Calcium channel blocker | cardio
bisoprolol | Bisoprolol | Beta-blocker | cardio
digoxin | Digoxin | Cardiac glycoside | cardio
amiodarone | Amiodarone | Class III antiarrhythmic | cardio
furosemide | Furosemide | Loop diuretic | cardio
bendroflumethiazide | Bendroflumethiazide | Thiazide diuretic | cardio
indapamide | Indapamide | Thiazide-like diuretic | cardio
spironolactone | Spironolactone | Aldosterone antagonist | cardio
gtn | Glyceryl trinitrate | Nitrate | cardio
salbutamol | Salbutamol | Short-acting beta-2 agonist | resp
tiotropium | Tiotropium | Long-acting antimuscarinic | resp
beclometasone | Beclometasone | Inhaled corticosteroid | resp
budesonide-formoterol | Budesonide with formoterol | Inhaled corticosteroid with LABA | resp
montelukast | Montelukast | Leukotriene receptor antagonist | resp
prednisolone | Prednisolone | Oral corticosteroid | resp
hydrocortisone | Hydrocortisone | Corticosteroid | endo
omeprazole | Omeprazole | Proton pump inhibitor | gastro
lansoprazole | Lansoprazole | Proton pump inhibitor | gastro
metoclopramide | Metoclopramide | Dopamine antagonist antiemetic | gastro
ondansetron | Ondansetron | 5-HT3 antagonist antiemetic | gastro
cyclizine | Cyclizine | Antihistamine antiemetic | gastro
loperamide | Loperamide | Antimotility drug | gastro
lactulose | Lactulose | Osmotic laxative | gastro
senna | Senna | Stimulant laxative | gastro
macrogol | Macrogol | Osmotic laxative | gastro
mesalazine | Mesalazine | Aminosalicylate | gastro
azathioprine | Azathioprine | Immunosuppressant | gastro
metformin | Metformin | Biguanide | endo
gliclazide | Gliclazide | Sulfonylurea | endo
insulin | Insulin (basal-bolus and premixed) | Insulin | endo
dapagliflozin | Dapagliflozin | SGLT2 inhibitor | endo
sitagliptin | Sitagliptin | DPP-4 inhibitor | endo
levothyroxine | Levothyroxine | Thyroid hormone | endo
carbimazole | Carbimazole | Antithyroid drug | endo
alendronic-acid | Alendronic acid | Bisphosphonate | msk
calcium-vitamin-d | Calcium and vitamin D | Supplement | msk
paracetamol | Paracetamol | Analgesic | gp
ibuprofen | Ibuprofen | NSAID | msk
naproxen | Naproxen | NSAID | msk
codeine | Codeine | Weak opioid | palliative
morphine | Morphine | Strong opioid | palliative
oxycodone | Oxycodone | Strong opioid | palliative
naloxone | Naloxone | Opioid antagonist | acute
gabapentin | Gabapentin | Gabapentinoid | neuro
pregabalin | Pregabalin | Gabapentinoid | neuro
amitriptyline | Amitriptyline | Tricyclic antidepressant | neuro
allopurinol | Allopurinol | Xanthine oxidase inhibitor | msk
colchicine | Colchicine | Anti-gout | msk
methotrexate | Methotrexate | DMARD (folate antagonist) | msk
hydroxychloroquine | Hydroxychloroquine | DMARD | msk
folic-acid | Folic acid | Vitamin | haem
ferrous-sulfate | Ferrous sulfate | Iron supplement | haem
hydroxocobalamin | Hydroxocobalamin | Vitamin B12 | haem
tranexamic-acid | Tranexamic acid | Antifibrinolytic | haem
amoxicillin | Amoxicillin | Penicillin | infection
co-amoxiclav | Co-amoxiclav | Penicillin with beta-lactamase inhibitor | infection
flucloxacillin | Flucloxacillin | Penicillinase-resistant penicillin | infection
benzylpenicillin | Benzylpenicillin | Penicillin | infection
clarithromycin | Clarithromycin | Macrolide | infection
doxycycline | Doxycycline | Tetracycline | infection
nitrofurantoin | Nitrofurantoin | Urinary antibacterial | infection
trimethoprim | Trimethoprim | Antifolate antibacterial | infection
ciprofloxacin | Ciprofloxacin | Fluoroquinolone | infection
metronidazole | Metronidazole | Nitroimidazole | infection
gentamicin | Gentamicin | Aminoglycoside | infection
vancomycin | Vancomycin | Glycopeptide | infection
piperacillin-tazobactam | Piperacillin with tazobactam | Broad-spectrum penicillin | infection
ceftriaxone | Ceftriaxone | Third-generation cephalosporin | infection
aciclovir | Aciclovir | Antiviral | infection
fluconazole | Fluconazole | Antifungal | infection
sertraline | Sertraline | SSRI | psych
citalopram | Citalopram | SSRI | psych
fluoxetine | Fluoxetine | SSRI | psych
mirtazapine | Mirtazapine | Noradrenergic and specific serotonergic antidepressant | psych
venlafaxine | Venlafaxine | SNRI | psych
lithium | Lithium | Mood stabiliser | psych
olanzapine | Olanzapine | Atypical antipsychotic | psych
quetiapine | Quetiapine | Atypical antipsychotic | psych
haloperidol | Haloperidol | Typical antipsychotic | psych
clozapine | Clozapine | Atypical antipsychotic | psych
diazepam | Diazepam | Benzodiazepine | psych
lorazepam | Lorazepam | Benzodiazepine | acute
zopiclone | Zopiclone | Z-drug hypnotic | psych
chlordiazepoxide | Chlordiazepoxide | Benzodiazepine (alcohol withdrawal) | psych
thiamine | Thiamine | Vitamin B1 | psych
levetiracetam | Levetiracetam | Antiepileptic | neuro
sodium-valproate | Sodium valproate | Antiepileptic | neuro
lamotrigine | Lamotrigine | Antiepileptic | neuro
carbamazepine | Carbamazepine | Antiepileptic | neuro
phenytoin | Phenytoin | Antiepileptic | neuro
co-careldopa | Co-careldopa | Dopamine precursor | neuro
donepezil | Donepezil | Acetylcholinesterase inhibitor | older
tamsulosin | Tamsulosin | Alpha-blocker | renal
finasteride | Finasteride | 5-alpha reductase inhibitor | renal
oxybutynin | Oxybutynin | Antimuscarinic | renal
combined-pill | Combined oral contraceptive | Hormonal contraceptive | womens
levonorgestrel | Levonorgestrel (emergency) | Emergency contraceptive | sexual
hrt | Hormone replacement therapy | Oestrogen with progestogen | womens
adrenaline | Adrenaline | Sympathomimetic (anaphylaxis) | acute
chlorphenamine | Chlorphenamine | Antihistamine | acute
potassium-chloride | Potassium chloride | Electrolyte replacement | acute
sodium-chloride | Sodium chloride 0.9% and maintenance fluids | IV fluid | periop
`;
