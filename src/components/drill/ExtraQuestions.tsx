import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { AssistLevel, FollowUp } from '../../content/types';
import type { Coverage } from '../../engine/scoring';
import { xid } from '../../engine/stages';
import { MAX_WIDTH, radius, space, type } from '../../theme';
import { ResultsView } from '../results';
import { Card, Txt } from '../ui';
import { ReasoningPanel } from './ReasoningPanel';

/** Scorable items for a list of extra questions, with prefixed ids */
export function extraScorable(extras: FollowUp[]) {
  return extras.flatMap((q, i) => q.items.map((it) => ({ id: xid(i, it.id), weight: it.weight, hasReason: !!it.reasonMatch })));
}

/**
 * Runs a sequence of questions, one screen each: follow-ups ("what adherence
 * options?"), commit-and-defend, a twist, a ladder step, a PSA task or a viva
 * question. Guided mode shows the model points as options, mixed with
 * plausible wrong ones; "commit" questions are always free text.
 */
export function ExtraQuestions({
  extras,
  level,
  seed,
  header,
  context,
  finishLabel = 'Finish rep',
  onDone,
}: {
  extras: FollowUp[];
  level: AssistLevel | ((q: FollowUp, i: number) => AssistLevel);
  seed: string;
  header: React.ReactNode;
  /** Shown above each question, e.g. the patient vignette */
  context?: React.ReactNode;
  finishLabel?: string;
  onDone: (covered: Record<string, Coverage>, distractors: string[]) => void;
}) {
  const [i, setI] = useState(0);
  const [covered, setCovered] = useState<Record<string, Coverage>>({});
  const [picked, setPicked] = useState<string[]>([]);
  const q = extras[i];
  const lvl = typeof level === 'function' ? level(q, i) : level;
  const kicker = q.label ?? (q.freeText ? 'Commit and defend' : 'Think it through');

  return (
    <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
      <View style={styles.inner}>
        {header}
        {context}
        <Card variant="hero" style={{ gap: space.sm }}>
          <Txt style={type.tiny} color="heroSoft">
            {kicker}
            {extras.length > 1 ? ` · ${i + 1} of ${extras.length}` : ''}
          </Txt>
          <Txt style={type.heading} color="hero">
            {q.prompt}
          </Txt>
          {q.data ? (
            <View style={styles.data}>
              <Txt style={[type.small, { fontVariant: ['tabular-nums'] }]} color="hero">
                {q.data}
              </Txt>
            </View>
          ) : null}
        </Card>
        {q.results ? (
          <Card style={{ gap: space.sm }}>
            <ResultsView panels={q.results} />
          </Card>
        ) : null}
        <ReasoningPanel
          key={i}
          seed={seed + i}
          items={q.items}
          distractors={q.distractors}
          level={q.freeText ? 3 : lvl}
          prompt="One point per line."
          placeholder={q.freeText ? 'e.g. Appendicitis — pain migrated to the RIF' : 'One point per line'}
          finishLabel={i + 1 < extras.length ? 'Next question' : finishLabel}
          onFinish={(o) => {
            const next = { ...covered };
            for (const [k, v] of Object.entries(o.covered)) next[xid(i, k)] = v;
            const allPicked = [...picked, ...o.distractors];
            if (i + 1 < extras.length) {
              setCovered(next);
              setPicked(allPicked);
              setI(i + 1);
            } else onDone(next, allPicked);
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: space.md, paddingBottom: 80 },
  inner: { width: '100%', maxWidth: MAX_WIDTH, paddingHorizontal: space.lg, gap: space.md, alignSelf: 'center' },
  data: { borderRadius: radius.sm, paddingHorizontal: space.md, paddingVertical: space.sm, backgroundColor: 'rgba(255,255,255,0.1)' },
});
