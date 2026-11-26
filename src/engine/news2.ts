import type { BloodRow, Obs } from '../content/types';

/**
 * NEWS2 (Royal College of Physicians, 2017). Each parameter scores 0–3;
 * the total and any single 3 set the clinical response.
 * Verify bands against the current RCP chart before release.
 */

export type NewsParam = 'rr' | 'spo2' | 'o2' | 'sbp' | 'hr' | 'acvpu' | 'temp';

export interface News2 {
  total: number;
  parts: Record<NewsParam, number>;
  risk: 'low' | 'low-medium' | 'medium' | 'high';
  response: string;
}

const band = (v: number, bands: [number, number][]): number => {
  for (const [max, score] of bands) if (v <= max) return score;
  return bands[bands.length - 1][1];
};

export function scoreRR(rr: number): number {
  return band(rr, [
    [8, 3],
    [11, 1],
    [20, 0],
    [24, 2],
    [Infinity, 3],
  ]);
}

export function scoreSpO2(spo2: number, onO2: boolean, scale2 = false): number {
  if (!scale2)
    return band(spo2, [
      [91, 3],
      [93, 2],
      [95, 1],
      [Infinity, 0],
    ]);
  // Scale 2: 88–92% is the target; above 92% only scores when on oxygen
  if (spo2 <= 83) return 3;
  if (spo2 <= 85) return 2;
  if (spo2 <= 87) return 1;
  if (spo2 <= 92 || !onO2) return 0;
  if (spo2 <= 94) return 1;
  if (spo2 <= 96) return 2;
  return 3;
}

export function scoreSBP(sbp: number): number {
  return band(sbp, [
    [90, 3],
    [100, 2],
    [110, 1],
    [219, 0],
    [Infinity, 3],
  ]);
}

export function scoreHR(hr: number): number {
  return band(hr, [
    [40, 3],
    [50, 1],
    [90, 0],
    [110, 1],
    [130, 2],
    [Infinity, 3],
  ]);
}

export function scoreTemp(t: number): number {
  return band(Math.round(t * 10) / 10, [
    [35.0, 3],
    [36.0, 1],
    [38.0, 0],
    [39.0, 1],
    [Infinity, 2],
  ]);
}

export function news2(o: Obs): News2 {
  const onO2 = !!o.o2;
  const parts: Record<NewsParam, number> = {
    rr: scoreRR(o.rr),
    spo2: scoreSpO2(o.spo2, onO2, o.scale2),
    o2: onO2 ? 2 : 0,
    sbp: scoreSBP(o.sbp),
    hr: scoreHR(o.hr),
    acvpu: o.acvpu === 'A' ? 0 : 3,
    temp: scoreTemp(o.temp),
  };
  const total = Object.values(parts).reduce((a, b) => a + b, 0);
  const anyThree = Object.values(parts).some((p) => p === 3);
  if (total >= 7)
    return { total, parts, risk: 'high', response: 'Emergency response: urgent assessment by a team with critical care skills.' };
  if (total >= 5)
    return {
      total,
      parts,
      risk: 'medium',
      response: 'Urgent response: review by a clinician competent in acute illness, at least hourly obs.',
    };
  if (anyThree)
    return { total, parts, risk: 'low-medium', response: 'Urgent ward-based response: a clinician to review, at least hourly obs.' };
  return { total, parts, risk: 'low', response: 'Ward-based response: nurse to assess, obs at least 4–6 hourly.' };
}

/** L or H when a result is outside its reference range */
export function bloodFlag(row: BloodRow): 'L' | 'H' | undefined {
  if (typeof row.value !== 'number') return undefined;
  if (row.low !== undefined && row.value < row.low) return 'L';
  if (row.high !== undefined && row.value > row.high) return 'H';
  return undefined;
}
