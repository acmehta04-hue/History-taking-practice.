import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InterviewRep } from '@/components/drill/InterviewRep';
import { ReasoningRep } from '@/components/drill/ReasoningRep';
import { success } from '@/components/drill/shared';
import { Button, Card, Chip, LevelBadge, mmss, pct, Ring, Row, TopBar, Txt } from '@/components/ui';
import { getSection, LEVEL_NAMES, presentationById, programKey } from '@/content';
import { pickCases } from '@/engine/progression';
import { defaultProgram, type RepResult, useStore } from '@/store';
import { MAX_WIDTH, space, type, useTheme } from '@/theme';

type Phase = 'intro' | 'rep' | 'repDone';

const LEVEL_COPY = {
  1: 'Guided: the full framework and suggested questions are on screen. Tapping a suggestion earns half credit.',
  2: 'Prompted: progress per framework group, plus hints when you need them.',
  3: 'Independent: a blank page and the clock. Hints still exist, but they cost points.',
} as const;

export default function DrillScreen() {
  const t = useTheme();
  const { presentationId, sectionId } = useLocalSearchParams<{ presentationId: string; sectionId: string }>();
  const p = presentationById[presentationId ?? ''];
  const section = getSection(presentationId ?? '', sectionId ?? '');
  const program = useStore((s) => s.programs[programKey(presentationId ?? '', sectionId ?? '')]) ?? defaultProgram;
  const completeSet = useStore((s) => s.completeSet);

  // Freeze the set's level and patients when it starts
  const level = useRef(program.level).current;
  const setNumber = useRef(program.setsCompleted + 1).current;
  const cases = useMemo(() => (p ? pickCases(p, program.setsCompleted) : []), [p]); // eslint-disable-line react-hooks/exhaustive-deps
  const startedAt = useRef(Date.now()).current;

  const [phase, setPhase] = useState<Phase>('intro');
  const [rep, setRep] = useState(0);
  const [results, setResults] = useState<RepResult[]>([]);

  if (!p || !section) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.bg, padding: space.lg }}>
        <TopBar title="Drill not found" />
      </SafeAreaView>
    );
  }

  const header = (
    <TopBar
      title={`${p.title} · ${section.short}`}
      subtitle={phase === 'intro' ? `Set ${setNumber}` : `Set ${setNumber} · Rep ${rep + 1} of ${cases.length}`}
      right={<LevelBadge level={level} compact />}
    />
  );

  const onRepDone = (r: RepResult) => {
    success();
    setResults((rs) => [...rs, r]);
    setPhase('repDone');
  };

  const next = () => {
    if (rep + 1 < cases.length) {
      setRep(rep + 1);
      setPhase('rep');
      return;
    }
    const saved = completeSet({
      presentationId: p.id,
      sectionId: section.id,
      level,
      startedAt,
      finishedAt: Date.now(),
      reps: results,
    });
    router.replace({ pathname: '/summary/[setId]', params: { setId: saved.id } });
  };

  const wrap = (children: React.ReactNode) => (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: t.bg }}>
      {children}
    </SafeAreaView>
  );

  /* ---------------- intro ---------------- */
  if (phase === 'intro') {
    return wrap(
      <ScrollView contentContainerStyle={{ paddingTop: space.md, paddingBottom: 60 }}>
        <View style={{ width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', paddingHorizontal: space.lg, gap: space.lg }}>
          {header}
          <Card variant="hero" style={{ gap: space.md }}>
            <Txt style={type.tiny} color="heroSoft">
              Set {setNumber} · {cases.length} reps
            </Txt>
            <Txt style={type.title} color="hero">
              {section.title}
            </Txt>
            <Txt color="heroSoft">{LEVEL_COPY[level]}</Txt>
            <Row gap={6} style={{ flexWrap: 'wrap' }}>
              {cases.map((c, i) => (
                <View
                  key={c.id}
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}>
                  <Txt style={type.small} color="hero">
                    Rep {i + 1}: {c.patient.age}
                    {c.patient.sex === 'male' ? 'M' : 'F'}
                  </Txt>
                </View>
              ))}
            </Row>
          </Card>

          {level < 3 && section.flow ? (
            <Card style={{ gap: space.sm }}>
              <Txt style={type.heading}>Your plan for this block</Txt>
              {section.flow.map((f, i) => (
                <Row key={i} gap={space.sm} style={{ alignItems: 'flex-start' }}>
                  <Txt style={[type.bodyStrong, { width: 20 }]} color="faint">
                    {i + 1}
                  </Txt>
                  <Txt style={{ flex: 1 }}>{f}</Txt>
                </Row>
              ))}
            </Card>
          ) : (
            <Card variant="alt">
              <Txt>No plan on screen at {LEVEL_NAMES[3]} level — run it from memory. You will see the ideal flow afterwards.</Txt>
            </Card>
          )}

          <Txt style={type.small} color="faint">
            Target: {mmss(section.targetSeconds)} per rep. The patient understands plain questions. If a question isn’t recognised, rephrase
            it — the matching is keyword-based in this version.
          </Txt>
          <Button label="Start rep 1" icon="play" onPress={() => setPhase('rep')} />
        </View>
      </ScrollView>,
    );
  }

  /* ---------------- rep done ---------------- */
  if (phase === 'repDone') {
    const r = results[results.length - 1];
    const last = rep + 1 >= cases.length;
    return wrap(
      <ScrollView contentContainerStyle={{ paddingTop: space.md, paddingBottom: 60 }}>
        <View style={{ width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', paddingHorizontal: space.lg, gap: space.lg }}>
          {header}
          <Card style={{ alignItems: 'center', gap: space.md, paddingVertical: space.xxl }}>
            <Ring value={r.accuracy} size={120} stroke={10} color={t.ink}>
              <Txt style={type.number}>{pct(r.accuracy)}</Txt>
              <Txt style={type.small} color="soft">
                accuracy
              </Txt>
            </Ring>
            <Txt style={type.title}>+{r.points} pts</Txt>
            <Row gap={6} style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
              <Chip label={`Independence ${pct(r.independence)}`} />
              <Chip label={`Time ${mmss(r.durationSec)}`} />
              {r.speedBonus ? <Chip label={`Speed +${r.speedBonus}`} tone="accent" /> : null}
              {r.redFlagsMissed.length ? (
                <Chip
                  label={`${r.redFlagsMissed.length} red flag${r.redFlagsMissed.length > 1 ? 's' : ''} missed`}
                  tone="bad"
                  icon="flag"
                />
              ) : (
                <Chip label="No red flags missed" tone="good" icon="checkmark" />
              )}
            </Row>
            <Txt color="soft" style={{ textAlign: 'center' }}>
              {r.missed.length} item{r.missed.length === 1 ? '' : 's'} missed. The full breakdown and the model answer come after the set.
            </Txt>
          </Card>
          <Button label={last ? 'See set feedback' : `Next patient (rep ${rep + 2})`} icon="arrow-forward" onPress={next} />
        </View>
      </ScrollView>,
    );
  }

  /* ---------------- rep ---------------- */
  const c = cases[rep];
  return wrap(
    section.kind === 'interview' ? (
      <InterviewRep key={c.id} section={section} patientCase={c} level={level} header={header} onDone={onRepDone} />
    ) : (
      <ReasoningRep key={c.id} section={section} patientCase={c} level={level} header={header} onDone={onRepDone} />
    ),
  );
}
