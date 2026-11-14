import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';
import type {AssetRef} from '../types';
import {Media} from './Media';
import {theme} from '../theme';

// Real footage, full screen. Multiple assets split the scene evenly, with short dissolves.
export const FootageScene: React.FC<{assets: AssetRef[]; durationInFrames: number; label?: string}> = ({
  assets,
  durationInFrames,
  label,
}) => {
  const frame = useCurrentFrame();
  const n = Math.max(1, assets.length);
  const each = Math.ceil(durationInFrames / n);
  const labelOpacity = interpolate(frame, [8, 20, Math.min(110, durationInFrames - 10), Math.min(122, durationInFrames)], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill>
      {assets.map((a, i) => {
        const from = i * each;
        const len = i === n - 1 ? durationInFrames - from : each + 8;
        return (
          <Sequence key={`${a.id}-${i}`} from={from} durationInFrames={len}>
            <Dissolve>
              <Media asset={a} durationInFrames={len} seed={i} />
            </Dissolve>
          </Sequence>
        );
      })}
      {label ? (
        <div
          style={{
            position: 'absolute',
            top: 56,
            left: 64,
            opacity: labelOpacity,
            fontFamily: theme.fontType,
            fontSize: 30,
            color: theme.ink,
            letterSpacing: 2,
            textTransform: 'uppercase',
            textShadow: '0 2px 8px rgba(0,0,0,0.9)',
            borderLeft: `4px solid ${theme.alarm}`,
            padding: '8px 18px 8px 16px',
            background: 'rgba(10,10,10,0.72)',
            zIndex: 10,
          }}
        >
          {label}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const Dissolve: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};
