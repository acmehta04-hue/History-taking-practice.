import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Button, Card, Chip, Icon, Row, Screen, SectionHeader, TopBar, Txt } from '@/components/ui';
import { conditionById, deepDives, presentationsWithCondition, specialtyById, spotDrillFor, testById, weightIn } from '@/content';
import { CAUSE_CATEGORY } from '@/content/catalogue/drills';
import { space, type, useTheme } from '@/theme';

/** A condition from the syllabus: the picture to recognise, how to confirm it, and the presentations it hides behind */
export default function ConditionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const c = conditionById[id ?? ''];

  if (!c) {
    return (
      <Screen>
        <TopBar title="Not found" />
        <Txt>That condition isn’t in the syllabus map yet.</Txt>
      </Screen>
    );
  }

  const home = specialtyById[c.areas[0]];
  const tone = t.tones[home?.tone ?? 'sky'];
  const ps = presentationsWithCondition(c.id);
  const tests = c.ix.map((x) => testById[x]).filter(Boolean);
  const dive = deepDives.find((d) => d.deepDive?.condition === c.title);
  const practise = ps.map((p) => ({ p, spot: spotDrillFor(p.id) })).find((x) => x.spot);

  return (
    <Screen>
      <TopBar subtitle={c.helper ? 'Differential' : 'UKMLA condition'} />

      <Card tone={home?.tone} style={{ gap: space.sm }}>
        <Txt style={type.tiny} color={tone.ink}>
          {c.areas
            .map((a) => specialtyById[a]?.short)
            .filter(Boolean)
            .join(' · ')}
        </Txt>
        <Txt style={type.display} color={tone.ink}>
          {c.title}
        </Txt>
      </Card>

      <Card style={{ gap: space.sm }}>
        <Row gap={space.sm}>
          <Icon name="eye-outline" size={18} />
          <Txt style={type.heading}>The classic picture</Txt>
        </Row>
        <Txt>{c.key}.</Txt>
      </Card>

      {tests.length ? (
        <Card style={{ gap: space.sm }}>
          <Row gap={space.sm}>
            <Icon name="flask-outline" size={18} />
            <Txt style={type.heading}>How to confirm it</Txt>
          </Row>
          {tests.map((x) => (
            <Row key={x.id} gap={space.sm}>
              <Chip label={x.category} />
              <Txt style={{ flex: 1 }}>{x.label}</Txt>
            </Row>
          ))}
        </Card>
      ) : null}

      {ps.length ? (
        <>
          <SectionHeader title="Where it comes up" />
          <Txt style={type.small} color="soft">
            The presentations it can hide behind, and how high it sits on each differential.
          </Txt>
          {ps.map((p) => {
            const w = weightIn(p, c.id)!;
            return (
              <Card
                key={p.id}
                onPress={() => router.push({ pathname: '/area/[id]', params: { id: p.areas[0], focus: p.id } })}
                accessibilityLabel={p.title}
                style={{ paddingVertical: space.md }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Txt style={[type.bodyStrong, { flex: 1 }]}>{p.title}</Txt>
                  <Chip label={CAUSE_CATEGORY[w]} tone={w === 'redflag' ? 'bad' : undefined} />
                </Row>
              </Card>
            );
          })}
        </>
      ) : null}

      <View style={{ gap: space.sm }}>
        {practise ? (
          <Button
            label={`Spot the cause: ${practise.p.title}`}
            icon="flash-outline"
            onPress={() => router.push({ pathname: '/drill/[presentationId]/[sectionId]', params: practise.spot! })}
          />
        ) : null}
        {dive ? (
          <Button
            label={`Deep dive: ${dive.title}`}
            icon="layers-outline"
            variant="secondary"
            onPress={() => router.push({ pathname: '/deep/[id]', params: { id: dive.id } })}
          />
        ) : null}
        <Row gap={6} style={{ flexWrap: 'wrap' }}>
          {c.areas.map((a) =>
            specialtyById[a] ? (
              <Chip
                key={a}
                label={specialtyById[a].short}
                icon={specialtyById[a].icon as never}
                onPress={() => router.push({ pathname: '/area/[id]', params: { id: a } })}
              />
            ) : null,
          )}
        </Row>
      </View>

      <Txt style={type.small} color="faint">
        A teaching summary, not a full account: check management and doses against NICE CKS and the BNF.
      </Txt>
    </Screen>
  );
}
