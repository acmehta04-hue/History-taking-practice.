import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Card, Chip, Icon, ProgressBar, Row, Screen, Txt } from '@/components/ui';
import { deepDives, plannedDeepDives, presentationsFor, programKey, specialties, specialtyById } from '@/content';
import { mastery } from '@/engine/recommend';
import { useStore } from '@/store';
import { space, type, useTheme } from '@/theme';

type Mode = 'presentation' | 'condition';

export default function Topics() {
  const t = useTheme();
  const programs = useStore((s) => s.programs);
  const [mode, setMode] = useState<Mode>('presentation');

  return (
    <Screen>
      <View style={{ marginTop: space.sm, gap: space.sm }}>
        <Txt style={type.display}>Drills</Txt>
        <Row gap={6}>
          <Chip label="By presentation" active={mode === 'presentation'} onPress={() => setMode('presentation')} />
          <Chip label="By condition (deep dive)" active={mode === 'condition'} onPress={() => setMode('condition')} />
        </Row>
        <Txt color="soft">
          {mode === 'presentation'
            ? 'Pick a presentation, then drill one block of the history at a time. Topics follow the UKMLA content map.'
            : 'Pick a UKMLA condition and follow it through: a history where every question has a reason, the management ladder, a counselling session, then prescribing (PSA style).'}
        </Txt>
      </View>

      {mode === 'condition' ? (
        <>
          {deepDives.map((p) => {
            const sp = specialtyById[p.specialtyId];
            const tone = t.tones[sp.tone];
            const m = p.sections.reduce((a, sec) => a + mastery(programs[programKey(p.id, sec.id)]), 0) / p.sections.length;
            return (
              <Card
                key={p.id}
                tone={sp.tone}
                onPress={() => router.push({ pathname: '/deep/[id]', params: { id: p.id } })}
                accessibilityLabel={`${p.title} deep dive`}
                style={{ gap: space.md }}>
                <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Txt style={type.tiny} color={tone.ink}>
                      Deep dive · {sp.title}
                    </Txt>
                    <Txt style={type.title} color={tone.ink}>
                      {p.title}
                    </Txt>
                    <Txt style={type.small} color={tone.ink}>
                      Treatment: {p.deepDive?.treatment}
                    </Txt>
                  </View>
                  <Icon name="arrow-forward-circle" size={28} color={tone.ink} />
                </Row>
                <Row gap={6} style={{ flexWrap: 'wrap' }}>
                  {p.sections.map((sec, i) => (
                    <Chip key={sec.id} label={`${i + 1}. ${sec.short}`} active={!!programs[programKey(p.id, sec.id)]} />
                  ))}
                </Row>
                <View style={{ gap: 6 }}>
                  <ProgressBar value={m} color={tone.strong} track={t.dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.55)'} />
                  <Txt style={type.small} color={tone.ink}>
                    {p.cases.length} patients · 4 sets · {Math.round(m * 100)}% mastery
                  </Txt>
                </View>
              </Card>
            );
          })}
          <Txt style={type.heading}>Coming soon</Txt>
          <Row gap={6} style={{ flexWrap: 'wrap' }}>
            {plannedDeepDives.map((d) => (
              <Chip key={d.condition} label={`${d.condition} · ${d.treatment}`} icon="time-outline" dim />
            ))}
          </Row>
        </>
      ) : (
        specialties.map((s) => {
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
        })
      )}
    </Screen>
  );
}
