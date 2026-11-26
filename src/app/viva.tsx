import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExtraQuestions } from '@/components/drill/ExtraQuestions';
import { Button, Card, Icon, pct, Row, Screen, TopBar, Txt } from '@/components/ui';
import { caseTitle, findQuestion } from '@/content';
import type { CaseFile, FollowUp, Presentation, VivaQuestion } from '@/content/types';
import { dueCards, isLearned, nextUpcoming, parseCardKey, PASS_MARK, questionScores } from '@/engine/flashcards';
import type { Coverage } from '@/engine/scoring';
import { VIVA_TIERS, xid } from '@/engine/stages';
import { useStore } from '@/store';
import { space, type, useTheme } from '@/theme';

const MAX_CARDS = 8;

interface Due {
  key: string;
  p: Presentation;
  c: CaseFile;
  q: FollowUp;
  box: number;
}

/** Viva flashcards: questions you missed come back now; ones you got right come back after 1–30 days */
export default function VivaReview() {
  const t = useTheme();
  const cards = useStore((s) => s.vivaCards);
  const gradeCards = useStore((s) => s.gradeCards);

  // Freeze the queue when the screen opens, so grading doesn't reshuffle it
  const [frozen] = useState(cards);
  const queue = useMemo<Due[]>(
    () =>
      dueCards(frozen)
        .map((key) => {
          const { presentationId, caseId, questionId } = parseCardKey(key);
          const found = findQuestion(presentationId, caseId, questionId);
          return found ? { key, ...found, box: frozen[key].box } : undefined;
        })
        .filter((x): x is Due => !!x)
        .slice(0, MAX_CARDS),
    [frozen],
  );

  const [phase, setPhase] = useState<'intro' | 'quiz' | 'done'>('intro');
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<{ due: Due; accuracy: number; covered: Record<string, Coverage> }[]>([]);

  const total = Object.keys(cards).length;
  const learned = Object.values(cards).filter(isLearned).length;
  const upcoming = nextUpcoming(cards);

  if (phase === 'quiz' && queue[index]) {
    const due = queue[index];
    const header = <TopBar title="Viva review" subtitle={`Card ${index + 1} of ${queue.length}`} />;
    const context = (
      <Card style={{ gap: 4 }}>
        <Txt style={type.tiny} color="faint">
          {due.p.title} · {due.box === 0 ? 'missed last time' : `box ${due.box}`}
        </Txt>
        <Txt style={type.bodyStrong}>
          {caseTitle(due.c)}: {due.c.diagnosis}
        </Txt>
      </Card>
    );
    return (
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: t.bg }}>
        <ExtraQuestions
          key={due.key}
          extras={[{ ...due.q, label: due.q.label ?? ('tier' in due.q ? VIVA_TIERS[(due.q as VivaQuestion).tier] : 'Viva review') }]}
          level={due.box === 0 ? 2 : 3}
          seed={due.key}
          header={header}
          context={context}
          finishLabel={index + 1 < queue.length ? 'Next card' : 'Finish review'}
          onDone={(covered) => {
            const accuracy = questionScores([due.q], covered)[0].accuracy;
            const next = [...results, { due, accuracy, covered }];
            setResults(next);
            if (index + 1 < queue.length) setIndex(index + 1);
            else {
              gradeCards(next.map((r) => ({ key: r.due.key, accuracy: r.accuracy })));
              setPhase('done');
            }
          }}
        />
      </SafeAreaView>
    );
  }

  if (phase === 'done') {
    const passed = results.filter((r) => r.accuracy >= PASS_MARK).length;
    return (
      <Screen>
        <TopBar title="Review complete" subtitle={`${passed} of ${results.length} remembered`} />
        {results.map((r) => (
          <Card key={r.due.key} style={{ gap: space.sm }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Txt style={type.tiny} color="faint">
                {r.due.p.title} · {caseTitle(r.due.c)}
              </Txt>
              <Txt style={type.bodyStrong} color={r.accuracy >= PASS_MARK ? 'good' : 'bad'}>
                {pct(r.accuracy)}
              </Txt>
            </Row>
            <Txt style={type.bodyStrong}>{r.due.q.prompt}</Txt>
            {r.due.q.items.map((it) => {
              const ok = !!r.covered[xid(0, it.id)];
              return (
                <Row key={it.id} gap={space.sm} style={{ alignItems: 'flex-start' }}>
                  <Icon name={ok ? 'checkmark-circle' : 'ellipse-outline'} size={18} color={ok ? t.good : t.inkFaint} />
                  <View style={{ flex: 1 }}>
                    <Txt style={type.small}>{it.label}</Txt>
                    {!ok ? (
                      <Txt style={type.small} color="soft">
                        {it.why}
                      </Txt>
                    ) : null}
                  </View>
                </Row>
              );
            })}
            <Txt style={type.small} color="faint">
              {r.accuracy >= PASS_MARK ? 'Moves up a box: comes back later.' : 'Back to the start: comes back next review.'}
            </Txt>
          </Card>
        ))}
        <Button label="Done" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
      </Screen>
    );
  }

  return (
    <Screen>
      <TopBar title="Viva flashcards" />
      <Card variant="hero" style={{ gap: space.md }}>
        <Txt style={type.tiny} color="heroSoft">
          {total} cards · {learned} learned
        </Txt>
        <Txt style={[type.display, { fontSize: 40 }]} color="hero">
          {queue.length} due
        </Txt>
        <Txt color="heroSoft">
          Every viva and PSA question you answer becomes a card. Missed ones come back straight away; ones you get right come back after 1,
          3, 7, 14, then 30 days.
        </Txt>
        {queue.length ? (
          <Button
            label={`Review ${queue.length} card${queue.length === 1 ? '' : 's'}`}
            variant="accent"
            icon="arrow-forward"
            onPress={() => setPhase('quiz')}
          />
        ) : null}
      </Card>
      {!queue.length ? (
        <Txt color="soft">
          {total
            ? `Nothing due. Next card due ${upcoming ? new Date(upcoming.due).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : 'later'}.`
            : 'No cards yet. Do a Viva block or a deep dive prescribing set to start your deck.'}
        </Txt>
      ) : null}
    </Screen>
  );
}
