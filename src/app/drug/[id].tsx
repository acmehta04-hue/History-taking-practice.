import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { DrillCard } from '@/components/DrillCard';
import { Card, Icon, type IconName, Row, Screen, SectionHeader, TopBar, Txt } from '@/components/ui';
import { combosFor, drugCatalogue, presentationById, singlesFor, specialtyById } from '@/content';
import { comboReadiness } from '@/engine/recommend';
import { useStore } from '@/store';
import { space, type, useTheme } from '@/theme';

const DRILL_ICON: Record<string, IconName> = { viva: 'school-outline', counsel: 'chatbubbles-outline', prescribe: 'create-outline' };
const KEY_LABELS = ['Uses and how it works', 'Safety', 'Monitoring'];

/** A drug: what examiners ask, then its viva, counselling and prescribing drills */
export default function DrugScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const programs = useStore((s) => s.programs);
  const p = presentationById[`drug-${id}`];
  const listed = drugCatalogue.find((d) => d.id === id);

  if (!p?.drug) {
    return (
      <Screen>
        <TopBar subtitle="Drug drills" />
        <Card variant="alt" style={{ gap: space.sm }}>
          <Txt style={type.title}>{listed?.name ?? 'Not found'}</Txt>
          {listed ? (
            <Txt color="soft">
              {listed.drugClass}. Drills for this drug are coming: a viva, a counselling session and PSA-style prescribing.
            </Txt>
          ) : (
            <Txt color="soft">That drug isn’t in the list yet.</Txt>
          )}
        </Card>
      </Screen>
    );
  }

  const area = specialtyById[p.specialtyId];
  const tone = t.tones[area.tone];
  return (
    <Screen>
      <TopBar subtitle="Drug drills" />

      <Card tone={area.tone} style={{ gap: space.sm }}>
        <Txt style={type.tiny} color={tone.ink}>
          {p.drug.drugClass}
        </Txt>
        <Txt style={type.display} color={tone.ink}>
          {p.drug.name}
        </Txt>
        <Txt color={tone.ink}>{p.drug.summary}</Txt>
      </Card>

      <Card style={{ gap: space.md }}>
        <Txt style={type.heading}>What examiners ask</Txt>
        {p.drug.keyPoints.map((k, i) => (
          <View key={i} style={{ gap: 2 }}>
            <Txt style={type.tiny} color="faint">
              {KEY_LABELS[i]}
            </Txt>
            <Txt style={type.small}>{k}</Txt>
          </View>
        ))}
      </Card>

      <SectionHeader title="Drills" />
      <View style={{ gap: space.md }}>
        {singlesFor(p).map((d) => (
          <DrillCard key={d.id} presentationId={p.id} drill={d} tone={area.tone} icon={DRILL_ICON[d.id]} />
        ))}
        {combosFor(p).map((d) => {
          const r = comboReadiness(p, d, programs);
          return (
            <DrillCard
              key={d.id}
              presentationId={p.id}
              drill={d}
              tone={area.tone}
              locked={r.ready ? undefined : { done: r.done, total: r.total }}
            />
          );
        })}
      </View>

      <Row gap={space.sm} style={{ alignItems: 'flex-start' }}>
        <Icon name="shield-checkmark-outline" size={16} color={t.inkFaint} />
        <Txt style={[type.small, { flex: 1 }]} color="faint">
          Teaching content: check doses and monitoring against {p.drug.verify.join(', ')}.
        </Txt>
      </Row>
    </Screen>
  );
}
