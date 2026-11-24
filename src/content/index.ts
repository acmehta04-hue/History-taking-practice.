import { library, libraryById } from './library';
import { abdominalPain } from './presentations/abdominal-pain';
import { lowMood } from './presentations/low-mood';
import { palpitations } from './presentations/palpitations';
import type { CaseFile, ChecklistItem, Presentation, SectionDef, Specialty } from './types';

export * from './types';
export { library, libraryById };

/**
 * Specialties follow the UKMLA content map areas. "planned" lists presentations
 * from the content map that are not written yet — they show as "coming soon".
 */
export const specialties: Specialty[] = [
  {
    id: 'gastro',
    title: 'Gastro & surgery',
    tone: 'butter',
    icon: 'nutrition-outline',
    planned: ['Change in bowel habit', 'Jaundice', 'Rectal bleeding', 'Dysphagia', 'Vomiting'],
  },
  {
    id: 'cardio',
    title: 'Cardiology',
    tone: 'coral',
    icon: 'heart-outline',
    planned: ['Chest pain', 'Breathlessness', 'Syncope', 'Peripheral oedema'],
  },
  {
    id: 'psych',
    title: 'Psychiatry',
    tone: 'lilac',
    icon: 'happy-outline',
    planned: ['Anxiety', 'Self-harm', 'Elated mood', 'Hallucinations', 'Substance misuse', 'Memory loss'],
  },
  { id: 'resp', title: 'Respiratory', tone: 'sky', icon: 'cloud-outline', planned: ['Cough', 'Wheeze', 'Haemoptysis'] },
  { id: 'neuro', title: 'Neurology', tone: 'mint', icon: 'flash-outline', planned: ['Headache', 'Dizziness', 'Seizures', 'Limb weakness'] },
  {
    id: 'womens',
    title: 'Women’s health',
    tone: 'rose',
    icon: 'flower-outline',
    planned: ['Pelvic pain', 'Bleeding in pregnancy', 'Menstrual problems'],
  },
];

export const presentations: Presentation[] = [abdominalPain, palpitations, lowMood];

export const presentationById: Record<string, Presentation> = Object.fromEntries(presentations.map((p) => [p.id, p]));

export const specialtyById: Record<string, Specialty> = Object.fromEntries(specialties.map((s) => [s.id, s]));

export function getSection(presentationId: string, sectionId: string): SectionDef | undefined {
  return presentationById[presentationId]?.sections.find((s) => s.id === sectionId);
}

export function getCase(presentationId: string, caseId: string): CaseFile | undefined {
  return presentationById[presentationId]?.cases.find((c) => c.id === caseId);
}

/** Checklist items that apply to this patient (e.g. LMP only for people who could be pregnant) */
export function checklistFor(section: SectionDef, c: CaseFile): ChecklistItem[] {
  return (section.checklist ?? []).filter((i) => !i.appliesTo || i.appliesTo(c));
}

export function presentationsFor(specialtyId: string): Presentation[] {
  return presentations.filter((p) => p.specialtyId === specialtyId);
}

export const programKey = (presentationId: string, sectionId: string) => `${presentationId}:${sectionId}`;
