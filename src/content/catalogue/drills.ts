import { matchesAny, normalise } from '../../engine/matcher';
import type {
  CaseFile,
  Distractor,
  FollowUp,
  Patient,
  Presentation,
  ReasonItem,
  SectionDef,
  Specialty,
  SyllabusCondition,
  SyllabusPresentation,
  Weight,
} from '../types';
import {
  areas,
  conditionById,
  conditions,
  featurePatterns,
  inSentence,
  presentationsInArea,
  presentationsWithCondition,
  syllabusPresentations,
  testById,
} from './index';

/**
 * Drills generated from the catalogue, one set of drills per UKMLA area:
 *
 *  - Differentials sprint: each rep is a presentation; list what it could be,
 *    must-not-miss first. Challenge sets add a twist (a classic picture: which
 *    cause is it now, and how would you confirm it?).
 *  - Spot the diagnosis: each rep is a condition's classic picture; name it in
 *    one line with the feature that clinches it. From Application sets: the
 *    tests that confirm it (these become flashcards).
 *  - Spot the cause, per presentation: the same, using only the causes of one
 *    presentation (lives in the presentation's home area).
 */

export const CAUSE_CATEGORY: Record<Weight, string> = { redflag: 'Must not miss', core: 'Core', extra: 'Also consider' };

/** Routine tests that are reasonable almost anywhere, so they never appear as wrong options */
const BASELINE = new Set([
  'obs',
  'fbc',
  'crp',
  'ue',
  'lft',
  'coag',
  'cultures',
  'glucose',
  'urine_dip',
  'urine_mcs',
  'bp',
  'cbg',
  'ecg',
  'cxr',
  'abg',
  'lactate',
  'gs',
  'upt',
  'tft',
  'haematinics',
  'calcium',
  'magnesium',
  'bmi',
]);

const NOBODY: Patient = { name: '', age: 0, sex: 'female', setting: '', opening: '' };

export const SPRINT_FLOW = [
  'Start with the must-not-miss causes: the ones that kill or disable if you miss them.',
  'Then the common causes, system by system: cardiac, respiratory, GI, renal, neuro, musculoskeletal, psychological, drugs.',
  'After a dash, add the feature that points to each one, e.g. “PE — pleuritic pain after a long-haul flight”.',
  'Finish with the rarer causes you would consider once the common ones are excluded.',
];

export const SPOT_FLOW = [
  'Read the whole picture first: age, sex, timing, and the one feature that doesn’t fit.',
  'Give one diagnosis, then after a dash the feature that clinches it.',
  'From Application sets you’ll be asked how to confirm it: name the key tests.',
];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** A stable order that still looks shuffled */
const shuffled = <T extends { id: string }>(xs: T[], seed: string) => [...xs].sort((a, b) => hash(seed + a.id) - hash(seed + b.id));

/** Would naming one count as naming the other? Then they can't share a list. */
function clashes(label: string, match: string[], items: ReasonItem[]): boolean {
  return items.some((it) => matchesAny(normalise(it.label), match) || matchesAny(normalise(label), it.match));
}

const conditionsOf = (p: SyllabusPresentation) =>
  p.causes.map((x) => ({ c: conditionById[x.id], weight: x.weight })).filter((x): x is { c: SyllabusCondition; weight: Weight } => !!x.c);

/** `topic`: words already in the question (e.g. "chest" in a chest pain sprint) don't count as a reason */
function causeItem(c: SyllabusCondition, weight: Weight, topic = ''): ReasonItem {
  return {
    id: c.id,
    label: c.title,
    weight,
    match: c.match,
    reasonMatch: featurePatterns(c.key, topic),
    why: `Classic picture: ${c.key}.`,
    category: CAUSE_CATEGORY[weight],
  };
}

function testItems(c: SyllabusCondition): ReasonItem[] {
  return c.ix
    .map((id) => testById[id])
    .filter((t) => !!t)
    .map((t) => ({
      id: t.id,
      label: t.label,
      weight: 'core' as const,
      match: t.match,
      why: `A key test for ${inSentence(c.title)}.`,
      category: t.category,
    }));
}

function usuallyPresents(c: SyllabusCondition): string {
  const ps = presentationsWithCondition(c.id)
    .slice(0, 3)
    .map((p) => inSentence(p.title));
  return ps.length ? `${c.title} usually presents with ${ps.join(', ')}.` : `${c.title}: ${c.key}.`;
}

/** Wrong-but-plausible conditions, skipping any that would clash with the answer */
function conditionDistractors(
  pool: SyllabusCondition[],
  items: ReasonItem[],
  seed: string,
  n: number,
  whyNot: (c: SyllabusCondition) => string,
): Distractor[] {
  const out: Distractor[] = [];
  for (const c of shuffled(pool, seed)) {
    if (out.length >= n) break;
    if (c.helper || items.some((i) => i.id === c.id) || clashes(c.title, c.match, items)) continue;
    if (out.some((d) => clashes(d.label, d.match, [causeItem(c, 'core')]))) continue;
    out.push({ label: c.title, match: c.match, whyNot: whyNot(c) });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Differentials sprint: one rep per presentation                       */
/* ------------------------------------------------------------------ */

function sprintTwist(p: SyllabusPresentation): FollowUp | undefined {
  const causes = conditionsOf(p).filter((x) => !x.c.helper);
  const pick = causes.find((x) => x.weight === 'redflag' && x.c.ix.length) ?? causes.find((x) => x.c.ix.length);
  if (!pick) return undefined;
  const items = [causeItem(pick.c, 'core'), ...testItems(pick.c)].filter(
    (it, i, all) => !all.slice(0, i).some((o) => clashes(it.label, it.match, [o])),
  );
  const others = causes.filter((x) => x.c.id !== pick.c.id && x.weight === 'redflag').map((x) => x.c);
  return {
    prompt: `New information: ${pick.c.key}. Which cause is now most likely, and which tests would confirm it? One per line.`,
    items,
    distractors: conditionDistractors(others, items, p.id, 2, (c) => `${c.title}: ${c.key}.`),
  };
}

/** Causes of neighbouring presentations (ones sharing 2+ causes): plausible-sounding, but not on this list */
function neighbourCauses(p: SyllabusPresentation): SyllabusCondition[] {
  const mine = new Set(p.causes.map((x) => x.id));
  const ids = syllabusPresentations
    .filter((o) => o.id !== p.id && o.causes.filter((x) => mine.has(x.id)).length >= 2)
    .flatMap((o) => o.causes.map((x) => x.id))
    .filter((id) => !mine.has(id));
  return [...new Set(ids)].map((id) => conditionById[id]).filter((c): c is SyllabusCondition => !!c);
}

function sprintCase(p: SyllabusPresentation, area: Specialty): CaseFile {
  const causes = conditionsOf(p);
  const items = causes.map((x) => causeItem(x.c, x.weight, p.title));
  const neighbours = neighbourCauses(p);
  const pool = neighbours.length >= 3 ? neighbours : conditions.filter((c) => c.areas.includes(p.areas[0]) || c.areas.includes(area.id));
  const mustNot = causes.filter((x) => x.weight === 'redflag').map((x) => x.c.title);
  const core = causes.filter((x) => x.weight === 'core').map((x) => x.c.title);
  const twist = sprintTwist(p);
  return {
    id: `p:${p.id}`,
    diagnosis: p.title,
    topic: { kicker: 'Differentials sprint', title: p.title },
    patient: NOBODY,
    summary: `${p.title}: what could it be? List the causes, must-not-miss first.`,
    answers: {},
    reasoning: { sprint: items },
    distractors: { sprint: conditionDistractors(pool, items, p.id, 3, usuallyPresents) },
    pearl: mustNot.length
      ? `Must not miss in ${inSentence(p.title)}: ${mustNot.join(', ')}. Then the common causes: ${core.join(', ')}.`
      : `The core causes of ${inSentence(p.title)}: ${core.join(', ')}.`,
    // Rotating sets take easier topics first; presentations from other areas come after this area's own
    difficulty: Math.min(3, (items.length <= 7 ? 1 : items.length <= 11 ? 2 : 3) + (p.areas[0] === area.id ? 0 : 1)) as 1 | 2 | 3,
    ...(twist ? { twist } : {}),
  };
}

/* ------------------------------------------------------------------ */
/* Spot the diagnosis: one rep per condition                            */
/* ------------------------------------------------------------------ */

function spotDifficulty(c: SyllabusCondition): 1 | 2 | 3 {
  const rank: Record<Weight, 1 | 2 | 3> = { core: 1, redflag: 2, extra: 3 };
  const ws = presentationsWithCondition(c.id).map((p) => rank[p.causes.find((x) => x.id === c.id)!.weight]);
  return ws.length ? (Math.min(...ws) as 1 | 2 | 3) : 2;
}

/** The presenting complaint a spot rep is filed under */
function presentingWith(c: SyllabusCondition, areaId: string): string {
  const ps = presentationsWithCondition(c.id);
  return (ps.find((p) => p.areas.includes(areaId)) ?? ps[0])?.title ?? 'Spot the diagnosis';
}

function confirmQuestion(c: SyllabusCondition, confusers: SyllabusCondition[]): FollowUp | undefined {
  const items = testItems(c);
  if (!items.length) return undefined;
  const distractors: Distractor[] = [];
  for (const d of confusers) {
    for (const t of d.ix.map((id) => testById[id]).filter(Boolean)) {
      if (distractors.length >= 2) break;
      if (BASELINE.has(t.id) || c.ix.includes(t.id) || distractors.some((x) => x.label === t.label)) continue;
      if (clashes(t.label, t.match, items) || distractors.some((x) => matchesAny(normalise(t.label), x.match))) continue;
      distractors.push({
        label: t.label,
        match: t.match,
        whyNot: `${t.label} is part of the work-up for ${inSentence(d.title)}, not this diagnosis.`,
      });
    }
  }
  return {
    id: 'ix',
    label: 'Confirm it',
    prompt: `Diagnosis: ${c.title}. Which investigations would confirm it? One per line.`,
    items,
    distractors,
    minStage: 2,
  };
}

function spotCase(c: SyllabusCondition, areaId: string, sectionIds: string[]): CaseFile {
  const filedUnder = presentingWith(c, areaId);
  const item: ReasonItem = {
    ...causeItem(c, 'core', filedUnder),
    category: 'Diagnosis',
    hint: `It begins with “${c.title.slice(0, 2)}…” (${c.title.split(' ').length} word${c.title.includes(' ') ? 's' : ''}).`,
  };
  // The most plausible confusers: other causes of the presentation it's filed under, then of its other presentations
  const ps = presentationsWithCondition(c.id);
  const first = ps.find((p) => p.title === filedUnder);
  const fromFirst = (first?.causes ?? [])
    .map((x) => conditionById[x.id])
    .filter((x): x is SyllabusCondition => !!x && !x.helper && x.id !== c.id);
  const fromOthers = ps
    .filter((p) => p !== first)
    .flatMap((p) => p.causes.map((x) => conditionById[x.id]))
    .filter((x): x is SyllabusCondition => !!x && !x.helper && x.id !== c.id);
  const sameArea = conditions.filter((x) => x.areas.includes(areaId));
  const wrong = (d: SyllabusCondition) => `${d.title}: ${d.key}.`;
  let distractors = conditionDistractors(fromFirst, [item], c.id, 3, wrong);
  if (distractors.length < 3) {
    const more = conditionDistractors(
      [...fromOthers, ...sameArea].filter((x) => !distractors.some((d) => d.label === x.title)),
      [item],
      c.id,
      3 - distractors.length,
      wrong,
    );
    distractors = [
      ...distractors,
      ...more.filter((m) => !distractors.some((d) => clashes(d.label, d.match, [{ ...item, label: m.label, match: m.match }]))),
    ];
  }
  const confirm = confirmQuestion(c, distractors.map((d) => conditions.find((x) => x.title === d.label)!).filter(Boolean));
  const by = <T>(v: T) => Object.fromEntries(sectionIds.map((s) => [s, v])) as Record<string, T>;
  const tests = testItems(c).map((t) => t.label);
  return {
    id: `c:${c.id}`,
    diagnosis: c.title,
    topic: { kicker: 'Spot the diagnosis', title: filedUnder },
    patient: NOBODY,
    summary: `${c.key}.`,
    answers: {},
    reasoning: by([item]),
    distractors: by(distractors),
    ...(confirm ? { followUps: by(confirm) } : {}),
    pearl: `${c.title}: ${c.key}.${tests.length ? ` Confirm with: ${tests.join(', ')}.` : ''}`,
    difficulty: spotDifficulty(c),
  };
}

/* ------------------------------------------------------------------ */
/* One generated "presentation" per area                                */
/* ------------------------------------------------------------------ */

const spotSection = (id: string, title: string, short: string, caseIds: string[], blurb: string): SectionDef => ({
  id,
  title,
  short,
  kind: 'reasoning',
  blurb,
  targetSeconds: 60,
  prompt: 'Your diagnosis, then after a dash the feature that clinches it.',
  placeholder: 'e.g. Appendicitis — pain moved to the RIF',
  flow: SPOT_FLOW,
  caseIds,
  rotate: true,
  single: true,
  wrongLabel: 'Not the best fit',
  stageNotes: {
    1: 'Name the diagnosis from its classic picture.',
    2: 'Adds a second question: which tests would confirm it?',
    3: 'The same, with 25% less time.',
  },
});

/** Section id of the per-presentation spot drill */
export const spotSectionId = (presentationId: string) => `spot-${presentationId}`;

function areaDrill(area: Specialty): Presentation {
  const pres = presentationsInArea(area.id);
  const home = pres.filter((p) => p.areas[0] === area.id);
  const areaConds = conditions.filter((c) => !c.helper && c.areas.includes(area.id));

  // Which spot sections each condition belongs to
  const sectionsFor = new Map<string, string[]>();
  const add = (id: string, section: string) => sectionsFor.set(id, [...(sectionsFor.get(id) ?? []), section]);
  for (const c of areaConds) add(c.id, 'spot');
  for (const p of home) for (const x of p.causes) if (conditionById[x.id] && !conditionById[x.id].helper) add(x.id, spotSectionId(p.id));

  const spotCases = [...sectionsFor.entries()].map(([id, secs]) => spotCase(conditionById[id], area.id, secs));
  const sprintCases = pres.map((p) => sprintCase(p, area));
  const sections: SectionDef[] = [
    {
      id: 'sprint',
      title: 'Differentials sprint',
      short: 'Sprint',
      kind: 'reasoning',
      blurb: `Three ${inSentence(area.short)} presentations a set: list what each could be, must-not-miss first.`,
      targetSeconds: 150,
      prompt: 'One cause per line, must-not-miss first. After a dash, add the feature that points to it for bonus credit.',
      placeholder: 'e.g. PE — pleuritic pain after a long flight',
      flow: SPRINT_FLOW,
      caseIds: sprintCases.map((c) => c.id),
      rotate: true,
      wrongLabel: 'Not a usual cause',
      guidedOnlyDistractors: true,
      stageNotes: {
        1: 'List the causes, must-not-miss first. Each set brings three new presentations.',
        2: 'New presentations each set: add the feature that points to each cause.',
        3: 'Adds a twist: a classic picture to pin down and confirm, with 25% less time.',
      },
    },
    spotSection(
      'spot',
      'Spot the diagnosis',
      'Spot',
      areaConds.map((c) => `c:${c.id}`),
      'Three classic pictures a set: name the diagnosis and the feature that clinches it. From set 2, say how you would confirm it.',
    ),
    ...home
      .map((p) => ({ p, ids: p.causes.filter((x) => conditionById[x.id] && !conditionById[x.id].helper).map((x) => `c:${x.id}`) }))
      .filter((x) => x.ids.length >= 2)
      .map(({ p, ids }) =>
        spotSection(
          spotSectionId(p.id),
          `Spot the cause: ${p.title}`,
          p.title,
          ids,
          `Classic pictures of what ${inSentence(p.title)} can be. Name each one, then how you would confirm it.`,
        ),
      ),
  ];

  return {
    id: `area-${area.id}`,
    title: area.short,
    specialtyId: area.id,
    ukmla: [area.title],
    kind: 'area',
    sections,
    combos: [],
    cases: [...sprintCases, ...spotCases],
  };
}

export const areaDrills: Presentation[] = areas.map(areaDrill);
export const areaDrillFor = (areaId: string) => areaDrills.find((p) => p.specialtyId === areaId);

/** Where a presentation's own spot drill lives */
export function spotDrillFor(presentationId: string): { presentationId: string; sectionId: string } | undefined {
  const p = syllabusPresentations.find((x) => x.id === presentationId);
  if (!p) return undefined;
  const drill = areaDrillFor(p.areas[0]);
  const sectionId = spotSectionId(p.id);
  return drill?.sections.some((s) => s.id === sectionId) ? { presentationId: drill.id, sectionId } : undefined;
}
