import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Chip, Icon, LevelBadge, pct, Ring, Row, Screen, SectionHeader, Stat, Txt } from '@/components/ui';
import { deepDives, library, presentationsFor, programKey, specialties, specialtyById } from '@/content';
import { activePlacement, daysBetween, dayKey, nextExam, parseDay } from '@/engine/calendar';
import { dueCards } from '@/engine/flashcards';
import { SETS_PER_BLOCK } from '@/engine/progression';
import { dueNow, nextUp, relativeDue, specialtyMastery } from '@/engine/recommend';
import { average } from '@/engine/scoring';
import { STAGES, stageFor } from '@/engine/stages';
import { setsSince, streakDays, useStore } from '@/store';
import { space, type, useTheme } from '@/theme';

const WEEK = 7 * 86400000;

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export default function Home() {
  const t = useTheme();
  const sets = useStore((s) => s.sets);
  const programs = useStore((s) => s.programs);
  const events = useStore((s) => s.events);

  const pick = nextUp(programs, events);
  const today = dayKey(new Date());
  const placement = activePlacement(events, today);
  const exam = nextExam(events, today);
  const examIn = exam ? daysBetween(today, exam.start) : undefined;
  const due = dueNow(programs);
  const week = setsSince(sets, WEEK);
  const streak = streakDays(sets);
  const weekPoints = week.reduce((a, s) => a + s.points, 0);
  const weekAcc = average(week.map((s) => s.accuracy));
  const prog = pick.program;
  const setNo = Math.min((prog?.setsCompleted ?? 0) + 1, 99);
  const tip = library[new Date().getDate() % library.length];
  const vivaCards = useStore((s) => s.vivaCards);
  const vivaDue = dueCards(vivaCards).length;

  const start = (presentationId: string, sectionId: string) =>
    router.push({ pathname: '/drill/[presentationId]/[sectionId]', params: { presentationId, sectionId } });

  return (
    <Screen>
      {/* Header */}
      <Row style={{ justifyContent: 'space-between', marginTop: space.sm }}>
        <View>
          <Txt style={type.small} color="soft">
            {greeting()}
          </Txt>
          <Txt style={type.display}>Ready for reps?</Txt>
        </View>
        <View style={[styles.streak, { backgroundColor: t.surface }]} accessibilityLabel={`${streak} day streak`}>
          <Icon name="flame" size={18} color={streak > 0 ? t.tones.coral.strong : t.inkFaint} />
          <Txt style={type.bodyStrong}>{streak}</Txt>
        </View>
      </Row>

      {/* Calendar context */}
      {placement || exam ? (
        <Row gap={space.sm} style={{ flexWrap: 'wrap' }}>
          {placement ? (
            <Chip
              icon="medkit-outline"
              label={`On ${placement.title} until ${parseDay(placement.end).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`}
              onPress={() => router.push('/plan')}
            />
          ) : null}
          {exam && examIn !== undefined ? (
            <Chip
              icon="calendar-outline"
              tone={examIn <= 28 ? 'warn' : undefined}
              label={examIn === 0 ? `${exam.title} today` : `${exam.title} in ${examIn} day${examIn === 1 ? '' : 's'}`}
              onPress={() => router.push('/plan')}
            />
          ) : null}
        </Row>
      ) : null}

      {/* Hero: next set */}
      <Card variant="hero" style={{ gap: space.lg }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt style={type.tiny} color="heroSoft">
            {pick.reason ?? (pick.due ? 'Due today' : prog ? 'Continue' : 'Start here')}
          </Txt>
          <LevelBadge level={prog?.level ?? 1} onHero />
        </Row>
        <View style={{ gap: 4 }}>
          <Txt style={[type.title, { fontSize: 28 }]} color="hero">
            {pick.presentation.title}
          </Txt>
          <Txt style={type.bodyStrong} color="heroSoft">
            {pick.drill.title}
          </Txt>
        </View>
        <Row gap={6}>
          {Array.from({ length: SETS_PER_BLOCK }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.setDot,
                { backgroundColor: i < Math.min(prog?.setsCompleted ?? 0, SETS_PER_BLOCK) ? t.accent : 'rgba(255,255,255,0.18)' },
              ]}
            />
          ))}
          <Txt style={[type.small, { marginLeft: 6 }]} color="heroSoft">
            Set {setNo} · {STAGES[stageFor(prog?.setsCompleted ?? 0)].name} · ~{Math.round((pick.drill.targetSeconds * 3) / 60)} min
          </Txt>
        </Row>
        <Button label="Start set" icon="arrow-forward" variant="accent" onPress={() => start(pick.presentation.id, pick.drill.id)} />
      </Card>

      {/* Stats */}
      <Row gap={space.md} style={{ alignItems: 'stretch' }}>
        <Stat label="Points · 7d" value={String(weekPoints)} sub={`${week.length} sets`} />
        <Stat label="Accuracy · 7d" value={week.length ? pct(weekAcc) : '—'} sub="model answer covered" />
      </Row>

      {/* Viva flashcards */}
      {vivaDue ? (
        <Card onPress={() => router.push('/viva')} accessibilityLabel="Viva flashcards" style={{ padding: space.lg }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Txt style={type.tiny} color="faint">
                Viva flashcards
              </Txt>
              <Txt style={type.heading}>
                {vivaDue} question{vivaDue === 1 ? '' : 's'} due
              </Txt>
              <Txt style={type.small} color="soft">
                The ones you missed come back first.
              </Txt>
            </View>
            <Icon name="albums-outline" size={28} />
          </Row>
        </Card>
      ) : null}

      {/* Due */}
      {due.length > 1 ? (
        <>
          <SectionHeader title="Due for review" />
          <View style={{ gap: space.sm }}>
            {due.slice(1, 4).map((d) => (
              <Card
                key={programKey(d.presentation.id, d.drill.id)}
                onPress={() => start(d.presentation.id, d.drill.id)}
                style={{ padding: space.lg }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <Txt style={type.bodyStrong}>
                      {d.presentation.title} · {d.drill.short}
                    </Txt>
                    <Txt style={type.small} color="soft">
                      {relativeDue(d.program?.nextDueAt)}
                    </Txt>
                  </View>
                  <Icon name="play-circle" size={28} />
                </Row>
              </Card>
            ))}
          </View>
        </>
      ) : null}

      {/* Specialties */}
      <SectionHeader title="Your topics" action="See all" onAction={() => router.push('/topics')} />
      <View style={styles.grid}>
        {specialties.map((s) => {
          const ps = presentationsFor(s.id);
          const m = specialtyMastery(s.id, programs);
          const tone = t.tones[s.tone];
          const live = ps.length > 0;
          return (
            <View key={s.id} style={styles.gridItem}>
              <Card
                tone={s.tone}
                onPress={
                  live ? () => router.push({ pathname: '/presentation/[id]', params: { id: ps[0].id } }) : () => router.push('/topics')
                }
                accessibilityLabel={s.title}
                style={{ minHeight: 150, justifyContent: 'space-between', opacity: live ? 1 : 0.7 }}>
                <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={[styles.iconBubble, { backgroundColor: t.dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.55)' }]}>
                    <Icon name={s.icon as never} size={20} color={tone.ink} />
                  </View>
                  {live ? (
                    <Ring
                      value={m}
                      size={40}
                      stroke={5}
                      color={tone.strong}
                      track={t.dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.6)'}>
                      <Txt style={[type.small, { fontSize: 10, fontWeight: '800' }]} color={tone.ink}>
                        {Math.round(m * 100)}
                      </Txt>
                    </Ring>
                  ) : null}
                </Row>
                <View>
                  <Txt style={type.heading} color={tone.ink}>
                    {s.title}
                  </Txt>
                  <Txt style={type.small} color={tone.ink}>
                    {live
                      ? `${ps.length} presentation${ps.length > 1 ? 's' : ''} · ${ps.reduce((a, p) => a + p.sections.length, 0)} drills`
                      : 'Coming soon'}
                  </Txt>
                </View>
              </Card>
            </View>
          );
        })}
      </View>

      {/* Deep dives */}
      <SectionHeader title="Deep dives" action="All conditions" onAction={() => router.push('/topics')} />
      {deepDives.map((d) => {
        const sp = specialtyById[d.specialtyId];
        const tone = t.tones[sp.tone];
        const done = d.sections.filter((s) => programs[programKey(d.id, s.id)]).length;
        return (
          <Card
            key={d.id}
            tone={sp.tone}
            onPress={() => router.push({ pathname: '/deep/[id]', params: { id: d.id } })}
            style={{ gap: space.sm }}>
            <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Txt style={type.tiny} color={tone.ink}>
                  UKMLA condition · {done}/{d.sections.length} sets started
                </Txt>
                <Txt style={type.title} color={tone.ink}>
                  {d.title} → {d.deepDive?.treatment}
                </Txt>
                <Txt style={type.small} color={tone.ink}>
                  History with a purpose · management ladder · counselling · prescribing (PSA)
                </Txt>
              </View>
              <Icon name="arrow-forward-circle" size={28} color={tone.ink} />
            </Row>
          </Card>
        );
      })}

      {/* Learn */}
      <SectionHeader title="Learn in 3 minutes" action="Library" onAction={() => router.push('/library')} />
      <Card onPress={() => router.push({ pathname: '/learn/[id]', params: { id: tip.id } })} style={{ gap: space.sm }}>
        <Chip label={tip.kicker} icon="sparkles-outline" />
        <Txt style={type.heading}>{tip.title}</Txt>
        <Txt style={type.small} color="soft" numberOfLines={2}>
          {tip.blocks[0].points[0]}
        </Txt>
        <Txt style={type.small} color="faint">
          {tip.minutes} min read
        </Txt>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  streak: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999 },
  setDot: { width: 28, height: 6, borderRadius: 3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -space.sm / 2 },
  gridItem: { width: '50%', padding: space.sm / 2 },
  iconBubble: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
