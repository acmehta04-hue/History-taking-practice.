import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { AssistLevel, FollowUp } from '../../content/types';
import type { Coverage } from '../../engine/scoring';
import { xid } from '../../engine/stages';
import { MAX_WIDTH, space, type } from '../../theme';
import { Card, Txt } from '../ui';
import { ReasoningPanel } from './ReasoningPanel';

/** Scorable items for a list of extra questions, with prefixed ids */
export function extraScorable(extras: FollowUp[]) {
  return extras.flatMap((q, i) => q.items.map((it) => ({ id: xid(i, it.id), weight: it.weight, hasReason: !!it.reasonMatch })));
}

/**
 * Runs the questions that follow a block, one screen each: follow-ups
 * ("what adherence options?"), the commit-and-defend question, or a twist.
 */
export function ExtraQuestions({
  extras,
  level,
  seed,
  header,
  onDone,
}: {
  extras: FollowUp[];
  level: AssistLevel;
  seed: string;
  header: React.ReactNode;
  onDone: (covered: Record<string, Coverage>, distractors: string[]) => void;
}) {
  const [i, setI] = useState(0);
  const [covered, setCovered] = useState<Record<string, Coverage>>({});
  const [picked, setPicked] = useState<string[]>([]);
  const q = extras[i];
  const isTwist = q.prompt.startsWith('Twist');

  return (
    <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
      <View style={styles.inner}>
        {header}
        <Card variant="hero" style={{ gap: space.sm }}>
          <Txt style={type.tiny} color="heroSoft">
            {isTwist ? 'Challenge · new information' : q.freeText ? 'Commit and defend' : 'Think it through'}
            {extras.length > 1 ? ` · ${i + 1} of ${extras.length}` : ''}
          </Txt>
          <Txt style={type.heading} color="hero">
            {q.prompt.replace(/^Twist — /, '')}
          </Txt>
        </Card>
        <ReasoningPanel
          key={i}
          seed={seed + i}
          items={q.items}
          level={q.freeText ? 3 : level}
          prompt="One point per line."
          placeholder={
            q.freeText ? 'e.g. Appendicitis — pain migrated to the RIF' : isTwist ? 'One action per line' : 'One option per line'
          }
          finishLabel={i + 1 < extras.length ? 'Next question' : 'Finish rep'}
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
});
