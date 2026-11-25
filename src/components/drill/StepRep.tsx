import { useState } from 'react';

import type { AssistLevel, CaseFile, SectionDef } from '../../content/types';
import type { Stage } from '../../engine/stages';
import type { RepResult } from '../../store';
import { InterviewRep } from './InterviewRep';
import { ReasoningRep } from './ReasoningRep';
import { VivaRep } from './VivaRep';

/** Merge the results of each block in a combined drill into one rep */
export function mergeSteps(steps: RepResult[]): RepResult {
  const size = (r: RepResult) => Math.max(1, Object.keys(r.covered).length + r.missed.length);
  const total = steps.reduce((a, r) => a + size(r), 0);
  const wavg = (f: (r: RepResult) => number) => steps.reduce((a, r) => a + f(r) * size(r), 0) / total;
  return {
    caseId: steps[0].caseId,
    kind: steps[0].kind,
    level: steps[0].level,
    accuracy: wavg((r) => r.accuracy),
    independence: wavg((r) => r.independence),
    points: steps.reduce((a, r) => a + r.points, 0),
    speedBonus: steps.reduce((a, r) => a + r.speedBonus, 0),
    durationSec: steps.reduce((a, r) => a + r.durationSec, 0),
    covered: {},
    missed: steps.flatMap((r) => r.missed),
    redFlagsMissed: steps.flatMap((r) => r.redFlagsMissed),
    unmatched: steps.flatMap((r) => r.unmatched),
    distractors: steps.flatMap((r) => r.distractors),
    steps,
  };
}

/**
 * One rep of a drill. A single-block drill has one step; a combined drill
 * runs each block in turn on the same patient, then merges the results.
 */
export function StepRep({
  sections,
  patientCase,
  level,
  stage,
  timeFactor,
  header,
  onDone,
}: {
  sections: SectionDef[];
  patientCase: CaseFile;
  level: AssistLevel;
  stage: Stage;
  timeFactor: number;
  header: (stepLabel?: string) => React.ReactNode;
  onDone: (r: RepResult) => void;
}) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState<RepResult[]>([]);
  const section = sections[step];
  const isLast = step === sections.length - 1;
  const label = sections.length > 1 ? `Block ${step + 1} of ${sections.length}: ${section.short}` : undefined;

  const next = (r: RepResult) => {
    if (sections.length === 1) return onDone(r);
    const all = [...done, r];
    if (isLast) return onDone(mergeSteps(all));
    setDone(all);
    setStep(step + 1);
  };

  const k = `${patientCase.id}-${section.id}`;
  const common = {
    section,
    patientCase,
    level,
    stage,
    isLastStep: isLast,
    targetSeconds: Math.round(section.targetSeconds * timeFactor),
    header: header(label),
    onDone: next,
  };
  if (section.kind === 'viva') return <VivaRep key={k} {...common} />;
  if (section.kind === 'reasoning') return <ReasoningRep key={k} {...common} />;
  return <InterviewRep key={k} {...common} />;
}
