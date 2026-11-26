/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  areas,
  catalogueProblems,
  conditionById,
  conditions,
  syllabusPresentations,
  testById,
  tests,
  titlePatterns,
} from '../src/content/catalogue';
import { areaDrills, spotDrillFor } from '../src/content/catalogue/drills';
import { getDrill, presentationById, presentations } from '../src/content';
import type { CaseFile, FollowUp, ReasonItem } from '../src/content/types';
import { matchesAny, matchEntry, normalise } from '../src/engine/matcher';
import { casesForSet, extraQuestions, pickRotating } from '../src/engine/stages';

/* ------------------------------------------------------------------ */
/* The tables                                                           */
/* ------------------------------------------------------------------ */

const areaIds = new Set(areas.map((a) => a.id));
const compiles = (p: string) => {
  try {
    new RegExp(p, 'i');
    return true;
  } catch {
    return false;
  }
};

describe('syllabus catalogue', () => {
  it('parses without problems', () => {
    assert.deepEqual(catalogueProblems, []);
  });

  it('covers all 24 UKMLA areas, each with presentations and conditions', () => {
    assert.equal(areas.length, 24);
    for (const a of areas) {
      assert.ok(syllabusPresentations.filter((p) => p.areas.includes(a.id)).length >= 2, `${a.id} needs presentations`);
      assert.ok(conditions.filter((c) => !c.helper && c.areas.includes(a.id)).length >= 4, `${a.id} needs conditions`);
    }
  });

  it('ids are unique', () => {
    for (const [name, ids] of [
      ['tests', tests.map((t) => t.id)],
      ['conditions', conditions.map((c) => c.id)],
      ['presentations', syllabusPresentations.map((p) => p.id)],
    ] as const) {
      const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
      assert.deepEqual(dupes, [], `duplicate ${name}`);
    }
  });

  it('every area, cause and test id points at something real', () => {
    for (const c of conditions) {
      for (const a of c.areas) assert.ok(areaIds.has(a), `${c.id}: unknown area ${a}`);
      for (const t of c.ix) assert.ok(testById[t], `${c.id}: unknown test ${t}`);
    }
    for (const p of syllabusPresentations) {
      for (const a of p.areas) assert.ok(areaIds.has(a), `${p.id}: unknown area ${a}`);
      const ids = p.causes.map((x) => x.id);
      for (const id of ids) assert.ok(conditionById[id], `${p.id}: unknown condition ${id}`);
      assert.equal(new Set(ids).size, ids.length, `${p.id} lists a cause twice`);
      assert.ok(ids.length >= 3, `${p.id} needs at least 3 causes`);
    }
  });

  it('every pattern compiles', () => {
    for (const t of tests) for (const m of t.match) assert.ok(compiles(m), `test ${t.id}: bad pattern ${m}`);
    for (const c of conditions) for (const m of c.match) assert.ok(compiles(m), `${c.id}: bad pattern ${m}`);
  });

  it('every condition and test is recognised by its own name', () => {
    for (const c of conditions) assert.ok(matchesAny(normalise(c.title), c.match), `${c.id}: "${c.title}" doesn't match itself`);
    for (const t of tests) assert.ok(matchesAny(normalise(t.label), t.match), `test ${t.id}: "${t.label}" doesn't match itself`);
  });

  it('a classic picture never names its own condition (it is the spot-the-diagnosis vignette)', () => {
    for (const c of conditions.filter((x) => !x.helper)) {
      const hit = c.match.find((m) => matchesAny(normalise(c.key), [m]));
      assert.equal(hit, undefined, `${c.id}: the picture contains "${hit}"`);
    }
  });

  it('naming one cause never credits another in the same differential', () => {
    for (const p of syllabusPresentations) {
      const cs = p.causes.map((x) => conditionById[x.id]).filter(Boolean);
      for (const a of cs)
        for (const b of cs) {
          if (a === b) continue;
          // naming a subtype may credit its parent: "Neutropenic sepsis" contains "Sepsis"
          if (matchesAny(normalise(a.title), titlePatterns(b.title))) continue;
          const syn = b.synonyms.find((m) => matchesAny(normalise(a.title), [m]));
          assert.equal(syn, undefined, `${p.id}: "${a.title}" also matches ${b.id} (pattern ${syn})`);
        }
    }
  });

  it('tests that confirm a condition never credit each other', () => {
    for (const c of conditions) {
      const ts = c.ix.map((id) => testById[id]).filter(Boolean);
      for (const a of ts)
        for (const b of ts)
          if (a !== b) assert.ok(!matchesAny(normalise(a.label), b.match), `${c.id}: "${a.label}" also matches test ${b.id}`);
    }
  });

  it('presentations with a hand-written drill share its id', () => {
    for (const id of ['abdominal-pain', 'change-bowel-habit', 'palpitations', 'low-mood'])
      assert.ok(syllabusPresentations.some((p) => p.id === id) && presentations.some((p) => p.id === id), id);
  });
});

/* ------------------------------------------------------------------ */
/* The generated drills                                                 */
/* ------------------------------------------------------------------ */

const listOf = (fu: FollowUp | FollowUp[]) => (Array.isArray(fu) ? fu : [fu]);
const questionsOf = (c: CaseFile): FollowUp[] => [...(c.twist ? [c.twist] : []), ...Object.values(c.followUps ?? {}).flatMap(listOf)];

function checkList(where: string, items: ReasonItem[], distractors: { label: string; match: string[] }[] = []) {
  const ids = items.map((i) => i.id);
  assert.equal(new Set(ids).size, ids.length, `${where}: duplicate ids`);
  for (const i of items) {
    const m = matchEntry(i.label, items, distractors as never);
    assert.ok(
      m.items.some((x) => x.id === i.id),
      `${where}: "${i.label}" matched [${m.items.map((x) => x.id)}]${m.distractor ? ` (distractor ${m.distractor.label})` : ''}`,
    );
  }
  for (const d of distractors)
    assert.ok(matchEntry(d.label, items, distractors as never).distractor, `${where}: distractor "${d.label}" not detected`);
}

describe('generated area drills', () => {
  it('there is one per area, each with a sprint and a spot drill', () => {
    assert.equal(areaDrills.length, 24);
    for (const p of areaDrills) {
      assert.equal(p.kind, 'area');
      assert.ok(presentationById[p.id], `${p.id} not registered`);
      for (const id of ['sprint', 'spot']) assert.ok(getDrill(p.id, id), `${p.id} missing ${id}`);
    }
  });

  it('every section has at least 3 reps and every rep a model answer', () => {
    for (const p of areaDrills)
      for (const s of p.sections) {
        const cs = p.cases.filter((c) => s.caseIds!.includes(c.id));
        assert.equal(cs.length, s.caseIds!.length, `${p.id}/${s.id}: missing cases`);
        assert.ok(cs.length >= 2, `${p.id}/${s.id} needs 2+ reps`);
        for (const c of cs) assert.ok((c.reasoning[s.id] ?? []).length >= 1, `${p.id}/${s.id}/${c.id}: no model answer`);
      }
  });

  it('every option label earns credit for itself, and every wrong option is detected', () => {
    for (const p of areaDrills)
      for (const c of p.cases) {
        for (const [sec, list] of Object.entries(c.reasoning)) checkList(`${p.id}/${c.id}/${sec}`, list, c.distractors?.[sec]);
        for (const q of questionsOf(c)) checkList(`${p.id}/${c.id} "${q.prompt.slice(0, 30)}"`, q.items, q.distractors);
      }
  });

  it('wrong options in a sprint are never real causes of that presentation', () => {
    for (const p of areaDrills)
      for (const c of p.cases.filter((x) => x.id.startsWith('p:')))
        for (const d of c.distractors?.sprint ?? []) assert.ok(!c.reasoning.sprint.some((i) => i.label === d.label), `${c.id}: ${d.label}`);
  });

  it('every presentation has a spot drill in its home area', () => {
    for (const sp of syllabusPresentations) assert.ok(spotDrillFor(sp.id), `${sp.id} has no spot drill`);
  });

  it('a spot rep asks for the confirming tests only from Application sets', () => {
    const p = areaDrills.find((x) => x.id === 'area-cardio')!;
    const s = p.sections.find((x) => x.id === 'spot')!;
    const acs = p.cases.find((c) => c.id === 'c:acs')!;
    assert.equal(extraQuestions(s, acs, 1).length, 0);
    const q = extraQuestions(s, acs, 2);
    assert.equal(q.length, 1);
    assert.deepEqual(q[0].items.map((i) => i.id).sort(), ['ecg', 'troponin']);
  });

  it('credits the reason when the clinching feature is given', () => {
    const p = areaDrills.find((x) => x.id === 'area-cardio')!;
    const c = p.cases.find((x) => x.id === 'p:chest-pain')!;
    const m = matchEntry('Aortic dissection — tearing pain to the back', c.reasoning.sprint);
    assert.deepEqual(
      m.items.map((i) => i.id),
      ['aortic-dissection'],
    );
    assert.equal(m.reasonHits['aortic-dissection'], true);
  });

  it('rotating sets work through every topic before repeating', () => {
    const p = areaDrills.find((x) => x.id === 'area-gastro')!;
    const s = p.sections.find((x) => x.id === 'sprint')!;
    const cs = p.cases.filter((c) => s.caseIds!.includes(c.id));
    const seen = new Set<string>();
    const sets = Math.ceil(cs.length / 3);
    for (let i = 0; i < sets; i++) for (const c of pickRotating(cs, i)) seen.add(c.id);
    assert.equal(seen.size, cs.length);
    assert.equal(casesForSet(cs, s, 3, 0).length, 3);
  });
});
