import { router } from 'expo-router';
import { View } from 'react-native';

import { Card, Icon, Row, Screen, Txt } from '@/components/ui';
import { library, specialties } from '@/content';
import { dueCards } from '@/engine/flashcards';
import { useStore } from '@/store';
import { space, type, useTheme } from '@/theme';

export default function Library() {
  const t = useTheme();
  const due = dueCards(useStore((s) => s.vivaCards)).length;
  return (
    <Screen>
      <View style={{ marginTop: space.sm }}>
        <Txt style={type.display}>Learn</Txt>
        <Txt color="soft">Short teaching cards linked to the drills: mechanisms, side effects, NICE ladders, monitoring and red flags.</Txt>
      </View>

      <Card variant="hero" onPress={() => router.push('/viva')} accessibilityLabel="Viva flashcards" style={{ gap: space.sm }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt style={type.tiny} color="heroSoft">
              Viva flashcards · {due} due
            </Txt>
            <Txt style={type.heading} color="hero">
              Review your viva and PSA questions
            </Txt>
          </View>
          <Icon name="albums-outline" size={28} color={t.heroInk} />
        </Row>
      </Card>

      {specialties
        .filter((s) => library.some((c) => c.specialtyId === s.id))
        .map((s) => (
          <View key={s.id} style={{ gap: space.sm }}>
            <Txt style={type.heading}>{s.title}</Txt>
            {library
              .filter((c) => c.specialtyId === s.id)
              .map((c) => (
                <Card
                  key={c.id}
                  tone={s.tone}
                  onPress={() => router.push({ pathname: '/learn/[id]', params: { id: c.id } })}
                  accessibilityLabel={c.title}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Txt style={type.tiny} color={t.tones[s.tone].ink}>
                        {c.kicker} · {c.minutes} min
                      </Txt>
                      <Txt style={type.heading} color={t.tones[s.tone].ink}>
                        {c.title}
                      </Txt>
                    </View>
                    <Icon name="arrow-forward" color={t.tones[s.tone].ink} />
                  </Row>
                </Card>
              ))}
          </View>
        ))}

      <Txt style={type.small} color="faint">
        Educational content for medical students, not clinical advice. Always check the current NICE guidance, NICE CKS and the BNF.
      </Txt>
    </Screen>
  );
}
