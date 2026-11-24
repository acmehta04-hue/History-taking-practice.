import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Button, Card, Chip, Icon, Row, Screen, SectionHeader, Txt } from '@/components/ui';
import { specialties, specialtyById } from '@/content';
import {
  activePlacement,
  type CalendarEvent,
  dayKey,
  daysBetween,
  EXAM_MODE_DAYS,
  type EventKind,
  inRange,
  monthGrid,
  nextExam,
  parseDay,
} from '@/engine/calendar';
import { useStore } from '@/store';
import { radius, space, type, useTheme } from '@/theme';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const EXAM_PRESETS = ['OSCE', 'Mock OSCE', 'UKMLA AKT', 'UKMLA CPSA', 'Finals'];

interface Draft {
  kind: EventKind;
  title: string;
  specialtyId?: string;
  start?: string;
  end?: string;
}

const fmt = (key: string) => parseDay(key).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

/** What to focus on, by distance to the next exam */
function phaseAdvice(daysToExam?: number): { title: string; body: string } {
  if (daysToExam === undefined)
    return {
      title: 'Build blocks',
      body: 'No exam on the calendar. Work through Foundation → Application → Challenge sets, starting with your placement specialty.',
    };
  if (daysToExam > 56)
    return {
      title: 'Build blocks',
      body: `${daysToExam} days to go. Master single blocks on your current placement; aim for 1 set a day.`,
    };
  if (daysToExam > EXAM_MODE_DAYS)
    return {
      title: 'Combine',
      body: `${daysToExam} days to go. Move into combined drills (HPC + Systems, Ddx → Ix → Mx) and Challenge sets.`,
    };
  return {
    title: 'Exam mode',
    body: `${daysToExam} days to go. Clear due reviews, mix specialties, and run full stations. Home now suggests these first.`,
  };
}

export default function Plan() {
  const t = useTheme();
  const events = useStore((s) => s.events);
  const sets = useStore((s) => s.sets);
  const addEvent = useStore((s) => s.addEvent);
  const removeEvent = useStore((s) => s.removeEvent);

  const today = dayKey(new Date());
  const [cursor, setCursor] = useState(() => ({ y: new Date().getFullYear(), m: new Date().getMonth() }));
  const [draft, setDraft] = useState<Draft | null>(null);
  const [selected, setSelected] = useState<string>(today);

  const grid = useMemo(() => monthGrid(cursor.y, cursor.m), [cursor]);
  const practised = useMemo(() => new Set(sets.map((s) => dayKey(new Date(s.finishedAt)))), [sets]);
  const placement = activePlacement(events, today);
  const exam = nextExam(events, today);
  const daysToExam = exam ? daysBetween(today, exam.start) : undefined;
  const advice = phaseAdvice(daysToExam);
  const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const shift = (n: number) => setCursor(({ y, m }) => ({ y: m + n < 0 ? y - 1 : m + n > 11 ? y + 1 : y, m: (m + n + 12) % 12 }));

  const tapDay = (key: string) => {
    setSelected(key);
    if (!draft) return;
    if (draft.kind === 'exam') return setDraft({ ...draft, start: key, end: key });
    if (!draft.start || (draft.start && draft.end)) return setDraft({ ...draft, start: key, end: undefined });
    if (key < draft.start) return setDraft({ ...draft, start: key, end: draft.start });
    setDraft({ ...draft, end: key });
  };

  const save = () => {
    if (!draft?.start) return;
    addEvent({
      kind: draft.kind,
      title: draft.title.trim() || (draft.kind === 'exam' ? 'Exam' : 'Placement'),
      specialtyId: draft.specialtyId,
      start: draft.start,
      end: draft.end ?? draft.start,
    });
    setDraft(null);
  };

  const toneFor = (e: CalendarEvent) => t.tones[specialtyById[e.specialtyId ?? '']?.tone ?? 'sky'];
  const draftRange = draft?.start ? { start: draft.start, end: draft.end ?? draft.start } : undefined;
  const selectedEvents = events.filter((e) => inRange(selected, e));

  return (
    <Screen>
      <View style={{ marginTop: space.sm }}>
        <Txt style={type.display}>Plan</Txt>
        <Txt color="soft">
          Add your placements and exams. Home steers drills to your current placement and switches to exam mode 4 weeks out.
        </Txt>
      </View>

      {/* Where you are now */}
      <Card variant="hero" style={{ gap: space.sm }}>
        <Txt style={type.tiny} color="heroSoft">
          Now · {advice.title}
        </Txt>
        <Txt style={type.heading} color="hero">
          {placement ? `${placement.title} placement` : 'No placement today'}
          {exam ? ` · ${exam.title} ${daysToExam === 0 ? 'today' : `in ${daysToExam} days`}` : ''}
        </Txt>
        <Txt color="heroSoft">{advice.body}</Txt>
      </Card>

      {/* Calendar */}
      <Card style={{ gap: space.md, paddingHorizontal: space.md }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous month"
            onPress={() => shift(-1)}
            hitSlop={10}
            style={styles.navBtn}>
            <Icon name="chevron-back" />
          </Pressable>
          <Txt style={type.heading}>{monthLabel}</Txt>
          <Pressable accessibilityRole="button" accessibilityLabel="Next month" onPress={() => shift(1)} hitSlop={10} style={styles.navBtn}>
            <Icon name="chevron-forward" />
          </Pressable>
        </Row>

        <View style={styles.grid}>
          {WEEKDAYS.map((d, i) => (
            <View key={`h${i}`} style={styles.cell}>
              <Txt style={type.tiny} color="faint">
                {d}
              </Txt>
            </View>
          ))}
          {grid.map(({ key, inMonth }) => {
            const place = events.find((e) => e.kind === 'placement' && inRange(key, e));
            const isExam = events.some((e) => e.kind === 'exam' && inRange(key, e));
            const inDraft = draftRange && key >= draftRange.start && key <= draftRange.end;
            const isToday = key === today;
            const isSel = key === selected;
            const tone = place ? toneFor(place) : undefined;
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={`${parseDay(key).toDateString()}${place ? `, ${place.title} placement` : ''}${isExam ? ', exam' : ''}`}
                onPress={() => tapDay(key)}
                style={styles.cell}>
                <View
                  style={[
                    styles.day,
                    tone && { backgroundColor: tone.bg },
                    inDraft && { backgroundColor: t.accent },
                    isExam && { backgroundColor: t.tones.coral.strong },
                    (isToday || isSel) && { borderWidth: 2, borderColor: isSel ? t.ink : t.inkFaint },
                    { opacity: inMonth ? 1 : 0.35 },
                  ]}>
                  <Txt
                    style={[type.small, { fontWeight: isToday || isExam ? '800' : '500' }]}
                    color={isExam ? '#FFFFFF' : inDraft ? t.accentInk : tone ? tone.ink : t.ink}>
                    {parseDay(key).getDate()}
                  </Txt>
                  {practised.has(key) ? <View style={[styles.dot, { backgroundColor: isExam ? '#FFFFFF' : t.good }]} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        <Row gap={space.md} style={{ flexWrap: 'wrap' }}>
          <Legend swatch={t.tones.lilac.bg} label="Placement" />
          <Legend swatch={t.tones.coral.strong} label="Exam" />
          <Legend dot={t.good} label="Practised" />
        </Row>

        {!draft ? (
          selectedEvents.length ? (
            <View style={{ gap: 6 }}>
              {selectedEvents.map((e) => (
                <Txt key={e.id} style={type.small} color="soft">
                  {fmt(selected)}: {e.title}
                  {e.kind === 'placement' ? ` placement (${fmt(e.start)} – ${fmt(e.end)})` : ''}
                </Txt>
              ))}
            </View>
          ) : null
        ) : null}
      </Card>

      {/* Add */}
      {draft ? (
        <Card style={{ gap: space.md }}>
          <Txt style={type.heading}>{draft.kind === 'placement' ? 'New placement' : 'New exam'}</Txt>
          {draft.kind === 'placement' ? (
            <Row gap={6} style={{ flexWrap: 'wrap' }}>
              {specialties.map((s) => (
                <Chip
                  key={s.id}
                  label={s.title}
                  active={draft.specialtyId === s.id}
                  onPress={() => setDraft({ ...draft, specialtyId: s.id, title: s.title })}
                />
              ))}
            </Row>
          ) : (
            <Row gap={6} style={{ flexWrap: 'wrap' }}>
              {EXAM_PRESETS.map((x) => (
                <Chip key={x} label={x} active={draft.title === x} onPress={() => setDraft({ ...draft, title: x })} />
              ))}
            </Row>
          )}
          <TextInput
            value={draft.title}
            onChangeText={(v) => setDraft({ ...draft, title: v })}
            placeholder={draft.kind === 'placement' ? 'Placement name, e.g. Psychiatry' : 'Exam name'}
            placeholderTextColor={t.inkFaint}
            accessibilityLabel="Name"
            style={[type.body, styles.input, { color: t.ink, backgroundColor: t.surfaceAlt }]}
          />
          <Row gap={space.sm} style={{ alignItems: 'flex-start' }}>
            <Icon name="hand-left-outline" size={18} color={t.inkSoft} />
            <Txt style={{ flex: 1 }} color="soft">
              {draft.kind === 'exam'
                ? draft.start
                  ? `Exam on ${fmt(draft.start)}.`
                  : 'Tap the exam day on the calendar.'
                : !draft.start
                  ? 'Tap the first day of the placement on the calendar.'
                  : !draft.end
                    ? `Starts ${fmt(draft.start)}. Now tap the last day.`
                    : `${fmt(draft.start)} – ${fmt(draft.end)} (${daysBetween(draft.start, draft.end) + 1} days).`}
            </Txt>
          </Row>
          <Row gap={space.sm}>
            <Button
              label="Save"
              small
              icon="checkmark"
              onPress={save}
              disabled={!draft.start || (draft.kind === 'placement' && !draft.end)}
            />
            <Button label="Cancel" small variant="ghost" onPress={() => setDraft(null)} />
          </Row>
        </Card>
      ) : (
        <Row gap={space.sm}>
          <Button
            label="Add placement"
            small
            icon="medkit-outline"
            variant="secondary"
            onPress={() => setDraft({ kind: 'placement', title: '' })}
          />
          <Button
            label="Add exam"
            small
            icon="calendar-outline"
            variant="secondary"
            onPress={() => setDraft({ kind: 'exam', title: 'OSCE' })}
          />
        </Row>
      )}

      {/* List */}
      {events.length ? (
        <>
          <SectionHeader title="Your calendar" />
          {[...events]
            .sort((a, b) => a.start.localeCompare(b.start))
            .map((e) => (
              <Card key={e.id} style={{ padding: space.lg }}>
                <Row>
                  <View style={[styles.swatch, { backgroundColor: e.kind === 'exam' ? t.tones.coral.strong : toneFor(e).bg }]} />
                  <View style={{ flex: 1 }}>
                    <Txt style={type.bodyStrong}>
                      {e.title}
                      {e.kind === 'placement' ? ' placement' : ''}
                    </Txt>
                    <Txt style={type.small} color="soft">
                      {e.start === e.end ? fmt(e.start) : `${fmt(e.start)} – ${fmt(e.end)}`}
                      {e.end < today ? ' · past' : inRange(today, e) ? ' · now' : ''}
                    </Txt>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${e.title}`}
                    onPress={() => removeEvent(e.id)}
                    hitSlop={10}>
                    <Icon name="trash-outline" size={18} color={t.inkFaint} />
                  </Pressable>
                </Row>
              </Card>
            ))}
        </>
      ) : null}
    </Screen>
  );
}

function Legend({ swatch, dot, label }: { swatch?: string; dot?: string; label: string }) {
  return (
    <Row gap={6}>
      {swatch ? <View style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: swatch }} /> : null}
      {dot ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: dot }} /> : null}
      <Txt style={type.small} color="soft">
        {label}
      </Txt>
    </Row>
  );
}

const styles = StyleSheet.create({
  navBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.2857%', aspectRatio: 1, padding: 2, alignItems: 'center', justifyContent: 'center' },
  day: { width: '100%', height: '100%', borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 2 },
  input: { borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 10 },
  swatch: { width: 12, height: 36, borderRadius: 6 },
});
