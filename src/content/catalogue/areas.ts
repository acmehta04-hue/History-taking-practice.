import type { Specialty } from '../types';

/**
 * The 24 areas of clinical practice in the GMC's MLA content map.
 * The ids of the first six are kept from earlier versions of the app (saved
 * placements point at them). Verify names against the current content map.
 */
export const areas: Specialty[] = [
  { id: 'gastro', title: 'Gastrointestinal including liver', short: 'Gastro & liver', tone: 'butter', icon: 'nutrition-outline' },
  { id: 'cardio', title: 'Cardiovascular', short: 'Cardiovascular', tone: 'coral', icon: 'heart-outline' },
  { id: 'psych', title: 'Mental health', short: 'Mental health', tone: 'lilac', icon: 'happy-outline' },
  { id: 'resp', title: 'Respiratory', short: 'Respiratory', tone: 'sky', icon: 'cloud-outline' },
  { id: 'neuro', title: 'Neurosciences', short: 'Neuro', tone: 'mint', icon: 'flash-outline' },
  { id: 'womens', title: 'Obstetrics and gynaecology', short: 'Obs & gynae', tone: 'rose', icon: 'flower-outline' },
  { id: 'acute', title: 'Acute and emergency', short: 'Acute & emergency', tone: 'coral', icon: 'pulse-outline' },
  { id: 'surgery', title: 'Surgery', short: 'Surgery', tone: 'butter', icon: 'cut-outline' },
  { id: 'child', title: 'Child health', short: 'Child health', tone: 'mint', icon: 'balloon-outline' },
  { id: 'gp', title: 'General practice and primary healthcare', short: 'General practice', tone: 'sky', icon: 'home-outline' },
  { id: 'older', title: 'Medicine of older adult', short: 'Older adults', tone: 'lilac', icon: 'walk-outline' },
  { id: 'cancer', title: 'Cancer', short: 'Cancer', tone: 'rose', icon: 'ribbon-outline' },
  { id: 'endo', title: 'Endocrine and metabolic', short: 'Endocrine', tone: 'butter', icon: 'flask-outline' },
  { id: 'renal', title: 'Renal and urology', short: 'Renal & urology', tone: 'sky', icon: 'beaker-outline' },
  { id: 'msk', title: 'Musculoskeletal', short: 'MSK', tone: 'mint', icon: 'body-outline' },
  { id: 'infection', title: 'Infection', short: 'Infection', tone: 'mint', icon: 'bug-outline' },
  { id: 'haem', title: 'Clinical haematology', short: 'Haematology', tone: 'rose', icon: 'water-outline' },
  { id: 'derm', title: 'Dermatology', short: 'Dermatology', tone: 'coral', icon: 'hand-left-outline' },
  { id: 'ent', title: 'Ear, nose and throat', short: 'ENT', tone: 'lilac', icon: 'ear-outline' },
  { id: 'eyes', title: 'Ophthalmology', short: 'Eyes', tone: 'sky', icon: 'eye-outline' },
  { id: 'sexual', title: 'Sexual health', short: 'Sexual health', tone: 'rose', icon: 'male-female-outline' },
  { id: 'periop', title: 'Perioperative medicine and anaesthesia', short: 'Periop & anaesthesia', tone: 'lilac', icon: 'bed-outline' },
  { id: 'palliative', title: 'Palliative and end of life care', short: 'Palliative care', tone: 'mint', icon: 'leaf-outline' },
  { id: 'imaging', title: 'Clinical imaging', short: 'Imaging', tone: 'sky', icon: 'scan-outline' },
];
