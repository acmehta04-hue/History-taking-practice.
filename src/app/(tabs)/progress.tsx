import { router } from 'expo-router';
import { Alert, Platform, View } from 'react-native';

import { BarList, LineChart } from '@/components/charts';
import { Button, Card, Chip, LevelBadge, pct, Row, Screen, SectionHeader, Stat, Txt } from '@/components/ui';
import { combosFor, getDrill, presentationById, presentations, programKey, singlesFor } from '@/content';
import { STAGES } from '@/engine/stages';
import { relativeDue } from '@/engine/recommend';
import { average } from '@/engine/scoring';
import { streakDays, useStore } from '@/store';
import { space, type } from '@/theme';

const BLOCKS = [
  { id: 'hpc', label: 'History of presenting complaint' },
  { id: 'systems', label: 'Systems review' },
  { id: 'risk', label: 'Risk assessment' },
  { id: 'pph', label: 'Past psychiatric history' },
  { id: 'dh', label: 'Drug history' },
  { id: 'fhsh', label: 'Family & social' },
  { id: 'ddx', label: 'Differentials' },
  { id: 'ix', label: 'Investigations' },
  { id: 'mx', label: 'Management' },
  { id: 'combo', label: 'Combined drills' },
];

export default function Progress() {
  const sets = useStore((s) => s.sets);
  const programs = useStore((s) => s.programs);
  const resetAll = useStore((s) => s.resetAll);

  const total = sets.reduce((a, s) => a + s.points, 0);
  const recent = sets.slice(-20);
  const line = recent.map((s, i) => ({
    y: s.points,
    label: `Set ${sets.length - recent.length + i + 1}`,
    detail: `${presentationById[s.presentationId]?.title} · ${getDrill(s.presentationId, s.sectionId)?.short} · ${pct(s.accuracy)}`,
  }));

  const bars = BLOCKS.map((b) => {
    const mine = sets.filter((s) => (b.id === 'combo' ? s.sectionId.startsWith('combo-') : s.sectionId === b.id)).slice(-5);
    return { label: b.label, value: average(mine.map((s) => s.accuracy)), n: mine.length };
  })
    .filter((b) => b.n > 0)
    .sort((a, b) => a.value - b.value)
    .map((b) => ({ label: b.label, value: b.value, sub: `${pct(b.value)} · last ${b.n}` }));

  const started = presentations.flatMap((p) =>
    [...singlesFor(p), ...combosFor(p)].map((s) => ({ p, s, prog: programs[programKey(p.id, s.id)] })).filter((x) => x.prog),
  );

  const confirmReset = () => {
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (globalThis.confirm?.('Delete all progress on this device?')) resetAll();
      return;
    }
    Alert.alert('Reset progress', 'Delete all progress on this device?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: resetAll },
    ]);
  };

  return (
    <Screen>
      <View style={{ marginTop: space.sm }}>
        <Txt style={type.display}>Progress</Txt>
        <Txt color="soft">Accuracy shows what you covered. Independence shows how much you did without help. Points combine both.</Txt>
      </View>

      <Row gap={space.md} style={{ alignItems: 'stretch' }}>
        <Stat label="Total points" value={String(total)} sub={`${sets.length} sets`} />
        <Stat label="Streak" value={`${streakDays(sets)}d`} sub="days in a row" />
      </Row>

      <Card style={{ gap: space.sm }}>
        <Txt style={type.heading}>Points per set</Txt>
        <LineChart data={line} unit=" pts" />
      </Card>

      <Card style={{ gap: space.md }}>
        <Txt style={type.heading}>Accuracy by history block</Txt>
        <Txt style={type.small} color="soft">
          Average of your last 5 sets in each block, weakest first — that is where to drill next.
        </Txt>
        {bars.length ? <BarList data={bars} /> : <Txt color="soft">Finish a set to see this.</Txt>}
      </Card>

      <SectionHeader title="Drills in progress" />
      {started.length ? (
        started.map(({ p, s, prog }) => (
          <Card
            key={programKey(p.id, s.id)}
            onPress={() =>
              router.push({ pathname: '/drill/[presentationId]/[sectionId]', params: { presentationId: p.id, sectionId: s.id } })
            }
            style={{ gap: space.sm, padding: space.lg }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Txt style={[type.bodyStrong, { flex: 1 }]}>
                {p.title} · {s.title}
              </Txt>
            </Row>
            <Row gap={6} style={{ flexWrap: 'wrap' }}>
              <LevelBadge level={prog!.level} />
              <Chip label={`${prog!.setsCompleted} sets`} />
              <Chip label={`Best ${pct(prog!.bestAccuracy)}`} />
              <Chip label={relativeDue(prog!.nextDueAt)} />
            </Row>
          </Card>
        ))
      ) : (
        <Txt color="soft">Nothing yet — start a drill from Home.</Txt>
      )}

      {sets.length ? (
        <>
          <SectionHeader title="Recent sets" />
          {[...sets]
            .reverse()
            .slice(0, 8)
            .map((s) => (
              <Card
                key={s.id}
                onPress={() => router.push({ pathname: '/summary/[setId]', params: { setId: s.id } })}
                style={{ padding: space.lg }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <Txt style={type.bodyStrong}>
                      {presentationById[s.presentationId]?.title} · {getDrill(s.presentationId, s.sectionId)?.short}
                    </Txt>
                    <Txt style={type.small} color="soft">
                      {new Date(s.finishedAt).toLocaleDateString()} · {pct(s.accuracy)} accuracy · L{s.level} · {STAGES[s.stage ?? 1].name}
                    </Txt>
                  </View>
                  <Txt style={type.heading}>{s.points}</Txt>
                </Row>
              </Card>
            ))}
        </>
      ) : null}

      <Card variant="alt" style={{ gap: space.sm }}>
        <Txt style={type.heading}>How points work</Txt>
        <Txt style={type.small} color="soft">
          Points = 100 × accuracy × (0.5 + 0.5 × independence) × level bonus (Guided ×1.0, Prompted ×1.2, Independent ×1.4), plus up to 10
          for speed if accuracy is at least 60%. Minus 5 per missed red flag and 2 per “not first line” pick. Red flags count 3×, core items
          2×, extras 1×. Giving the reason for a test or diagnosis earns 50% extra.
        </Txt>
      </Card>

      <Button label="Reset all progress" variant="ghost" small onPress={confirmReset} />
    </Screen>
  );
}
