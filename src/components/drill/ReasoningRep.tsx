import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { caseKicker, caseTitle } from '../../content';
import type { AssistLevel, CaseFile, SectionDef } from '../../content/types';
import { cardResults } from '../../engine/flashcards';
import type { Coverage } from '../../engine/scoring';
import { extraQuestions, type Stage, wrongLabelFor } from '../../engine/stages';
import type { EntryLine, RepResult } from '../../store';
import { MAX_WIDTH, space, type, useTheme } from '../../theme';
import { ResultsView } from '../results';
import { Card, Icon, mmss, Row, Txt } from '../ui';
import { ExtraQuestions, extraScorable } from './ExtraQuestions';
import { ReasoningPanel, type ReasoningOutcome } from './ReasoningPanel';
import { buildRepResult, useElapsed } from './shared';
import { quizExtras } from '../../content/quiz';

/** A reasoning rep: read the vignette, list differentials / investigations / management, then (Challenge) handle a twist */
export function ReasoningRep({
  section,
  patientCase,
  level,
  stage,
  isLastStep = true,
  targetSeconds,
  header,
  onDone,
}: {
  section: SectionDef;
  patientCase: CaseFile;
  level: AssistLevel;
  stage: Stage;
  isLastStep?: boolean;
  targetSeconds: number;
  header: React.ReactNode;
  onDone: (r: RepResult) => void;
}) {
  const t = useTheme();
  const [elapsed, finalSeconds] = useElapsed();
  const items = patientCase.reasoning[section.id] ?? [];
  const extras = useMemo(() => extraQuestions(section, patientCase, stage, isLastStep), [section, patientCase, stage, isLastStep]);
  const [main, setMain] = useState<ReasoningOutcome | null>(null);

  const finish = (o: ReasoningOutcome, extraCovered: Record<string, Coverage> = {}, extraPicked: string[] = []) => {
    const result = buildRepResult({
      caseId: patientCase.id,
      kind: 'reasoning',
      level,
      items: [
        ...items.map((i) => ({ id: i.id, weight: i.weight, hasReason: !!i.reasonMatch && level > 1 })),
        ...extraScorable(extras, level),
      ],
      covered: { ...o.covered, ...extraCovered },
      durationSec: finalSeconds(),
      targetSeconds: targetSeconds + extras.length * 90,
      distractors: [...o.distractors, ...extraPicked],
      entries: o.entries as EntryLine[],
      quiz: level === 1,
    });
    onDone({ ...result, sectionId: section.id, cards: cardResults(extras, extraCovered) });
  };

  if (main && extras.length) {
    return (
      <ExtraQuestions
        extras={extras}
        level={level}
        seed={patientCase.id + section.id}
        header={header}
        onDone={(cov, picked) => finish(main, cov, picked)}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
      <View style={styles.inner}>
        {header}
        <Card style={{ gap: space.sm }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt style={type.tiny} color="faint">
              {caseKicker(patientCase)}
            </Txt>
            <Row gap={4}>
              <Icon name="time-outline" size={16} color={t.inkSoft} />
              <Txt style={[type.small, { fontVariant: ['tabular-nums'] }]} color={elapsed > targetSeconds ? 'warn' : 'soft'}>
                {mmss(elapsed)}
              </Txt>
            </Row>
          </Row>
          <Txt style={type.heading}>{caseTitle(patientCase)}</Txt>
          <Txt>{patientCase.summaries?.[section.id] ?? patientCase.summary}</Txt>
          {patientCase.results?.[section.id] ? <ResultsView panels={patientCase.results[section.id]} /> : null}
        </Card>

        <ReasoningPanel
          seed={patientCase.id + section.id}
          items={items}
          distractors={[...(patientCase.distractors?.[section.id] ?? []), ...(level === 1 ? quizExtras(patientCase.id, section.id) : [])]}
          level={level}
          prompt={level === 1 ? quizPrompt(section) : (section.prompt ?? 'One point per message.')}
          finishLabel={extras.length ? 'Next question' : 'Finish rep'}
          onFinish={(o) => (extras.length ? setMain(o) : finish(o))}
          single={section.single}
          wrongLabel={wrongLabelFor(section)}
          guidedOnlyDistractors={section.guidedOnlyDistractors}
          placeholder={section.placeholder ?? PLACEHOLDER[section.id]}
        />
      </View>
    </ScrollView>
  );
}

/** Example answers for the chat box, so the format is obvious */
const PLACEHOLDER: Record<string, string> = {
  ddx: 'e.g. Appendicitis — pain migrated to the RIF',
  sprint: 'e.g. Pulmonary embolism — pleuritic pain',
  ix: 'e.g. FBC — anaemia from blood loss',
  mx: 'e.g. IV fluids — dehydrated from vomiting',
};

/** The question as a multiple-choice stem (Guided level) */
function quizPrompt(section: SectionDef): string {
  if (section.quizPrompt) return section.quizPrompt;
  if (section.single) return 'What is the most likely diagnosis?';
  return (
    {
      ddx: 'Which of these belong on your differential?',
      ix: 'Which investigations would you request?',
      mx: 'Which of these belong in your management plan?',
      sprint: 'Which of these could cause it?',
      prescribe: 'Which of these belong on the prescription?',
      ladder: 'Which of these would you do?',
      journey: 'What is going on, and what do you do?',
    }[section.id] ?? 'Which of these belong in your answer?'
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: space.md, paddingBottom: 80 },
  inner: { width: '100%', maxWidth: MAX_WIDTH, paddingHorizontal: space.lg, gap: space.md, alignSelf: 'center' },
});
