import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {RouteKey} from '../types';
import {theme} from '../theme';

// Schematic of the channel approaching the bridge. The ship's bow moves to each keyframe's distance
// from the bridge; the clock and the distance readout run with it. drift (0..1) pushes the ship toward
// the left-hand pier (the ship's starboard side when heading down the screen).
const W = 1920;
const H = 1080;
const BRIDGE_Y = 740;
const PX_PER_FT = 0.19;
const CX = 960; // channel centre
const CHANNEL_FT = 700;
const PIER_FT = 200; // channel edge to pier

const toSec = (c: string) => {
  const [h, m, s] = c.split(':').map(Number);
  return h * 3600 + m * 60 + (s || 0);
};
const fmt = (sec: number) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const RouteMap: React.FC<{keyframes: RouteKey[]; title?: string; durationInFrames: number}> = ({keyframes, title, durationInFrames}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const n = keyframes.length;
  // When each keyframe is reached (frames). Pinned keyframes use their narration time;
  // the rest are spread so the last one is reached at 65% of the scene, then held.
  const times: number[] = keyframes.map((k, j) =>
    k.t !== undefined ? k.t * fps : j === 0 ? 0 : 10 + ((durationInFrames * 0.65 - 10) * j) / Math.max(1, n - 1),
  );
  for (let j = 1; j < n; j++) times[j] = Math.max(times[j], times[j - 1] + 1);
  let i = 0;
  while (i < n - 2 && frame >= times[i + 1]) i++;
  const A = keyframes[i];
  const B = keyframes[Math.min(n - 1, i + 1)];
  const raw = n > 1 ? interpolate(frame, [times[i], times[Math.min(n - 1, i + 1)]], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
  const local = Easing.inOut(Easing.quad)(raw);
  const feet = A.feet + (B.feet - A.feet) * local;
  const clock = toSec(A.clock) + (toSec(B.clock) - toSec(A.clock)) * local;
  const drift = (A.drift ?? 0) + ((B.drift ?? 0) - (A.drift ?? 0)) * local;
  // a keyframe's note shows only once the ship has reached it
  const note = (raw >= 1 ? B.note : A.note) ?? '';

  const halfChannel = (CHANNEL_FT / 2) * PX_PER_FT;
  const pierOffset = halfChannel + PIER_FT * PX_PER_FT;
  const shipLen = 984 * PX_PER_FT;
  const shipBeam = 158 * PX_PER_FT;
  const bowY = BRIDGE_Y - feet * PX_PER_FT;
  const shipX = CX - drift * (pierOffset - 6);
  const angle = drift * 22; // bow swings toward the pier (stern swings the other way)
  const trailTop = BRIDGE_Y - keyframes[0].feet * PX_PER_FT;
  // camera closes in on the bridge as the ship approaches
  const zoom = interpolate(feet, [0, 1600, 3200], [1.45, 1.15, 0.95], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const focusX = CX - pierOffset * interpolate(feet, [0, 1600], [0.6, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{backgroundColor: '#07121c'}}>
      <svg width={W} height={H} style={{transform: `scale(${zoom})`, transformOrigin: `${focusX}px ${BRIDGE_Y - 40}px`}}>
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(120,170,210,0.08)" strokeWidth="1" />
          </pattern>
          <linearGradient id="water" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#0b2236" />
            <stop offset="1" stopColor="#0f2d47" />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill="url(#grid)" />
        {/* dredged channel */}
        <rect x={CX - halfChannel} y={0} width={halfChannel * 2} height={H} fill="url(#water)" />
        <line x1={CX - halfChannel} y1={0} x2={CX - halfChannel} y2={H} stroke="rgba(150,200,240,0.35)" strokeDasharray="14 10" strokeWidth={2} />
        <line x1={CX + halfChannel} y1={0} x2={CX + halfChannel} y2={H} stroke="rgba(150,200,240,0.35)" strokeDasharray="14 10" strokeWidth={2} />
        <text x={CX + halfChannel + 14} y={BRIDGE_Y - 360} fill="rgba(150,200,240,0.6)" fontFamily="Courier New" fontSize={22}>
          FORT McHENRY CHANNEL · 700 FT
        </text>
        {/* track so far */}
        <line x1={CX} y1={trailTop} x2={shipX} y2={bowY} stroke={theme.accent} strokeOpacity={0.35} strokeWidth={3} strokeDasharray="4 8" />
        {/* bridge */}
        <rect x={0} y={BRIDGE_Y - 8} width={W} height={16} fill="#b9c3cc" />
        {[-1, 1].map((s) => (
          <g key={s}>
            <rect x={CX + s * pierOffset - 14} y={BRIDGE_Y - 22} width={28} height={44} fill={s < 0 ? theme.alarm : '#8a949c'} />
            <text x={CX + s * pierOffset + s * 40} y={BRIDGE_Y - 34} textAnchor={s < 0 ? 'end' : 'start'} fill={s < 0 ? theme.alarm : '#c8d0d6'} fontFamily="Courier New" fontWeight={700} fontSize={26}>
              PIER {s < 0 ? 17 : 18}
            </text>
          </g>
        ))}
        <text x={CX - pierOffset - 420} y={BRIDGE_Y + 48} fill="#c8d0d6" fontFamily="Courier New" fontSize={24}>
          FRANCIS SCOTT KEY BRIDGE
        </text>
        {/* ship */}
        <g transform={`translate(${shipX} ${bowY}) rotate(${angle})`}>
          <path
            d={`M 0 0 L ${shipBeam / 2} ${-shipBeam * 0.9} L ${shipBeam / 2} ${-shipLen} L ${-shipBeam / 2} ${-shipLen} L ${-shipBeam / 2} ${-shipBeam * 0.9} Z`}
            fill="#e8892a"
            stroke="#ffd29a"
            strokeWidth={2}
          />
          <rect x={-shipBeam / 2 + 3} y={-shipLen * 0.86} width={shipBeam - 6} height={shipLen * 0.08} fill="#fff3e0" />
        </g>
        <text x={shipX + shipBeam + 40} y={bowY - shipLen * 0.75} fill="#ffd29a" fontFamily="Courier New" fontSize={24} fontWeight={700}>
          DALI · 984 FT
        </text>
      </svg>
      {/* readouts */}
      <div style={{position: 'absolute', right: 80, top: 110, textAlign: 'right', fontFamily: theme.fontType, color: theme.ink}}>
        <div style={{fontSize: 30, letterSpacing: 4, color: '#8fb4d0'}}>{title ?? 'MARCH 26, 2024'}</div>
        <div style={{fontSize: 110, fontWeight: 700, color: theme.accent}}>{fmt(clock)}</div>
        <div style={{fontSize: 46, marginTop: 6}}>{Math.max(0, Math.round(feet)).toLocaleString('en-US')} FT TO THE BRIDGE</div>
        <div style={{fontSize: 34, marginTop: 18, color: theme.alarm, minHeight: 40, letterSpacing: 2, textTransform: 'uppercase'}}>{note}</div>
      </div>
    </AbsoluteFill>
  );
};
