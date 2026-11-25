import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { type AssistLevel, LEVEL_NAMES, type Specialty } from '../content/types';
import { MAX_WIDTH, radius, space, type, useTheme } from '../theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export function Icon({ name, size = 20, color }: { name: IconName; size?: number; color?: string }) {
  const t = useTheme();
  return <Ionicons name={name} size={size} color={color ?? t.ink} />;
}

/* ------------------------------------------------------------------ */

export function Screen({
  children,
  scroll = true,
  footer,
  contentStyle,
}: {
  children: ReactNode;
  scroll?: boolean;
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const inner = <View style={[styles.inner, contentStyle]}>{children}</View>;
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: t.bg }}>
      {scroll ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {inner}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>{inner}</View>
      )}
      {footer}
    </SafeAreaView>
  );
}

export function TopBar({ title, subtitle, right }: { title?: string; subtitle?: string; right?: ReactNode }) {
  const t = useTheme();
  return (
    <View style={styles.topBar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        style={({ pressed }) => [styles.iconBtn, { backgroundColor: t.surface, opacity: pressed ? 0.7 : 1 }]}>
        <Icon name="chevron-back" size={20} />
      </Pressable>
      <View style={{ flex: 1, marginHorizontal: space.md }}>
        {title ? (
          <Txt style={type.heading} numberOfLines={1}>
            {title}
          </Txt>
        ) : null}
        {subtitle ? (
          <Txt style={type.small} color="soft" numberOfLines={1}>
            {subtitle}
          </Txt>
        ) : null}
      </View>
      {right}
    </View>
  );
}

/* ------------------------------------------------------------------ */

type TxtColor = 'ink' | 'soft' | 'faint' | 'good' | 'bad' | 'warn' | 'hero' | 'heroSoft' | 'accentInk';

export function Txt({
  children,
  style,
  color = 'ink',
  numberOfLines,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  color?: TxtColor | string;
  numberOfLines?: number;
}) {
  const t = useTheme();
  const map: Record<TxtColor, string> = {
    ink: t.ink,
    soft: t.inkSoft,
    faint: t.inkFaint,
    good: t.good,
    bad: t.bad,
    warn: t.warn,
    hero: t.heroInk,
    heroSoft: t.heroSoft,
    accentInk: t.accentInk,
  };
  const c = (map as Record<string, string>)[color] ?? color;
  return (
    <Text numberOfLines={numberOfLines} style={[type.body, { color: c }, style]}>
      {children}
    </Text>
  );
}

/* ------------------------------------------------------------------ */

export function Card({
  children,
  style,
  onPress,
  tone,
  variant = 'surface',
  accessibilityLabel,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  tone?: Specialty['tone'];
  variant?: 'surface' | 'hero' | 'alt';
  accessibilityLabel?: string;
}) {
  const t = useTheme();
  const bg = tone ? t.tones[tone].bg : variant === 'hero' ? t.hero : variant === 'alt' ? t.surfaceAlt : t.surface;
  const body = <View style={[styles.card, { backgroundColor: bg }, style]}>{children}</View>;
  if (!onPress) return body;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] })}>
      {body}
    </Pressable>
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  small,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  icon?: IconName;
  disabled?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const bg = { primary: t.ink, secondary: t.surface, accent: t.accent, ghost: 'transparent' }[variant];
  const fg = { primary: t.bg, secondary: t.ink, accent: t.accentInk, ghost: t.ink }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        {
          backgroundColor: bg,
          opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: t.line,
        },
        style,
      ]}>
      <Text style={[small ? type.small : type.bodyStrong, { color: fg, fontWeight: '700' }]}>{label}</Text>
      {icon ? <Ionicons name={icon} size={small ? 16 : 18} color={fg} /> : null}
    </Pressable>
  );
}

export function Chip({
  label,
  onPress,
  active,
  tone,
  icon,
  dim,
}: {
  label: string;
  onPress?: () => void;
  active?: boolean;
  tone?: 'good' | 'bad' | 'warn' | 'accent';
  icon?: IconName;
  dim?: boolean;
}) {
  const t = useTheme();
  const palette = {
    good: [t.goodBg, t.good],
    bad: [t.badBg, t.bad],
    warn: [t.warnBg, t.warn],
    accent: [t.accent, t.accentInk],
  } as const;
  const [bg, fg] = tone ? palette[tone] : active ? [t.ink, t.bg] : [t.surface, t.inkSoft];
  const content = (
    <View style={[styles.chip, { backgroundColor: bg, borderColor: tone || active ? 'transparent' : t.line, opacity: dim ? 0.5 : 1 }]}>
      {icon ? <Ionicons name={icon} size={13} color={fg} /> : null}
      <Text style={[type.small, { color: fg, fontWeight: '600', flexShrink: 1 }]}>{label}</Text>
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, maxWidth: '100%' })}>
      {content}
    </Pressable>
  );
}

export function ProgressBar({ value, color, track, height = 8 }: { value: number; color?: string; track?: string; height?: number }) {
  const t = useTheme();
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <View style={{ height, borderRadius: height, backgroundColor: track ?? t.surfaceAlt, overflow: 'hidden' }}>
      <View style={{ width: `${pct}%`, height: '100%', borderRadius: height, backgroundColor: color ?? t.ink }} />
    </View>
  );
}

export function Ring({
  value,
  size = 56,
  stroke = 6,
  color,
  track,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: ReactNode;
}) {
  const t = useTheme();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track ?? t.surfaceAlt} strokeWidth={stroke} fill="none" />
        {v > 0 ? (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color ?? t.ink}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${c * v} ${c}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ) : null}
      </Svg>
      {children}
    </View>
  );
}

export function LevelBadge({ level, onHero, compact }: { level: AssistLevel; onHero?: boolean; compact?: boolean }) {
  const t = useTheme();
  const icons: Record<AssistLevel, IconName> = { 1: 'school-outline', 2: 'bulb-outline', 3: 'flash-outline' };
  return (
    <View style={[styles.chip, { backgroundColor: onHero ? 'rgba(255,255,255,0.12)' : t.surfaceAlt, borderColor: 'transparent' }]}>
      <Ionicons name={icons[level]} size={13} color={onHero ? t.heroInk : t.inkSoft} />
      <Text style={[type.small, { color: onHero ? t.heroInk : t.inkSoft, fontWeight: '700' }]}>
        {compact ? `L${level}` : `L${level} · ${LEVEL_NAMES[level]}`}
      </Text>
    </View>
  );
}

export function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: Specialty['tone'] }) {
  return (
    <Card tone={tone} style={{ flex: 1, padding: space.lg, gap: 2 }}>
      <Txt style={type.tiny} color="faint">
        {label}
      </Txt>
      <Txt style={type.number}>{value}</Txt>
      {sub ? (
        <Txt style={type.small} color="soft">
          {sub}
        </Txt>
      ) : null}
    </Card>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Txt style={type.heading}>{title}</Txt>
      {action && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={8}>
          <Txt style={type.small} color="soft">
            {action}
          </Txt>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Row({ children, gap = space.md, style }: { children: ReactNode; gap?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', gap, alignItems: 'center' }, style]}>{children}</View>;
}

export const pct = (n: number) => `${Math.round(n * 100)}%`;
export const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, alignItems: 'center', paddingBottom: 120 },
  inner: { width: '100%', maxWidth: MAX_WIDTH, paddingHorizontal: space.lg, paddingTop: space.md, gap: space.lg },
  topBar: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: radius.lg, padding: space.xl - 4 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    borderRadius: radius.pill,
    paddingVertical: 14,
    paddingHorizontal: 22,
  },
  buttonSmall: { paddingVertical: 8, paddingHorizontal: 14 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 11,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: space.sm },
});
