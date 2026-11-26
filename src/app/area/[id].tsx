import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { DrillCard } from '@/components/DrillCard';
import { Button, Card, Chip, Icon, Row, Screen, SectionHeader, TopBar, Txt } from '@/components/ui';
import {
  areaDrillFor,
  conditionById,
  conditionsInArea,
  deepDives,
  getDrill,
  patientsOf,
  presentations,
  presentationsInArea,
  specialtyById,
  spotDrillFor,
  type SyllabusPresentation,
  type Weight,
} from '@/content';
import { CAUSE_CATEGORY } from '@/content/catalogue/drills';
import { space, type, useTheme } from '@/theme';

const ORDER: Weight[] = ['redflag', 'core', 'extra'];

/** A UKMLA area: its full history drills, its syllabus drills, and every presentation with what it could be */
export default function AreaScreen() {
  const { id, focus } = useLocalSearchParams<{ id: string; focus?: string }>();
  const t = useTheme();
  const area = specialtyById[id ?? ''];
  const [open, setOpen] = useState<string | null>(focus ?? null);
  const [allConditions, setAllConditions] = useState(false);

  if (!area) {
    return (
      <Screen>
        <TopBar title="Not found" />
        <Txt>That area does not exist.</Txt>
      </Screen>
    );
  }

  const tone = t.tones[area.tone];
  const drills = areaDrillFor(area.id)!;
  const sprint = getDrill(drills.id, 'sprint')!;
  const spot = getDrill(drills.id, 'spot')!;
  const built = presentations.filter((p) => p.specialtyId === area.id || p.ukmla.includes(area.title));
  const dives = deepDives.filter((p) => p.specialtyId === area.id);
  const sylPres = presentationsInArea(area.id);
  const conds = conditionsInArea(area.id).sort((a, b) => a.title.localeCompare(b.title));
  const shownConds = allConditions ? conds : conds.slice(0, 24);

  return (
    <Screen>
      <TopBar subtitle="UKMLA area of clinical practice" />

      <Card tone={area.tone} style={{ gap: space.md }}>
        <Row gap={space.md}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: t.dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.55)',
            }}>
            <Icon name={area.icon as never} size={24} color={tone.ink} />
          </View>
          <Txt style={[type.title, { flex: 1 }]} color={tone.ink}>
            {area.title}
          </Txt>
        </Row>
        <Txt color={tone.ink}>
          {sylPres.length} presentations · {conds.length} conditions
          {built.length ? ` · ${built.length} full history drill${built.length > 1 ? 's' : ''}` : ''}
        </Txt>
      </Card>

      {built.length || dives.length ? (
        <>
          <SectionHeader title="Full history drills" />
          {built.map((p) => (
            <Card key={p.id} onPress={() => router.push({ pathname: '/presentation/[id]', params: { id: p.id } })} style={{ gap: 4 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt style={type.heading}>{p.title}</Txt>
                  <Txt style={type.small} color="soft">
                    {patientsOf(p).length} scripted patients · {p.sections.length} blocks · {p.combos.length} combined drills
                  </Txt>
                </View>
                <Icon name="arrow-forward-circle" size={26} />
              </Row>
            </Card>
          ))}
          {dives.map((p) => (
            <Card key={p.id} onPress={() => router.push({ pathname: '/deep/[id]', params: { id: p.id } })} style={{ gap: 4 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt style={type.heading}>Deep dive: {p.title}</Txt>
                  <Txt style={type.small} color="soft">
                    History with a purpose, management ladder, counselling, prescribing ({p.deepDive?.treatment})
                  </Txt>
                </View>
                <Icon name="arrow-forward-circle" size={26} />
              </Row>
            </Card>
          ))}
        </>
      ) : null}

      <SectionHeader title="Syllabus drills" />
      <Txt style={type.small} color="soft">
        Built from the syllabus map below, so they cover every presentation and condition in {area.short}. Each set takes the next three
        topics.
      </Txt>
      <DrillCard presentationId={drills.id} drill={sprint} tone={area.tone} icon="list-outline" />
      <DrillCard presentationId={drills.id} drill={spot} tone={area.tone} icon="flash-outline" />

      <SectionHeader title="Presentations: what could it be?" />
      <Txt style={type.small} color="soft">
        Tap one to see its causes, then drill them. Red is must-not-miss.
      </Txt>
      {sylPres.map((sp) => (
        <PresentationRow key={sp.id} sp={sp} open={open === sp.id} onToggle={() => setOpen(open === sp.id ? null : sp.id)} />
      ))}

      <SectionHeader title={`Conditions (${conds.length})`} />
      <Row gap={6} style={{ flexWrap: 'wrap' }}>
        {shownConds.map((c) => (
          <Chip key={c.id} label={c.title} onPress={() => router.push({ pathname: '/condition/[id]', params: { id: c.id } })} />
        ))}
      </Row>
      {conds.length > shownConds.length ? (
        <Button label={`Show all ${conds.length}`} variant="secondary" small onPress={() => setAllConditions(true)} />
      ) : null}

      <Card variant="alt" style={{ gap: 4 }}>
        <Txt style={type.bodyStrong}>Based on the GMC’s MLA content map</Txt>
        <Txt style={type.small} color="soft">
          Areas, presentations and conditions follow the content map; the differentials and classic pictures are teaching summaries. Check
          details against NICE CKS and the BNF.
        </Txt>
      </Card>
    </Screen>
  );
}

function PresentationRow({ sp, open, onToggle }: { sp: SyllabusPresentation; open: boolean; onToggle: () => void }) {
  const t = useTheme();
  const full = presentations.find((p) => p.id === sp.id);
  const spot = spotDrillFor(sp.id);
  const mustNot = sp.causes.filter((x) => x.weight === 'redflag').length;

  return (
    <Card style={{ gap: space.md }}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${sp.title}: ${open ? 'hide' : 'show'} causes`} onPress={onToggle}>
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt style={type.heading}>{sp.title}</Txt>
            <Txt style={type.small} color="soft">
              {sp.causes.length} causes{mustNot ? ` · ${mustNot} must-not-miss` : ''}
              {full ? ' · full history drill' : ''}
            </Txt>
          </View>
          <Icon name={open ? 'chevron-up' : 'chevron-down'} />
        </Row>
      </Pressable>

      {open ? (
        <>
          {ORDER.map((w) => {
            const list = sp.causes.filter((x) => x.weight === w && conditionById[x.id]);
            if (!list.length) return null;
            return (
              <View key={w} style={{ gap: 6 }}>
                <Txt style={type.tiny} color={w === 'redflag' ? t.bad : 'faint'}>
                  {CAUSE_CATEGORY[w]}
                </Txt>
                <Row gap={6} style={{ flexWrap: 'wrap' }}>
                  {list.map((x) => (
                    <Chip
                      key={x.id}
                      label={conditionById[x.id].title}
                      tone={w === 'redflag' ? 'bad' : undefined}
                      onPress={() => router.push({ pathname: '/condition/[id]', params: { id: x.id } })}
                    />
                  ))}
                </Row>
              </View>
            );
          })}
          <Row gap={space.sm} style={{ flexWrap: 'wrap' }}>
            {spot ? (
              <Button
                small
                label="Spot the cause"
                icon="flash-outline"
                onPress={() => router.push({ pathname: '/drill/[presentationId]/[sectionId]', params: spot })}
              />
            ) : null}
            {full ? (
              <Button
                small
                variant="secondary"
                label="Full history drill"
                icon="chatbubbles-outline"
                onPress={() => router.push({ pathname: '/presentation/[id]', params: { id: full.id } })}
              />
            ) : null}
          </Row>
        </>
      ) : null}
    </Card>
  );
}
