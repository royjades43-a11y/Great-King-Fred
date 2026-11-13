import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import type {AssetRef} from '../types';
import {Media} from './Media';
import {theme} from '../theme';

// An excerpt from the official report on a sheet of paper, with the key phrase highlighted.
export const DocumentCard: React.FC<{
  source: string;
  quote: string;
  highlight?: string;
  background?: AssetRef;
  durationInFrames: number;
}> = ({source, quote, highlight, background, durationInFrames}) => {
  const frame = useCurrentFrame();
  const inT = interpolate(frame, [0, 16], [0, 1], {extrapolateRight: 'clamp'});
  const hl = interpolate(frame, [24, 54], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const push = interpolate(frame, [0, durationInFrames], [1, 1.05]);

  let before = quote;
  let mark = '';
  let after = '';
  if (highlight) {
    const i = quote.toLowerCase().indexOf(highlight.toLowerCase());
    if (i >= 0) {
      before = quote.slice(0, i);
      mark = quote.slice(i, i + highlight.length);
      after = quote.slice(i + highlight.length);
    }
  }

  return (
    <AbsoluteFill style={{backgroundColor: '#0d0d0d'}}>
      {background ? (
        <AbsoluteFill style={{opacity: 0.25, filter: 'blur(6px) grayscale(1)'}}>
          <Media asset={background} durationInFrames={durationInFrames} />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div
          style={{
            width: 1200,
            backgroundColor: theme.paper,
            padding: '70px 90px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
            transform: `rotate(-1deg) scale(${push}) translateY(${(1 - inT) * 40}px)`,
            opacity: inT,
          }}
        >
          <div style={{fontFamily: theme.fontType, fontSize: 24, color: '#5a5045', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 30}}>
            {source}
          </div>
          <div style={{fontFamily: theme.fontType, fontSize: 44, lineHeight: 1.45, color: '#1b1814'}}>
            “{before}
            {mark ? (
              <span
                style={{
                  backgroundImage: `linear-gradient(transparent 55%, rgba(215,38,43,0.45) 55%)`,
                  backgroundSize: `${hl}% 100%`,
                  backgroundRepeat: 'no-repeat',
                }}
              >
                {mark}
              </span>
            ) : null}
            {after}”
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
