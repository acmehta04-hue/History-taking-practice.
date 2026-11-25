import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Card, Chip, Icon, type IconName, LevelBadge, mmss, pct, Row, Screen, Stat, TopBar, Txt } from '@/components/ui';
import { checklistFor, getCase, getDrill, LEVEL_NAMES, libraryById, presentationById, programKey } from '@/content';
import {
  type CaseFile,
  type ChecklistItem,
  type FollowUp,
  type Purpose,
  PURPOSE_NAMES,
  type ReasonItem,
  type SectionDef,
} from '@/content/types';
import { PASS_MARK } from '@/engine/flashcards';
import { relativeDue } from '@/engine/recommend';
import type { Method } from '@/engine/scoring';
import { extraQuestions, type Stage, stageBlurb, STAGES, stageFor, xid } from '@/engine/stages';
import { type RepResult, useStore } from '@/store';
import { space, type, useTheme } from '@/theme';

const METHOD_ICON: Record<Method, IconName> = { typed: 'checkmark', hinted: 'bulb-outline', suggested: 'hand-left-outline' };

type AnyItem = (ChecklistItem | ReasonItem) & { modelQuestion?: string; purpose?: Purpose; target?: string };

const missedCards = (reps: RepResult[]): number =>
  reps.reduce((a, r) => a + (r.cards ?? []).filter((c) => c.accuracy < PASS_MARK).length + missedCards(r.steps ?? []), 0);

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
  const drill = getDrill(set.presentationId, set.sectionId)!;
  const stage = set.stage ?? 1;
  const nextStage = stageFor(program?.setsCompleted ?? 0);
  const scriptSection = drill.sections.find((x) => x.kind === 'interview' || x.kind === 'counsel');
  const duration = set.reps.reduce((a, r) => a + r.durationSec, 0);
  const toRetry = missedCards(set.reps);
  const levelMsg =
    set.nextLevel > set.level
      ? `Guidance fades next set: L${set.nextLevel} ${LEVEL_NAMES[set.nextLevel]}.`
      : set.nextLevel < set.level
        ? `More support next set: back to L${set.nextLevel} ${LEVEL_NAMES[set.nextLevel]}. That’s normal: rebuild, then fade again.`
        : `Same level next set. To move up you need 80% accuracy and 80% independence.`;
  const scriptCase = getCase(p.id, set.reps[0].caseId)!;

  // Deep dives: point to the next set in the sequence
  const diveIndex = p.kind === 'deepdive' ? p.sections.findIndex((s) => s.id === drill.id) : -1;
  const diveNext = diveIndex >= 0 ? p.sections[diveIndex + 1] : undefined;

  return (
    <Screen>
      <TopBar title="Set complete" subtitle={`${p.title} · ${drill.title}`} />

      <Card variant="hero" style={{ gap: space.md }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt style={type.tiny} color="heroSoft">
            {STAGES[stage].name} · {set.reps.length} reps · {mmss(duration)}
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
        {nextStage > stage ? (
          <Row gap={space.sm} style={{ alignItems: 'flex-start' }}>
            <Icon name="flame-outline" size={18} color={t.accent} />
            <Txt style={{ flex: 1 }} color="hero">
              Next set steps up to {STAGES[nextStage].name}:{' '}
              {stageBlurb(
                nextStage,
                drill.sections.map((x) => x.kind),
              )}
            </Txt>
          </Row>
        ) : null}
      </Card>

      <Row gap={space.md} style={{ alignItems: 'stretch' }}>
        <Stat label="Accuracy" value={pct(set.accuracy)} sub="of the model answer" />
        <Stat label="Independence" value={pct(set.independence)} sub="covered without help" />
      </Row>

      {toRetry ? (
        <Card onPress={() => router.push('/viva')} style={{ gap: 4 }} accessibilityLabel="Retry missed questions">
          <Row style={{ justifyContent: 'space-between' }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Txt style={type.heading}>
                Retry the {toRetry} question{toRetry === 1 ? '' : 's'} you missed
              </Txt>
              <Txt style={type.small} color="soft">
                Missed questions come back straight away as flashcards. Ones you get right come back after 1, 3, 7, 14 and 30 days.
              </Txt>
            </View>
            <Icon name="albums-outline" size={26} />
          </Row>
        </Card>
      ) : null}

      {/* Ideal flow */}
      <Card style={{ gap: space.sm }}>
        <Txt style={type.heading}>The ideal flow</Txt>
        {drill.flow.map((f, i) => (
          <Row key={i} gap={space.sm} style={{ alignItems: 'flex-start' }}>
            <Txt style={[type.bodyStrong, { width: 20 }]} color="faint">
              {i + 1}
            </Txt>
            <Txt style={{ flex: 1 }}>{f.replace(/^\d+\. /, '')}</Txt>
          </Row>
        ))}
      </Card>

      {scriptSection ? <Script section={scriptSection} c={scriptCase} /> : null}

      <Txt style={type.heading}>Rep by rep</Txt>
      {set.reps.map((r, i) => (
        <RepCard key={i} index={i} r={r} sections={drill.sections} stage={stage} c={getCase(p.id, r.caseId)!} />
      ))}

      {drill.teach.length ? (
        <>
          <Txt style={type.heading}>Teach-back</Txt>
          {drill.teach.map((id) => {
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
        {diveNext ? (
          <Button
            label={`Next in this deep dive: ${diveNext.short}`}
            icon="arrow-forward"
            onPress={() =>
              router.replace({ pathname: '/drill/[presentationId]/[sectionId]', params: { presentationId: p.id, sectionId: diveNext.id } })
            }
          />
        ) : null}
        <Button
          label="Next set now"
          icon="repeat"
          variant={diveNext ? 'secondary' : 'primary'}
          onPress={() =>
            router.replace({ pathname: '/drill/[presentationId]/[sectionId]', params: { presentationId: p.id, sectionId: drill.id } })
          }
        />
        <Button label="Done for now" variant="secondary" onPress={() => router.replace('/')} />
        <Txt style={type.small} color="faint">
          Spaced practice works best. {relativeDue(program?.nextDueAt)}, but you can start it whenever you like.
        </Txt>
      </View>
    </Screen>
  );
}

/** The model questions (or statements) in order: how a strong candidate would run this block */
function Script({ section, c }: { section: SectionDef; c: CaseFile }) {
  const [open, setOpen] = useState(false);
  const items = checklistFor(section, c);
  const shown = open ? items : items.slice(0, 4);
  return (
    <Card style={{ gap: space.sm }}>
      <Txt style={type.heading}>{section.kind === 'counsel' ? 'How to say it' : 'How to ask it'}</Txt>
      {shown.map((i) => (
        <View key={i.id} style={{ gap: 2 }}>
          <Txt style={type.tiny} color="faint">
            {i.label}
            {i.weight === 'redflag' ? ' · red flag' : ''}
            {i.purpose ? ` · ${PURPOSE_NAMES[i.purpose]}` : ''}
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

function RepCard({ r, sections, stage, c, index }: { r: RepResult; sections: SectionDef[]; stage: Stage; c: CaseFile; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const steps = r.steps?.length ? r.steps : [{ ...r, sectionId: r.sectionId ?? sections[0].id }];

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

      {open
        ? steps.map((st, i) => {
            const section = sections.find((x) => x.id === st.sectionId) ?? sections[0];
            return (
              <View key={section.id} style={{ gap: space.md }}>
                {steps.length > 1 ? (
                  <Txt style={type.bodyStrong}>
                    {section.title} · {pct(st.accuracy)}
                  </Txt>
                ) : null}
                <RepDetails r={st} section={section} c={c} stage={stage} isLast={i === steps.length - 1} />
              </View>
            );
          })
        : null}

      {open ? <Pearl text={c.pearl} /> : null}
    </Card>
  );
}

function Pearl({ text }: { text: string }) {
  const t = useTheme();
  return (
    <Card variant="alt" style={{ padding: space.lg }}>
      <Row gap={space.sm} style={{ alignItems: 'flex-start' }}>
        <Icon name="sparkles" size={18} color={t.warn} />
        <Txt style={{ flex: 1 }}>{text}</Txt>
      </Row>
    </Card>
  );
}

function baseItems(section: SectionDef, c: CaseFile): AnyItem[] {
  if (section.kind === 'viva') return [];
  return section.kind === 'reasoning' ? (c.reasoning[section.id] ?? []) : checklistFor(section, c);
}

function RepDetails({ r, section, c, stage, isLast }: { r: RepResult; section: SectionDef; c: CaseFile; stage: Stage; isLast: boolean }) {
  const t = useTheme();
  const base = baseItems(section, c);
  const extras = extraQuestions(section, c, stage, isLast);
  const missed = base.filter((i) => !r.covered[i.id]);
  const coveredBase = base.filter((i) => r.covered[i.id]);
  const noReason = base.filter((i) => 'reasonMatch' in i && i.reasonMatch && r.covered[i.id] && !r.covered[i.id].reason);
  const distractorDefs = [...Object.values(c.distractors ?? {}).flat(), ...extras.flatMap((q) => q.distractors ?? [])];
  const missedLabel = section.kind === 'counsel' ? 'say it like this' : section.kind === 'interview' ? 'ask it like this' : 'model answer';

  return (
    <>
      {section.tagPurpose ? (
        <PurposeBreakdown items={base} r={r} />
      ) : (
        <>
          {coveredBase.length ? (
            <View style={{ gap: 6 }}>
              <Txt style={type.tiny} color="faint">
                Covered: ✓ unaided · bulb after a hint · hand from a suggestion
              </Txt>
              <Row gap={6} style={{ flexWrap: 'wrap' }}>
                {coveredBase.map((it) => {
                  const cov = r.covered[it.id];
                  return (
                    <Chip key={it.id} label={it.label} icon={METHOD_ICON[cov.method]} tone={cov.method === 'typed' ? 'good' : undefined} />
                  );
                })}
              </Row>
            </View>
          ) : null}

          {missed.length ? (
            <View style={{ gap: space.sm }}>
              <Txt style={type.tiny} color="faint">
                Missed: {missedLabel}
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
          ) : base.length ? (
            <Chip label="Nothing missed" tone="good" icon="trophy-outline" />
          ) : null}
        </>
      )}

      {noReason.length ? (
        <View style={{ gap: space.sm }}>
          <Txt style={type.tiny} color="faint">
            Named it: now say why
          </Txt>
          {noReason.map((m) => (
            <Txt key={m.id} style={type.small}>
              <Txt style={type.bodyStrong}>{m.label}: </Txt>
              {m.why}
            </Txt>
          ))}
        </View>
      ) : null}

      {extras.map((q, i) => (
        <QuestionReview key={i} q={q} i={i} r={r} />
      ))}

      {r.distractors.length ? (
        <View style={{ gap: space.sm }}>
          <Txt style={type.tiny} color="faint">
            Not first line
          </Txt>
          {r.distractors.map((d, i) => (
            <Txt key={`${d}-${i}`} style={type.small}>
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
    </>
  );
}

/** One extra question (viva, follow-up, ladder step, PSA task, twist) with what was covered */
function QuestionReview({ q, i, r }: { q: FollowUp; i: number; r: RepResult }) {
  const t = useTheme();
  const got = q.items.filter((it) => r.covered[xid(i, it.id)]);
  return (
    <View style={{ gap: space.sm, borderTopWidth: 1, borderTopColor: t.line, paddingTop: space.md }}>
      <Txt style={type.tiny} color="faint">
        {q.label ?? 'Follow-up'} · {got.length}/{q.items.length}
      </Txt>
      <Txt style={type.bodyStrong}>{q.prompt}</Txt>
      {q.data ? (
        <Txt style={type.small} color="soft">
          {q.data}
        </Txt>
      ) : null}
      {q.items.map((it) => {
        const ok = !!r.covered[xid(i, it.id)];
        return (
          <Row key={it.id} gap={space.sm} style={{ alignItems: 'flex-start' }}>
            <Icon
              name={ok ? 'checkmark-circle' : 'ellipse-outline'}
              size={18}
              color={ok ? t.good : it.weight === 'redflag' ? t.bad : t.inkFaint}
            />
            <View style={{ flex: 1 }}>
              <Txt style={ok ? type.small : type.bodyStrong}>
                {it.label}
                {!ok && it.weight === 'redflag' ? '  · red flag' : ''}
              </Txt>
              {!ok ? (
                <Txt style={type.small} color="soft">
                  {it.why}
                </Txt>
              ) : null}
            </View>
          </Row>
        );
      })}
    </View>
  );
}

/** Deep dive "why" sets: what each question was for, and whether the student tagged it right */
function PurposeBreakdown({ items, r }: { items: AnyItem[]; r: RepResult }) {
  const t = useTheme();
  const groups: Purpose[] = ['exclude', 'risk', 'severity'];
  return (
    <View style={{ gap: space.md }}>
      {groups.map((g) => {
        const list = items.filter((i) => i.purpose === g);
        if (!list.length) return null;
        return (
          <View key={g} style={{ gap: space.sm }}>
            <Txt style={type.tiny} color="faint">
              {PURPOSE_NAMES[g]} · asked {list.filter((i) => r.covered[i.id]).length}/{list.length}
            </Txt>
            {list.map((it) => {
              const asked = !!r.covered[it.id];
              const tag = r.tags?.[it.id] as Purpose | undefined;
              const tagOk = tag === it.purpose;
              return (
                <Row key={it.id} gap={space.sm} style={{ alignItems: 'flex-start' }}>
                  <Icon
                    name={asked ? 'checkmark-circle' : 'ellipse-outline'}
                    size={18}
                    color={asked ? t.good : it.weight === 'redflag' ? t.bad : t.inkFaint}
                  />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Txt style={type.bodyStrong}>
                      {it.label}
                      {asked ? (tag ? (tagOk ? '  · tagged right' : `  · you tagged “${PURPOSE_NAMES[tag]}”`) : '  · not tagged') : ''}
                    </Txt>
                    <Txt style={type.small} color="soft">
                      {it.target}
                    </Txt>
                    {!asked && it.modelQuestion ? <Txt style={type.small}>“{it.modelQuestion}”</Txt> : null}
                  </View>
                </Row>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}
