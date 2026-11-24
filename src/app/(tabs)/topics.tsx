import { router } from 'expo-router';
import { View } from 'react-native';

import { Card, Chip, Icon, ProgressBar, Row, Screen, Txt } from '@/components/ui';
import { presentationsFor, programKey, specialties } from '@/content';
import { mastery } from '@/engine/recommend';
import { useStore } from '@/store';
import { space, type, useTheme } from '@/theme';

export default function Topics() {
  const t = useTheme();
  const programs = useStore((s) => s.programs);

  return (
    <Screen>
      <View style={{ marginTop: space.sm }}>
        <Txt style={type.display}>Drills</Txt>
        <Txt color="soft">Pick a presentation, then drill one block of the history at a time. Topics follow the UKMLA content map.</Txt>
      </View>

      {specialties.map((s) => {
        const ps = presentationsFor(s.id);
        const tone = t.tones[s.tone];
        return (
          <View key={s.id} style={{ gap: space.sm }}>
            <Row gap={space.sm}>
              <Icon name={s.icon as never} size={18} color={tone.strong} />
              <Txt style={type.heading}>{s.title}</Txt>
            </Row>

            {ps.map((p) => {
              const sectionsDone = p.sections.filter((sec) => programs[programKey(p.id, sec.id)]).length;
              const m = p.sections.reduce((a, sec) => a + mastery(programs[programKey(p.id, sec.id)]), 0) / p.sections.length;
              return (
                <Card
                  key={p.id}
                  tone={s.tone}
                  onPress={() => router.push({ pathname: '/presentation/[id]', params: { id: p.id } })}
                  accessibilityLabel={p.title}
                  style={{ gap: space.md }}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <Txt style={type.title} color={tone.ink}>
                      {p.title}
                    </Txt>
                    <Icon name="arrow-forward-circle" size={28} color={tone.ink} />
                  </Row>
                  <Row gap={6} style={{ flexWrap: 'wrap' }}>
                    {p.sections.map((sec) => (
                      <Chip key={sec.id} label={sec.short} active={!!programs[programKey(p.id, sec.id)]} />
                    ))}
                  </Row>
                  <View style={{ gap: 6 }}>
                    <ProgressBar value={m} color={tone.strong} track={t.dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.55)'} />
                    <Txt style={type.small} color={tone.ink}>
                      {p.cases.length} patients · {sectionsDone}/{p.sections.length} drills started · {Math.round(m * 100)}% mastery
                    </Txt>
                  </View>
                </Card>
              );
            })}

            {s.planned.length ? (
              <Row gap={6} style={{ flexWrap: 'wrap' }}>
                {s.planned.map((name) => (
                  <Chip key={name} label={name} icon="time-outline" dim />
                ))}
              </Row>
            ) : null}
          </View>
        );
      })}
    </Screen>
  );
}
