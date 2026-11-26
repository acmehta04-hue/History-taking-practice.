/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { libraryById } from '../src/content/library';
import { abdominalPain } from '../src/content/presentations/abdominal-pain';
import { changeBowelHabit } from '../src/content/presentations/change-bowel-habit';
import { headache } from '../src/content/presentations/headache';
import { lowMood } from '../src/content/presentations/low-mood';
import { palpitations } from '../src/content/presentations/palpitations';
import type { CaseFile, ChecklistItem, FollowUp, Presentation, ResultPanel, SectionDef } from '../src/content/types';
import { depressionDive } from '../src/content/deepdives/depression';
import { drugDrills } from '../src/content/drugs';
import { matchEntry, matchQuestion, normalise, patientReply, splitEntry } from '../src/engine/matcher';
import { activePlacement, type CalendarEvent, daysBetween, monthGrid, nextExam } from '../src/engine/calendar';
import { nextLevel, pickCases } from '../src/engine/progression';
import { comboReadiness, nextUp } from '../src/engine/recommend';
import { casesForSet, extraQuestions, pickCasesForStage, stageFor, synthesisQuestion, xid } from '../src/engine/stages';
import { casesForDrill, checklistFor, findQuestion, getDrill, presentationById, presentations } from '../src/content';
import { counselTurn, initialCounselState } from '../src/engine/counsel';
import { cardResults, dueCards, gradeCard, questionScores } from '../src/engine/flashcards';
import { scoreRep } from '../src/engine/scoring';
import { bloodFlag, news2 } from '../src/engine/news2';
import { ecgTrace, measuredRate } from '../src/engine/ecg';

const ALL: Presentation[] = [abdominalPain, changeBowelHabit, palpitations, lowMood, headache, depressionDive, ...drugDrills];
const listOf = (fu: FollowUp | FollowUp[]) => (Array.isArray(fu) ? fu : [fu]);
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
  it('in a quiz, ticking every option is not full marks', () => {
    const items = [
      { id: 'a', weight: 'core' as const },
      { id: 'b', weight: 'core' as const },
      { id: 'c', weight: 'redflag' as const },
    ];
    const covered = { a: { method: 'suggested' as const }, b: { method: 'suggested' as const }, c: { method: 'suggested' as const } };
    const base = { items, covered, level: 1 as const, durationSec: 0, targetSeconds: 0 };
    assert.equal(scoreRep({ ...base, distractorsPicked: 0, quiz: true }).accuracy, 1);
    assert.ok(scoreRep({ ...base, distractorsPicked: 3, quiz: true }).accuracy < 0.5);
    // typed answers keep the old rule: wrong entries cost points, not accuracy
    assert.equal(scoreRep({ ...base, distractorsPicked: 3 }).accuracy, 1);
  });
  it('a Guided quiz moves up on accuracy alone, because picked answers earn no independence', () => {
    assert.equal(nextLevel(1, 0.85, 0, true), 2);
    assert.equal(nextLevel(1, 0.85, 0), 1);
    assert.equal(nextLevel(1, 0.6, 0, true), 1);
    // from Prompted up, the chat is typed, so independence counts again
    assert.equal(nextLevel(2, 0.9, 0.5, true), 2);
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
      const source = p.deepDive ? presentationById[p.deepDive.source] : undefined;
      const interviewItems = [...p.sections, ...(source?.sections ?? [])].flatMap((s) => s.checklist ?? []);
      const itemIds = new Set(interviewItems.map((i) => i.id));
      const casesFor = (s: SectionDef): CaseFile[] =>
        s.caseIds ? p.cases.filter((c) => s.caseIds!.includes(c.id)) : p.cases.filter((c) => !c.episode);
      const patients = p.cases.filter((c) => !c.episode);
      const questionsOf = (c: CaseFile): FollowUp[] => [
        ...(c.twist ? [c.twist] : []),
        ...Object.values(c.followUps ?? {}).flatMap(listOf),
        ...(c.viva ?? []).flatMap((q) => (q.probe ? [q, q.probe] : [q])),
      ];

      it('every pattern compiles', () => {
        for (const i of interviewItems) for (const m of i.match) new RegExp(m, 'i');
        for (const c of p.cases) {
          const lists = [...Object.values(c.reasoning), ...questionsOf(c).map((q) => q.items)];
          for (const list of lists) for (const i of list) [...i.match, ...(i.reasonMatch ?? [])].forEach((m) => new RegExp(m, 'i'));
          for (const d of [...Object.values(c.distractors ?? {}).flat(), ...questionsOf(c).flatMap((q) => q.distractors ?? [])])
            d.match.forEach((m) => new RegExp(m, 'i'));
        }
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
          const syn = synthesisQuestion(c, 3);
          for (const q of [...questionsOf(c), ...(syn ? [syn] : [])]) {
            for (const i of q.items) {
              const m = matchEntry(i.label, q.items, q.distractors);
              assert.ok(
                m.items.some((x) => x.id === i.id),
                `${c.id} question "${q.prompt.slice(0, 40)}…": label "${i.label}" matched [${m.items.map((x) => x.id)}]${m.distractor ? ' (distractor ' + m.distractor.label + ')' : ''}`,
              );
            }
            for (const d of q.distractors ?? [])
              assert.ok(matchEntry(d.label, q.items, q.distractors).distractor, `${c.id}: distractor "${d.label}" not detected`);
          }
        }
      });

      it('case answers refer to real checklist items', () => {
        for (const c of p.cases) for (const k of Object.keys(c.answers)) assert.ok(itemIds.has(k), `${c.id}: unknown answer key ${k}`);
      });

      it('every case has a model answer for every reasoning section', () => {
        for (const s of p.sections.filter((x) => x.kind === 'reasoning'))
          for (const c of casesFor(s)) assert.ok((c.reasoning[s.id] ?? []).length >= 3, `${c.id} missing ${s.id}`);
      });

      it('section patient lists point at real patients', () => {
        for (const s of p.sections) {
          for (const id of s.caseIds ?? [])
            assert.ok(
              p.cases.some((c) => c.id === id),
              `${s.id}: no patient ${id}`,
            );
          assert.ok(casesFor(s).length >= 2, `${s.id} needs at least 2 patients`);
        }
        for (const c of p.cases) {
          for (const k of [...Object.keys(c.openings ?? {}), ...Object.keys(c.summaries ?? {}), ...Object.keys(c.followUps ?? {})])
            assert.ok(p.sections.some((s) => s.id === k) || source?.sections.some((s) => s.id === k), `${c.id}: unknown section ${k}`);
        }
      });

      it('combined drills point at real blocks', () => {
        for (const c of p.combos) {
          const d = getDrill(p.id, c.id);
          assert.ok(d && d.sections.length === c.sections.length && d.sections.length >= 2, `${c.id} has a missing block`);
        }
      });

      it('every patient has a difficulty', () => {
        for (const c of p.cases) assert.ok([1, 2, 3].includes(c.difficulty), `${c.id} difficulty`);
      });

      it('teaching links exist', () => {
        for (const s of p.sections) for (const t of s.teach ?? []) assert.ok(libraryById[t], `missing library card ${t}`);
      });

      it('ids are unique within each section, and flashcard ids within each patient', () => {
        for (const s of p.sections) {
          const list = (s.checklist ?? []).map((i) => i.id);
          assert.equal(new Set(list).size, list.length, `${s.id} has duplicate ids`);
        }
        for (const c of p.cases) {
          for (const [k, list] of Object.entries(c.reasoning)) {
            const l = list.map((i) => i.id);
            assert.equal(new Set(l).size, l.length, `${c.id}/${k} has duplicate ids`);
          }
          for (const q of questionsOf(c)) {
            const l = q.items.map((i) => i.id);
            assert.equal(new Set(l).size, l.length, `${c.id}: duplicate item ids in "${q.prompt.slice(0, 30)}"`);
          }
          const cardIds = questionsOf(c)
            .map((q) => q.id)
            .filter(Boolean);
          assert.equal(new Set(cardIds).size, cardIds.length, `${c.id} has duplicate flashcard ids`);
        }
      });

      if (!p.kind || p.kind === 'presentation') {
        it('every patient has a Challenge twist', () => {
          for (const c of patients) assert.ok((c.twist?.items.length ?? 0) >= 4, `${c.id} twist`);
        });
        it('every patient has viva questions at all three tiers', () => {
          for (const c of patients) {
            const tiers = new Set((c.viva ?? []).map((q) => q.tier));
            assert.deepEqual([...tiers].sort(), [1, 2, 3], `${c.id} viva tiers`);
            assert.ok(
              (c.viva ?? []).some((q) => q.probe),
              `${c.id} has no examiner probe`,
            );
          }
        });
      } else {
        it('every purpose-tagged question says what it is for', () => {
          for (const s of p.sections.filter((x) => x.tagPurpose))
            for (const i of s.checklist ?? []) if (i.purpose) assert.ok(i.target, `${i.id} has no target`);
        });
        it('counselling concerns point at points the patient will hear', () => {
          for (const s of p.sections.filter((x) => x.kind === 'counsel'))
            for (const c of casesFor(s)) {
              const ids = new Set(checklistFor(s, c).map((i) => i.id));
              assert.ok((c.concerns ?? []).length >= 3, `${c.id} needs concerns`);
              for (const q of c.concerns ?? []) assert.ok(ids.has(q.itemId), `${c.id}: concern points at ${q.itemId}`);
            }
        });
      }
    });
  }
});

describe('stages (sets get harder)', () => {
  it('rises with sets completed and stays at Challenge', () => {
    assert.deepEqual([0, 1, 2, 3, 7].map(stageFor), [1, 2, 3, 3, 3]);
  });
  it('picks easier patients first and the hardest at Challenge', () => {
    const easy = pickCasesForStage(abdominalPain.cases, 1, 0).map((c) => c.difficulty);
    const hard = pickCasesForStage(abdominalPain.cases, 3, 2).map((c) => c.difficulty);
    assert.equal(hard[0], 3);
    assert.ok(easy.reduce((a, b) => a + b, 0) < hard.reduce((a, b) => a + b, 0));
    assert.ok(!pickCasesForStage(abdominalPain.cases, 1, 0).some((c) => c.id === 'ectopic'));
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
    assert.equal(extraQuestions(mx, c, 3)[0].label, 'Challenge · new information');
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

describe('viva', () => {
  it('asks recall at Foundation, adds why with probes at Application, and data at Challenge', () => {
    const viva = section(lowMood, 'viva');
    const c = caseOf(lowMood, 'bipolar');
    const [s1, s2, s3] = ([1, 2, 3] as const).map((st) => extraQuestions(viva, c, st));
    assert.ok(s1.every((q) => q.label === 'Viva · recall'));
    assert.ok(s2.some((q) => q.label === 'Examiner follow-up'));
    assert.ok(s3.some((q) => q.label === 'Viva · data and what-ifs'));
    assert.ok(s1.length < s2.length && s2.length < s3.length);
  });
  it('the full station ends with the viva', () => {
    for (const p of presentations) assert.equal(getDrill(p.id, 'combo-full')!.sections.at(-1)!.id, 'viva');
  });
  it('marks a viva answer by keyword', () => {
    const q = caseOf(lowMood, 'bipolar').viva!.find((x) => x.id === 'bp-lithium-se')!;
    const m = matchEntry('Polyuria from nephrogenic diabetes insipidus', q.items);
    assert.ok(m.items.some((i) => i.id === 'renal'));
  });
});

describe('flashcards', () => {
  it('missed cards come back now; remembered ones move up a box', () => {
    const now = 1_000_000;
    const miss = gradeCard(undefined, 0.4, now);
    assert.equal(miss.box, 0);
    assert.equal(miss.due, now);
    const hit = gradeCard(undefined, 0.9, now);
    assert.equal(hit.box, 1);
    assert.equal(hit.due, now + 86400000);
    assert.equal(gradeCard(hit, 0.9, now).box, 2);
    assert.equal(gradeCard(hit, 0.2, now).box, 0);
    assert.deepEqual(dueCards({ a: miss, b: hit }, now), ['a']);
  });
  it('scores each question separately and records cards only for questions with an id', () => {
    const q = caseOf(lowMood, 'bipolar').viva![0];
    const covered = { [xid(0, q.items[0].id)]: { method: 'typed' as const } };
    const [score] = questionScores([q], covered);
    assert.ok(score.accuracy > 0 && score.accuracy < 1);
    assert.deepEqual(
      cardResults([q], covered).map((r) => r.qid),
      [q.id],
    );
    assert.deepEqual(cardResults([{ prompt: 'no id', items: q.items }], covered), []);
  });
  it('finds every flashcard question from its key', () => {
    for (const p of ALL)
      for (const c of p.cases) {
        for (const q of c.viva ?? []) assert.ok(findQuestion(p.id, c.id, q.id), `${p.id}/${c.id}/${q.id}`);
        for (const fu of Object.values(c.followUps ?? {}).flatMap(listOf))
          if (fu.id) assert.ok(findQuestion(p.id, c.id, fu.id), `${p.id}/${c.id}/${fu.id}`);
      }
  });
});

describe('deep dive: depression', () => {
  const why = section(depressionDive, 'why');
  it('uses the right patients for each set', () => {
    const ids = (sec: string) =>
      casesForDrill(depressionDive, getDrill(depressionDive.id, sec)!)
        .map((c) => c.id)
        .sort();
    assert.deepEqual(ids('why'), ['bipolar', 'depression_new', 'ssri_adherence']);
    assert.deepEqual(ids('counsel'), ['arthur', 'depression_new', 'jade']);
    assert.deepEqual(ids('prescribe'), ['arthur', 'depression_new', 'jade']);
  });
  it('tags every history question with a purpose', () => {
    const purposes = new Set(why.checklist!.filter((i) => i.purpose).map((i) => i.purpose));
    assert.deepEqual([...purposes].sort(), ['exclude', 'risk', 'severity']);
    const got = matchQuestion('Have you ever felt really high, needing little sleep?', why.checklist!);
    assert.deepEqual(
      got.map((i) => i.id),
      ['mood_mania'],
    );
    assert.equal(got[0].purpose, 'exclude');
  });
  it('gives extra credit for tagging the purpose correctly', () => {
    const items = [{ id: 'a', weight: 'core' as const, hasReason: true }];
    const right = scoreRep({ items, covered: { a: { method: 'typed', reason: true } }, level: 1, durationSec: 999, targetSeconds: 1 });
    const wrong = scoreRep({ items, covered: { a: { method: 'typed', reason: false } }, level: 1, durationSec: 999, targetSeconds: 1 });
    assert.ok(right.accuracy > wrong.accuracy);
  });
  it('shows patient-specific counselling points only to the right patient', () => {
    const counsel = section(depressionDive, 'counsel');
    const ids = (cid: string) => checklistFor(counsel, caseOf(depressionDive, cid)).map((i) => i.id);
    assert.ok(ids('arthur').includes('cs_sodium') && !ids('jade').includes('cs_sodium'));
    assert.ok(ids('jade').includes('cs_review_1wk') && !ids('arthur').includes('cs_review_1wk'));
    assert.ok(ids('depression_new').includes('cs_sjw') && !ids('arthur').includes('cs_sjw'));
  });
  it('recognises counselling explanations', () => {
    const counsel = section(depressionDive, 'counsel');
    const got = matchQuestion('It usually takes a few weeks to work, and please don’t stop it suddenly.', counsel.checklist!).map(
      (i) => i.id,
    );
    assert.ok(got.includes('cs_onset') && got.includes('cs_stopping'), got.join(', '));
  });
  it('reads a prescription written on one line', () => {
    const laura = caseOf(depressionDive, 'depression_new');
    const m = matchEntry('Sertraline 50 mg oral once daily', laura.reasoning.prescribe);
    assert.deepEqual(m.items.map((i) => i.id).sort(), ['rx_dose', 'rx_drug', 'rx_freq', 'rx_route']);
    assert.ok(matchEntry('Sertraline 200 mg once daily', laura.reasoning.prescribe, laura.distractors?.prescribe).distractor);
  });
});

describe('counselling patient', () => {
  const arthur = caseOf(depressionDive, 'arthur');
  const items = checklistFor(section(depressionDive, 'counsel'), arthur);
  const pick = (id: string) => items.find((i) => i.id === id)!;
  it('acknowledges what was explained, then asks back from the second turn', () => {
    const t1 = counselTurn({ gained: [pick('cs_what')], covered: new Set(['cs_what']), c: arthur, state: initialCounselState });
    assert.match(t1.reply, /sleeping tablet/);
    assert.equal(t1.state.open, null);
    const t2 = counselTurn({ gained: [], covered: new Set(['cs_what']), c: arthur, state: t1.state });
    assert.match(t2.reply, /water tablet/);
    const t3 = counselTurn({ gained: [pick('cs_sodium')], covered: new Set(['cs_what', 'cs_sodium']), c: arthur, state: t2.state });
    assert.match(t3.reply, /naproxen/);
  });
  it('asks again once if a question is ignored', () => {
    const r1 = counselTurn({ gained: [], covered: new Set(), c: arthur, state: { next: 1, open: 0, openTurns: 0, turn: 2 } });
    const r2 = counselTurn({ gained: [], covered: new Set(), c: arthur, state: r1.state });
    assert.match(r2.reply, /still not sure/);
  });
});

/* ------------------------------------------------------------------ */
/* Results: NEWS2, bloods, ECGs; follow-up episodes                     */
/* ------------------------------------------------------------------ */

describe('NEWS2', () => {
  const normal = { rr: 16, spo2: 98, sbp: 124, dbp: 78, hr: 72, acvpu: 'A' as const, temp: 36.8 };
  it('scores a normal set of obs as 0', () => {
    assert.equal(news2(normal).total, 0);
    assert.equal(news2(normal).risk, 'low');
  });
  it('scores each band edge', () => {
    assert.equal(news2({ ...normal, rr: 21 }).parts.rr, 2);
    assert.equal(news2({ ...normal, rr: 25 }).parts.rr, 3);
    assert.equal(news2({ ...normal, spo2: 95 }).parts.spo2, 1);
    assert.equal(news2({ ...normal, spo2: 91 }).parts.spo2, 3);
    assert.equal(news2({ ...normal, sbp: 100 }).parts.sbp, 2);
    assert.equal(news2({ ...normal, sbp: 90 }).parts.sbp, 3);
    assert.equal(news2({ ...normal, hr: 111 }).parts.hr, 2);
    assert.equal(news2({ ...normal, hr: 131 }).parts.hr, 3);
    assert.equal(news2({ ...normal, temp: 38.1 }).parts.temp, 1);
    assert.equal(news2({ ...normal, temp: 39.1 }).parts.temp, 2);
    assert.equal(news2({ ...normal, temp: 35.0 }).parts.temp, 3);
  });
  it('adds 2 for oxygen and uses scale 2 when asked', () => {
    assert.equal(news2({ ...normal, o2: '2 L/min' }).total, 2);
    assert.equal(news2({ ...normal, spo2: 90, scale2: true }).parts.spo2, 0);
    assert.equal(news2({ ...normal, spo2: 97, scale2: true, o2: '28% Venturi' }).parts.spo2, 3);
    assert.equal(news2({ ...normal, spo2: 97, scale2: true }).parts.spo2, 0);
  });
  it('any single 3 gives a low-medium (urgent ward) response; 5+ medium; 7+ high', () => {
    assert.equal(news2({ ...normal, acvpu: 'C' }).risk, 'low-medium');
    assert.equal(news2({ ...normal, rr: 22, hr: 112, sbp: 104 }).risk, 'medium');
    assert.equal(news2({ ...normal, rr: 24, spo2: 94, sbp: 98, hr: 128, temp: 38.6 }).total, 8);
  });
  it('flags bloods outside the range', () => {
    assert.equal(bloodFlag({ test: 'K', value: 3.0, low: 3.5, high: 5.3 }), 'L');
    assert.equal(bloodFlag({ test: 'CRP', value: 286, high: 5 }), 'H');
    assert.equal(bloodFlag({ test: 'Na', value: 140, low: 133, high: 146 }), undefined);
  });
});

describe('ECG strips', () => {
  it('draws the rate you ask for', () => {
    for (const rate of [60, 112, 150]) assert.ok(Math.abs(measuredRate(ecgTrace({ rate, rhythm: 'sinus' })) - rate) <= 3, `rate ${rate}`);
  });
  it('makes AF irregular and sinus regular', () => {
    const gaps = (b: number[]) => b.slice(1).map((x, i) => x - b[i]);
    const spread = (g: number[]) => Math.max(...g) - Math.min(...g);
    assert.ok(spread(gaps(ecgTrace({ rate: 130, rhythm: 'af' }).beats)) > 0.1);
    assert.ok(spread(gaps(ecgTrace({ rate: 130, rhythm: 'sinus' }).beats)) < 0.001);
  });
  it('is the same every time (no flicker between renders)', () => {
    assert.deepEqual(ecgTrace({ rate: 132, rhythm: 'af' }).beats, ecgTrace({ rate: 132, rhythm: 'af' }).beats);
  });
});

describe('follow-up episodes', () => {
  const journey = getDrill('change-bowel-habit', 'journey')!;
  it('runs Robert’s visits in order, every set', () => {
    const cases = casesForDrill(changeBowelHabit, journey);
    for (const setsDone of [0, 1, 4])
      assert.deepEqual(
        casesForSet(cases, journey.sections[0], stageFor(setsDone), setsDone).map((c) => c.id),
        ['crc_results', 'crc_leak', 'crc_sbo'],
      );
  });
  it('keeps episodes out of the ordinary blocks', () => {
    const hpc = getDrill('change-bowel-habit', 'hpc')!;
    assert.ok(casesForDrill(changeBowelHabit, hpc).every((c) => !c.episode));
  });
  it('every episode belongs to a real patient', () => {
    for (const p of ALL)
      for (const c of p.cases.filter((x) => x.episode))
        assert.ok(
          p.cases.some((x) => x.id === c.episode!.of && !x.episode),
          c.id,
        );
  });
  it('any NEWS2 score written in an answer matches the obs on screen', () => {
    for (const p of ALL)
      for (const c of p.cases) {
        const check = (panels: ResultPanel[] | undefined, items: { label: string }[]) => {
          const obs = panels?.find((x) => x.kind === 'obs');
          for (const it of items) {
            const m = it.label.match(/NEWS2 (\d+)/);
            if (m) {
              assert.ok(obs && obs.kind === 'obs', `${c.id}: "${it.label}" but no obs`);
              assert.equal(news2(obs.obs).total, Number(m[1]), `${c.id}: "${it.label}"`);
            }
          }
        };
        for (const [sec, list] of Object.entries(c.reasoning)) check(c.results?.[sec], list);
        for (const fu of Object.values(c.followUps ?? {}).flatMap(listOf)) check(fu.results, fu.items);
      }
  });
});

describe('drug drills', () => {
  for (const p of drugDrills) {
    it(`${p.title}: every viva topic starts with recall, and the set covers tiers 1–3 with a probe`, () => {
      const topics = p.cases.filter((c) => c.topic);
      assert.equal(topics.length, 3);
      for (const c of topics)
        assert.ok(
          (c.viva ?? []).some((q) => q.tier === 1),
          `${c.id} has no recall question`,
        );
      const qs = topics.flatMap((c) => c.viva ?? []);
      assert.deepEqual([...new Set(qs.map((q) => q.tier))].sort(), [1, 2, 3]);
      assert.ok(qs.some((q) => q.probe));
    });
    it(`${p.title}: every prescription names the drug, dose, route and frequency`, () => {
      for (const c of p.cases.filter((x) => !x.topic))
        for (const id of ['rx_drug', 'rx_dose', 'rx_route', 'rx_freq'])
          assert.ok(
            c.reasoning.prescribe.some((i) => i.id === id),
            `${c.id} missing ${id}`,
          );
    });
  }
});
