import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { TextInput, View } from 'react-native';

import { Card, Chip, Icon, ProgressBar, Row, Screen, Txt } from '@/components/ui';
import {
  catalogueStats,
  conditions,
  conditionsInArea,
  deepDives,
  plannedDeepDives,
  patientsOf,
  presentations,
  presentationsInArea,
  programKey,
  specialties,
  specialtyById,
  syllabusPresentations,
} from '@/content';
import { matchesAny, normalise } from '@/engine/matcher';
import { mastery, specialtyMastery } from '@/engine/recommend';
import { useStore } from '@/store';
import { radius, space, type, useTheme } from '@/theme';

type Mode = 'area' | 'condition';

export default function Topics() {
  const t = useTheme();
  const programs = useStore((s) => s.programs);
  const [mode, setMode] = useState<Mode>('area');
  const [query, setQuery] = useState('');
  const stats = catalogueStats();

  const q = normalise(query);
  const results = useMemo(() => {
    if (q.length < 2) return null;
    const hit = (title: string, match: string[] = []) => normalise(title).includes(q) || matchesAny(q, match);
    return {
      presentations: syllabusPresentations.filter((p) => hit(p.title)).slice(0, 8),
      conditions: conditions.filter((c) => !c.helper && hit(c.title, c.match)).slice(0, 12),
    };
  }, [q]);

  const track = t.dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.55)';

  return (
    <Screen>
      <View style={{ marginTop: space.sm, gap: space.sm }}>
        <Txt style={type.display}>Drills</Txt>
        <Row gap={6} style={{ flexWrap: 'wrap' }}>
          <Chip label="By area" active={mode === 'area'} onPress={() => setMode('area')} />
          <Chip label="By condition (deep dive)" active={mode === 'condition'} onPress={() => setMode('condition')} />
        </Row>
        <Txt color="soft">
          {mode === 'area'
            ? 'The whole UKMLA syllabus: every area, every presentation, and the conditions each could be.'
            : 'Pick a UKMLA condition and follow it through: a history where every question has a reason, the management ladder, a counselling session, then prescribing (PSA style).'}
        </Txt>
      </View>

      {mode === 'condition' ? (
        <>
          {deepDives.map((p) => {
            const sp = specialtyById[p.specialtyId];
            const tone = t.tones[sp.tone];
            const m = p.sections.reduce((a, sec) => a + mastery(programs[programKey(p.id, sec.id)]), 0) / p.sections.length;
            return (
              <Card
                key={p.id}
                tone={sp.tone}
                onPress={() => router.push({ pathname: '/deep/[id]', params: { id: p.id } })}
                accessibilityLabel={`${p.title} deep dive`}
                style={{ gap: space.md }}>
                <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Txt style={type.tiny} color={tone.ink}>
                      Deep dive · {sp.short}
                    </Txt>
                    <Txt style={type.title} color={tone.ink}>
                      {p.title}
                    </Txt>
                    <Txt style={type.small} color={tone.ink}>
                      Treatment: {p.deepDive?.treatment}
                    </Txt>
                  </View>
                  <Icon name="arrow-forward-circle" size={28} color={tone.ink} />
                </Row>
                <Row gap={6} style={{ flexWrap: 'wrap' }}>
                  {p.sections.map((sec, i) => (
                    <Chip key={sec.id} label={`${i + 1}. ${sec.short}`} active={!!programs[programKey(p.id, sec.id)]} />
                  ))}
                </Row>
                <View style={{ gap: 6 }}>
                  <ProgressBar value={m} color={tone.strong} track={track} />
                  <Txt style={type.small} color={tone.ink}>
                    {p.cases.length} patients · 4 sets · {Math.round(m * 100)}% mastery
                  </Txt>
                </View>
              </Card>
            );
          })}
          <Txt style={type.heading}>Coming soon</Txt>
          <Row gap={6} style={{ flexWrap: 'wrap' }}>
            {plannedDeepDives.map((d) => (
              <Chip key={d.condition} label={`${d.condition} · ${d.treatment}`} icon="time-outline" dim />
            ))}
          </Row>
          <Txt style={type.small} color="soft">
            Every other condition has its own page (classic picture, how to confirm it, where it comes up): search for it under By area.
          </Txt>
        </>
      ) : (
        <>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: space.sm,
              backgroundColor: t.surface,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: t.line,
              paddingHorizontal: 14,
            }}>
            <Icon name="search-outline" size={18} color={t.inkFaint} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search presentations and conditions"
              placeholderTextColor={t.inkFaint}
              accessibilityLabel="Search the syllabus"
              autoCorrect={false}
              style={[type.body, { flex: 1, color: t.ink, paddingVertical: 12 }]}
            />
            {query ? <Chip label="Clear" onPress={() => setQuery('')} /> : null}
          </View>

          {results ? (
            <SearchResults results={results} />
          ) : (
            <>
              <Card variant="hero" style={{ gap: space.sm }}>
                <Txt style={type.tiny} color="heroSoft">
                  The syllabus map
                </Txt>
                <Txt style={type.title} color="hero">
                  {stats.areas} areas · {stats.presentations} presentations · {stats.conditions} conditions
                </Txt>
                <Txt color="heroSoft">
                  Every area has a differentials sprint and a spot-the-diagnosis drill, and every presentation a spot-the-cause drill.{' '}
                  {presentations.length} presentations have full history drills so far.
                </Txt>
              </Card>

              <Txt style={type.heading}>Full history drills</Txt>
              {presentations.map((p) => {
                const s = specialtyById[p.specialtyId];
                const tone = t.tones[s.tone];
                const sectionsDone = p.sections.filter((sec) => programs[programKey(p.id, sec.id)]).length;
                const m = p.sections.reduce((a, sec) => a + mastery(programs[programKey(p.id, sec.id)]), 0) / p.sections.length;
                return (
                  <Card
                    key={p.id}
                    tone={s.tone}
                    onPress={() => router.push({ pathname: '/presentation/[id]', params: { id: p.id } })}
                    accessibilityLabel={p.title}
                    style={{ gap: space.md }}>
                    <Row style={{ justifyContent: 'space-between' }}>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Txt style={type.tiny} color={tone.ink}>
                          {s.short}
                        </Txt>
                        <Txt style={type.title} color={tone.ink}>
                          {p.title}
                        </Txt>
                      </View>
                      <Icon name="arrow-forward-circle" size={28} color={tone.ink} />
                    </Row>
                    <Row gap={6} style={{ flexWrap: 'wrap' }}>
                      {p.sections.map((sec) => (
                        <Chip key={sec.id} label={sec.short} active={!!programs[programKey(p.id, sec.id)]} />
                      ))}
                    </Row>
                    <View style={{ gap: 6 }}>
                      <ProgressBar value={m} color={tone.strong} track={track} />
                      <Txt style={type.small} color={tone.ink}>
                        {patientsOf(p).length} patients · {sectionsDone}/{p.sections.length} drills started · {Math.round(m * 100)}% mastery
                      </Txt>
                    </View>
                  </Card>
                );
              })}

              <Txt style={type.heading}>All {specialties.length} areas</Txt>
              {specialties.map((s) => {
                const tone = t.tones[s.tone];
                const m = specialtyMastery(s.id, programs);
                const full = presentations.filter((p) => p.specialtyId === s.id).length;
                return (
                  <Card
                    key={s.id}
                    onPress={() => router.push({ pathname: '/area/[id]', params: { id: s.id } })}
                    accessibilityLabel={s.title}
                    style={{ gap: space.sm, paddingVertical: space.md }}>
                    <Row gap={space.md}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 14,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: tone.bg,
                        }}>
                        <Icon name={s.icon as never} size={20} color={tone.ink} />
                      </View>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Txt style={type.bodyStrong}>{s.title}</Txt>
                        <Txt style={type.small} color="soft">
                          {presentationsInArea(s.id).length} presentations · {conditionsInArea(s.id).length} conditions
                          {full ? ` · ${full} full drill${full > 1 ? 's' : ''}` : ''}
                        </Txt>
                      </View>
                      <Icon name="chevron-forward" size={18} color={t.inkFaint} />
                    </Row>
                    {m > 0 ? <ProgressBar value={m} color={tone.strong} height={6} /> : null}
                  </Card>
                );
              })}
            </>
          )}
        </>
      )}
    </Screen>
  );
}

function SearchResults({ results }: { results: { presentations: typeof syllabusPresentations; conditions: typeof conditions } }) {
  if (!results.presentations.length && !results.conditions.length)
    return (
      <Card variant="alt">
        <Txt>Nothing found. Try another name or an abbreviation (e.g. “PE”, “AF”).</Txt>
      </Card>
    );
  return (
    <View style={{ gap: space.md }}>
      {results.presentations.length ? (
        <View style={{ gap: space.sm }}>
          <Txt style={type.tiny} color="faint">
            Presentations
          </Txt>
          {results.presentations.map((p) => (
            <Card
              key={p.id}
              onPress={() => router.push({ pathname: '/area/[id]', params: { id: p.areas[0], focus: p.id } })}
              accessibilityLabel={p.title}
              style={{ paddingVertical: space.md }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Txt style={type.bodyStrong}>{p.title}</Txt>
                  <Txt style={type.small} color="soft">
                    {specialtyById[p.areas[0]]?.short} · {p.causes.length} causes
                  </Txt>
                </View>
                <Icon name="chevron-forward" size={18} />
              </Row>
            </Card>
          ))}
        </View>
      ) : null}
      {results.conditions.length ? (
        <View style={{ gap: space.sm }}>
          <Txt style={type.tiny} color="faint">
            Conditions
          </Txt>
          {results.conditions.map((c) => (
            <Card
              key={c.id}
              onPress={() => router.push({ pathname: '/condition/[id]', params: { id: c.id } })}
              accessibilityLabel={c.title}
              style={{ paddingVertical: space.md }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Txt style={type.bodyStrong}>{c.title}</Txt>
                  <Txt style={type.small} color="soft" numberOfLines={1}>
                    {c.key}
                  </Txt>
                </View>
                <Icon name="chevron-forward" size={18} />
              </Row>
            </Card>
          ))}
        </View>
      ) : null}
    </View>
  );
}
