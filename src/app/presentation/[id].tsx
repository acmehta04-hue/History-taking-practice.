import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Button, Card, Chip, LevelBadge, Row, Screen, TopBar, Txt } from '@/components/ui';
import { presentationById, programKey, specialtyById } from '@/content';
import { SETS_PER_BLOCK } from '@/engine/progression';
import { relativeDue } from '@/engine/recommend';
import { useStore } from '@/store';
import { radius, space, type, useTheme } from '@/theme';

export default function PresentationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const programs = useStore((s) => s.programs);
  const p = presentationById[id ?? ''];

  if (!p) {
    return (
      <Screen>
        <TopBar title="Not found" />
        <Txt>That presentation does not exist yet.</Txt>
      </Screen>
    );
  }

  const sp = specialtyById[p.specialtyId];
  const tone = t.tones[sp.tone];

  return (
    <Screen>
      <TopBar subtitle={sp.title} />

      <Card tone={sp.tone} style={{ gap: space.md }}>
        <Txt style={type.display} color={tone.ink}>
          {p.title}
        </Txt>
        <Txt color={tone.ink}>
          {p.cases.length} patients rotate through each drill. A set is 3 reps — 3 patients, the same block of the history.
        </Txt>
        <Row gap={6} style={{ flexWrap: 'wrap' }}>
          {p.ukmla.map((u) => (
            <Chip key={u} label={u} icon="ribbon-outline" />
          ))}
        </Row>
      </Card>

      <View style={{ gap: space.md }}>
        {p.sections.map((s) => {
          const prog = programs[programKey(p.id, s.id)];
          const done = prog?.setsCompleted ?? 0;
          return (
            <Card key={s.id} style={{ gap: space.md }}>
              <Row style={{ alignItems: 'flex-start' }}>
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: radius.md,
                    backgroundColor: tone.bg,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Txt style={[type.bodyStrong, { fontSize: 13 }]} color={tone.ink}>
                    {s.short}
                  </Txt>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt style={type.heading}>{s.title}</Txt>
                  <Txt style={type.small} color="soft">
                    {s.blurb}
                  </Txt>
                </View>
              </Row>
              <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap' }} gap={space.sm}>
                <Row gap={6}>
                  <LevelBadge level={prog?.level ?? 1} />
                  <Chip label={`${Math.min(done, SETS_PER_BLOCK)}/${SETS_PER_BLOCK} sets`} />
                  {prog ? (
                    <Chip label={relativeDue(prog.nextDueAt)} tone={prog.nextDueAt && prog.nextDueAt <= Date.now() ? 'warn' : undefined} />
                  ) : null}
                </Row>
                <Button
                  small
                  label={done ? 'Next set' : 'Start'}
                  icon="play"
                  onPress={() =>
                    router.push({ pathname: '/drill/[presentationId]/[sectionId]', params: { presentationId: p.id, sectionId: s.id } })
                  }
                />
              </Row>
            </Card>
          );
        })}
      </View>

      <Card variant="alt" style={{ gap: space.sm }}>
        <Txt style={type.heading}>How guidance fades</Txt>
        <Txt style={type.small} color="soft">
          L1 Guided: suggested questions and the full framework on screen.{'\n'}L2 Prompted: framework labels and hints only.
          {'\n'}L3 Independent: a blank page and the clock.{'\n'}Score 80%+ accuracy and independence to move up a level; under 50% drops
          you a level.
        </Txt>
      </Card>
    </Screen>
  );
}
