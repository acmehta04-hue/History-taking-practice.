import { presentations, presentationsFor, programKey } from '../content';
import type { Presentation, SectionDef } from '../content/types';
import type { ProgramState } from '../store';
import { SETS_PER_BLOCK } from './progression';

export interface Pick {
  presentation: Presentation;
  section: SectionDef;
  program?: ProgramState;
  due: boolean;
}

function all(programs: Record<string, ProgramState>): Pick[] {
  return presentations.flatMap((p) =>
    p.sections.map((s) => ({ presentation: p, section: s, program: programs[programKey(p.id, s.id)], due: false })),
  );
}

export function dueNow(programs: Record<string, ProgramState>, now = Date.now()): Pick[] {
  return all(programs)
    .filter((x) => x.program?.nextDueAt !== undefined && x.program.nextDueAt <= now)
    .sort((a, b) => (a.program!.nextDueAt ?? 0) - (b.program!.nextDueAt ?? 0))
    .map((x) => ({ ...x, due: true }));
}

/** What the home screen suggests next */
export function nextUp(programs: Record<string, ProgramState>, now = Date.now()): Pick {
  const due = dueNow(programs, now);
  if (due.length) return due[0];
  const list = all(programs);
  const inProgress = list
    .filter((x) => x.program && x.program.setsCompleted < SETS_PER_BLOCK)
    .sort((a, b) => (b.program!.lastSetAt ?? 0) - (a.program!.lastSetAt ?? 0));
  if (inProgress.length) return inProgress[0];
  const fresh = list.find((x) => !x.program);
  if (fresh) return fresh;
  return list.sort((a, b) => (a.program!.nextDueAt ?? 0) - (b.program!.nextDueAt ?? 0))[0];
}

/** 0–1 mastery for a program: best accuracy, scaled by how independent the student now is */
export function mastery(program?: ProgramState): number {
  if (!program) return 0;
  return program.bestAccuracy * (program.level / 3);
}

export function specialtyMastery(specialtyId: string, programs: Record<string, ProgramState>): number {
  const sections = presentationsFor(specialtyId).flatMap((p) => p.sections.map((s) => programs[programKey(p.id, s.id)]));
  if (!sections.length) return 0;
  return sections.reduce((a, p) => a + mastery(p), 0) / sections.length;
}

export function relativeDue(ts: number | undefined, now = Date.now()): string {
  if (ts === undefined) return 'Not started';
  const d = Math.round((ts - now) / 86400000);
  if (ts <= now) return 'Due now';
  if (d <= 0) return 'Due later today';
  if (d === 1) return 'Due tomorrow';
  return `Due in ${d} days`;
}
