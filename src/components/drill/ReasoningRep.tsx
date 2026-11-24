import { ScrollView, StyleSheet, View } from 'react-native';

import type { AssistLevel, CaseFile, SectionDef } from '../../content/types';
import type { RepResult } from '../../store';
import { MAX_WIDTH, space, type, useTheme } from '../../theme';
import { Card, Icon, mmss, Row, Txt } from '../ui';
import { ReasoningPanel } from './ReasoningPanel';
import { buildRepResult, useElapsed } from './shared';

/** A reasoning rep: read the vignette, then list differentials / investigations / management */
export function ReasoningRep({
  section,
  patientCase,
  level,
  header,
  onDone,
}: {
  section: SectionDef;
  patientCase: CaseFile;
  level: AssistLevel;
  header: React.ReactNode;
  onDone: (r: RepResult) => void;
}) {
  const t = useTheme();
  const [elapsed, finalSeconds] = useElapsed();
  const items = patientCase.reasoning[section.id] ?? [];

  return (
    <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
      <View style={styles.inner}>
        {header}
        <Card style={{ gap: space.sm }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt style={type.tiny} color="faint">
              {patientCase.patient.setting}
            </Txt>
            <Row gap={4}>
              <Icon name="time-outline" size={16} color={t.inkSoft} />
              <Txt style={[type.small, { fontVariant: ['tabular-nums'] }]} color={elapsed > section.targetSeconds ? 'warn' : 'soft'}>
                {mmss(elapsed)}
              </Txt>
            </Row>
          </Row>
          <Txt style={type.heading}>
            {patientCase.patient.name}, {patientCase.patient.age}
          </Txt>
          <Txt>{patientCase.summary}</Txt>
        </Card>

        <ReasoningPanel
          seed={patientCase.id + section.id}
          items={items}
          distractors={patientCase.distractors?.[section.id]}
          level={level}
          prompt={section.prompt ?? 'One item per line.'}
          finishLabel="Finish rep"
          onFinish={(o) =>
            onDone(
              buildRepResult({
                caseId: patientCase.id,
                kind: 'reasoning',
                level,
                items: items.map((i) => ({ id: i.id, weight: i.weight, hasReason: !!i.reasonMatch })),
                covered: o.covered,
                durationSec: finalSeconds(),
                targetSeconds: section.targetSeconds,
                distractors: o.distractors,
                entries: o.entries,
              }),
            )
          }
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: space.md, paddingBottom: 80 },
  inner: { width: '100%', maxWidth: MAX_WIDTH, paddingHorizontal: space.lg, gap: space.md, alignSelf: 'center' },
});
