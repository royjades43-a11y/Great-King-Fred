import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import type {AssetRef} from '../types';
import {Media} from './Media';
import {theme} from '../theme';

// Big text card: episode title, a date/time stamp, a chapter heading.
export const TitleCard: React.FC<{text: string; subtext?: string; background?: AssetRef; durationInFrames: number}> = ({
  text,
  subtext,
  background,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const inT = interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp'});
  const subT = interpolate(frame, [14, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      {background ? (
        <AbsoluteFill style={{opacity: 0.35, filter: 'grayscale(0.6)'}}>
          <Media asset={background} durationInFrames={durationInFrames} />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: 120}}>
        <div
          style={{
            fontFamily: theme.fontDisplay,
            fontWeight: 700,
            fontSize: text.length > 40 ? 84 : 120,
            lineHeight: 1.05,
            color: theme.ink,
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: 4,
            opacity: inT,
            transform: `translateY(${(1 - inT) * 24}px)`,
            textShadow: '0 6px 30px rgba(0,0,0,0.8)',
          }}
        >
          {text}
        </div>
        {subtext ? (
          <div
            style={{
              marginTop: 28,
              fontFamily: theme.fontType,
              fontSize: 38,
              color: theme.accent,
              letterSpacing: 3,
              opacity: subT,
              textAlign: 'center',
            }}
          >
            {subtext}
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
