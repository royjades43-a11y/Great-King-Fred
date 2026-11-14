import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import type {PowerStep} from '../types';
import {theme} from '../theme';

// Simplified one-line diagram of the ship's power plant. Each step lists which nodes are energised;
// lit nodes and the lines between them glow, the rest go dark.
type Node = {id: string; label: string; x: number; y: number; w?: number};
const NODES: Node[] = [
  {id: 'DG2', label: 'GENERATOR 2', x: 260, y: 230},
  {id: 'DG3', label: 'GENERATOR 3', x: 560, y: 230},
  {id: 'DG4', label: 'GENERATOR 4', x: 860, y: 230},
  {id: 'HV', label: 'HIGH-VOLTAGE BOARD', x: 560, y: 420, w: 560},
  {id: 'ME', label: 'MAIN ENGINE', x: 1300, y: 420},
  {id: 'TR', label: 'BREAKER HR1 + TRANSFORMER', x: 560, y: 600, w: 460},
  {id: 'LV', label: 'LOW-VOLTAGE BOARD', x: 560, y: 780, w: 560},
  {id: 'STEER', label: 'STEERING PUMPS', x: 260, y: 950},
  {id: 'COOL', label: 'COOLING PUMP', x: 560, y: 950},
  {id: 'FUEL', label: 'FLUSHING (FUEL) PUMP', x: 880, y: 950, w: 330},
  {id: 'LIGHTS', label: 'LIGHTS', x: 1180, y: 950},
  {id: 'EG', label: 'EMERGENCY GENERATOR', x: 1500, y: 780, w: 340},
];
const EDGES: [string, string][] = [
  ['DG2', 'HV'], ['DG3', 'HV'], ['DG4', 'HV'], ['HV', 'ME'], ['HV', 'TR'], ['TR', 'LV'],
  ['LV', 'STEER'], ['LV', 'COOL'], ['LV', 'FUEL'], ['LV', 'LIGHTS'], ['COOL', 'ME'], ['EG', 'LIGHTS'],
];
const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));

export const PowerDiagram: React.FC<{steps: PowerStep[]; title?: string; durationInFrames: number}> = ({steps, title, durationInFrames}) => {
  const frame = useCurrentFrame();
  const per = durationInFrames / Math.max(1, steps.length);
  const idx = Math.min(steps.length - 1, Math.floor(frame / per));
  const local = frame - idx * per;
  const step = steps[idx];
  const prev = steps[Math.max(0, idx - 1)];
  const on = new Set(step.on);
  const was = new Set(prev.on);
  const flicker = (id: string) => {
    if (idx === 0 || on.has(id) === was.has(id)) return on.has(id) ? 1 : 0;
    // changing state: flicker for a few frames, then settle
    const t = interpolate(local, [0, 14], [0, 1], {extrapolateRight: 'clamp'});
    const blink = local < 14 && Math.floor(local / 2) % 2 === 0;
    return on.has(id) ? (blink ? 0.3 : t) : blink ? 0.8 : 1 - t;
  };
  const glow = (v: number) => `rgba(255, 196, 64, ${0.15 + 0.85 * v})`;

  return (
    <AbsoluteFill style={{backgroundColor: '#0a0c10'}}>
      <svg width={1920} height={1080}>
        {EDGES.map(([a, b], k) => {
          const A = byId[a];
          const B = byId[b];
          const v = Math.min(flicker(a), flicker(b));
          return <line key={k} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={glow(v)} strokeWidth={v > 0.5 ? 6 : 3} />;
        })}
        {NODES.map((n) => {
          const v = flicker(n.id);
          const w = n.w ?? 280;
          return (
            <g key={n.id}>
              <rect x={n.x - w / 2} y={n.y - 36} width={w} height={72} rx={8} fill={v > 0.5 ? '#3a2a08' : '#14171c'} stroke={glow(v)} strokeWidth={3} />
              <text x={n.x} y={n.y + 9} textAnchor="middle" fontFamily="Courier New" fontWeight={700} fontSize={24} fill={v > 0.5 ? '#ffd27a' : '#59606a'}>
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{position: 'absolute', right: 70, top: 70, textAlign: 'right', fontFamily: theme.fontType}}>
        <div style={{fontSize: 28, color: '#7c8794', letterSpacing: 4}}>{title ?? "THE DALI'S POWER PLANT"}</div>
        <div style={{fontSize: 96, fontWeight: 700, color: theme.accent}}>{step.clock}</div>
        <div style={{fontSize: 36, color: theme.ink, maxWidth: 560, marginLeft: 'auto', textTransform: 'uppercase'}}>{step.label}</div>
      </div>
      <div style={{position: 'absolute', left: 70, top: 1000 - 960, fontFamily: theme.fontType, fontSize: 22, color: '#59606a'}}>
        SIMPLIFIED FROM NTSB MIR-25-40 FIGURES 5–16
      </div>
    </AbsoluteFill>
  );
};
