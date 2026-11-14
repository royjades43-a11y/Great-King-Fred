import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Word} from '../types';
import {theme} from '../theme';

// Word-by-word captions. Words are grouped into short lines; the word being spoken lights up.
type Line = {words: Word[]; start: number; end: number};

export function groupWords(words: Word[], maxWords = 7, maxGap = 0.6): Line[] {
  const lines: Line[] = [];
  let cur: Word[] = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const prev = cur[cur.length - 1];
    const sentenceEnd = prev && /[.!?…]["”']?$/.test(prev.text);
    if (cur.length && (cur.length >= maxWords || w.start - prev.end > maxGap || sentenceEnd)) {
      lines.push({words: cur, start: cur[0].start, end: cur[cur.length - 1].end});
      cur = [];
    }
    cur.push(w);
  }
  if (cur.length) lines.push({words: cur, start: cur[0].start, end: cur[cur.length - 1].end});
  return lines;
}

export const Captions: React.FC<{lines: Line[]}> = ({lines}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const line = lines.find((l, i) => t >= l.start - 0.05 && t < (lines[i + 1]?.start ?? l.end + 0.6));
  if (!line) return null;
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 90}}>
      <div
        style={{
          maxWidth: 1500,
          textAlign: 'center',
          fontFamily: theme.fontBody,
          fontWeight: 800,
          fontSize: 58,
          lineHeight: 1.2,
          color: theme.ink,
          textShadow: '0 3px 0 #000, 0 0 18px rgba(0,0,0,0.95)',
          WebkitTextStroke: '1.5px rgba(0,0,0,0.85)',
        }}
      >
        {line.words.map((w, i) => {
          const active = t >= w.start && t < w.end + 0.08;
          const spoken = t >= w.end;
          return (
            <span
              key={i}
              style={{
                color: active ? theme.accent : spoken ? theme.ink : 'rgba(244,239,230,0.72)',
                display: 'inline-block',
                transform: active ? 'scale(1.08)' : 'none',
                margin: '0 15px',
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
