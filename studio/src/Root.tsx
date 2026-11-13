import React from 'react';
import {Composition} from 'remotion';
import {Documentary} from './Documentary';
import type {DocumentaryProps} from './types';

const placeholder: DocumentaryProps = {
  title: 'No episode loaded',
  fps: 30,
  duration: 5,
  audio: '',
  words: [],
  scenes: [{kind: 'title', start: 0, end: 5, text: 'Engineering Failure Studio', subtext: 'Render with --props=episodes/<slug>/build/props.json'}],
  captions: false,
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Documentary"
    component={Documentary as unknown as React.FC<Record<string, unknown>>}
    width={1920}
    height={1080}
    fps={30}
    durationInFrames={150}
    defaultProps={placeholder as unknown as Record<string, unknown>}
    calculateMetadata={({props}) => {
      const p = props as unknown as DocumentaryProps;
      return {fps: p.fps, durationInFrames: Math.max(1, Math.ceil(p.duration * p.fps))};
    }}
  />
);
