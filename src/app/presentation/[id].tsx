import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Button, Card, Chip, Icon, LevelBadge, ProgressBar, Row, Screen, SectionHeader, TopBar, Txt } from '@/components/ui';
import { combosFor, type Drill, presentationById, programKey, singlesFor, specialtyById } from '@/content';
import { comboReadiness, relativeDue } from '@/engine/recommend';
import { STAGES, stageFor } from '@/engine/stages';
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
  const start = (d: Drill) =>
    router.push({ pathname: '/drill/[presentationId]/[sectionId]', params: { presentationId: p.id, sectionId: d.id } });

  const drillCard = (d: Drill, locked?: { done: number; total: number }) => {
    const prog = programs[programKey(p.id, d.id)];
    const done = prog?.setsCompleted ?? 0;
    const stage = stageFor(done);
    return (
      <Card key={d.id} style={{ gap: space.md }}>
        <Row style={{ alignItems: 'flex-start' }}>
          <View
            style={{
              minWidth: 52,
              height: 52,
              paddingHorizontal: 6,
              borderRadius: radius.md,
              backgroundColor: d.kind === 'combo' ? t.hero : tone.bg,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Txt style={[type.bodyStrong, { fontSize: 12, textAlign: 'center' }]} color={d.kind === 'combo' ? t.heroInk : tone.ink}>
              {d.kind === 'combo' ? `×${d.sections.length}` : d.short}
            </Txt>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt style={type.heading}>{d.kind === 'combo' ? d.short : d.title}</Txt>
            <Txt style={type.small} color="soft">
              {d.kind === 'combo' ? `${d.title}. ${d.blurb}` : d.blurb}
            </Txt>
          </View>
        </Row>
        {locked ? (
          <View style={{ gap: 6 }}>
            <ProgressBar value={locked.done / locked.total} color={tone.strong} />
            <Row gap={6}>
              <Icon name="lock-closed-outline" size={14} color={t.inkSoft} />
              <Txt style={type.small} color="soft">
                Unlocks when every block reaches L2 ({locked.done}/{locked.total}). You can try it now.
              </Txt>
            </Row>
          </View>
        ) : null}
        <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap' }} gap={space.sm}>
          <Row gap={6} style={{ flexWrap: 'wrap', flex: 1 }}>
            <LevelBadge level={prog?.level ?? 1} />
            <Chip label={`Set ${done + 1} · ${STAGES[stage].name}`} icon={stage === 3 ? 'flame-outline' : undefined} />
            {prog ? (
              <Chip label={relativeDue(prog.nextDueAt)} tone={prog.nextDueAt && prog.nextDueAt <= Date.now() ? 'warn' : undefined} />
            ) : null}
          </Row>
          <Button
            small
            label={done ? 'Next set' : locked ? 'Try' : 'Start'}
            icon="play"
            variant={locked ? 'secondary' : 'primary'}
            onPress={() => start(d)}
          />
        </Row>
      </Card>
    );
  };

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

      <SectionHeader title="Single blocks" />
      <View style={{ gap: space.md }}>{singlesFor(p).map((d) => drillCard(d))}</View>

      <SectionHeader title="Combined drills" />
      <Txt style={type.small} color="soft">
        Chain blocks on the same patient, the way a real history flows. Each combined drill has its own sets, levels and stages.
      </Txt>
      <View style={{ gap: space.md }}>
        {combosFor(p).map((d) => {
          const r = comboReadiness(p, d, programs);
          return drillCard(d, r.ready ? undefined : { done: r.done, total: r.total });
        })}
      </View>

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
