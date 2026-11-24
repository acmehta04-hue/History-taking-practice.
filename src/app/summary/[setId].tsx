import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Card, Chip, Icon, type IconName, LevelBadge, mmss, pct, Row, Screen, Stat, TopBar, Txt } from '@/components/ui';
import { checklistFor, getCase, getSection, LEVEL_NAMES, libraryById, presentationById, programKey } from '@/content';
import type { CaseFile, ChecklistItem, ReasonItem, SectionDef } from '@/content/types';
import { relativeDue } from '@/engine/recommend';
import type { Method } from '@/engine/scoring';
import { type RepResult, useStore } from '@/store';
import { space, type, useTheme } from '@/theme';

const METHOD_ICON: Record<Method, IconName> = { typed: 'checkmark', hinted: 'bulb-outline', suggested: 'hand-left-outline' };

type AnyItem = (ChecklistItem | ReasonItem) & { modelQuestion?: string };

function itemsFor(section: SectionDef, c: CaseFile): AnyItem[] {
  if (section.kind === 'reasoning') return c.reasoning[section.id] ?? [];
  const base: AnyItem[] = checklistFor(section, c);
  const fu = c.followUps?.[section.id];
  return fu ? [...base, ...fu.items.map((i) => ({ ...i, id: `fu:${i.id}` }))] : base;
}

export default function Summary() {
  const t = useTheme();
  const { setId } = useLocalSearchParams<{ setId: string }>();
  const set = useStore((s) => s.sets.find((x) => x.id === setId));
  const program = useStore((s) => (set ? s.programs[programKey(set.presentationId, set.sectionId)] : undefined));

  if (!set) {
    return (
      <Screen>
        <TopBar title="Set not found" />
      </Screen>
    );
  }

  const p = presentationById[set.presentationId];
  const section = getSection(set.presentationId, set.sectionId)!;
  const duration = set.reps.reduce((a, r) => a + r.durationSec, 0);
  const levelMsg =
    set.nextLevel > set.level
      ? `Guidance fades next set: L${set.nextLevel} ${LEVEL_NAMES[set.nextLevel]}.`
      : set.nextLevel < set.level
        ? `More support next set: back to L${set.nextLevel} ${LEVEL_NAMES[set.nextLevel]}. That’s normal — rebuild, then fade again.`
        : `Same level next set. To move up you need 80% accuracy and 80% independence.`;
  const scriptCase = getCase(p.id, set.reps[0].caseId)!;

  return (
    <Screen>
      <TopBar title="Set complete" subtitle={`${p.title} · ${section.title}`} />

      <Card variant="hero" style={{ gap: space.md }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt style={type.tiny} color="heroSoft">
            {set.reps.length} reps · {mmss(duration)}
          </Txt>
          <LevelBadge level={set.level} onHero />
        </Row>
        <Txt style={[type.display, { fontSize: 44 }]} color="hero">
          +{set.points} pts
        </Txt>
        <Row gap={space.sm} style={{ alignItems: 'flex-start' }}>
          <Icon
            name={set.nextLevel > set.level ? 'trending-up' : set.nextLevel < set.level ? 'refresh' : 'remove'}
            size={18}
            color={t.accent}
          />
          <Txt style={{ flex: 1 }} color="hero">
            {levelMsg}
          </Txt>
        </Row>
      </Card>

      <Row gap={space.md} style={{ alignItems: 'stretch' }}>
        <Stat label="Accuracy" value={pct(set.accuracy)} sub="of the model answer" />
        <Stat label="Independence" value={pct(set.independence)} sub="covered without help" />
      </Row>

      {/* Ideal flow */}
      <Card style={{ gap: space.sm }}>
        <Txt style={type.heading}>The ideal flow</Txt>
        {(section.flow ?? []).map((f, i) => (
          <Row key={i} gap={space.sm} style={{ alignItems: 'flex-start' }}>
            <Txt style={[type.bodyStrong, { width: 20 }]} color="faint">
              {i + 1}
            </Txt>
            <Txt style={{ flex: 1 }}>{f}</Txt>
          </Row>
        ))}
      </Card>

      {section.kind === 'interview' ? <Script section={section} c={scriptCase} /> : null}

      <Txt style={type.heading}>Rep by rep</Txt>
      {set.reps.map((r, i) => (
        <RepCard key={i} index={i} r={r} section={section} c={getCase(p.id, r.caseId)!} />
      ))}

      {section.teach?.length ? (
        <>
          <Txt style={type.heading}>Teach-back</Txt>
          {section.teach.map((id) => {
            const card = libraryById[id];
            return card ? (
              <Card key={id} onPress={() => router.push({ pathname: '/learn/[id]', params: { id } })} style={{ gap: 4 }}>
                <Txt style={type.tiny} color="faint">
                  {card.kicker} · {card.minutes} min
                </Txt>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Txt style={[type.heading, { flex: 1 }]}>{card.title}</Txt>
                  <Icon name="arrow-forward" />
                </Row>
              </Card>
            ) : null;
          })}
        </>
      ) : null}

      <View style={{ gap: space.sm }}>
        <Button
          label="Next set now"
          icon="repeat"
          onPress={() =>
            router.replace({ pathname: '/drill/[presentationId]/[sectionId]', params: { presentationId: p.id, sectionId: section.id } })
          }
        />
        <Button label="Done for now" variant="secondary" onPress={() => router.replace('/')} />
        <Txt style={type.small} color="faint">
          Spaced practice works best. {relativeDue(program?.nextDueAt)} — but you can start it whenever you like.
        </Txt>
      </View>
    </Screen>
  );
}

/** The model questions in order — how a strong candidate would run this block */
function Script({ section, c }: { section: SectionDef; c: CaseFile }) {
  const [open, setOpen] = useState(false);
  const items = checklistFor(section, c);
  const shown = open ? items : items.slice(0, 4);
  return (
    <Card style={{ gap: space.sm }}>
      <Txt style={type.heading}>How to ask it</Txt>
      {shown.map((i) => (
        <View key={i.id} style={{ gap: 2 }}>
          <Txt style={type.tiny} color="faint">
            {i.label}
            {i.weight === 'redflag' ? ' · red flag' : ''}
          </Txt>
          <Txt>“{i.modelQuestion}”</Txt>
        </View>
      ))}
      {items.length > 4 ? (
        <Pressable accessibilityRole="button" onPress={() => setOpen(!open)}>
          <Txt style={type.bodyStrong}>{open ? 'Show less' : `Show all ${items.length}`}</Txt>
        </Pressable>
      ) : null}
    </Card>
  );
}

function RepCard({ r, section, c, index }: { r: RepResult; section: SectionDef; c: CaseFile; index: number }) {
  const t = useTheme();
  const [open, setOpen] = useState(index === 0);
  const items = itemsFor(section, c);
  const byId = Object.fromEntries(items.map((i) => [i.id, i]));
  const missed = r.missed.map((id) => byId[id]).filter(Boolean);
  const noReason = items.filter((i) => 'reasonMatch' in i && i.reasonMatch && r.covered[i.id] && !r.covered[i.id].reason);
  const distractorDefs = Object.values(c.distractors ?? {}).flat();

  return (
    <Card style={{ gap: space.md }}>
      <Pressable accessibilityRole="button" onPress={() => setOpen(!open)}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt style={type.tiny} color="faint">
              Rep {index + 1} · {c.patient.name}, {c.patient.age}
            </Txt>
            <Txt style={type.heading}>{c.diagnosis}</Txt>
            <Txt style={type.small} color="soft">
              {pct(r.accuracy)} accuracy · {pct(r.independence)} independent · {r.points} pts
            </Txt>
          </View>
          <Icon name={open ? 'chevron-up' : 'chevron-down'} />
        </Row>
      </Pressable>

      {open ? (
        <>
          {Object.keys(r.covered).length ? (
            <View style={{ gap: 6 }}>
              <Txt style={type.tiny} color="faint">
                Covered — ✓ unaided · bulb after a hint · hand from a suggestion
              </Txt>
              <Row gap={6} style={{ flexWrap: 'wrap' }}>
                {Object.entries(r.covered).map(([id, cov]) =>
                  byId[id] ? (
                    <Chip
                      key={id}
                      label={byId[id].label}
                      icon={METHOD_ICON[cov.method]}
                      tone={cov.method === 'typed' ? 'good' : undefined}
                    />
                  ) : null,
                )}
              </Row>
            </View>
          ) : null}

          {missed.length ? (
            <View style={{ gap: space.sm }}>
              <Txt style={type.tiny} color="faint">
                Missed — {section.kind === 'interview' ? 'ask it like this' : 'model answer'}
              </Txt>
              {missed.map((m) => (
                <View
                  key={m.id}
                  style={{ borderLeftWidth: 3, borderLeftColor: m.weight === 'redflag' ? t.bad : t.line, paddingLeft: space.md, gap: 2 }}>
                  <Txt style={type.bodyStrong}>
                    {m.label}
                    {m.weight === 'redflag' ? '  · red flag' : ''}
                  </Txt>
                  {m.modelQuestion ? <Txt>“{m.modelQuestion}”</Txt> : null}
                  <Txt style={type.small} color="soft">
                    {m.why}
                  </Txt>
                </View>
              ))}
            </View>
          ) : (
            <Chip label="Nothing missed" tone="good" icon="trophy-outline" />
          )}

          {noReason.length ? (
            <View style={{ gap: space.sm }}>
              <Txt style={type.tiny} color="faint">
                Named it — now say why
              </Txt>
              {noReason.map((m) => (
                <Txt key={m.id} style={type.small}>
                  <Txt style={type.bodyStrong}>{m.label}: </Txt>
                  {m.why}
                </Txt>
              ))}
            </View>
          ) : null}

          {r.distractors.length ? (
            <View style={{ gap: space.sm }}>
              <Txt style={type.tiny} color="faint">
                Not first line
              </Txt>
              {r.distractors.map((d) => (
                <Txt key={d} style={type.small}>
                  <Txt style={type.bodyStrong}>{d}: </Txt>
                  {distractorDefs.find((x) => x.label === d)?.whyNot}
                </Txt>
              ))}
            </View>
          ) : null}

          {r.unmatched.length ? (
            <View style={{ gap: 4 }}>
              <Txt style={type.tiny} color="faint">
                Not recognised (try rephrasing next time)
              </Txt>
              {r.unmatched.slice(0, 5).map((u, i) => (
                <Txt key={i} style={type.small} color="soft">
                  • {u}
                </Txt>
              ))}
            </View>
          ) : null}

          <Card variant="alt" style={{ padding: space.lg }}>
            <Row gap={space.sm} style={{ alignItems: 'flex-start' }}>
              <Icon name="sparkles" size={18} color={t.warn} />
              <Txt style={{ flex: 1 }}>{c.pearl}</Txt>
            </Row>
          </Card>
        </>
      ) : null}
    </Card>
  );
}
