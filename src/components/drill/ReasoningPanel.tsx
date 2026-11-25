import { useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import type { AssistLevel, Distractor, ReasonItem } from '../../content/types';
import { matchEntry } from '../../engine/matcher';
import type { Coverage, Method } from '../../engine/scoring';
import type { EntryLine } from '../../store';
import { radius, space, type, useTheme } from '../../theme';
import { Button, Card, Chip, Icon, Row, Txt } from '../ui';
import { nextToHint, seededShuffle, tap } from './shared';

export interface ReasoningOutcome {
  covered: Record<string, Coverage>;
  entries: EntryLine[];
  distractors: string[];
}

/**
 * Free-text reasoning: one differential / investigation / step per line.
 *  L1 Guided     — option chips (with distractors); tapping one pre-fills "Option — " for you to add the reason
 *  L2 Prompted   — how many items are expected per category, plus hints
 *  L3 Independent — blank page; hints cost points
 */
export function ReasoningPanel({
  seed,
  items,
  distractors = [],
  level,
  prompt,
  finishLabel,
  onFinish,
  placeholder,
}: {
  seed: string;
  items: ReasonItem[];
  distractors?: Distractor[];
  level: AssistLevel;
  prompt: string;
  finishLabel: string;
  onFinish: (o: ReasoningOutcome) => void;
  placeholder?: string;
}) {
  const t = useTheme();
  const [input, setInput] = useState('');
  const [chosen, setChosen] = useState<string | null>(null);
  const [entries, setEntries] = useState<EntryLine[]>([]);
  const [covered, setCovered] = useState<Record<string, Coverage>>({});
  const [hinted, setHinted] = useState<Set<string>>(new Set());
  const [hint, setHint] = useState<string | null>(null);
  const [picked, setPicked] = useState<string[]>([]);

  const options = useMemo(
    () => seededShuffle([...items.map((i) => i.label), ...distractors.map((d) => d.label)], seed),
    [items, distractors, seed],
  );

  const categories = useMemo(() => {
    const m = new Map<string, { total: number; done: number }>();
    for (const it of items) {
      const k = it.category ?? (it.weight === 'redflag' ? 'Must-not-miss' : it.weight === 'core' ? 'Core' : 'Extra credit');
      const v = m.get(k) ?? { total: 0, done: 0 };
      v.total++;
      if (covered[it.id]) v.done++;
      m.set(k, v);
    }
    return [...m.entries()];
  }, [items, covered]);

  const submit = () => {
    const reason = input.trim();
    const text = chosen ? (reason ? `${chosen} — ${reason}` : chosen) : reason;
    if (!text) return;
    const m = matchEntry(text, items, distractors);
    const method: Method = chosen ? 'suggested' : 'typed';
    const next = { ...covered };
    for (const it of m.items) {
      const prev = next[it.id];
      const reason = !!m.reasonHits[it.id];
      if (!prev) next[it.id] = { method: hinted.has(it.id) && method === 'typed' ? 'hinted' : method, reason };
      else if (reason && !prev.reason) next[it.id] = { ...prev, reason: true };
    }
    if (m.items.length) tap();
    if (m.distractor) setPicked((p) => [...p, m.distractor!.label]);
    setCovered(next);
    setEntries((e) => [...e, { text, itemIds: m.items.map((i) => i.id), distractor: m.distractor?.label }]);
    setInput('');
    setChosen(null);
    if (hint && m.items.length) setHint(null);
  };

  const askHint = () => {
    const it = nextToHint(items, covered, hinted);
    if (!it) return setHint('You have covered everything in the model answer.');
    setHinted(new Set(hinted).add(it.id));
    setHint(it.why);
  };

  const remove = (i: number) => {
    // removing an entry does not un-cover items — keeps the scoring simple and forgiving
    setEntries((e) => e.filter((_, j) => j !== i));
  };

  const feedback = (e: EntryLine) => {
    if (level === 3) return null;
    if (e.distractor) return <Chip label="Not first line" tone="warn" icon="alert-circle-outline" />;
    if (e.itemIds.length) return <Chip label="In model answer" tone="good" icon="checkmark" />;
    return <Chip label="Not recognised" icon="help-outline" />;
  };

  return (
    <View style={{ gap: space.md }}>
      <Txt style={type.bodyStrong}>{prompt}</Txt>

      {level === 2 ? (
        <Row gap={6} style={{ flexWrap: 'wrap' }}>
          {categories.map(([k, v]) => (
            <Chip key={k} label={`${k} ${v.done}/${v.total}`} tone={v.done === v.total ? 'good' : undefined} />
          ))}
        </Row>
      ) : null}

      {level === 1 ? (
        <View style={{ gap: 6 }}>
          <Txt style={type.tiny} color="faint">
            Tap an option (add the reason if you can)
          </Txt>
          <Row gap={6} style={{ flexWrap: 'wrap' }}>
            {options.map((o) => (
              <Chip key={o} label={o} active={chosen === o} onPress={() => setChosen(chosen === o ? null : o)} />
            ))}
          </Row>
        </View>
      ) : null}

      {entries.length ? (
        <Card style={{ padding: space.lg, gap: space.sm }}>
          {entries.map((e, i) => (
            <Row key={`${e.text}-${i}`} style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Txt style={{ flex: 1 }}>
                {i + 1}. {e.text}
              </Txt>
              <Row gap={6}>
                {feedback(e)}
                <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${e.text}`} hitSlop={8} onPress={() => remove(i)}>
                  <Icon name="close" size={16} color={t.inkFaint} />
                </Pressable>
              </Row>
            </Row>
          ))}
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

      {chosen ? (
        <Row gap={6}>
          <Txt style={type.small} color="soft">
            Adding:
          </Txt>
          <Chip label={chosen} active icon="close" onPress={() => setChosen(null)} />
        </Row>
      ) : null}
      <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'flex-end' }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          onSubmitEditing={submit}
          placeholder={chosen ? 'Why? e.g. likely theatre' : (placeholder ?? 'e.g. FBC — anaemia from blood loss')}
          placeholderTextColor={t.inkFaint}
          returnKeyType="send"
          submitBehavior="submit"
          accessibilityLabel="Your answer"
          style={[
            type.body,
            {
              flex: 1,
              color: t.ink,
              backgroundColor: t.surface,
              borderRadius: radius.md,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: t.line,
            },
          ]}
        />
        <Button label="Add" small onPress={submit} disabled={!input.trim() && !chosen} style={{ paddingVertical: 12 }} />
      </View>

      <Row style={{ justifyContent: 'space-between' }}>
        {level > 1 ? <Button label="Hint" icon="bulb-outline" variant="secondary" small onPress={askHint} /> : <View />}
        <Button
          label={finishLabel}
          icon="checkmark-done"
          small
          onPress={() => onFinish({ covered, entries, distractors: picked })}
          disabled={!entries.length}
        />
      </Row>
      {entries.length ? null : (
        <Txt style={type.small} color="faint">
          Add at least one line to finish.
        </Txt>
      )}
    </View>
  );
}
