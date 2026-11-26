import { normalise } from '../../engine/matcher';
import type { SyllabusCondition, SyllabusPresentation, TestDef, Weight } from '../types';
import { areas } from './areas';
import { CONDITIONS_MEDICINE } from './conditions-medicine';
import { CONDITIONS_SPECIALTIES } from './conditions-specialties';
import { DRUGS_TABLE } from './drugs';
import { PRESENTATIONS_TABLE } from './presentations';
import { TESTS_TABLE } from './tests';

/**
 * The UKMLA syllabus catalogue: areas → presentations → the conditions each
 * could be → the tests that confirm them. Read from plain tables so it can be
 * edited like a spreadsheet; anything malformed is collected in
 * `catalogueProblems`, which the tests require to be empty.
 */

export { areas };
export const catalogueProblems: string[] = [];

function rows(table: string, name: string, fields: number): string[][] {
  return table
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const parts = (l.endsWith('|') ? `${l} ` : l).split(' | ').map((p) => p.trim());
      if (parts.length !== fields) catalogueProblems.push(`${name}: expected ${fields} fields, got ${parts.length}: ${l.slice(0, 60)}`);
      return parts;
    });
}

const list = (s: string | undefined, sep: RegExp) =>
  (s ?? '')
    .split(sep)
    .map((x) => x.trim())
    .filter(Boolean);

/** One word of a title as a pattern: plurals and possessives are optional */
function titleWords(text: string): string {
  const out: string[] = [];
  for (const w of normalise(text).split(' ')) {
    if (w === 's' && out.length) out[out.length - 1] += ' ?s?';
    else out.push(w.length >= 5 && w.endsWith('s') && !/(ss|us|is|os)$/.test(w) ? w.slice(0, -1) : w);
  }
  return out.join(' ');
}

/** Patterns from a title: "Main name (other name)" and "A / B" give one pattern each */
export function titlePatterns(title: string): string[] {
  const m = title.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
  const parts = (m ? [m[1], m[2]] : [title]).flatMap((p) => p.split(/\s+\/\s+/));
  const out: string[] = [];
  for (const part of parts) {
    const n = normalise(part);
    if (n.length < 3) continue;
    out.push(n.length <= 4 ? `\\b${n}\\b` : `\\b${titleWords(part)}`);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Tests                                                                */
/* ------------------------------------------------------------------ */

export const tests: TestDef[] = rows(TESTS_TABLE, 'tests', 4).map(([id, label, category, patterns]) => ({
  id,
  label,
  category,
  match: list(patterns, /;/),
}));
export const testById: Record<string, TestDef> = Object.fromEntries(tests.map((t) => [t.id, t]));

/* ------------------------------------------------------------------ */
/* Conditions                                                           */
/* ------------------------------------------------------------------ */

function parseConditions(table: string, name: string): SyllabusCondition[] {
  return rows(table, name, 6).map(([rawId, title, areaList, syn, key, ix]) => {
    const helper = rawId.startsWith('~');
    const synonyms = list(syn, /;/);
    return {
      id: helper ? rawId.slice(1) : rawId,
      title,
      areas: list(areaList, /\s+/),
      match: [...titlePatterns(title), ...synonyms],
      synonyms,
      key,
      ix: list(ix, /\s+/),
      ...(helper ? { helper: true } : {}),
    };
  });
}

export const conditions: SyllabusCondition[] = [
  ...parseConditions(CONDITIONS_MEDICINE, 'conditions-medicine'),
  ...parseConditions(CONDITIONS_SPECIALTIES, 'conditions-specialties'),
];
export const conditionById: Record<string, SyllabusCondition> = Object.fromEntries(conditions.map((c) => [c.id, c]));

/* ------------------------------------------------------------------ */
/* Presentations                                                        */
/* ------------------------------------------------------------------ */

const PREFIX: Record<string, Weight> = { '!': 'redflag', '?': 'extra' };

export const syllabusPresentations: SyllabusPresentation[] = rows(PRESENTATIONS_TABLE, 'presentations', 4).map(
  ([id, title, areaList, causes]) => ({
    id,
    title,
    areas: list(areaList, /\s+/),
    causes: list(causes, /\s+/).map((tok) => {
      const weight = PREFIX[tok[0]];
      return { id: weight ? tok.slice(1) : tok, weight: weight ?? 'core' };
    }),
  }),
);
export const syllabusPresentationById: Record<string, SyllabusPresentation> = Object.fromEntries(
  syllabusPresentations.map((p) => [p.id, p]),
);

export const presentationsInArea = (areaId: string) => syllabusPresentations.filter((p) => p.areas.includes(areaId));
export const conditionsInArea = (areaId: string) => conditions.filter((c) => !c.helper && c.areas.includes(areaId));
export const presentationsWithCondition = (conditionId: string) =>
  syllabusPresentations.filter((p) => p.causes.some((x) => x.id === conditionId));

/** Where a condition sits in a presentation's differential */
export const weightIn = (p: SyllabusPresentation, conditionId: string): Weight | undefined =>
  p.causes.find((x) => x.id === conditionId)?.weight;

/* ------------------------------------------------------------------ */
/* Feature keywords: credit for giving a reason ("PE — pleuritic pain") */
/* ------------------------------------------------------------------ */

const STOP = new Set(
  (
    'and the for are was but not has had any all can one two who its his her new old off out own per may way day got too use via yet due ' +
    'get let put set see now far few men man son with from that this after before often usually which there their about over under into ' +
    'than then when where while worse better also more most less very much some other have been being years year older young younger ' +
    'woman women person people someone child children baby adult history recent recently sudden severe mild symptoms signs sign symptom ' +
    'associated present presents may might could will without within around both either each side left right days week weeks month ' +
    'months hours hour time times normal raised high known previous risk factor factors cause causes caused like feels feeling felt ' +
    'onset pain blood they them what does your first just only even such these those every same through going getting starting ' +
    'started common rare classic picture'
  ).split(' '),
);

/** Patterns for the clinical features in a classic picture, skipping words already in the question (`topic`) */
export function featurePatterns(key: string, topic = ''): string[] {
  const out = new Set<string>();
  const skip = new Set(normalise(topic).split(' '));
  for (const w of normalise(key).split(' ')) {
    if (w.length < 3 || STOP.has(w) || skip.has(w) || /\d/.test(w)) continue;
    const stem = w.length > 6 ? w.replace(/(ations?|ness|ing|ed|es|ly|ity)$/, '') : w;
    out.add(stem.length <= 3 ? `\\b${stem}\\b` : stem);
  }
  const caps = /\b[A-Z][A-Z0-9]{1,4}\b/g;
  let m: RegExpExecArray | null;
  while ((m = caps.exec(key))) out.add(`\\b${m[0].toLowerCase()}\\b`);
  return [...out];
}

/** Title in running text: "acute coronary syndrome", but "Crohn’s disease", "IgA vasculitis" */
export function inSentence(title: string): string {
  const first = title.split(' ')[0];
  if (
    /[’']/.test(first) ||
    /[A-Z].*[A-Z]/.test(first) ||
    /^(Guillain|Kawasaki|Lyme|Mallory|Stevens|Von|Duchenne|Clostridioides|Mycoplasma)/.test(title)
  )
    return title;
  return title[0].toLowerCase() + title.slice(1);
}

/* ------------------------------------------------------------------ */
/* Drugs to know                                                        */
/* ------------------------------------------------------------------ */

export interface CatalogueDrug {
  id: string;
  name: string;
  drugClass: string;
  areaId: string;
}

export const drugCatalogue: CatalogueDrug[] = rows(DRUGS_TABLE, 'drugs', 4).map(([id, name, drugClass, areaId]) => ({
  id,
  name,
  drugClass,
  areaId,
}));

/** Totals for the syllabus screen */
export function catalogueStats() {
  return {
    areas: areas.length,
    presentations: syllabusPresentations.length,
    conditions: conditions.filter((c) => !c.helper).length,
    tests: tests.length,
    drugs: drugCatalogue.length,
  };
}
