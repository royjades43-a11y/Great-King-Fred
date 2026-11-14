import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import type {CompareItem} from '../types';
import {theme} from '../theme';

// To-scale side-by-side comparison (ship lengths and beams), drawn as top-down hull outlines.
export const Compare: React.FC<{title: string; items: CompareItem[]; note?: string; durationInFrames: number}> = ({title, items, note}) => {
  const frame = useCurrentFrame();
  const max = Math.max(...items.map((x) => x.length));
  const scale = 1500 / max;
  return (
    <AbsoluteFill style={{backgroundColor: '#0a1520', padding: '120px 160px'}}>
      <div style={{fontFamily: theme.fontDisplay, fontWeight: 700, fontSize: 64, color: theme.ink, textTransform: 'uppercase'}}>{title}</div>
      <div style={{marginTop: 80}}>
        {items.map((it, i) => {
          const t = Easing.out(Easing.cubic)(interpolate(frame, [10 + i * 30, 55 + i * 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
          const L = it.length * scale * t;
          const B = Math.max(24, (it.beam ?? it.length * 0.15) * scale);
          return (
            <div key={i} style={{marginBottom: 70}}>
              <svg width={1600} height={B + 4}>
                <path
                  d={`M 2 2 L ${Math.max(2, L - B * 0.7)} 2 Q ${L} ${B / 2 + 2} ${Math.max(2, L - B * 0.7)} ${B + 2} L 2 ${B + 2} Z`}
                  fill={it.highlight ? '#e8892a' : '#7f8d99'}
                  stroke={it.highlight ? '#ffd29a' : '#c0c8cf'}
                  strokeWidth={2}
                />
              </svg>
              <div style={{fontFamily: theme.fontType, fontSize: 34, color: it.highlight ? theme.accent : theme.ink, marginTop: 12, opacity: t}}>
                {it.label} · {it.length.toLocaleString('en-US')} FT{it.sublabel ? ` · ${it.sublabel}` : ''}
              </div>
            </div>
          );
        })}
      </div>
      {note ? <div style={{position: 'absolute', left: 160, bottom: 190, fontFamily: theme.fontType, fontSize: 30, color: '#7c8794'}}>{note}</div> : null}
    </AbsoluteFill>
  );
};
