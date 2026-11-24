/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { libraryById } from '../src/content/library';
import { abdominalPain } from '../src/content/presentations/abdominal-pain';
import { lowMood } from '../src/content/presentations/low-mood';
import { palpitations } from '../src/content/presentations/palpitations';
import type { ChecklistItem, Presentation } from '../src/content/types';
import { matchEntry, matchQuestion, normalise, patientReply, splitEntry } from '../src/engine/matcher';
import { activePlacement, type CalendarEvent, daysBetween, monthGrid, nextExam } from '../src/engine/calendar';
import { nextLevel, pickCases } from '../src/engine/progression';
import { comboReadiness, nextUp } from '../src/engine/recommend';
import { extraQuestions, pickCasesForStage, stageFor, synthesisQuestion } from '../src/engine/stages';
import { getDrill } from '../src/content';
import { scoreRep } from '../src/engine/scoring';

const ALL: Presentation[] = [abdominalPain, palpitations, lowMood];
const section = (p: Presentation, id: string) => p.sections.find((s) => s.id === id)!;
const ids = (items: ChecklistItem[]) => items.map((i) => i.id).sort();
const caseOf = (p: Presentation, id: string) => p.cases.find((c) => c.id === id)!;

describe('normalise', () => {
  it('lower-cases and strips punctuation', () => {
    assert.equal(normalise('What’s the PAIN like?!'), 'what s the pain like');
  });
});

describe('HPC matching (SOCRATES)', () => {
  const hpc = section(abdominalPain, 'hpc').checklist!;
  const cases: [string, string[]][] = [
    ['Can you tell me what brought you in today?', ['open']],
    ['Where is the pain?', ['site']],
    ['When did it start?', ['onset']],
    ['What does the pain feel like?', ['character']],
    ['Does the pain go anywhere else?', ['radiation']],
    ['Is it there all the time or does it come and go?', ['timing']],
    ['On a scale of 1 to 10 how bad is it?', ['severity']],
    ['What do you think is going on, and is there anything worrying you?', ['ice']],
  ];
  for (const [q, expected] of cases) {
    it(`"${q}" -> ${expected.join(', ')}`, () => {
      const got = ids(matchQuestion(q, hpc));
      for (const e of expected) assert.ok(got.includes(e), `expected ${e}, got ${got.join(', ')}`);
    });
  }

  it('does not treat "since it started" as an onset question', () => {
    assert.ok(!ids(matchQuestion('Is it constant? Has it changed since it started?', hpc)).includes('onset'));
  });

  it('does not treat "does it spread anywhere" as site', () => {
    assert.ok(!ids(matchQuestion('Does it spread anywhere?', hpc)).includes('site'));
  });

  it('answers from the case, then falls back politely', () => {
    const c = caseOf(abdominalPain, 'appendicitis');
    const reply = patientReply(matchQuestion('Where is the pain?', hpc), c);
    assert.match(reply, /right/);
    assert.match(patientReply([], c), /rephrase|not sure|follow/);
  });
});

describe('targeted questions', () => {
  it('asks about pregnancy in the systems review', () => {
    const got = ids(matchQuestion('Is there any chance you could be pregnant?', section(abdominalPain, 'systems').checklist!));
    assert.ok(got.includes('sys_lmp'));
  });
  it('detects an adherence question', () => {
    const got = ids(matchQuestion('Do you ever forget to take your tablets?', section(lowMood, 'dh').checklist!));
    assert.ok(got.includes('dh_adherence'));
  });
  it('detects suicide risk questions', () => {
    const risk = section(lowMood, 'risk').checklist!;
    assert.ok(ids(matchQuestion('Have you had any thoughts of ending your life?', risk)).includes('risk_si'));
    assert.ok(ids(matchQuestion('Have you made any plans?', risk)).includes('risk_plan'));
  });
  it('screens for mania', () => {
    const got = ids(
      matchQuestion('Have you ever felt the opposite, really high and needing little sleep?', section(lowMood, 'hpc').checklist!),
    );
    assert.ok(got.includes('mood_mania'));
  });
});

describe('reasoning entries', () => {
  const crohns = caseOf(abdominalPain, 'crohns');
  it('splits "test — reason"', () => {
    assert.deepEqual(splitEntry('FBC — anaemia'), { head: 'FBC', reason: '— anaemia' });
    assert.equal(splitEntry('Check TFTs because of amiodarone').head.trim(), 'Check TFTs');
  });
  it('credits the reason for faecal calprotectin', () => {
    const m = matchEntry('Faecal calprotectin to differentiate IBD from IBS', crohns.reasoning.ix);
    assert.deepEqual(
      m.items.map((i) => i.id),
      ['calprotectin'],
    );
    assert.equal(m.reasonHits.calprotectin, true);
  });
  it('gives no reason credit without a reason', () => {
    const m = matchEntry('FBC', crohns.reasoning.ix);
    assert.deepEqual(
      m.items.map((i) => i.id),
      ['fbc'],
    );
    assert.equal(m.reasonHits.fbc, false);
  });
  it('matches several tests on one line', () => {
    const m = matchEntry('FBC, CRP and U&Es', crohns.reasoning.ix);
    assert.deepEqual(m.items.map((i) => i.id).sort(), ['crp', 'fbc', 'ue']);
  });
  it('TFTs because amiodarone is thyrotoxic', () => {
    const af = caseOf(palpitations, 'af_amiodarone');
    const m = matchEntry('TFTs because amiodarone can cause thyrotoxicosis', af.reasoning.ix);
    assert.equal(m.reasonHits.tft, true);
  });
  it('flags a distractor, unless the student rules it out', () => {
    const svt = caseOf(palpitations, 'svt');
    assert.ok(matchEntry('24 hour Holter', svt.reasoning.ix, svt.distractors?.ix).distractor);
    const ok = matchEntry('Avoid adenosine as she has asthma — use verapamil', svt.reasoning.mx, svt.distractors?.mx);
    assert.equal(ok.distractor, undefined);
    assert.ok(ok.items.some((i) => i.id === 'adenosine'));
  });
});

describe('scoring', () => {
  const items = [
    { id: 'a', weight: 'core' as const },
    { id: 'b', weight: 'redflag' as const },
  ];
  it('full unaided coverage at Guided scores 100 + speed', () => {
    const s = scoreRep({
      items,
      covered: { a: { method: 'typed' }, b: { method: 'typed' } },
      level: 1,
      durationSec: 60,
      targetSeconds: 120,
    });
    assert.equal(s.accuracy, 1);
    assert.equal(s.independence, 1);
    assert.equal(s.points, 105);
  });
  it('tapping every suggestion halves the points', () => {
    const s = scoreRep({
      items,
      covered: { a: { method: 'suggested' }, b: { method: 'suggested' } },
      level: 1,
      durationSec: 999,
      targetSeconds: 120,
    });
    assert.equal(s.independence, 0);
    assert.equal(s.points, 50);
  });
  it('penalises a missed red flag', () => {
    const s = scoreRep({ items, covered: { a: { method: 'typed' } }, level: 3, durationSec: 999, targetSeconds: 120 });
    assert.deepEqual(s.redFlagsMissed, ['b']);
    assert.equal(s.points, Math.round(100 * 0.4 * 1.4) - 5);
  });
});

describe('progression', () => {
  it('fades guidance after a strong set and restores it after a weak one', () => {
    assert.equal(nextLevel(1, 0.85, 0.9), 2);
    assert.equal(nextLevel(2, 0.7, 0.9), 2);
    assert.equal(nextLevel(3, 0.4, 1), 2);
    assert.equal(nextLevel(3, 0.95, 1), 3);
  });
  it('rotates patients between sets', () => {
    assert.notEqual(pickCases(abdominalPain, 0)[0].id, pickCases(abdominalPain, 1)[0].id);
    assert.equal(pickCases(abdominalPain, 0).length, 3);
  });
});

/* ------------------------------------------------------------------ */
/* Content integrity — catches authoring mistakes before they ship       */
/* ------------------------------------------------------------------ */

describe('content integrity', () => {
  for (const p of ALL) {
    describe(p.title, () => {
      const interviewItems = p.sections.flatMap((s) => s.checklist ?? []);
      const itemIds = new Set(interviewItems.map((i) => i.id));

      it('every pattern compiles', () => {
        for (const i of interviewItems) for (const m of i.match) new RegExp(m, 'i');
        for (const c of p.cases)
          for (const list of Object.values(c.reasoning))
            for (const i of list) [...i.match, ...(i.reasonMatch ?? [])].forEach((m) => new RegExp(m, 'i'));
      });

      it('every model question earns credit for its own item', () => {
        for (const s of p.sections) {
          for (const i of s.checklist ?? []) {
            const got = matchQuestion(i.modelQuestion, s.checklist!).map((x) => x.id);
            assert.ok(got.includes(i.id), `${s.id}/${i.id}: "${i.modelQuestion}" matched [${got.join(', ')}]`);
          }
        }
      });

      it('every Guided option label earns credit for itself', () => {
        for (const c of p.cases) {
          for (const [sec, list] of Object.entries(c.reasoning)) {
            for (const i of list) {
              const m = matchEntry(i.label, list, c.distractors?.[sec]);
              assert.ok(
                m.items.some((x) => x.id === i.id),
                `${c.id}/${sec}/${i.id}: label "${i.label}" matched [${m.items.map((x) => x.id)}]${m.distractor ? ' (distractor ' + m.distractor.label + ')' : ''}`,
              );
            }
            for (const d of c.distractors?.[sec] ?? [])
              assert.ok(matchEntry(d.label, list, c.distractors?.[sec]).distractor, `${c.id}/${sec}: distractor "${d.label}" not detected`);
          }
          if (c.twist)
            for (const i of c.twist.items)
              assert.ok(
                matchEntry(i.label, c.twist.items).items.some((x) => x.id === i.id),
                `${c.id} twist "${i.label}"`,
              );
          const syn = synthesisQuestion(c, 3);
          if (syn)
            for (const i of syn.items)
              assert.ok(
                matchEntry(i.label, syn.items).items.some((x) => x.id === i.id),
                `${c.id} synthesis "${i.label}"`,
              );
          for (const [sec, fu] of Object.entries(c.followUps ?? {}))
            for (const i of fu.items)
              assert.ok(
                matchEntry(i.label, fu.items).items.some((x) => x.id === i.id),
                `${c.id}/${sec} follow-up "${i.label}"`,
              );
        }
      });

      it('case answers refer to real checklist items', () => {
        for (const c of p.cases) for (const k of Object.keys(c.answers)) assert.ok(itemIds.has(k), `${c.id}: unknown answer key ${k}`);
      });

      it('every case has a model answer for every reasoning section', () => {
        for (const s of p.sections.filter((x) => x.kind === 'reasoning'))
          for (const c of p.cases) assert.ok((c.reasoning[s.id] ?? []).length >= 3, `${c.id} missing ${s.id}`);
      });

      it('combined drills point at real blocks', () => {
        for (const c of p.combos) {
          const d = getDrill(p.id, c.id);
          assert.ok(d && d.sections.length === c.sections.length && d.sections.length >= 2, `${c.id} has a missing block`);
        }
      });

      it('every patient has a difficulty and a Challenge twist', () => {
        for (const c of p.cases) {
          assert.ok([1, 2, 3].includes(c.difficulty), `${c.id} difficulty`);
          assert.ok((c.twist?.items.length ?? 0) >= 4, `${c.id} twist`);
        }
      });

      it('teaching links exist', () => {
        for (const s of p.sections) for (const t of s.teach ?? []) assert.ok(libraryById[t], `missing library card ${t}`);
      });

      it('ids are unique within each section', () => {
        for (const s of p.sections) {
          const list = (s.checklist ?? []).map((i) => i.id);
          assert.equal(new Set(list).size, list.length, `${s.id} has duplicate ids`);
        }
        for (const c of p.cases)
          for (const [k, list] of Object.entries(c.reasoning)) {
            const l = list.map((i) => i.id);
            assert.equal(new Set(l).size, l.length, `${c.id}/${k} has duplicate ids`);
          }
      });
    });
  }
});

describe('stages (sets get harder)', () => {
  it('rises with sets completed and stays at Challenge', () => {
    assert.deepEqual([0, 1, 2, 3, 7].map(stageFor), [1, 2, 3, 3, 3]);
  });
  it('picks easier patients first and the hardest at Challenge', () => {
    const easy = pickCasesForStage(abdominalPain, 1, 0).map((c) => c.difficulty);
    const hard = pickCasesForStage(abdominalPain, 3, 2).map((c) => c.difficulty);
    assert.equal(hard[0], 3);
    assert.ok(easy.reduce((a, b) => a + b, 0) < hard.reduce((a, b) => a + b, 0));
    assert.ok(!pickCasesForStage(abdominalPain, 1, 0).some((c) => c.id === 'ectopic'));
  });
  it('adds commit-and-defend from Application, and must-not-miss at Challenge', () => {
    const hpc = section(abdominalPain, 'hpc');
    const c = caseOf(abdominalPain, 'cholecystitis');
    assert.equal(extraQuestions(hpc, c, 1).length, 0);
    assert.equal(extraQuestions(hpc, c, 2)[0].items.length, 1);
    assert.ok(extraQuestions(hpc, c, 3)[0].items.some((i) => i.label.startsWith('Must not miss')));
  });
  it('adds the twist only to reasoning blocks at Challenge, and only after the last block of a combo', () => {
    const mx = section(abdominalPain, 'mx');
    const c = caseOf(abdominalPain, 'appendicitis');
    assert.equal(extraQuestions(mx, c, 2).length, 0);
    assert.match(extraQuestions(mx, c, 3)[0].prompt, /^Twist/);
    assert.equal(extraQuestions(mx, c, 3, false).length, 0);
  });
  it('credits a committed diagnosis with its reason', () => {
    const syn = synthesisQuestion(caseOf(abdominalPain, 'appendicitis'), 2)!;
    const m = matchEntry('Appendicitis — pain migrated to the RIF with anorexia', syn.items);
    assert.equal(m.reasonHits.lead, true);
  });
});

describe('combined drills', () => {
  it('unlock when every block reaches L2', () => {
    const d = getDrill('low-mood', 'combo-background')!;
    const p = lowMood;
    assert.equal(comboReadiness(p, d, {}).ready, false);
    const lvl2 = { level: 2 as const, setsCompleted: 2, bestAccuracy: 0.8, masteredStreak: 0 };
    assert.equal(comboReadiness(p, d, { 'low-mood:pph': lvl2, 'low-mood:dh': lvl2 }).ready, true);
  });
});

describe('calendar', () => {
  const events: CalendarEvent[] = [
    { id: 'a', kind: 'placement', title: 'Psychiatry', specialtyId: 'psych', start: '2026-11-02', end: '2026-12-11' },
    { id: 'b', kind: 'exam', title: 'OSCE', start: '2026-12-14', end: '2026-12-14' },
  ];
  it('finds the current placement and next exam', () => {
    assert.equal(activePlacement(events, '2026-11-24')?.title, 'Psychiatry');
    assert.equal(nextExam(events, '2026-11-24')?.title, 'OSCE');
    assert.equal(daysBetween('2026-11-24', '2026-12-14'), 20);
  });
  it('builds a Monday-first 6-week grid', () => {
    const g = monthGrid(2026, 10); // November 2026 starts on a Sunday
    assert.equal(g.length, 42);
    assert.equal(g[0].key, '2026-10-26');
    assert.equal(g.find((d) => d.inMonth)?.key, '2026-11-01');
  });
  it('steers suggestions to the placement specialty', () => {
    const pick = nextUp({}, [{ ...events[0] }], new Date(2026, 10, 24).getTime());
    assert.equal(pick.presentation.specialtyId, 'psych');
  });
  it('switches to exam mode when an exam is close', () => {
    const due = { level: 2 as const, setsCompleted: 1, bestAccuracy: 0.7, masteredStreak: 0, nextDueAt: 0 };
    const pick = nextUp({ 'palpitations:hpc': due }, events, new Date(2026, 10, 24).getTime());
    assert.match(pick.reason ?? '', /OSCE soon/);
  });
});
