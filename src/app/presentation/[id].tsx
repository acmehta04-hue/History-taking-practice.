import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { DrillCard } from '@/components/DrillCard';
import { Card, Chip, Icon, Row, Screen, SectionHeader, TopBar, Txt } from '@/components/ui';
import { combosFor, patientsOf, presentationById, singlesFor, specialties, specialtyById, spotDrillFor } from '@/content';
import { comboReadiness } from '@/engine/recommend';
import { useStore } from '@/store';
import { space, type, useTheme } from '@/theme';

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
  const spot = spotDrillFor(p.id);

  return (
    <Screen>
      <TopBar subtitle={sp.title} />

      <Card tone={sp.tone} style={{ gap: space.md }}>
        <Txt style={type.display} color={tone.ink}>
          {p.title}
        </Txt>
        <Txt color={tone.ink}>
          {patientsOf(p).length} patients rotate through each drill. A set is 3 reps — 3 patients, the same block of the history.
        </Txt>
        <Row gap={6} style={{ flexWrap: 'wrap' }}>
          {p.ukmla.map((u) => {
            const area = specialties.find((a) => a.title === u);
            return (
              <Chip
                key={u}
                label={u}
                icon="ribbon-outline"
                onPress={area ? () => router.push({ pathname: '/area/[id]', params: { id: area.id, focus: p.id } }) : undefined}
              />
            );
          })}
        </Row>
      </Card>

      <SectionHeader title="Single blocks" />
      <View style={{ gap: space.md }}>
        {singlesFor(p).map((d) => (
          <DrillCard key={d.id} presentationId={p.id} drill={d} tone={sp.tone} />
        ))}
      </View>

      <SectionHeader title="Combined drills" />
      <Txt style={type.small} color="soft">
        Chain blocks on the same patient, the way a real history flows. Each combined drill has its own sets, levels and stages.
      </Txt>
      <View style={{ gap: space.md }}>
        {combosFor(p).map((d) => {
          const r = comboReadiness(p, d, programs);
          return (
            <DrillCard
              key={d.id}
              presentationId={p.id}
              drill={d}
              tone={sp.tone}
              locked={r.ready ? undefined : { done: r.done, total: r.total }}
            />
          );
        })}
      </View>

      {spot ? (
        <Card
          onPress={() => router.push({ pathname: '/drill/[presentationId]/[sectionId]', params: spot })}
          accessibilityLabel="Spot the cause drill"
          style={{ gap: 4 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Txt style={type.heading}>Spot the cause</Txt>
              <Txt style={type.small} color="soft">
                Quick reps on every condition {p.title.toLowerCase()} could be: name it from its classic picture, then say how to confirm
                it.
              </Txt>
            </View>
            <Icon name="flash-outline" size={24} />
          </Row>
        </Card>
      ) : null}

      <Card variant="alt" style={{ gap: space.sm }}>
        <Txt style={type.heading}>How it progresses</Txt>
        <Txt style={type.small} color="soft">
          <Txt style={[type.small, { fontWeight: '700' }]}>Help fades (levels). </Txt>
          L1 Guided → L2 Prompted → L3 Independent. 80%+ accuracy and independence moves you up; under 50% moves you down.
        </Txt>
        <Txt style={type.small} color="soft">
          <Txt style={[type.small, { fontWeight: '700' }]}>Work gets harder (stages). </Txt>
          Set 1 Foundation: classic patients. Set 2 Application: commit to a diagnosis and defend it. Set 3+ Challenge: hardest patients,
          25% less time, the must-not-miss diagnosis, and a twist that changes the picture.
        </Txt>
        <Txt style={type.small} color="soft">
          <Txt style={[type.small, { fontWeight: '700' }]}>Blocks join up (combined drills). </Txt>
          Once each block reaches L2, chain them: HPC + Systems, PMH/PPH + DH, Ddx → Ix → Mx, then the full station.
        </Txt>
      </Card>
    </Screen>
  );
}
