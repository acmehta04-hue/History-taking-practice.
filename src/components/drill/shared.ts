import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import type { AssistLevel, SectionKind, Weight } from '../../content/types';
import { type Coverage, scoreRep, type ScorableItem } from '../../engine/scoring';
import type { EntryLine, RepResult, TranscriptLine } from '../../store';

export function tap() {
  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function success() {
  if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

/** Seconds since mount, ticking once a second */
export function useElapsed(): [number, () => number] {
  const start = useRef(Date.now());
  const [sec, setSec] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSec(Math.floor((Date.now() - start.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);
  return [sec, () => Math.round((Date.now() - start.current) / 1000)];
}

const PRIORITY: Record<Weight, number> = { redflag: 0, core: 1, extra: 2 };

/** The next item to hint: red flags and core items first, in checklist order */
export function nextToHint<T extends { id: string; weight: Weight }>(
  items: T[],
  covered: Record<string, Coverage>,
  hinted: Set<string>,
): T | undefined {
  return [...items]
    .map((it, i) => ({ it, i }))
    .filter(({ it }) => !covered[it.id] && !hinted.has(it.id))
    .sort((a, b) => PRIORITY[a.it.weight] - PRIORITY[b.it.weight] || a.i - b.i)[0]?.it;
}

/** Deterministic shuffle so Guided options don't jump around between renders */
export function seededShuffle<T>(arr: T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    const j = Math.abs(h) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function buildRepResult(args: {
  caseId: string;
  kind: SectionKind;
  level: AssistLevel;
  items: ScorableItem[];
  covered: Record<string, Coverage>;
  durationSec: number;
  targetSeconds: number;
  distractors?: string[];
  unmatched?: string[];
  transcript?: TranscriptLine[];
  entries?: EntryLine[];
}): RepResult {
  const s = scoreRep({
    items: args.items,
    covered: args.covered,
    level: args.level,
    durationSec: args.durationSec,
    targetSeconds: args.targetSeconds,
    distractorsPicked: args.distractors?.length ?? 0,
  });
  return {
    caseId: args.caseId,
    kind: args.kind,
    level: args.level,
    accuracy: s.accuracy,
    independence: s.independence,
    points: s.points,
    speedBonus: s.speedBonus,
    durationSec: args.durationSec,
    covered: args.covered,
    missed: s.missed,
    redFlagsMissed: s.redFlagsMissed,
    unmatched: args.unmatched ?? [],
    distractors: args.distractors ?? [],
    transcript: args.transcript,
    entries: args.entries,
  };
}
