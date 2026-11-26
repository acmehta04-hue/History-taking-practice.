import type { DrugProfile, Presentation } from '../types';
import { alendronicAcid } from './alendronic-acid';
import { drugDrill } from './build';
import { levothyroxine } from './levothyroxine';
import { metformin } from './metformin';
import { methotrexate } from './methotrexate';
import { prednisolone } from './prednisolone';
import { warfarin } from './warfarin';

/** Drugs with full drills (viva, counselling, prescribing) */
export const drugProfiles: DrugProfile[] = [warfarin, metformin, levothyroxine, prednisolone, methotrexate, alendronicAcid];

export const drugDrills: Presentation[] = drugProfiles.map(drugDrill);
