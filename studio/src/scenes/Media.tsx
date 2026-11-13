import React from 'react';
import {AbsoluteFill, Img, Loop, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {AssetRef} from '../types';

// Full-bleed media. Videos fill the frame (cover) and loop if the segment outlasts the clip.
// Stills get a slow Ken Burns push so nothing on screen is ever frozen.
export const Media: React.FC<{asset: AssetRef; durationInFrames: number; seed?: number; fit?: 'cover' | 'contain'}> = ({
  asset,
  durationInFrames,
  seed = 0,
  fit = 'cover',
}) => {
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const src = staticFile(asset.file);

  if (asset.type === 'video') {
    const trimIn = Math.round((asset.trimIn ?? 0) * fps);
    const usable = asset.duration ? Math.max(1, Math.floor(asset.duration * fps) - trimIn) : durationInFrames;
    const video = (
      <OffthreadVideo
        src={src}
        muted
        startFrom={trimIn}
        style={{width: '100%', height: '100%', objectFit: fit}}
      />
    );
    return (
      <AbsoluteFill style={{backgroundColor: 'black'}}>
        {usable < durationInFrames ? <Loop durationInFrames={usable}>{video}</Loop> : video}
      </AbsoluteFill>
    );
  }

  const progress = interpolate(frame, [0, Math.max(1, durationInFrames)], [0, 1], {extrapolateRight: 'clamp'});
  const zoomIn = seed % 2 === 0;
  const scale = zoomIn ? 1.04 + 0.12 * progress : 1.16 - 0.12 * progress;
  const fx = asset.focus?.x ?? (seed % 3 === 0 ? 0.4 : seed % 3 === 1 ? 0.6 : 0.5);
  const fy = asset.focus?.y ?? 0.45;
  return (
    <AbsoluteFill style={{backgroundColor: 'black', overflow: 'hidden'}}>
      <Img
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: fit,
          transform: `scale(${scale})`,
          transformOrigin: `${fx * 100}% ${fy * 100}%`,
        }}
      />
    </AbsoluteFill>
  );
};
