import { useState } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { space, type, useTheme } from '../theme';
import { Txt } from './ui';

/**
 * Small, dependency-free charts drawn with react-native-svg.
 * Single-series by design: the title names the series, so no legend.
 * Tap a point to read it (the touch equivalent of a hover tooltip).
 */

export interface Point {
  y: number;
  label: string;
  detail?: string;
}

export function LineChart({ data, height = 170, yMax, unit = '' }: { data: Point[]; height?: number; yMax?: number; unit?: string }) {
  const t = useTheme();
  const [w, setW] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const pad = { l: 34, r: 12, t: 12, b: 22 };
  const max = yMax ?? niceMax(Math.max(10, ...data.map((d) => d.y)));
  const innerW = Math.max(0, w - pad.l - pad.r);
  const innerH = height - pad.t - pad.b;
  const x = (i: number) => pad.l + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (v: number) => pad.t + innerH - (v / max) * innerH;
  const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(d.y).toFixed(1)}`).join(' ');
  const ticks = [0, Math.round(max / 2), Math.round(max)];
  const active = sel ?? data.length - 1;
  const focus = data[active];

  const onPress = (lx: number) => {
    if (!data.length || innerW <= 0) return;
    const i = Math.round(((lx - pad.l) / innerW) * (data.length - 1));
    setSel(Math.max(0, Math.min(data.length - 1, i)));
  };

  return (
    <View>
      <View style={styles.readout}>
        {focus ? (
          <>
            <Txt style={type.number}>
              {Math.round(focus.y)}
              {unit}
            </Txt>
            <Txt style={type.small} color="soft" numberOfLines={1}>
              {focus.label}
              {focus.detail ? ` · ${focus.detail}` : ''}
            </Txt>
          </>
        ) : (
          <Txt color="soft">No sets yet — your first set will appear here.</Txt>
        )}
      </View>
      <Pressable
        accessibilityLabel="Points per set chart. Tap to inspect a set."
        onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)}
        onPress={(e) => onPress(e.nativeEvent.locationX)}
        style={{ height }}>
        {w > 0 ? (
          <Svg width={w} height={height}>
            {ticks.map((v) => (
              <Line key={v} x1={pad.l} x2={w - pad.r} y1={y(v)} y2={y(v)} stroke={t.line} strokeWidth={1} />
            ))}
            {data.length > 1 ? <Path d={path} stroke={t.ink} strokeWidth={2} fill="none" strokeLinejoin="round" /> : null}
            {focus ? (
              <>
                <Line
                  x1={x(active)}
                  x2={x(active)}
                  y1={pad.t}
                  y2={pad.t + innerH}
                  stroke={t.inkFaint}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
                <Circle cx={x(active)} cy={y(focus.y)} r={5} fill={t.accent} stroke={t.surface} strokeWidth={2} />
              </>
            ) : null}
          </Svg>
        ) : null}
        {w > 0
          ? ticks.map((v) => (
              <Txt key={v} style={[type.small, styles.tick, { top: y(v) - 9, color: t.inkFaint }]}>
                {v}
              </Txt>
            ))
          : null}
      </Pressable>
    </View>
  );
}

/** Round up so the axis reads 0 / half / max in round numbers */
function niceMax(v: number): number {
  const step = Math.pow(10, Math.floor(Math.log10(v)));
  let n = Math.ceil(v / step);
  if (n > 1 && n % 2 === 1) n += 1;
  return n * step;
}

export interface Bar {
  label: string;
  value: number; // 0–1
  sub?: string;
}

/** Horizontal bars for one measure across items, sorted by the caller */
export function BarList({ data, color }: { data: Bar[]; color?: string }) {
  const t = useTheme();
  return (
    <View style={{ gap: space.md }}>
      {data.map((b) => (
        <View key={b.label} accessible accessibilityLabel={`${b.label}: ${Math.round(b.value * 100)}%`}>
          <View style={styles.barHead}>
            <Txt style={type.bodyStrong}>{b.label}</Txt>
            <Txt style={type.small} color="soft">
              {b.sub ?? `${Math.round(b.value * 100)}%`}
            </Txt>
          </View>
          <View style={[styles.track, { backgroundColor: t.surfaceAlt }]}>
            <View style={[styles.bar, { width: `${Math.max(2, b.value * 100)}%`, backgroundColor: color ?? t.ink }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  readout: { minHeight: 56, marginBottom: space.sm },
  tick: { position: 'absolute', left: 0, width: 28, textAlign: 'right', fontSize: 11 },
  barHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  track: { height: 10, borderRadius: 4, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 4 },
});
