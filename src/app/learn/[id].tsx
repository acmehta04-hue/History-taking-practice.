import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Card, Chip, Row, Screen, TopBar, Txt } from '@/components/ui';
import { libraryById, specialtyById } from '@/content';
import { space, type, useTheme } from '@/theme';

export default function LearnCard() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const card = libraryById[id ?? ''];
  if (!card) {
    return (
      <Screen>
        <TopBar title="Card not found" />
      </Screen>
    );
  }
  const tone = specialtyById[card.specialtyId]?.tone ?? 'lilac';

  return (
    <Screen>
      <TopBar subtitle={`${card.kicker} · ${card.minutes} min`} />
      <Card tone={tone} style={{ gap: space.sm }}>
        <Txt style={type.display} color={t.tones[tone].ink}>
          {card.title}
        </Txt>
      </Card>

      {card.blocks.map((b) => (
        <Card key={b.heading} style={{ gap: space.md }}>
          <Txt style={type.heading}>{b.heading}</Txt>
          {b.points.map((pt, i) => (
            <Row key={i} gap={space.sm} style={{ alignItems: 'flex-start' }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: t.tones[tone].strong, marginTop: 8 }} />
              <Txt style={{ flex: 1 }}>{pt}</Txt>
            </Row>
          ))}
        </Card>
      ))}

      <View style={{ gap: space.sm }}>
        <Txt style={type.tiny} color="faint">
          Verify against
        </Txt>
        <Row gap={6} style={{ flexWrap: 'wrap' }}>
          {card.verify.map((v) => (
            <Chip key={v} label={v} icon="shield-checkmark-outline" />
          ))}
        </Row>
      </View>
    </Screen>
  );
}
