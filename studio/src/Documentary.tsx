import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import type {DocumentaryProps, Scene} from './types';
import {FootageScene} from './scenes/FootageScene';
import {EvidenceBoard} from './scenes/EvidenceBoard';
import {TitleCard} from './scenes/TitleCard';
import {DocumentCard} from './scenes/DocumentCard';
import {Captions, groupWords} from './scenes/Captions';
import {theme} from './theme';

export const Documentary: React.FC<DocumentaryProps> = ({fps, audio, words, scenes, captions}) => {
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
