import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { success } from '@/components/drill/shared';
import { StepRep } from '@/components/drill/StepRep';
import { Button, Card, Chip, LevelBadge, mmss, pct, Ring, Row, TopBar, Txt } from '@/components/ui';
import { caseTag, casesForDrill, getDrill, isQuiz, LEVEL_NAMES, presentationById, programKey } from '@/content';
import { casesForSet, stageBlurb, STAGES, stageFor } from '@/engine/stages';
import { defaultProgram, type RepResult, useStore } from '@/store';
import { MAX_WIDTH, space, type, useTheme } from '@/theme';

type Phase = 'intro' | 'rep' | 'repDone';

/** What each level looks like: history reps are a patient interview, reasoning reps a quiz then a chat */
const LEVEL_COPY = {
  interview: {
    1: 'Guided: the framework and suggested questions are on screen. Tapping a suggestion earns half credit.',
    2: 'Prompted: progress per framework group, plus hints when you need them.',
    3: 'Independent: a blank page and the clock. Hints still exist, but they cost points.',
  },
  reasoning: {
    1: 'Guided: a multiple-choice quiz. Tick every option that belongs, then check. Score 80% to move on to your own words.',
    2: 'Prompted: a chat with the examiner. Type each point and get feedback as you go, with hints if you need them.',
    3: 'Independent: the examiner just listens. Type your answer against the clock; hints cost points.',
  },
} as const;

/** Route param is called sectionId for history, but it can be a block or a combined drill id */
export default function DrillScreen() {
  const t = useTheme();
  const { presentationId, sectionId } = useLocalSearchParams<{ presentationId: string; sectionId: string }>();
  const p = presentationById[presentationId ?? ''];
  const drill = getDrill(presentationId ?? '', sectionId ?? '');
  const program = useStore((s) => s.programs[programKey(presentationId ?? '', sectionId ?? '')]) ?? defaultProgram;
  const completeSet = useStore((s) => s.completeSet);

  // Freeze the set's level, stage, patients and start time when it starts
  const [frozen] = useState(() => {
    const stage = stageFor(program.setsCompleted);
    return {
      level: program.level,
      setNumber: program.setsCompleted + 1,
      stage,
      startedAt: Date.now(),
      cases: p && drill ? casesForSet(casesForDrill(p, drill), drill.sections[0], stage, program.setsCompleted) : [],
    };
  });
  const { level, setNumber, stage, startedAt, cases } = frozen;

  const [phase, setPhase] = useState<Phase>('intro');
  const [rep, setRep] = useState(0);
  const [results, setResults] = useState<RepResult[]>([]);

  if (!p || !drill) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.bg, padding: space.lg }}>
        <TopBar title="Drill not found" />
      </SafeAreaView>
    );
  }

  const info = STAGES[stage];
  const header = (stepLabel?: string) => (
    <TopBar
      title={`${p.title} · ${drill.short}`}
      subtitle={
        phase === 'intro'
          ? `Set ${setNumber} · ${info.name}`
          : `Set ${setNumber} · ${info.name} · Rep ${rep + 1}/${cases.length}${stepLabel ? ` · ${stepLabel}` : ''}`
      }
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
      sectionId: drill.id,
      level,
      stage,
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
  const page = (children: React.ReactNode) =>
    wrap(
      <ScrollView contentContainerStyle={{ paddingTop: space.md, paddingBottom: 60 }}>
        <View style={{ width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', paddingHorizontal: space.lg, gap: space.lg }}>
          {children}
        </View>
      </ScrollView>,
    );

  /* ---------------- intro ---------------- */
  if (phase === 'intro') {
    return page(
      <>
        {header()}
        <Card variant="hero" style={{ gap: space.md }}>
          <Txt style={type.tiny} color="heroSoft">
            Set {setNumber} · {cases.length} reps{drill.kind === 'combo' ? ` · ${drill.sections.length} blocks per rep` : ''}
          </Txt>
          <Txt style={type.title} color="hero">
            {drill.title}
          </Txt>
          <Row gap={6} style={{ flexWrap: 'wrap' }}>
            {([1, 2, 3] as const).map((n) => (
              <View
                key={n}
                style={{
                  backgroundColor: n === stage ? t.accent : 'rgba(255,255,255,0.1)',
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}>
                <Txt style={[type.small, { fontWeight: '700' }]} color={n === stage ? t.accentInk : t.heroSoft}>
                  {n}. {STAGES[n].name}
                </Txt>
              </View>
            ))}
          </Row>
          <Txt color="hero">{stageBlurb(stage, drill.sections)}</Txt>
          <Txt color="heroSoft">{LEVEL_COPY[isQuiz(drill, 1) ? 'reasoning' : 'interview'][level]}</Txt>
          <Row gap={6} style={{ flexWrap: 'wrap' }}>
            {cases.map((c, i) => (
              <View
                key={c.id}
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}>
                <Txt style={type.small} color="hero">
                  Rep {i + 1}: {caseTag(c)} · {'●'.repeat(c.difficulty)}
                  {'○'.repeat(3 - c.difficulty)}
                </Txt>
              </View>
            ))}
          </Row>
        </Card>

        {level < 3 && drill.flow.length ? (
          <Card style={{ gap: space.sm }}>
            <Txt style={type.heading}>Your plan for this {drill.kind === 'combo' ? 'drill' : 'block'}</Txt>
            {drill.flow.map((f, i) => (
              <Row key={i} gap={space.sm} style={{ alignItems: 'flex-start' }}>
                <Txt style={[type.bodyStrong, { width: 20 }]} color="faint">
                  {drill.kind === 'combo' ? '•' : i + 1}
                </Txt>
                <Txt style={{ flex: 1 }}>{f.replace(/^\d+\. /, '')}</Txt>
              </Row>
            ))}
          </Card>
        ) : (
          <Card variant="alt">
            <Txt>No plan on screen at {LEVEL_NAMES[3]} level — run it from memory. You will see the ideal flow afterwards.</Txt>
          </Card>
        )}

        <Txt style={type.small} color="faint">
          Target: {mmss(drill.targetSeconds * info.timeFactor)} per rep. Matching is keyword-based in this version: if something isn’t
          recognised, rephrase it.
        </Txt>
        <Button label="Start rep 1" icon="play" onPress={() => setPhase('rep')} />
      </>,
    );
  }

  /* ---------------- rep done ---------------- */
  if (phase === 'repDone') {
    const r = results[results.length - 1];
    const last = rep + 1 >= cases.length;
    return page(
      <>
        {header()}
        <Card style={{ alignItems: 'center', gap: space.md, paddingVertical: space.xxl }}>
          <Ring value={r.accuracy} size={120} stroke={10} color={t.ink}>
            <Txt style={type.number}>{pct(r.accuracy)}</Txt>
            <Txt style={type.small} color="soft">
              accuracy
            </Txt>
          </Ring>
          <Txt style={type.title}>+{r.points} pts</Txt>
          <Row gap={6} style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
            {isQuiz(drill, level) ? <Chip label="Quiz" /> : <Chip label={`Independence ${pct(r.independence)}`} />}
            <Chip label={`Time ${mmss(r.durationSec)}`} />
            {r.speedBonus ? <Chip label={`Speed +${r.speedBonus}`} tone="accent" /> : null}
            {r.redFlagsMissed.length ? (
              <Chip label={`${r.redFlagsMissed.length} red flag${r.redFlagsMissed.length > 1 ? 's' : ''} missed`} tone="bad" icon="flag" />
            ) : (
              <Chip label="No red flags missed" tone="good" icon="checkmark" />
            )}
          </Row>
          <Txt color="soft" style={{ textAlign: 'center' }}>
            {r.missed.length} item{r.missed.length === 1 ? '' : 's'} missed. The full breakdown and the model answer come after the set.
          </Txt>
        </Card>
        <Button label={last ? 'See set feedback' : `Next patient (rep ${rep + 2})`} icon="arrow-forward" onPress={next} />
      </>,
    );
  }

  /* ---------------- rep ---------------- */
  const c = cases[rep];
  return wrap(
    <StepRep
      key={c.id}
      sections={drill.sections}
      patientCase={c}
      level={level}
      stage={stage}
      timeFactor={info.timeFactor}
      header={header}
      onDone={onRepDone}
    />,
  );
}
