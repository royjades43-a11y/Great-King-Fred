import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import type {ChartBar} from '../types';
import {theme} from '../theme';

// Horizontal bars that grow in, scaled to the largest value.
export const Chart: React.FC<{title: string; bars: ChartBar[]; note?: string; durationInFrames: number}> = ({title, bars, note}) => {
  const frame = useCurrentFrame();
  const max = Math.max(...bars.map((b) => b.value));
  const maxW = 1200;
  return (
    <AbsoluteFill style={{backgroundColor: '#0b0d10', padding: '140px 160px'}}>
      <div style={{fontFamily: theme.fontDisplay, fontWeight: 700, fontSize: 64, color: theme.ink, textTransform: 'uppercase', letterSpacing: 2}}>{title}</div>
      <div style={{marginTop: 70}}>
        {bars.map((b, i) => {
          const t = Easing.out(Easing.cubic)(interpolate(frame, [12 + i * 22, 52 + i * 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
          const w = Math.max(6, (b.value / max) * maxW * t);
          return (
            <div key={i} style={{marginBottom: 56}}>
              <div style={{fontFamily: theme.fontType, fontSize: 32, color: '#9aa4ae', marginBottom: 12, textTransform: 'uppercase'}}>{b.label}</div>
              <div style={{display: 'flex', alignItems: 'center'}}>
                <div style={{width: w, height: 70, backgroundColor: b.highlight ? theme.alarm : '#5d6b78', boxShadow: b.highlight ? '0 0 30px rgba(215,38,43,0.5)' : 'none'}} />
                <div style={{marginLeft: 26, fontFamily: theme.fontType, fontWeight: 700, fontSize: 46, color: b.highlight ? theme.accent : theme.ink, opacity: t}}>
                  {b.display ?? String(b.value)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {note ? (
        <div style={{position: 'absolute', left: 160, bottom: 190, fontFamily: theme.fontType, fontSize: 30, color: '#7c8794', opacity: interpolate(frame, [60, 80], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
          {note}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
