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
  // Vary the move per asset so consecutive stills don't all zoom the same way:
  // push in, pull out, drift left, drift right, or a near-locked hold.
  let h = seed;
  for (const c of asset.id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const move = h % 5;
  const e = progress * progress * (3 - 2 * progress); // smoothstep
  const scale = move === 0 ? 1.04 + 0.1 * e : move === 1 ? 1.14 - 0.1 * e : move === 4 ? 1.03 + 0.025 * e : 1.1;
  const dx = move === 2 ? 3 - 6 * e : move === 3 ? -3 + 6 * e : 0; // percent of width
  // Diagrams, charts and odd-shaped images would lose their edges (labels, legends) if cropped to 16:9.
  const aspect = asset.width && asset.height ? asset.width / asset.height : 16 / 9;
  const contain = (asset.fit ?? (aspect < 1.7 || aspect > 2.0 ? 'contain' : 'cover')) === 'contain' || fit === 'contain';
  if (contain) {
    const s2 = 1 + 0.05 * progress;
    return (
      <AbsoluteFill style={{backgroundColor: 'black', overflow: 'hidden'}}>
        <Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(40px) brightness(0.35)', transform: 'scale(1.2)'}} />
        <AbsoluteFill style={{padding: '40px 60px 200px', transform: `scale(${s2})`}}>
          <Img src={src} style={{width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6))'}} />
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
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
          transform: `scale(${scale}) translateX(${dx}%)`,
          transformOrigin: `${fx * 100}% ${fy * 100}%`,
        }}
      />
    </AbsoluteFill>
  );
};
