import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { AssistLevel, CaseFile, SectionDef } from '../../content/types';
import { cardResults } from '../../engine/flashcards';
import { extraQuestions, type Stage, STAGES } from '../../engine/stages';
import type { RepResult } from '../../store';
import { MAX_WIDTH, space, type } from '../../theme';
import { Button, Card, Txt } from '../ui';
import { ExtraQuestions, extraScorable } from './ExtraQuestions';
import { buildRepResult, useElapsed } from './shared';

/**
 * A viva rep: the examiner's questions about one patient.
 * Foundation asks recall; Application adds "why" with follow-up probes;
 * Challenge adds data interpretation and what-ifs.
 */
export function VivaRep({
  section,
  patientCase,
  level,
  stage,
  targetSeconds,
  header,
  onDone,
}: {
  section: SectionDef;
  patientCase: CaseFile;
  level: AssistLevel;
  stage: Stage;
  targetSeconds: number;
  header: React.ReactNode;
  onDone: (r: RepResult) => void;
}) {
  const extras = useMemo(() => extraQuestions(section, patientCase, stage), [section, patientCase, stage]);
  const [, finalSeconds] = useElapsed();

  const context = (
    <Card style={{ gap: space.sm }}>
      <Txt style={type.tiny} color="faint">
        Viva · {STAGES[stage].name}
      </Txt>
      <Txt style={type.heading}>
        {patientCase.topic
          ? `${patientCase.diagnosis}: ${patientCase.topic.title}`
          : `${patientCase.patient.name}, ${patientCase.patient.age}: ${patientCase.diagnosis}`}
      </Txt>
      <Txt style={type.small} color="soft">
        {patientCase.summary}
      </Txt>
    </Card>
  );

  const finish = (covered: Parameters<typeof cardResults>[1], distractors: string[]) => {
    const result = buildRepResult({
      caseId: patientCase.id,
      kind: 'viva',
      level,
      items: extraScorable(extras, level),
      covered,
      durationSec: finalSeconds(),
      targetSeconds,
      distractors,
      quiz: level === 1,
    });
    onDone({ ...result, sectionId: section.id, cards: cardResults(extras, covered) });
  };

  if (!extras.length) {
    return (
      <ScrollView contentContainerStyle={styles.wrap}>
        <View style={styles.inner}>
          {header}
          {context}
          <Txt color="soft">No viva questions for this patient yet.</Txt>
          <Button label="Skip" onPress={() => finish({}, [])} />
        </View>
      </ScrollView>
    );
  }

  return <ExtraQuestions extras={extras} level={level} seed={patientCase.id + 'viva'} header={header} context={context} onDone={finish} />;
}

const styles = StyleSheet.create({
  wrap: { paddingTop: space.md, paddingBottom: 80 },
  inner: { width: '100%', maxWidth: MAX_WIDTH, paddingHorizontal: space.lg, gap: space.md, alignSelf: 'center' },
});
