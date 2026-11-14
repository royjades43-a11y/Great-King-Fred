import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import type {DocumentaryProps, Scene} from './types';
import {FootageScene} from './scenes/FootageScene';
import {EvidenceBoard} from './scenes/EvidenceBoard';
import {TitleCard} from './scenes/TitleCard';
import {DocumentCard} from './scenes/DocumentCard';
import {Stamp} from './scenes/Stamp';
import {RouteMap} from './scenes/RouteMap';
import {PowerDiagram} from './scenes/PowerDiagram';
import {Chart} from './scenes/Chart';
import {Compare} from './scenes/Compare';
import {Captions, groupWords} from './scenes/Captions';
import {theme} from './theme';

export const Documentary: React.FC<DocumentaryProps> = ({fps, audio, words, scenes, captions, music}) => {
  const lines = useMemo(() => groupWords(words), [words]);
  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      {scenes.map((scene, i) => {
        const from = Math.round(scene.start * fps);
        const next = scenes[i + 1];
        // Overlap into the next scene so the fade-in never reveals black.
        const to = Math.round(scene.end * fps) + (next ? theme.fadeFrames : 0);
        const len = Math.max(1, to - from);
        return (
          <Sequence key={i} from={from} durationInFrames={len} name={`${i + 1}:${scene.kind}`}>
            <FadeIn first={i === 0}>
              <SceneView scene={scene} durationInFrames={len} />
            </FadeIn>
          </Sequence>
        );
      })}
      <Grade />
      {captions ? <Captions lines={lines} /> : null}
      {audio ? <Audio src={staticFile(audio)} /> : null}
      {(music ?? []).map((m, i) => (
        <Sequence key={`music-${i}`} from={Math.round(m.start * fps)} durationInFrames={Math.max(1, Math.round((m.end - m.start) * fps))}>
          <Audio
            src={staticFile(m.file)}
            startFrom={Math.round(m.offset * fps)}
            volume={(f) => musicVolume(f, m, fps, words)}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const SceneView: React.FC<{scene: Scene; durationInFrames: number}> = ({scene, durationInFrames}) => {
  switch (scene.kind) {
    case 'footage':
      return <FootageScene assets={scene.assets} durationInFrames={durationInFrames} label={scene.label} />;
    case 'evidence':
      return <EvidenceBoard items={scene.items} durationInFrames={durationInFrames} heading={scene.heading} links={scene.links} />;
    case 'title':
      return <TitleCard text={scene.text} subtext={scene.subtext} background={scene.background} durationInFrames={durationInFrames} />;
    case 'stamp':
      return <Stamp text={scene.text} subtext={scene.subtext} assets={scene.assets} durationInFrames={durationInFrames} />;
    case 'route':
      return <RouteMap keyframes={scene.keyframes} title={scene.title} durationInFrames={durationInFrames} />;
    case 'power':
      return <PowerDiagram steps={scene.steps} title={scene.title} durationInFrames={durationInFrames} />;
    case 'chart':
      return <Chart title={scene.title} bars={scene.bars} note={scene.note} durationInFrames={durationInFrames} />;
    case 'compare':
      return <Compare title={scene.title} items={scene.items} note={scene.note} durationInFrames={durationInFrames} />;
    case 'document':
      return (
        <DocumentCard
          source={scene.source}
          quote={scene.quote}
          highlight={scene.highlight}
          background={scene.background}
          durationInFrames={durationInFrames}
        />
      );
  }
};

const FadeIn: React.FC<{first: boolean; children: React.ReactNode}> = ({first, children}) => {
  const frame = useCurrentFrame();
  const opacity = first ? 1 : interpolate(frame, [0, theme.fadeFrames], [0, 1], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};

// Documentary grade: vignette plus a soft bottom gradient so captions always read.
const Grade: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)'}} />
    <AbsoluteFill style={{background: 'linear-gradient(to bottom, transparent 70%, rgba(0,0,0,0.55) 100%)'}} />
  </AbsoluteFill>
);

// Music bed: fades in and out over 2.5 s, sits under the narration, and lifts in pauses longer than ~1 s.
function musicVolume(f: number, m: {start: number; end: number; volume: number}, fps: number, words: {start: number; end: number}[]) {
  const len = (m.end - m.start) * fps;
  const fade = Math.min(1, f / (2.5 * fps), (len - f) / (2.5 * fps));
  const t = m.start + f / fps;
  let lo = 0;
  let hi = words.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (words[mid].end < t) lo = mid + 1;
    else hi = mid;
  }
  const w = words[lo];
  const prevEnd = lo > 0 ? words[lo - 1].end : -10;
  const speaking = w && t >= w.start - 0.35 && t <= w.end + 0.35;
  const gapLen = w ? w.start - prevEnd : 10;
  const inGap = !speaking && (gapLen > 1.0 || !w || t > w.end + 1);
  const lift = inGap ? 2.2 : 1;
  return Math.max(0, Math.min(1, m.volume * lift * Math.max(0, fade)));
}
