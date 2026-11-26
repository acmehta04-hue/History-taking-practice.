import { useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, type ScrollViewInstance, StyleSheet, TextInput, View } from 'react-native';

import { checklistFor } from '../../content';
import {
  type AssistLevel,
  type CaseFile,
  type ChecklistItem,
  type Purpose,
  PURPOSE_HELP,
  PURPOSE_NAMES,
  type SectionDef,
} from '../../content/types';
import { type CounselState, counselTurn, initialCounselState } from '../../engine/counsel';
import { cardResults } from '../../engine/flashcards';
import { matchQuestion, patientReply } from '../../engine/matcher';
import type { Coverage, Method } from '../../engine/scoring';
import { extraQuestions, type Stage } from '../../engine/stages';
import type { RepResult, TranscriptLine } from '../../store';
import { MAX_WIDTH, radius, space, type, useTheme } from '../../theme';
import { Button, Card, Chip, Icon, mmss, Row, Txt } from '../ui';
import { ExtraQuestions, extraScorable } from './ExtraQuestions';
import { buildRepResult, nextToHint, tap, useElapsed } from './shared';

const PURPOSES: Purpose[] = ['exclude', 'risk', 'severity'];

/**
 * One conversation rep.
 *  interview — the student asks questions, the simulated patient answers.
 *  counsel   — the student explains a treatment; the patient acknowledges and asks back.
 * With section.tagPurpose, the student also tags each new question: exclude / risk factor / severity.
 *
 *  L1 Guided      — every framework item on screen + suggested questions or statements
 *  L2 Prompted    — progress per framework group + hints
 *  L3 Independent — only a count; hints cost points
 */
export function InterviewRep({
  section,
  patientCase,
  level,
  stage,
  isLastStep = true,
  targetSeconds,
  header,
  onDone,
}: {
  section: SectionDef;
  patientCase: CaseFile;
  level: AssistLevel;
  stage: Stage;
  isLastStep?: boolean;
  targetSeconds: number;
  header: React.ReactNode;
  onDone: (r: RepResult) => void;
}) {
  const t = useTheme();
  const counsel = section.kind === 'counsel';
  const items = useMemo(() => checklistFor(section, patientCase), [section, patientCase]);
  const byId = useMemo(() => Object.fromEntries(items.map((i) => [i.id, i])) as Record<string, ChecklistItem>, [items]);
  const extras = useMemo(() => extraQuestions(section, patientCase, stage, isLastStep), [section, patientCase, stage, isLastStep]);
  const [elapsed, finalSeconds] = useElapsed();
  const opening = patientCase.openings?.[section.id] ?? patientCase.patient.opening;

  const [transcript, setTranscript] = useState<TranscriptLine[]>([{ from: 'patient', text: opening }]);
  const [covered, setCovered] = useState<Record<string, Coverage>>({});
  const [hinted, setHinted] = useState<Set<string>>(new Set());
  const [hint, setHint] = useState<string | null>(null);
  const [unmatched, setUnmatched] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<'interview' | 'extras'>('interview');
  const [pendingTag, setPendingTag] = useState<string[] | null>(null);
  const [tags, setTags] = useState<Record<string, Purpose>>({});
  const [tagNote, setTagNote] = useState<{ ok: boolean; lines: string[] } | null>(null);
  const counselState = useRef<CounselState>(initialCounselState);
  const scroller = useRef<ScrollViewInstance>(null);

  const ask = (text: string, method: Method = 'typed') => {
    const q = text.trim();
    if (!q) return;
    const matched = matchQuestion(q, items);
    const next = { ...covered };
    const gained: ChecklistItem[] = [];
    for (const m of matched) {
      if (!next[m.id]) {
        next[m.id] = { method: method === 'suggested' ? 'suggested' : hinted.has(m.id) ? 'hinted' : 'typed' };
        gained.push(m);
      }
    }
    if (gained.length) tap();
    if (!matched.length && !counsel) setUnmatched((u) => [...u, q]);

    let reply: string;
    if (counsel) {
      const res = counselTurn({ gained, covered: new Set(Object.keys(next)), c: patientCase, state: counselState.current });
      counselState.current = res.state;
      reply = res.reply;
    } else reply = patientReply(matched, patientCase, unmatched.length);

    setCovered(next);
    setTranscript((tr) => [...tr, { from: 'student', text: q, itemIds: matched.map((m) => m.id) }, { from: 'patient', text: reply }]);
    setInput('');
    if (hint && gained.length) setHint(null);
    if (section.tagPurpose) {
      const purposeful = gained.filter((g) => g.purpose).map((g) => g.id);
      setPendingTag(purposeful.length ? purposeful : null);
      setTagNote(null);
    }
    setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 50);
  };

  const chooseTag = (p: Purpose) => {
    if (!pendingTag) return;
    const lines: string[] = [];
    let allOk = true;
    setCovered((prev) => {
      const next = { ...prev };
      for (const id of pendingTag) if (next[id]) next[id] = { ...next[id], reason: byId[id]?.purpose === p };
      return next;
    });
    setTags((prev) => {
      const next = { ...prev };
      for (const id of pendingTag) next[id] = p;
      return next;
    });
    for (const id of pendingTag) {
      const it = byId[id];
      if (!it?.purpose) continue;
      const ok = it.purpose === p;
      if (!ok) allOk = false;
      lines.push(ok ? `${PURPOSE_NAMES[p]}: ${it.target ?? it.why}` : `That was “${PURPOSE_NAMES[it.purpose]}”: ${it.target ?? it.why}`);
    }
    setTagNote({ ok: allOk, lines });
    setPendingTag(null);
  };

  const askHint = () => {
    const it = nextToHint(items, covered, hinted);
    if (!it) return setHint('You have covered the whole checklist. Finish when ready.');
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

  const finish = (extraCovered: Record<string, Coverage> = {}, distractors: string[] = []) => {
    const all = [
      ...items.map((i) => ({ id: i.id, weight: i.weight, hasReason: !!section.tagPurpose && !!i.purpose })),
      ...extraScorable(extras, level),
    ];
    const result = buildRepResult({
      caseId: patientCase.id,
      kind: section.kind,
      level,
      items: all,
      covered: { ...covered, ...extraCovered },
      durationSec: finalSeconds(),
      targetSeconds: targetSeconds + extras.length * 90,
      unmatched,
      distractors,
      transcript,
    });
    onDone({ ...result, sectionId: section.id, cards: cardResults(extras, extraCovered), tags: section.tagPurpose ? tags : undefined });
  };

  const turns = transcript.filter((l) => l.from === 'student').length;

  if (phase === 'extras' && extras.length) {
    return <ExtraQuestions extras={extras} level={level} seed={patientCase.id + section.id} header={header} onDone={finish} />;
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
                <Txt style={[type.small, { fontVariant: ['tabular-nums'] }]} color={elapsed > targetSeconds ? 'warn' : 'soft'}>
                  {mmss(elapsed)}
                </Txt>
              </Row>
            </Row>
          </Card>

          {counsel ? (
            <Txt style={type.small} color="soft">
              Counselling: explain the treatment in plain words. The patient will react and ask you things back.
            </Txt>
          ) : null}
          {section.tagPurpose ? (
            <Txt style={type.small} color="soft">
              After each question, tag what it was for: {PURPOSES.map((p) => PURPOSE_NAMES[p]).join(', ')}.
            </Txt>
          ) : null}

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
              Independent mode · {turns} {counsel ? 'turn' : 'question'}
              {turns === 1 ? '' : 's'}
            </Txt>
          )}

          {/* Transcript */}
          <View style={{ gap: space.sm }}>
            {transcript.map((l, i) => {
              const me = l.from === 'student';
              const footnote = l.itemIds?.length
                ? `✓ ${l.itemIds.map((id) => byId[id]?.label).join(', ')}`
                : counsel
                  ? ''
                  : 'Not recognised. Try rephrasing.';
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
                    {me && level < 3 && footnote ? (
                      <Txt style={[type.small, { marginTop: 4, opacity: 0.75 }]} color={t.bubbleMeInk}>
                        {footnote}
                      </Txt>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>

          {tagNote ? (
            <Card variant="alt" style={{ padding: space.lg, gap: 4 }}>
              <Row gap={space.sm} style={{ alignItems: 'flex-start' }}>
                <Icon name={tagNote.ok ? 'checkmark-circle' : 'close-circle'} size={18} color={tagNote.ok ? t.good : t.bad} />
                <View style={{ flex: 1, gap: 2 }}>
                  {tagNote.lines.map((line, i) => (
                    <Txt key={i} style={type.small}>
                      {line}
                    </Txt>
                  ))}
                </View>
              </Row>
            </Card>
          ) : null}

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
          {pendingTag ? (
            <View style={[styles.tagBox, { backgroundColor: t.surface, borderColor: t.accent }]}>
              <Txt style={type.bodyStrong}>What was that question for?</Txt>
              <Row gap={6} style={{ flexWrap: 'wrap' }}>
                {PURPOSES.map((p) => (
                  <Pressable
                    key={p}
                    accessibilityRole="button"
                    accessibilityLabel={`${PURPOSE_NAMES[p]}: ${PURPOSE_HELP[p]}`}
                    onPress={() => chooseTag(p)}
                    style={({ pressed }) => [styles.tagBtn, { backgroundColor: t.ink, opacity: pressed ? 0.75 : 1 }]}>
                    <Txt style={[type.small, { fontWeight: '700' }]} color={t.bg}>
                      {PURPOSE_NAMES[p]}
                    </Txt>
                  </Pressable>
                ))}
              </Row>
              {level < 3 ? (
                <Txt style={type.small} color="faint">
                  Exclude: rules out another cause. Risk factor: makes it likelier. Severity & safety: how bad, how urgent.
                </Txt>
              ) : null}
            </View>
          ) : null}
          {level === 1 && suggestions.length && !pendingTag ? (
            <View style={{ gap: 6 }}>
              {suggestions.slice(0, 2).map((s) => (
                <Pressable
                  key={s.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${counsel ? 'Say' : 'Ask'}: ${s.modelQuestion}`}
                  onPress={() => ask(s.modelQuestion, 'suggested')}
                  style={({ pressed }) => [
                    styles.suggestion,
                    { backgroundColor: t.surface, borderColor: t.line, opacity: pressed ? 0.7 : 1 },
                  ]}>
                  <Icon name={counsel ? 'chatbubble-outline' : 'chatbubble-ellipses-outline'} size={16} color={t.inkSoft} />
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
              placeholder={counsel ? 'Explain to the patient…' : 'Ask the patient a question…'}
              placeholderTextColor={t.inkFaint}
              returnKeyType="send"
              submitBehavior="submit"
              accessibilityLabel={counsel ? 'What you say' : 'Your question'}
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
            <Button
              label={counsel ? 'Say' : 'Ask'}
              small
              onPress={() => ask(input)}
              disabled={!input.trim()}
              style={{ paddingVertical: 12 }}
            />
          </View>
          <Row style={{ justifyContent: 'flex-end' }}>
            <Button
              label={counsel ? 'End session' : extras.length ? 'Done asking' : 'Finish rep'}
              variant="ghost"
              small
              icon="flag-outline"
              disabled={turns === 0}
              onPress={() => (extras.length ? setPhase('extras') : finish())}
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
  tagBox: { borderWidth: 2, borderRadius: radius.md, padding: space.md, gap: space.sm },
  tagBtn: { borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 9 },
  composer: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: space.sm, paddingBottom: space.sm },
});
