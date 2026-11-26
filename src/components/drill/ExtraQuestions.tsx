import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { AssistLevel, FollowUp } from '../../content/types';
import type { Coverage } from '../../engine/scoring';
import { xid } from '../../engine/stages';
import { MAX_WIDTH, radius, space, type } from '../../theme';
import { ResultsView } from '../results';
import { Card, Txt } from '../ui';
import { ReasoningPanel } from './ReasoningPanel';

type LevelFor = AssistLevel | ((q: FollowUp, i: number) => AssistLevel);

/** The level a question actually runs at: "commit" questions are always free text */
export const questionLevel = (level: LevelFor, q: FollowUp, i: number): AssistLevel =>
  q.freeText ? 3 : typeof level === 'function' ? level(q, i) : level;

/**
 * Scorable items for a list of extra questions, with prefixed ids. A quiz answer
 * (Guided level) can't carry a reason, so the reason bonus only counts in the chat.
 */
export function extraScorable(extras: FollowUp[], level: LevelFor = 3) {
  return extras.flatMap((q, i) =>
    q.items.map((it) => ({ id: xid(i, it.id), weight: it.weight, hasReason: !!it.reasonMatch && questionLevel(level, q, i) > 1 })),
  );
}

/**
 * Runs a sequence of questions, one screen each: follow-ups ("what adherence
 * options?"), commit-and-defend, a twist, a ladder step, a PSA task or a viva
 * question. Guided level is a multiple-choice quiz; higher levels are a chat
 * with the examiner. "Commit" questions are always typed.
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
  level: LevelFor;
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
  const lvl = questionLevel(level, q, i);
  const kicker = q.label ?? (q.freeText ? 'Commit and defend' : 'Think it through');

  return (
    <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
      <View style={styles.inner}>
        {header}
        {context}
        <Txt style={type.tiny} color="faint">
          {kicker}
          {extras.length > 1 ? ` · ${i + 1} of ${extras.length}` : ''}
        </Txt>
        {q.data || q.results ? (
          <Card style={{ gap: space.sm }}>
            {q.data ? (
              <View style={styles.data}>
                <Txt style={[type.small, { fontVariant: ['tabular-nums'] }]}>{q.data}</Txt>
              </View>
            ) : null}
            {q.results ? <ResultsView panels={q.results} /> : null}
          </Card>
        ) : null}
        <ReasoningPanel
          key={i}
          seed={seed + i}
          items={q.items}
          distractors={q.distractors}
          level={lvl}
          prompt={q.prompt}
          placeholder={q.freeText ? 'e.g. Appendicitis — pain migrated to the RIF' : undefined}
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
  data: { borderRadius: radius.sm, paddingHorizontal: space.md, paddingVertical: space.sm },
});
