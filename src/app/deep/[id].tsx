import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Button, Card, Chip, Icon, LevelBadge, Row, Screen, TopBar, Txt } from '@/components/ui';
import { presentationById, programKey, specialtyById } from '@/content';
import { relativeDue } from '@/engine/recommend';
import { STAGES, stageFor } from '@/engine/stages';
import { useStore } from '@/store';
import { space, type, useTheme } from '@/theme';

const STEP_ICONS = ['help-circle-outline', 'git-branch-outline', 'chatbubbles-outline', 'document-text-outline'] as const;

/** A deep dive: one condition, four sets in order */
export default function DeepDive() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const programs = useStore((s) => s.programs);
  const p = presentationById[id ?? ''];

  if (!p || p.kind !== 'deepdive') {
    return (
      <Screen>
        <TopBar title="Deep dive not found" />
      </Screen>
    );
  }

  const sp = specialtyById[p.specialtyId];
  const tone = t.tones[sp.tone];
  const progs = p.sections.map((s) => programs[programKey(p.id, s.id)]);
  const nextIndex = Math.max(
    0,
    progs.findIndex((x) => !x),
  );

  return (
    <Screen>
      <TopBar subtitle={`Deep dive · ${sp.title}`} />

      <Card tone={sp.tone} style={{ gap: space.md }}>
        <Txt style={type.tiny} color={tone.ink}>
          UKMLA condition
        </Txt>
        <Txt style={type.display} color={tone.ink}>
          {p.title}
        </Txt>
        <Txt color={tone.ink}>{p.deepDive?.blurb}</Txt>
        <Row gap={6} style={{ flexWrap: 'wrap' }}>
          <Chip label={`Treatment: ${p.deepDive?.treatment}`} icon="medkit-outline" />
          {p.ukmla.map((u) => (
            <Chip key={u} label={u} icon="ribbon-outline" />
          ))}
        </Row>
      </Card>

      <View style={{ gap: space.md }}>
        {p.sections.map((s, i) => {
          const prog = progs[i];
          const done = prog?.setsCompleted ?? 0;
          const stage = stageFor(done);
          const isNext = i === nextIndex && !prog;
          const earlier = i > 0 && !progs[i - 1];
          return (
            <Card key={s.id} style={{ gap: space.md, borderWidth: isNext ? 2 : 0, borderColor: t.accent }}>
              <Row style={{ alignItems: 'flex-start' }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: done ? t.goodBg : tone.bg,
                  }}>
                  <Icon name={done ? 'checkmark' : (STEP_ICONS[i] ?? 'ellipse-outline')} size={20} color={done ? t.good : tone.ink} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt style={type.tiny} color="faint">
                    Set {i + 1} of {p.sections.length}
                    {isNext ? ' · next' : ''}
                  </Txt>
                  <Txt style={type.heading}>{s.title}</Txt>
                  <Txt style={type.small} color="soft">
                    {s.blurb}
                  </Txt>
                </View>
              </Row>
              {earlier ? (
                <Txt style={type.small} color="faint">
                  Works best after set {i}, but you can start it now.
                </Txt>
              ) : null}
              <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap' }} gap={space.sm}>
                <Row gap={6} style={{ flexWrap: 'wrap', flex: 1 }}>
                  <LevelBadge level={prog?.level ?? 1} />
                  <Chip label={`${STAGES[stage].name}`} icon={stage === 3 ? 'flame-outline' : undefined} />
                  {prog ? <Chip label={relativeDue(prog.nextDueAt)} /> : null}
                </Row>
                <Button
                  small
                  label={done ? 'Again' : 'Start'}
                  icon="play"
                  variant={isNext || done ? 'primary' : 'secondary'}
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
        <Txt style={type.heading}>How a deep dive works</Txt>
        <Txt style={type.small} color="soft">
          1. History with a purpose: after each question, tag what it was for (exclude a diagnosis, risk factor, or severity and safety).
          {'\n'}2. The ladder: investigations with reasons, then first, second and third line, then choose the drug.
          {'\n'}3. Counselling: explain the drug you chose. The patient reacts and asks you things back.
          {'\n'}4. Prescribing: write the prescription, review interactions, plan monitoring, interpret results, then viva questions.
          {'\n'}Each set has its own level and stages, like any drill, and questions you miss become viva flashcards.
        </Txt>
      </Card>
    </Screen>
  );
}
