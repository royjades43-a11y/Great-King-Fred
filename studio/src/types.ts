// Contract between scripts/build_timeline.mjs and the renderer.
// All times are in seconds, relative to the start of the voiceover.

export type Word = {text: string; start: number; end: number};

export type AssetRef = {
  id: string;
  file: string; // relative to the episode folder, e.g. "footage/clip-01.mp4"
  type: 'video' | 'image';
  duration?: number; // seconds, videos only
  trimIn?: number; // seconds into the clip to start from
  focus?: {x: number; y: number}; // 0..1, where the Ken Burns move should drift toward
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain'; // contain = show the whole image over a blurred backdrop (diagrams, documents)
};

export type EvidenceItem = {asset: AssetRef; note?: string};

export type Scene =
  | {kind: 'footage'; start: number; end: number; assets: AssetRef[]; label?: string}
  | {kind: 'evidence'; start: number; end: number; items: EvidenceItem[]; heading?: string; links?: [number, number][]}
  | {kind: 'title'; start: number; end: number; text: string; subtext?: string; background?: AssetRef}
  | {kind: 'document'; start: number; end: number; source: string; quote: string; highlight?: string; background?: AssetRef}
  | {kind: 'stamp'; start: number; end: number; text: string; subtext?: string; assets: AssetRef[]}
  | {kind: 'route'; start: number; end: number; keyframes: RouteKey[]; title?: string}
  | {kind: 'power'; start: number; end: number; steps: PowerStep[]; title?: string}
  | {kind: 'chart'; start: number; end: number; title: string; bars: ChartBar[]; note?: string}
  | {kind: 'compare'; start: number; end: number; title: string; items: CompareItem[]; note?: string};

export type RouteKey = {clock: string; feet: number; note?: string; drift?: number; t?: number; hideFeet?: boolean};
export type PowerStep = {clock: string; label: string; on: string[]};
export type ChartBar = {label: string; value: number; display?: string; highlight?: boolean};
export type CompareItem = {label: string; length: number; beam?: number; sublabel?: string; highlight?: boolean};

export type MusicCue = {file: string; start: number; end: number; offset: number; volume: number};

export type DocumentaryProps = {
  title: string;
  fps: number;
  duration: number; // seconds
  audio: string; // relative to the episode folder
  words: Word[];
  scenes: Scene[];
  captions: boolean;
  music?: MusicCue[];
};
