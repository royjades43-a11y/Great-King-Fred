import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {EvidenceItem} from '../types';
import {theme} from '../theme';

// Investigation photos pinned to a board, with handwritten notes and red string between them.
const SLOTS: Record<number, {x: number; y: number; r: number}[]> = {
  1: [{x: 960, y: 520, r: -2}],
  2: [
    {x: 600, y: 500, r: -4},
    {x: 1330, y: 560, r: 3},
  ],
  3: [
    {x: 480, y: 420, r: -5},
    {x: 1040, y: 640, r: 2},
    {x: 1500, y: 380, r: 4},
  ],
  4: [
    {x: 500, y: 330, r: -4},
    {x: 1420, y: 330, r: 3},
    {x: 640, y: 770, r: 3},
    {x: 1300, y: 760, r: -3},
  ],
};

export const EvidenceBoard: React.FC<{
  items: EvidenceItem[];
  durationInFrames: number;
  heading?: string;
  links?: [number, number][];
}> = ({items, durationInFrames, heading, links}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const shown = items.slice(0, 4);
  const slots = SLOTS[Math.max(1, shown.length)];
  const stagger = Math.min(36, Math.floor(durationInFrames / (shown.length + 2)));
  const photoW = shown.length <= 2 ? 640 : 520;
  const drift = interpolate(frame, [0, durationInFrames], [1, 1.06]);
  const strings = links ?? shown.slice(1).map((_, i) => [i, i + 1] as [number, number]);

  return (
    <AbsoluteFill style={{backgroundColor: theme.board, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          transform: `scale(${drift})`,
          background:
            'radial-gradient(ellipse at 50% 40%, #4a3f33 0%, #2a2520 70%, #15120f 100%), repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0 2px, transparent 2px 6px)',
        }}
      >
        {heading ? (
          <div
            style={{
              position: 'absolute',
              top: 48,
              left: 0,
              right: 0,
              textAlign: 'center',
              fontFamily: theme.fontType,
              fontSize: 40,
              color: theme.paper,
              letterSpacing: 6,
              textTransform: 'uppercase',
              opacity: interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'}),
            }}
          >
            {heading}
          </div>
        ) : null}

        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          {strings.map(([a, b], i) => {
            const A = slots[a];
            const B = slots[b];
            if (!A || !B) return null;
            const startAt = stagger * (Math.max(a, b) + 1);
            const t = interpolate(frame, [startAt, startAt + 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            const x2 = A.x + (B.x - A.x) * t;
            const y2 = A.y - 170 + (B.y - A.y) * t;
            return (
              <line
                key={i}
                x1={A.x}
                y1={A.y - 170}
                x2={x2}
                y2={y2}
                stroke={theme.alarm}
                strokeWidth={5}
                strokeLinecap="round"
                opacity={t > 0 ? 0.9 : 0}
              />
            );
          })}
        </svg>

        {shown.map((item, i) => {
          const s = slots[i];
          const pop = spring({frame: frame - i * stagger, fps, config: {damping: 14, stiffness: 120}});
          return (
            <div
              key={item.asset.id + i}
              style={{
                position: 'absolute',
                left: s.x - photoW / 2,
                top: s.y - photoW * 0.36,
                width: photoW,
                transform: `rotate(${s.r}deg) scale(${0.85 + 0.15 * pop})`,
                opacity: pop,
                backgroundColor: '#f7f3ea',
                padding: '14px 14px 18px',
                boxShadow: '0 18px 40px rgba(0,0,0,0.6)',
              }}
            >
              <div style={{width: '100%', height: photoW * 0.6, overflow: 'hidden', backgroundColor: '#111'}}>
                <Img src={staticFile(item.asset.file)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
              </div>
              {item.note ? (
                <div
                  style={{
                    marginTop: 12,
                    fontFamily: theme.fontType,
                    fontSize: 26,
                    lineHeight: 1.2,
                    color: '#1d1a16',
                  }}
                >
                  {item.note}
                </div>
              ) : null}
              <div
                style={{
                  position: 'absolute',
                  top: -12,
                  left: photoW / 2 - 12,
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: theme.alarm,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.5)',
                }}
              />
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
