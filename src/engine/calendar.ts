/**
 * Calendar helpers. Dates are local calendar days stored as "YYYY-MM-DD"
 * strings, so time zones never shift a placement by a day.
 */

export type EventKind = 'placement' | 'exam';

export interface CalendarEvent {
  id: string;
  kind: EventKind;
  title: string;
  /** Placements: the specialty you're on, used to steer recommendations */
  specialtyId?: string;
  start: string;
  /** Inclusive. Exams usually start === end */
  end: string;
}

export const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function parseDay(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((parseDay(b).getTime() - parseDay(a).getTime()) / 86400000);
}

export const inRange = (day: string, e: CalendarEvent) => day >= e.start && day <= e.end;

/** 6 rows × 7 columns, Monday first; days outside the month are included (flagged) */
export function monthGrid(year: number, month: number): { key: string; inMonth: boolean }[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // Monday = 0
  const start = new Date(year, month, 1 - offset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    return { key: dayKey(d), inMonth: d.getMonth() === month };
  });
}

export function activePlacement(events: CalendarEvent[], today = dayKey(new Date())): CalendarEvent | undefined {
  return events.filter((e) => e.kind === 'placement' && inRange(today, e)).sort((a, b) => b.start.localeCompare(a.start))[0];
}

export function nextExam(events: CalendarEvent[], today = dayKey(new Date())): CalendarEvent | undefined {
  return events.filter((e) => e.kind === 'exam' && e.end >= today).sort((a, b) => a.start.localeCompare(b.start))[0];
}

/** Within this many days of an exam, recommendations switch to exam mode */
export const EXAM_MODE_DAYS = 28;
