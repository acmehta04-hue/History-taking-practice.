import { useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import type { AssistLevel, Distractor, ReasonItem } from '../../content/types';
import { matchEntry } from '../../engine/matcher';
import type { Coverage } from '../../engine/scoring';
import type { EntryLine } from '../../store';
import { radius, space, type, useTheme } from '../../theme';
import { Button, Chip, Icon, type IconName, Row, Txt } from '../ui';
import { nextToHint, seededShuffle, tap } from './shared';

export interface ReasoningOutcome {
  covered: Record<string, Coverage>;
  entries: EntryLine[];
  distractors: string[];
}

interface PanelProps {
  seed: string;
  items: ReasonItem[];
  distractors?: Distractor[];
  level: AssistLevel;
  /** The question: the quiz stem, or the examiner's first message */
  prompt: string;
  finishLabel: string;
  onFinish: (o: ReasoningOutcome) => void;
  placeholder?: string;
  /** One answer only (spot the diagnosis) */
  single?: boolean;
  /** What a wrong-but-plausible option is called */
  wrongLabel?: string;
  /** Wrong options are only offered in the quiz; typed answers at L2/L3 are checked against the model answer alone */
  guidedOnlyDistractors?: boolean;
}

/**
 * Reasoning answers (differentials, investigations, management, viva, prescribing):
 *  L1 Guided       — a multiple-choice quiz: tick the right options, check, then see why
 *  L2 Prompted     — a text chat with the examiner, who says what landed and nudges
 *  L3 Independent  — the same chat, but the examiner gives nothing away until the end
 */
export function ReasoningPanel(props: PanelProps) {
  return props.level === 1 ? <QuizPanel {...props} /> : <ChatPanel {...props} />;
}

/* ------------------------------------------------------------------ */
/* Guided: multiple choice                                              */
/* ------------------------------------------------------------------ */

type Option = { key: string; label: string; item?: ReasonItem; distractor?: Distractor };
type Look = { icon: IconName; bg: string; border: string; colour: string; verdict?: string; note?: string };

function QuizPanel({ seed, items, distractors = [], prompt, finishLabel, onFinish, single, wrongLabel = 'Not first line' }: PanelProps) {
  const t = useTheme();
  const options = useMemo<Option[]>(
    () =>
      seededShuffle<Option>(
        [
          ...items.map((item) => ({ key: `i:${item.id}`, label: item.label, item })),
          ...distractors.map((distractor, k) => ({ key: `d:${k}`, label: distractor.label, distractor })),
        ],
        seed,
      ),
    [items, distractors, seed],
  );
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [checked, setChecked] = useState(false);

  const toggle = (key: string) => {
    if (checked) return;
    tap();
    if (single) return setPicked(new Set([key]));
    const next = new Set(picked);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setPicked(next);
  };

  const chosen = options.filter((o) => picked.has(o.key));
  const right = chosen.filter((o) => o.item).length;
  const wrong = chosen.filter((o) => o.distractor).length;

  const finish = () => {
    const covered: Record<string, Coverage> = {};
    for (const o of chosen) if (o.item) covered[o.item.id] = { method: 'suggested' };
    onFinish({
      covered,
      entries: chosen.map((o) => ({ text: o.label, itemIds: o.item ? [o.item.id] : [], distractor: o.distractor?.label })),
      distractors: chosen.filter((o) => o.distractor).map((o) => o.distractor!.label),
    });
  };

  const look = (o: Option, on: boolean): Look => {
    if (!checked)
      return {
        icon: single ? (on ? 'radio-button-on' : 'radio-button-off') : on ? 'checkbox' : 'square-outline',
        bg: t.surface,
        border: on ? t.ink : t.line,
        colour: on ? t.ink : t.inkFaint,
      };
    if (o.item && on) return { icon: 'checkmark-circle', bg: t.goodBg, border: t.good, colour: t.good, verdict: 'Right', note: o.item.why };
    if (o.item) return { icon: 'alert-circle', bg: t.warnBg, border: t.warn, colour: t.warn, verdict: 'Missed', note: o.item.why };
    if (on) return { icon: 'close-circle', bg: t.badBg, border: t.bad, colour: t.bad, verdict: wrongLabel, note: o.distractor?.whyNot };
    return {
      icon: 'remove-circle-outline',
      bg: t.surface,
      border: t.line,
      colour: t.inkFaint,
      verdict: 'Rightly left out',
      note: o.distractor?.whyNot,
    };
  };

  return (
    <View style={{ gap: space.md }}>
      {prompt ? <Txt style={type.bodyStrong}>{prompt}</Txt> : null}
      <Txt style={type.tiny} color="faint">
        {single ? 'Pick one' : 'Select all that apply'}
      </Txt>
      <View style={{ gap: space.sm }}>
        {options.map((o) => {
          const on = picked.has(o.key);
          const l = look(o, on);
          return (
            <Pressable
              key={o.key}
              accessibilityRole={single ? 'radio' : 'checkbox'}
              accessibilityState={{ checked: on, disabled: checked }}
              accessibilityLabel={o.label}
              onPress={() => toggle(o.key)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                gap: space.md,
                alignItems: 'flex-start',
                padding: space.md,
                borderRadius: radius.md,
                borderWidth: on && !checked ? 2 : 1,
                borderColor: l.border,
                backgroundColor: l.bg,
                opacity: pressed && !checked ? 0.8 : 1,
              })}>
              <Icon name={l.icon} size={22} color={l.colour} />
              <View style={{ flex: 1, gap: 2 }}>
                <Txt style={on ? type.bodyStrong : type.body}>{o.label}</Txt>
                {l.verdict ? (
                  <Txt style={[type.small, { fontWeight: '700' }]} color={l.colour}>
                    {l.verdict}
                  </Txt>
                ) : null}
                {l.note ? (
                  <Txt style={type.small} color="soft">
                    {l.note}
                  </Txt>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
      {checked ? (
        <View style={{ gap: space.sm }}>
          <Txt style={type.bodyStrong}>
            {right} of {items.length} right{wrong ? ` · ${wrong} wrong option${wrong > 1 ? 's' : ''} chosen` : ''}
          </Txt>
          <Button label={finishLabel} icon="arrow-forward" onPress={finish} />
        </View>
      ) : (
        <View style={{ gap: space.sm }}>
          <Button label="Check" icon="checkmark-done" onPress={() => setChecked(true)} disabled={!picked.size} />
          <Txt style={type.small} color="faint">
            Guided level: get 80% right to move on to answering in your own words.
          </Txt>
        </View>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Prompted and Independent: a chat with the examiner                   */
/* ------------------------------------------------------------------ */

type Msg = { from: 'examiner' | 'me'; text: string; tone?: 'good' | 'warn' | 'bad' };

const QUIET = ['Okay.', 'Go on.', 'Noted. Anything else?', 'Mm-hm.', 'Right.'];

function ChatPanel({
  items,
  distractors = [],
  level,
  prompt,
  finishLabel,
  onFinish,
  placeholder,
  single = false,
  wrongLabel = 'Not first line',
  guidedOnlyDistractors = false,
}: PanelProps) {
  const t = useTheme();
  const [msgs, setMsgs] = useState<Msg[]>(prompt ? [{ from: 'examiner', text: prompt }] : []);
  const [input, setInput] = useState('');
  const [entries, setEntries] = useState<EntryLine[]>([]);
  const [covered, setCovered] = useState<Record<string, Coverage>>({});
  const [hinted, setHinted] = useState<Set<string>>(new Set());
  const [picked, setPicked] = useState<string[]>([]);
  const quiet = level === 3;
  const active = guidedOnlyDistractors ? [] : distractors;
  const full = single && entries.length > 0;

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

  const send = () => {
    const text = input.trim();
    if (!text || full) return;
    const m = matchEntry(text, items, active);
    const next = { ...covered };
    const gained: ReasonItem[] = [];
    let reasonAdded = false;
    for (const it of m.items) {
      const prev = next[it.id];
      const reason = !!m.reasonHits[it.id];
      if (!prev) {
        next[it.id] = { method: hinted.has(it.id) ? 'hinted' : 'typed', reason };
        gained.push(it);
      } else if (reason && !prev.reason) {
        next[it.id] = { ...prev, reason: true };
        reasonAdded = true;
      }
    }
    if (gained.length) tap();
    if (m.distractor) setPicked((p) => [...p, m.distractor!.label]);
    setCovered(next);
    setEntries((e) => [...e, { text, itemIds: m.items.map((i) => i.id), distractor: m.distractor?.label }]);

    let reply: Msg;
    if (quiet) reply = { from: 'examiner', text: single ? 'Thank you.' : QUIET[entries.length % QUIET.length] };
    else if (m.distractor) reply = { from: 'examiner', text: `${wrongLabel}: ${m.distractor.whyNot}`, tone: 'bad' };
    else if (gained.length) {
      const needsWhy = gained.some((g) => g.reasonMatch && !next[g.id].reason);
      const gaveWhy = gained.some((g) => next[g.id].reason);
      reply = {
        from: 'examiner',
        tone: 'good',
        text:
          `${single ? 'Correct' : 'Yes'}: ${gained.map((g) => g.label).join('; ')}.` +
          (gaveWhy ? ' Good reasoning.' : needsWhy ? ' Why?' : '') +
          (single ? '' : ` (${Object.keys(next).length} of ${items.length})`),
      };
    } else if (reasonAdded) reply = { from: 'examiner', text: 'Good, that’s the reason.', tone: 'good' };
    else if (m.items.length) reply = { from: 'examiner', text: 'You’ve already said that one.' };
    else
      reply = {
        from: 'examiner',
        text: single ? 'That’s not the answer I was looking for.' : 'I’m not sure that’s in my answer. Can you put it another way?',
        tone: 'warn',
      };
    setMsgs((ms) => [...ms, { from: 'me', text }, reply]);
    setInput('');
  };

  const askHint = () => {
    const it = nextToHint(items, covered, hinted);
    if (!it) return setMsgs((ms) => [...ms, { from: 'examiner', text: 'You’ve covered everything I was looking for.' }]);
    setHinted(new Set(hinted).add(it.id));
    setMsgs((ms) => [...ms, { from: 'examiner', text: `A nudge: ${it.hint ?? it.why}`, tone: 'warn' }]);
  };

  const toneColour = (tone?: Msg['tone']) => (tone === 'good' ? t.good : tone === 'bad' ? t.bad : tone === 'warn' ? t.warn : undefined);

  return (
    <View style={{ gap: space.md }}>
      {level === 2 && !single ? (
        <Row gap={6} style={{ flexWrap: 'wrap' }}>
          {categories.map(([k, v]) => (
            <Chip key={k} label={`${k} ${v.done}/${v.total}`} tone={v.done === v.total ? 'good' : undefined} />
          ))}
        </Row>
      ) : null}

      <View style={{ gap: space.sm }}>
        {msgs.map((msg, i) => {
          const me = msg.from === 'me';
          const accent = toneColour(msg.tone);
          return (
            <View key={i} style={{ flexDirection: 'row', justifyContent: me ? 'flex-end' : 'flex-start' }}>
              <View
                style={[
                  { maxWidth: '88%', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, gap: 2 },
                  me
                    ? { backgroundColor: t.bubbleMe, borderBottomRightRadius: 6 }
                    : {
                        backgroundColor: t.bubbleThem,
                        borderBottomLeftRadius: 6,
                        borderWidth: t.dark && !accent ? 0 : 1,
                        borderColor: accent ?? t.line,
                      },
                ]}>
                {!me && i === 0 ? (
                  <Txt style={type.tiny} color="faint">
                    Examiner
                  </Txt>
                ) : null}
                <Txt color={me ? t.bubbleMeInk : t.ink}>{msg.text}</Txt>
              </View>
            </View>
          );
        })}
      </View>

      {full ? null : (
        <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'flex-end' }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            onSubmitEditing={send}
            placeholder={placeholder ?? (single ? 'Your answer, then why' : 'e.g. FBC — anaemia from blood loss')}
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
                borderRadius: radius.pill,
                paddingHorizontal: 18,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: t.line,
              },
            ]}
          />
          <Button label="Send" small onPress={send} disabled={!input.trim()} style={{ paddingVertical: 12 }} />
        </View>
      )}

      <Row style={{ justifyContent: 'space-between' }}>
        {!full ? <Button label="Hint" icon="bulb-outline" variant="secondary" small onPress={askHint} /> : <View />}
        <Button
          label={finishLabel}
          icon="checkmark-done"
          small
          variant={entries.length ? 'primary' : 'secondary'}
          onPress={() => onFinish({ covered, entries, distractors: picked })}
          disabled={!entries.length}
        />
      </Row>
      {entries.length ? null : (
        <Txt style={type.small} color="faint">
          {single ? 'One answer: make it your best one.' : 'One point per message. Add the reason after a dash for extra credit.'}
        </Txt>
      )}
    </View>
  );
}
