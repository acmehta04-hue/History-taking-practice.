import { useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, type ScrollViewInstance, StyleSheet, TextInput, View } from 'react-native';

import { checklistFor } from '../../content';
import type { AssistLevel, CaseFile, SectionDef } from '../../content/types';
import { matchQuestion, patientReply } from '../../engine/matcher';
import type { Coverage, Method } from '../../engine/scoring';
import type { RepResult, TranscriptLine } from '../../store';
import { MAX_WIDTH, radius, space, type, useTheme } from '../../theme';
import { Button, Card, Chip, Icon, mmss, Row, Txt } from '../ui';
import { ReasoningPanel } from './ReasoningPanel';
import { buildRepResult, nextToHint, tap, useElapsed } from './shared';

/**
 * One interview rep: the student asks questions, the simulated patient answers.
 *  L1 Guided      — every framework item on screen + three suggested questions
 *  L2 Prompted    — progress per framework group + hints
 *  L3 Independent — only a question count; hints cost points
 */
export function InterviewRep({
  section,
  patientCase,
  level,
  header,
  onDone,
}: {
  section: SectionDef;
  patientCase: CaseFile;
  level: AssistLevel;
  header: React.ReactNode;
  onDone: (r: RepResult) => void;
}) {
  const t = useTheme();
  const items = useMemo(() => checklistFor(section, patientCase), [section, patientCase]);
  const followUp = patientCase.followUps?.[section.id];
  const [elapsed, finalSeconds] = useElapsed();

  const [transcript, setTranscript] = useState<TranscriptLine[]>([{ from: 'patient', text: patientCase.patient.opening }]);
  const [covered, setCovered] = useState<Record<string, Coverage>>({});
  const [hinted, setHinted] = useState<Set<string>>(new Set());
  const [hint, setHint] = useState<string | null>(null);
  const [unmatched, setUnmatched] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<'interview' | 'followup'>('interview');
  const scroller = useRef<ScrollViewInstance>(null);

  const ask = (text: string, method: Method = 'typed') => {
    const q = text.trim();
    if (!q) return;
    const matched = matchQuestion(q, items);
    const next = { ...covered };
    let gained = false;
    for (const m of matched) {
      if (!next[m.id]) {
        next[m.id] = { method: method === 'suggested' ? 'suggested' : hinted.has(m.id) ? 'hinted' : 'typed' };
        gained = true;
      }
    }
    if (gained) tap();
    if (!matched.length) setUnmatched((u) => [...u, q]);
    setCovered(next);
    setTranscript((tr) => [
      ...tr,
      { from: 'student', text: q, itemIds: matched.map((m) => m.id) },
      { from: 'patient', text: patientReply(matched, patientCase, unmatched.length) },
    ]);
    setInput('');
    if (hint && gained) setHint(null);
    setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 50);
  };

  const askHint = () => {
    const it = nextToHint(items, covered, hinted);
    if (!it) return setHint('You have covered the whole checklist — finish when ready.');
    setHinted(new Set(hinted).add(it.id));
    setHint(it.hint);
  };

  const suggestions = items.filter((i) => !covered[i.id]).slice(0, 3);

  const groups = useMemo(() => {
    const m = new Map<string, { total: number; done: number }>();
    for (const it of items) {
      const g = it.group ?? 'Other';
      const v = m.get(g) ?? { total: 0, done: 0 };
      v.total++;
      if (covered[it.id]) v.done++;
      m.set(g, v);
    }
    return [...m.entries()];
  }, [items, covered]);

  const finish = (extra?: { covered: Record<string, Coverage>; distractors: string[] }) => {
    const all = [
      ...items.map((i) => ({ id: i.id, weight: i.weight })),
      ...(extra && followUp ? followUp.items.map((i) => ({ id: `fu:${i.id}`, weight: i.weight, hasReason: !!i.reasonMatch })) : []),
    ];
    const cov: Record<string, Coverage> = { ...covered };
    if (extra) for (const [k, v] of Object.entries(extra.covered)) cov[`fu:${k}`] = v;
    onDone(
      buildRepResult({
        caseId: patientCase.id,
        kind: 'interview',
        level,
        items: all,
        covered: cov,
        durationSec: finalSeconds(),
        targetSeconds: section.targetSeconds + (followUp ? 90 : 0),
        unmatched,
        distractors: extra?.distractors,
        transcript,
      }),
    );
  };

  const questionsAsked = transcript.filter((l) => l.from === 'student').length;

  if (phase === 'followup' && followUp) {
    return (
      <ScrollView contentContainerStyle={styles.followWrap} keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>
          {header}
          <Card variant="hero" style={{ gap: space.sm }}>
            <Txt style={type.tiny} color="heroSoft">
              Think it through
            </Txt>
            <Txt style={type.heading} color="hero">
              {followUp.prompt}
            </Txt>
          </Card>
          <ReasoningPanel
            seed={patientCase.id + section.id}
            items={followUp.items}
            level={level}
            prompt="One option per line."
            finishLabel="Finish rep"
            onFinish={(o) => finish({ covered: o.covered, distractors: o.distractors })}
          />
        </View>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={8}>
      <ScrollView ref={scroller} style={{ flex: 1 }} contentContainerStyle={styles.chatWrap} keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>
          {header}

          {/* Patient card */}
          <Card style={{ padding: space.lg }}>
            <Row>
              <View style={[styles.avatar, { backgroundColor: t.surfaceAlt }]}>
                <Txt style={type.bodyStrong}>
                  {patientCase.patient.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </Txt>
              </View>
              <View style={{ flex: 1 }}>
                <Txt style={type.bodyStrong}>{patientCase.patient.name}</Txt>
                <Txt style={type.small} color="soft">
                  {patientCase.patient.age}, {patientCase.patient.sex} · {patientCase.patient.setting}
                </Txt>
              </View>
              <Row gap={4}>
                <Icon name="time-outline" size={16} color={t.inkSoft} />
                <Txt style={[type.small, { fontVariant: ['tabular-nums'] }]} color={elapsed > section.targetSeconds ? 'warn' : 'soft'}>
                  {mmss(elapsed)}
                </Txt>
              </Row>
            </Row>
          </Card>

          {/* Framework aid */}
          {level === 1 ? (
            <Row gap={6} style={{ flexWrap: 'wrap' }}>
              {items.map((i) => (
                <Chip
                  key={i.id}
                  label={i.label}
                  tone={covered[i.id] ? 'good' : i.weight === 'redflag' ? 'warn' : undefined}
                  icon={covered[i.id] ? 'checkmark' : i.weight === 'redflag' ? 'flag' : undefined}
                />
              ))}
            </Row>
          ) : level === 2 ? (
            <Row gap={6} style={{ flexWrap: 'wrap' }}>
              {groups.map(([g, v]) => (
                <Chip key={g} label={`${g} ${v.done}/${v.total}`} tone={v.done === v.total ? 'good' : undefined} />
              ))}
            </Row>
          ) : (
            <Txt style={type.small} color="faint">
              Independent mode · {questionsAsked} question{questionsAsked === 1 ? '' : 's'} asked
            </Txt>
          )}

          {/* Transcript */}
          <View style={{ gap: space.sm }}>
            {transcript.map((l, i) => {
              const me = l.from === 'student';
              return (
                <View key={i} style={[styles.bubbleRow, { justifyContent: me ? 'flex-end' : 'flex-start' }]}>
                  <View
                    style={[
                      styles.bubble,
                      me
                        ? { backgroundColor: t.bubbleMe, borderBottomRightRadius: 6 }
                        : { backgroundColor: t.bubbleThem, borderBottomLeftRadius: 6, borderWidth: t.dark ? 0 : 1, borderColor: t.line },
                    ]}>
                    <Txt color={me ? t.bubbleMeInk : t.ink}>{l.text}</Txt>
                    {me && level < 3 ? (
                      <Txt style={[type.small, { marginTop: 4, opacity: 0.75 }]} color={t.bubbleMeInk}>
                        {l.itemIds?.length
                          ? `✓ ${l.itemIds.map((id) => items.find((x) => x.id === id)?.label).join(', ')}`
                          : 'Not recognised — try rephrasing'}
                      </Txt>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>

          {hint ? (
            <Card variant="alt" style={{ padding: space.lg }}>
              <Row gap={space.sm} style={{ alignItems: 'flex-start' }}>
                <Icon name="bulb" size={18} color={t.warn} />
                <Txt style={{ flex: 1 }}>{hint}</Txt>
              </Row>
            </Card>
          ) : null}
        </View>
      </ScrollView>

      {/* Composer */}
      <View style={[styles.composer, { backgroundColor: t.bg, borderTopColor: t.line }]}>
        <View style={[styles.inner, { gap: space.sm }]}>
          {level === 1 && suggestions.length ? (
            <View style={{ gap: 6 }}>
              {suggestions.slice(0, 2).map((s) => (
                <Pressable
                  key={s.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Ask: ${s.modelQuestion}`}
                  onPress={() => ask(s.modelQuestion, 'suggested')}
                  style={({ pressed }) => [
                    styles.suggestion,
                    { backgroundColor: t.surface, borderColor: t.line, opacity: pressed ? 0.7 : 1 },
                  ]}>
                  <Icon name="chatbubble-ellipses-outline" size={16} color={t.inkSoft} />
                  <Txt style={[type.small, { flex: 1 }]} color="soft">
                    <Txt style={[type.small, { fontWeight: '700' }]}>{s.label}: </Txt>
                    {s.modelQuestion}
                  </Txt>
                </Pressable>
              ))}
            </View>
          ) : null}
          <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
            {level > 1 ? <Button label="Hint" variant="secondary" small onPress={askHint} /> : null}
            <TextInput
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => ask(input)}
              placeholder="Ask the patient a question…"
              placeholderTextColor={t.inkFaint}
              returnKeyType="send"
              submitBehavior="submit"
              accessibilityLabel="Your question"
              style={[
                type.body,
                {
                  flex: 1,
                  color: t.ink,
                  backgroundColor: t.surface,
                  borderRadius: radius.pill,
                  paddingHorizontal: 18,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: t.line,
                },
              ]}
            />
            <Button label="Ask" small onPress={() => ask(input)} disabled={!input.trim()} style={{ paddingVertical: 12 }} />
          </View>
          <Row style={{ justifyContent: 'flex-end' }}>
            <Button
              label={followUp ? 'Done asking' : 'Finish rep'}
              variant="ghost"
              small
              icon="flag-outline"
              disabled={questionsAsked === 0}
              onPress={() => (followUp ? setPhase('followup') : finish())}
            />
          </Row>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  inner: { width: '100%', maxWidth: MAX_WIDTH, paddingHorizontal: space.lg, gap: space.md, alignSelf: 'center' },
  chatWrap: { paddingTop: space.md, paddingBottom: space.xl },
  followWrap: { paddingTop: space.md, paddingBottom: 80 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  bubbleRow: { flexDirection: 'row' },
  bubble: { maxWidth: '85%', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
  suggestion: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  composer: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: space.sm, paddingBottom: space.sm },
});
