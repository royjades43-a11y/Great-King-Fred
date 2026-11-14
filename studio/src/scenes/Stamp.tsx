import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import type {AssetRef} from '../types';
import {FootageScene} from './FootageScene';
import {theme} from '../theme';

// A timestamp or place card typed over moving footage, instead of a black title card.
export const Stamp: React.FC<{text: string; subtext?: string; assets: AssetRef[]; durationInFrames: number}> = ({
  text,
  subtext,
  assets,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const chars = Math.floor(interpolate(frame, [4, 4 + text.length * 2], [0, text.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const sub = interpolate(frame, [text.length * 2 + 6, text.length * 2 + 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const out = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cursor = Math.floor(frame / 15) % 2 === 0 && chars < text.length + 1;
  return (
    <AbsoluteFill>
      <FootageScene assets={assets} durationInFrames={durationInFrames} />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)'}} />
      <div style={{position: 'absolute', left: 110, top: 300, opacity: out}}>
        <div style={{width: 90, height: 6, backgroundColor: theme.alarm, marginBottom: 26}} />
        <div style={{fontFamily: theme.fontType, fontWeight: 700, fontSize: 132, color: theme.ink, letterSpacing: 4, textShadow: '0 6px 30px rgba(0,0,0,0.8)'}}>
          {text.slice(0, chars)}
          <span style={{opacity: cursor ? 1 : 0, color: theme.accent}}>▌</span>
        </div>
        {subtext ? (
          <div style={{marginTop: 14, fontFamily: theme.fontType, fontSize: 40, color: theme.accent, letterSpacing: 4, textTransform: 'uppercase', opacity: sub}}>
            {subtext}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
