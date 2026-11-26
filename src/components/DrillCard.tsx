import { router } from 'expo-router';
import { View } from 'react-native';

import { type Drill, programKey, type Specialty } from '../content';
import { isDue, relativeDue } from '../engine/recommend';
import { STAGES, stageFor } from '../engine/stages';
import { useStore } from '../store';
import { radius, space, type, useTheme } from '../theme';
import { Button, Card, Chip, Icon, type IconName, LevelBadge, ProgressBar, Row, Txt } from './ui';

/**
 * One drill with its level, stage, due date and a start button. Used on a
 * presentation's page (blocks and combined drills) and an area's page
 * (syllabus drills).
 */
export function DrillCard({
  presentationId,
  drill,
  tone,
  locked,
  icon,
}: {
  presentationId: string;
  drill: Drill;
  tone: Specialty['tone'];
  /** Combined drills: how many blocks have reached L2 */
  locked?: { done: number; total: number };
  /** Shown in the badge instead of the drill's short name */
  icon?: IconName;
}) {
  const t = useTheme();
  const tc = t.tones[tone];
  const prog = useStore((s) => s.programs[programKey(presentationId, drill.id)]);
  const done = prog?.setsCompleted ?? 0;
  const stage = stageFor(done);
  const combo = drill.kind === 'combo';
  const start = () => router.push({ pathname: '/drill/[presentationId]/[sectionId]', params: { presentationId, sectionId: drill.id } });

  return (
    <Card style={{ gap: space.md }}>
      <Row style={{ alignItems: 'flex-start' }}>
        <View
          style={{
            minWidth: 52,
            height: 52,
            paddingHorizontal: 6,
            borderRadius: radius.md,
            backgroundColor: combo ? t.hero : tc.bg,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {icon ? (
            <Icon name={icon} size={24} color={tc.ink} />
          ) : (
            <Txt style={[type.bodyStrong, { fontSize: 12, textAlign: 'center' }]} color={combo ? t.heroInk : tc.ink}>
              {combo ? `×${drill.sections.length}` : drill.short}
            </Txt>
          )}
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt style={type.heading}>{combo ? drill.short : drill.title}</Txt>
          <Txt style={type.small} color="soft">
            {combo ? `${drill.title}. ${drill.blurb}` : drill.blurb}
          </Txt>
        </View>
      </Row>
      {locked ? (
        <View style={{ gap: 6 }}>
          <ProgressBar value={locked.done / locked.total} color={tc.strong} />
          <Row gap={6}>
            <Icon name="lock-closed-outline" size={14} color={t.inkSoft} />
            <Txt style={type.small} color="soft">
              Unlocks when every block reaches L2 ({locked.done}/{locked.total}). You can try it now.
            </Txt>
          </Row>
        </View>
      ) : null}
      <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap' }} gap={space.sm}>
        <Row gap={6} style={{ flexWrap: 'wrap', flex: 1 }}>
          <LevelBadge level={prog?.level ?? 1} />
          <Chip label={`Set ${done + 1} · ${STAGES[stage].name}`} icon={stage === 3 ? 'flame-outline' : undefined} />
          {prog ? (
            <Chip label={relativeDue(prog.nextDueAt)} tone={isDue(prog.nextDueAt) ? 'warn' : undefined} />
          ) : null}
        </Row>
        <Button
          small
          label={done ? 'Next set' : locked ? 'Try' : 'Start'}
          icon="play"
          variant={locked ? 'secondary' : 'primary'}
          onPress={start}
        />
      </Row>
    </Card>
  );
}
