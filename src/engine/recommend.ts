import {
  areaDrillFor,
  areaDrills,
  combosFor,
  deepDives,
  type Drill,
  drillSourcesFor,
  presentations,
  programKey,
  singlesFor,
  specialties,
} from '../content';
import type { Presentation, Specialty } from '../content/types';
import type { ProgramState } from '../store';
import { activePlacement, type CalendarEvent, daysBetween, dayKey, EXAM_MODE_DAYS, nextExam } from './calendar';
import { SETS_PER_BLOCK } from './progression';

export interface Pick {
  presentation: Presentation;
  drill: Drill;
  program?: ProgramState;
  due: boolean;
  /** Why this was suggested, shown on the home card */
  reason?: string;
}

type Programs = Record<string, ProgramState>;

/** Hand-written drills first, then the syllabus drills (sprint and spot for every area, then per-presentation spot drills) */
function all(programs: Programs, specialtyId?: string): Pick[] {
  return [...presentations, ...deepDives, ...areaDrills]
    .filter((p) => !specialtyId || p.specialtyId === specialtyId)
    .flatMap((p) =>
      [...singlesFor(p), ...combosFor(p)].map((d) => ({
        presentation: p,
        drill: d,
        program: programs[programKey(p.id, d.id)],
        due: false,
      })),
    );
}

/** A combined drill is ready once every block in it has reached L2 */
export function comboReadiness(p: Presentation, d: Drill, programs: Programs): { ready: boolean; done: number; total: number } {
  const done = d.sections.filter((s) => (programs[programKey(p.id, s.id)]?.level ?? 1) >= 2).length;
  return { ready: done === d.sections.length, done, total: d.sections.length };
}

export function dueNow(programs: Programs, now = Date.now()): Pick[] {
  return all(programs)
    .filter((x) => x.program?.nextDueAt !== undefined && x.program.nextDueAt <= now)
    .sort((a, b) => (a.program!.nextDueAt ?? 0) - (b.program!.nextDueAt ?? 0))
    .map((x) => ({ ...x, due: true }));
}

/**
 * What the home screen suggests next.
 *  - Exam within 4 weeks: due reviews first, then combined drills that are ready
 *  - On a placement: prefer drills from that specialty
 *  - Otherwise: due → in progress → unlocked combo → next new block
 */
export function nextUp(programs: Programs, events: CalendarEvent[] = [], now = Date.now()): Pick {
  const today = dayKey(new Date(now));
  const exam = nextExam(events, today);
  const examSoon = exam && daysBetween(today, exam.start) <= EXAM_MODE_DAYS;
  const placement = activePlacement(events, today);
  const focus = placement?.specialtyId && drillSourcesFor(placement.specialtyId).length ? placement.specialtyId : undefined;

  const due = dueNow(programs, now);
  if (examSoon) {
    if (due.length) return { ...due[0], reason: `${exam.title} soon — clear your reviews` };
    const combo = all(programs).find((x) => x.drill.kind === 'combo' && comboReadiness(x.presentation, x.drill, programs).ready);
    if (combo) return { ...combo, reason: `${exam.title} soon — practise blocks together` };
  }

  const scoped = focus ? all(programs, focus) : all(programs);
  const tag = focus ? `On your ${placement!.title} placement` : undefined;
  const scopedDue = due.filter((d) => !focus || d.presentation.specialtyId === focus);
  if (scopedDue.length) return { ...scopedDue[0], reason: tag ?? 'Due for review' };

  const inProgress = scoped
    .filter((x) => x.program && x.program.setsCompleted < SETS_PER_BLOCK)
    .sort((a, b) => (b.program!.lastSetAt ?? 0) - (a.program!.lastSetAt ?? 0));
  if (inProgress.length) return { ...inProgress[0], reason: tag };

  const combo = scoped.find((x) => x.drill.kind === 'combo' && !x.program && comboReadiness(x.presentation, x.drill, programs).ready);
  if (combo) return { ...combo, reason: 'New: combined drill unlocked' };

  // Hand-written drills before syllabus drills; within the syllabus, an area's sprint and spot before its per-presentation drills
  const fresh =
    scoped.find((x) => x.drill.kind === 'single' && !x.program && x.presentation.kind !== 'area') ??
    scoped.find((x) => x.drill.kind === 'single' && !x.program && ['sprint', 'spot'].includes(x.drill.id)) ??
    scoped.find((x) => x.drill.kind === 'single' && !x.program);
  if (fresh) return { ...fresh, reason: tag };
  if (due.length) return due[0];
  const any = all(programs).find((x) => x.drill.kind === 'single' && !x.program);
  if (any) return any;
  return all(programs).sort((a, b) => (a.program?.nextDueAt ?? 0) - (b.program?.nextDueAt ?? 0))[0];
}

/** 0–1 mastery for a program: best accuracy, scaled by how independent the student now is */
export function mastery(program?: ProgramState): number {
  if (!program) return 0;
  return program.bestAccuracy * (program.level / 3);
}

/** Mastery for an area: its hand-written drills plus its two main syllabus drills (sprint and spot) */
export function specialtyMastery(specialtyId: string, programs: Programs): number {
  const keys = drillSourcesFor(specialtyId).flatMap((p) =>
    p.sections.filter((s) => p.kind !== 'area' || s.id === 'sprint' || s.id === 'spot').map((s) => programKey(p.id, s.id)),
  );
  if (!keys.length) return 0;
  return keys.reduce((a, k) => a + mastery(programs[k]), 0) / keys.length;
}

/** When anything in an area was last practised (0 if never) */
export function lastPractised(specialtyId: string, programs: Programs): number {
  return Math.max(
    0,
    ...drillSourcesFor(specialtyId).flatMap((p) => p.sections.map((s) => programs[programKey(p.id, s.id)]?.lastSetAt ?? 0)),
  );
}

/** The areas to show first: the current placement, then recently practised, then areas with full history drills */
export function topAreas(programs: Programs, events: CalendarEvent[], n = 5, now = Date.now()): Specialty[] {
  const placement = activePlacement(events, dayKey(new Date(now)))?.specialtyId;
  const score = (s: Specialty) =>
    (s.id === placement ? 1e15 : 0) + lastPractised(s.id, programs) + (presentations.some((p) => p.specialtyId === s.id) ? 1 : 0);
  return [...specialties].sort((a, b) => score(b) - score(a)).slice(0, n);
}

/** Sets completed across an area's syllabus drills */
export function syllabusSets(specialtyId: string, programs: Programs): number {
  const p = areaDrillFor(specialtyId);
  return p ? p.sections.reduce((a, s) => a + (programs[programKey(p.id, s.id)]?.setsCompleted ?? 0), 0) : 0;
}

export const isDue = (ts: number | undefined, now = Date.now()) => ts !== undefined && ts <= now;

export function relativeDue(ts: number | undefined, now = Date.now()): string {
  if (ts === undefined) return 'Not started';
  const d = Math.round((ts - now) / 86400000);
  if (ts <= now) return 'Due now';
  if (d <= 0) return 'Due later today';
  if (d === 1) return 'Due tomorrow';
  return `Due in ${d} days`;
}
