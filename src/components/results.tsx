import { ScrollView, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { BloodRow, EcgSpec, Obs, ResultPanel, XraySpec } from '../content/types';
import { ecgTrace } from '../engine/ecg';
import { bloodFlag, news2, type NewsParam } from '../engine/news2';
import { radius, space, type, useTheme } from '../theme';
import { Chip, Row, Txt } from './ui';

/**
 * Results to interpret: observations (NEWS2), bloods, a rhythm strip, a
 * schematic X-ray or a written report. `reveal` adds the answers that would
 * give the question away (the NEWS2 breakdown), for summaries.
 */
export function ResultsView({ panels, reveal = false }: { panels: ResultPanel[]; reveal?: boolean }) {
  return (
    <View style={{ gap: space.md }}>
      {panels.map((p, i) => (
        <View key={i} style={{ gap: 6 }}>
          <Txt style={type.tiny} color="faint">
            {p.title ?? DEFAULT_TITLE[p.kind]}
          </Txt>
          {p.kind === 'obs' ? <ObsPanel obs={p.obs} reveal={reveal} /> : null}
          {p.kind === 'bloods' ? <BloodsPanel rows={p.rows} /> : null}
          {p.kind === 'ecg' ? <EcgStrip spec={p.ecg} /> : null}
          {p.kind === 'xray' ? <XrayView spec={p.xray} /> : null}
          {p.kind === 'report' ? <ReportPanel lines={p.lines} /> : null}
        </View>
      ))}
    </View>
  );
}

const DEFAULT_TITLE: Record<ResultPanel['kind'], string> = {
  obs: 'Observations',
  bloods: 'Blood results',
  ecg: 'ECG rhythm strip',
  xray: 'Radiograph',
  report: 'Report',
};

/* ------------------------------------------------------------------ */

const ACVPU = { A: 'Alert', C: 'New confusion', V: 'Responds to voice', P: 'Responds to pain', U: 'Unresponsive' };

function ObsPanel({ obs, reveal }: { obs: Obs; reveal: boolean }) {
  const t = useTheme();
  const n = news2(obs);
  const rows: [string, string, NewsParam][] = [
    ['Resp rate', `${obs.rr} /min`, 'rr'],
    [obs.scale2 ? 'SpO₂ (scale 2)' : 'SpO₂', `${obs.spo2}%`, 'spo2'],
    ['Air or oxygen?', obs.o2 ?? 'Room air', 'o2'],
    ['Blood pressure', `${obs.sbp}/${obs.dbp}`, 'sbp'],
    ['Pulse', `${obs.hr} /min`, 'hr'],
    ['Consciousness', ACVPU[obs.acvpu], 'acvpu'],
    ['Temperature', `${obs.temp.toFixed(1)} °C`, 'temp'],
  ];
  const scoreColour = (s: number) => (s === 3 ? t.bad : s === 2 ? t.warn : s === 1 ? t.inkSoft : t.inkFaint);
  return (
    <View style={{ backgroundColor: t.surfaceAlt, borderRadius: radius.sm, padding: space.md, gap: 6 }}>
      {rows.map(([label, value, key]) => (
        <Row key={key} style={{ justifyContent: 'space-between' }}>
          <Txt style={[type.small, { flex: 1 }]} color="soft">
            {label}
          </Txt>
          <Txt style={[type.bodyStrong, { fontVariant: ['tabular-nums'] }]}>{value}</Txt>
          {reveal ? (
            <Txt style={[type.small, { width: 28, textAlign: 'right', fontWeight: '800' }]} color={scoreColour(n.parts[key])}>
              {n.parts[key]}
            </Txt>
          ) : null}
        </Row>
      ))}
      {reveal ? (
        <View style={{ borderTopWidth: 1, borderTopColor: t.line, paddingTop: 6, gap: 4 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt style={type.bodyStrong}>NEWS2 {n.total}</Txt>
            <Chip
              label={n.risk === 'low-medium' ? 'Low–medium' : n.risk[0].toUpperCase() + n.risk.slice(1)}
              tone={n.risk === 'high' ? 'bad' : n.risk === 'low' ? 'good' : 'warn'}
            />
          </Row>
          <Txt style={type.small} color="soft">
            {n.response}
          </Txt>
        </View>
      ) : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */

function BloodsPanel({ rows }: { rows: BloodRow[] }) {
  const t = useTheme();
  return (
    <View style={{ backgroundColor: t.surfaceAlt, borderRadius: radius.sm, padding: space.md, gap: 6 }}>
      {rows.map((r) => {
        const f = bloodFlag(r);
        const range =
          r.low !== undefined && r.high !== undefined
            ? `${r.low}–${r.high}`
            : r.low !== undefined
              ? `>${r.low}`
              : r.high !== undefined
                ? `<${r.high}`
                : '';
        return (
          <Row key={r.test} style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Txt style={[type.small, { flex: 1 }]} color="soft">
              {r.test}
            </Txt>
            <View style={{ alignItems: 'flex-end' }}>
              <Txt style={[type.bodyStrong, { fontVariant: ['tabular-nums'] }]} color={f ? t.bad : undefined}>
                {r.value}
                {r.unit ? ` ${r.unit}` : ''}
                {f ? ` ${f}` : ''}
              </Txt>
              {r.prev !== undefined ? (
                <Txt style={type.small} color="faint">
                  was {r.prev}
                </Txt>
              ) : null}
            </View>
            <Txt style={[type.small, { width: 76, textAlign: 'right', fontVariant: ['tabular-nums'] }]} color="faint">
              {range}
            </Txt>
          </Row>
        );
      })}
    </View>
  );
}

/* ------------------------------------------------------------------ */

const PX_PER_SEC = 112.5; // 25 mm/s at 4.5 px/mm
const PX_PER_MV = 45; // 10 mm/mV

export function EcgStrip({ spec, seconds = 6 }: { spec: EcgSpec; seconds?: number }) {
  const t = useTheme();
  const trace = ecgTrace(spec, seconds);
  const w = seconds * PX_PER_SEC;
  const h = 140;
  const base = h * 0.64;
  const d = trace.points
    .map(([s, mv], i) => `${i ? 'L' : 'M'}${(s * PX_PER_SEC).toFixed(1)},${(base - mv * PX_PER_MV).toFixed(1)}`)
    .join('');
  const minor = PX_PER_SEC * 0.04; // 1 mm
  const vLines = Array.from({ length: Math.floor(w / minor) + 1 }, (_, i) => i * minor);
  const hLines = Array.from({ length: Math.floor(h / minor) + 1 }, (_, i) => i * minor);
  return (
    <View style={{ gap: 4 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator style={{ borderRadius: radius.sm }}>
        <Svg width={w} height={h} accessibilityLabel="ECG rhythm strip">
          <Rect x={0} y={0} width={w} height={h} fill={t.ecg.paper} />
          {vLines.map((x, i) => (
            <Line key={`v${i}`} x1={x} y1={0} x2={x} y2={h} stroke={i % 5 ? t.ecg.minor : t.ecg.major} strokeWidth={i % 5 ? 0.5 : 1} />
          ))}
          {hLines.map((y, i) => (
            <Line key={`h${i}`} x1={0} y1={y} x2={w} y2={y} stroke={i % 5 ? t.ecg.minor : t.ecg.major} strokeWidth={i % 5 ? 0.5 : 1} />
          ))}
          <Path d={d} stroke={t.ecg.trace} strokeWidth={1.6} fill="none" strokeLinejoin="round" />
        </Svg>
      </ScrollView>
      <Txt style={type.small} color="faint">
        Lead {spec.lead ?? 'II'} · 6 seconds · 25 mm/s, 10 mm/mV · schematic drawing
      </Txt>
    </View>
  );
}

/* ------------------------------------------------------------------ */

/** A schematic radiograph: air is black, soft tissue grey, bone white. Left of the image is the patient's right. */
export function XrayView({ spec }: { spec: XraySpec }) {
  const t = useTheme();
  const x = t.xray;
  const has = (f: string) => spec.findings.includes(f as never);
  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <View style={{ width: '100%', maxWidth: 340, aspectRatio: 300 / 360, borderRadius: radius.sm, overflow: 'hidden' }}>
        <Svg width="100%" height="100%" viewBox="0 0 300 360" accessibilityLabel={spec.view === 'axr' ? 'Abdominal X-ray' : 'Chest X-ray'}>
          <Rect x={0} y={0} width={300} height={360} fill={x.bg} />
          {spec.view === 'axr' ? <Abdomen x={x} findings={spec.findings} /> : <Chest x={x} freeAir={has('free-air')} />}
        </Svg>
      </View>
      <Txt style={type.small} color="faint">
        {spec.view === 'axr' ? 'Abdominal X-ray, supine' : 'Chest X-ray, erect'} · schematic, not a real image · R is on the left
      </Txt>
    </View>
  );
}

type XrayColours = ReturnType<typeof useTheme>['xray'];

function Abdomen({ x, findings }: { x: XrayColours; findings: XraySpec['findings'] }) {
  const sbo = findings.includes('dilated-small-bowel');
  const lbo = findings.includes('dilated-large-bowel');
  const loops = [110, 146, 182, 218];
  return (
    <G>
      {/* soft tissue, liver */}
      <Rect x={18} y={6} width={264} height={354} rx={40} fill={x.soft} />
      <Ellipse cx={92} cy={58} rx={78} ry={52} fill={x.softLight} />
      {/* lower ribs */}
      {[0, 1, 2].map((i) => (
        <G key={i}>
          <Path d={`M136 ${14 + i * 16} Q 70 ${8 + i * 16} 30 ${44 + i * 18}`} stroke={x.bone} strokeWidth={5} fill="none" opacity={0.55} />
          <Path
            d={`M164 ${14 + i * 16} Q 230 ${8 + i * 16} 270 ${44 + i * 18}`}
            stroke={x.bone}
            strokeWidth={5}
            fill="none"
            opacity={0.55}
          />
        </G>
      ))}
      {/* spine */}
      {Array.from({ length: 8 }, (_, i) => (
        <Rect key={i} x={134} y={20 + i * 32} width={32} height={26} rx={4} fill={x.bone} opacity={0.8} />
      ))}
      {/* pelvis */}
      <Path d="M140 278 C 100 270 50 262 34 300 C 44 330 90 336 118 330 L 136 318 Z" fill={x.bone} opacity={0.7} />
      <Path d="M160 278 C 200 270 250 262 266 300 C 256 330 210 336 182 330 L 164 318 Z" fill={x.bone} opacity={0.7} />
      <Path d="M132 278 L 168 278 L 158 330 L 142 330 Z" fill={x.bone} opacity={0.85} />
      <Circle cx={86} cy={356} r={20} fill={x.bone} opacity={0.75} />
      <Circle cx={214} cy={356} r={20} fill={x.bone} opacity={0.75} />

      {sbo ? (
        <G>
          {/* a central stack of dilated small bowel loops, folds crossing the full width */}
          {loops.map((y, i) => (
            <G key={y}>
              <Line x1={78} y1={y} x2={222} y2={y} stroke={x.gas} strokeWidth={28} strokeLinecap="round" />
              {Array.from({ length: 19 }, (_, k) => 82 + k * 7.5).map((lx) => (
                <Line key={lx} x1={lx} y1={y - 12} x2={lx} y2={y + 12} stroke={x.fold} strokeWidth={1.4} opacity={0.8} />
              ))}
              {i < loops.length - 1 ? (
                <Path
                  d={i % 2 ? `M78 ${y} C 56 ${y} 56 ${y + 36} 78 ${y + 36}` : `M222 ${y} C 244 ${y} 244 ${y + 36} 222 ${y + 36}`}
                  stroke={x.gas}
                  strokeWidth={28}
                  fill="none"
                />
              ) : null}
            </G>
          ))}
        </G>
      ) : lbo ? (
        <G>
          {/* a dilated colon framing the abdomen, haustra part-way across */}
          <Path
            d="M70 250 L 70 100 Q 70 80 92 80 L 208 80 Q 230 80 230 100 L 230 250 Q 230 290 170 292"
            stroke={x.gas}
            strokeWidth={36}
            fill="none"
            strokeLinecap="round"
          />
          {Array.from({ length: 10 }, (_, k) => 96 + k * 15).map((y) => (
            <G key={y}>
              <Line x1={52} y1={y} x2={62} y2={y} stroke={x.fold} strokeWidth={1.6} />
              <Line x1={238} y1={y} x2={248} y2={y} stroke={x.fold} strokeWidth={1.6} />
            </G>
          ))}
        </G>
      ) : (
        <G>
          {/* normal: a little gas in the colon */}
          {[
            [74, 236, 10],
            [72, 170, 8],
            [96, 96, 9],
            [150, 104, 8],
            [206, 96, 9],
            [228, 176, 7],
            [176, 286, 9],
          ].map(([cx, cy, r], i) => (
            <Ellipse key={i} cx={cx} cy={cy} rx={r * 1.6} ry={r} fill={x.gas} opacity={0.85} />
          ))}
        </G>
      )}
    </G>
  );
}

function Chest({ x, freeAir }: { x: XrayColours; freeAir: boolean }) {
  return (
    <G>
      {/* trunk and neck */}
      <Path d="M120 0 L 180 0 L 186 30 C 250 40 290 60 296 120 L 296 360 L 4 360 L 4 120 C 10 60 50 40 114 30 Z" fill={x.soft} />
      {/* abdomen below the diaphragm and the liver */}
      <Rect x={4} y={262} width={292} height={98} fill={x.softLight} />
      {/* lungs */}
      <Path d="M124 60 C 80 64 46 100 38 170 C 34 220 40 250 48 262 C 80 236 112 236 132 248 L 134 90 Z" fill={x.gas} />
      <Path d="M176 60 C 220 64 254 100 262 170 C 266 220 260 252 252 270 C 220 250 200 250 176 252 L 168 90 Z" fill={x.gas} />
      {/* free air: a dark crescent under the right hemidiaphragm, above the liver */}
      {freeAir ? <Path d="M58 266 C 80 254 112 254 128 262 C 112 262 82 264 58 270 Z" fill={x.gas} stroke={x.gas} strokeWidth={5} /> : null}
      {/* gastric bubble under the left hemidiaphragm */}
      <Ellipse cx={214} cy={284} rx={20} ry={11} fill={x.gas} />
      {/* mediastinum and heart */}
      <Path d="M132 50 L 170 50 L 176 150 C 226 160 248 210 240 252 C 200 262 150 260 120 250 C 112 220 118 180 128 150 Z" fill={x.soft} />
      {/* ribs and clavicles */}
      {Array.from({ length: 7 }, (_, i) => (
        <G key={i}>
          <Path
            d={`M136 ${70 + i * 26} Q 80 ${56 + i * 26} 42 ${96 + i * 26}`}
            stroke={x.bone}
            strokeWidth={3}
            fill="none"
            opacity={0.45}
          />
          <Path
            d={`M164 ${70 + i * 26} Q 220 ${56 + i * 26} 258 ${96 + i * 26}`}
            stroke={x.bone}
            strokeWidth={3}
            fill="none"
            opacity={0.45}
          />
        </G>
      ))}
      <Path d="M140 44 Q 90 30 40 48" stroke={x.bone} strokeWidth={6} fill="none" opacity={0.8} />
      <Path d="M160 44 Q 210 30 260 48" stroke={x.bone} strokeWidth={6} fill="none" opacity={0.8} />
      {Array.from({ length: 9 }, (_, i) => (
        <Rect key={i} x={140} y={10 + i * 30} width={20} height={24} rx={3} fill={x.bone} opacity={0.35} />
      ))}
    </G>
  );
}

function ReportPanel({ lines }: { lines: string[] }) {
  const t = useTheme();
  return (
    <View style={{ backgroundColor: t.surfaceAlt, borderRadius: radius.sm, padding: space.md, gap: 4 }}>
      {lines.map((l, i) => (
        <Txt key={i} style={type.small}>
          {l}
        </Txt>
      ))}
    </View>
  );
}
