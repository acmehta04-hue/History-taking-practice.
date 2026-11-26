import type { EcgSpec } from '../content/types';

/**
 * A schematic rhythm strip: millivolts against time, built beat by beat from
 * Gaussian bumps (P, Q, R, S, T, U). Good enough to read rate, rhythm, P waves,
 * QRS width, ST and T changes and U waves: it is a teaching drawing, not a
 * recording.
 */

export interface EcgTrace {
  /** [seconds, millivolts] */
  points: [number, number][];
  /** When each QRS happens (seconds) */
  beats: number[];
  seconds: number;
}

const gauss = (t: number, centre: number, sigma: number, amp: number) => amp * Math.exp(-((t - centre) ** 2) / (2 * sigma * sigma));

/** Deterministic pseudo-random numbers, so a strip looks the same every time */
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(s ^ (s >>> 15), 2246822507) + 0x9e3779b9) >>> 0;
    s ^= s >>> 13;
    return (s >>> 0) / 4294967296;
  };
}

/** One beat, t seconds after the start of the beat; rr scales the QT */
function beat(t: number, spec: EcgSpec, rr: number, withP: boolean): number {
  const broad = spec.qrs === 'broad';
  const qt = Math.sqrt(Math.min(1.2, Math.max(0.3, rr)));
  const r = 0.2; // R peak
  let v = 0;
  if (withP) v += gauss(t, 0.06, 0.022, 0.15);
  v += gauss(t, r - (broad ? 0.04 : 0.018), broad ? 0.012 : 0.007, -0.12);
  v += gauss(t, r, broad ? 0.028 : 0.009, broad ? 1.0 : 1.25);
  v += gauss(t, r + (broad ? 0.06 : 0.022), broad ? 0.02 : 0.008, broad ? -0.35 : -0.25);
  // ST segment: a raised or lowered plateau between the end of the QRS and the T wave
  const stEnd = r + 0.17 * qt;
  const stOffset = spec.st === 'elevated' ? 0.22 : spec.st === 'depressed' ? -0.15 : 0;
  if (stOffset && t > r + 0.03 && t < stEnd + 0.05) {
    const rise = Math.min(1, (t - (r + 0.03)) / 0.02);
    const fall = Math.min(1, Math.max(0, (stEnd + 0.05 - t) / 0.05));
    v += stOffset * rise * fall;
  }
  const tCentre = r + 0.22 * qt;
  const tShape = { normal: [0.3, 0.045], peaked: [0.75, 0.026], flat: [0.07, 0.05], inverted: [-0.25, 0.045] }[spec.t ?? 'normal'];
  v += gauss(t, tCentre, tShape[1] * qt, tShape[0]);
  if (spec.u) v += gauss(t, r + 0.37 * qt, 0.04 * qt, 0.2);
  return v;
}

export function ecgTrace(spec: EcgSpec, seconds = 6, hz = 250, seed = 7): EcgTrace {
  const rand = rng(seed + Math.round(spec.rate));
  const meanRR = 60 / Math.max(20, spec.rate);
  const beats: number[] = [];
  let tBeat = 0.15 + rand() * meanRR * 0.5;
  while (tBeat < seconds + 0.5) {
    beats.push(tBeat);
    const rr = spec.rhythm === 'af' ? meanRR * (0.65 + 0.7 * rand()) : meanRR;
    tBeat += rr;
  }
  // AF: a wavy baseline; flutter: a sawtooth at 300 a minute
  const phases = [rand(), rand(), rand()].map((x) => x * Math.PI * 2);
  const baseline = (t: number) => {
    if (spec.rhythm === 'af')
      return (
        0.035 * Math.sin(2 * Math.PI * 6.1 * t + phases[0]) +
        0.025 * Math.sin(2 * Math.PI * 7.7 * t + phases[1]) +
        0.015 * Math.sin(2 * Math.PI * 4.3 * t + phases[2])
      );
    if (spec.rhythm === 'flutter') {
      const x = (t / 0.2) % 1;
      return x < 0.8 ? 0.12 - 0.3 * (x / 0.8) : -0.18 + 0.3 * ((x - 0.8) / 0.2);
    }
    return 0;
  };

  const points: [number, number][] = [];
  const dt = 1 / hz;
  for (let i = 0; i <= seconds * hz; i++) {
    const t = i * dt;
    let v = baseline(t);
    for (let k = 0; k < beats.length; k++) {
      const start = beats[k] - 0.2; // the template's R peak sits 0.2 s in
      const local = t - start;
      if (local < -0.05 || local > 0.9) continue;
      const rr = k + 1 < beats.length ? beats[k + 1] - beats[k] : meanRR;
      v += beat(local, spec, rr, spec.rhythm === 'sinus');
    }
    points.push([t, v]);
  }
  return { points, beats: beats.filter((b) => b <= seconds), seconds };
}

/** Heart rate measured from a trace (beats in the strip, the way you'd count on a 6-second strip) */
export function measuredRate(trace: EcgTrace): number {
  const b = trace.beats;
  if (b.length < 2) return 0;
  return Math.round((60 * (b.length - 1)) / (b[b.length - 1] - b[0]));
}
