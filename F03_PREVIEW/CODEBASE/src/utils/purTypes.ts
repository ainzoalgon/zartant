/**
 * Types pour le mode PUR de F03 Preview
 */

// ── Modes principaux ──────────────────────────────────────────────────────

export type PurMode = "ranking" | "blur" | "reframing" | "split" | "anchor";

export type RankingSubMode = "simple" | "split";
export type BlurType = "gaussien" | "radial" | "motion";
export type BlurZone = "tout" | "centre" | "bords" | "personnalise";
export type ReframingMode = "fixe" | "suivi_objet" | "keyframe";
export type SplitMode = "automatique" | "manuel" | "beat_sync";
export type AnchorMode = "fixe" | "orbital" | "spiral";
export type TransitionType = "cut" | "fade" | "slide" | "wipe" | "zoom";

// ── Ranking ───────────────────────────────────────────────────────────────

export interface RankingScene {
  rank: number;
  title: string;
  label: string;
  elementIndex?: number;
  durationSeconds: number;
  titleColor?: string;
  titleScale?: number;
  titleX?: number;
  titleY?: number;
  animationEntrance?: string;
  animationSortie?: string;
}

export interface RankingLayout {
  type: RankingSubMode;
  rankingVideo: {
    position: string;
    heightRatio: number;
  };
  element?: {
    position: string;
    heightRatio: number;
    type: string;
    path: string;
  };
}

export interface RankingConfig {
  mode: RankingSubMode;
  layout: RankingLayout;
  scenes: RankingScene[];
  totalRanks: number;
  transitionDuration: number;
  shake: number;
}

// ── Blur ──────────────────────────────────────────────────────────────────

export interface BlurConfig {
  enabled: boolean;
  intensity: number;
  type: BlurType;
  zone: BlurZone;
  centerX: number;
  centerY: number;
  size: number;
  animated: boolean;
  frameStart?: number;
  frameEnd?: number;
  easing?: string;
}

// ── Reframing ─────────────────────────────────────────────────────────────

export interface ReframingConfig {
  enabled: boolean;
  mode: ReframingMode;
  zoom: number;
  positionX: number;
  positionY: number;
  // Suivi objet
  target?: string;
  smoothness?: number;
  margin?: number;
  // Keyframes
  keyframes?: ReframingKeyframe[];
}

export interface ReframingKeyframe {
  frame: number;
  positionX: number;
  positionY: number;
  zoom: number;
}

// ── Split ─────────────────────────────────────────────────────────────────

export interface SplitConfig {
  enabled: boolean;
  mode: SplitMode;
  sceneCount: number;
  totalDuration: number;
  scenes: SplitScene[];
  defaultTransition: TransitionType;
  transitionDuration: number;
}

export interface SplitScene {
  id: string;
  startFrame: number;
  endFrame: number;
  transition: TransitionType;
}

// ── Anchor ────────────────────────────────────────────────────────────────

export interface AnchorConfig {
  enabled: boolean;
  mode: AnchorMode;
  positionX: number;
  positionY: number;
  rotation: number;
  zoom: number;
  // Animation
  speed?: number;
  amplitude?: number;
}

// ── Workflow ──────────────────────────────────────────────────────────────

export interface WorkflowData {
  dev: string;
  pack_id: string;
  mode: string;
  analysis: {
    mode: string;
    clips_count: number;
    titles: string[];
    labels: string[];
    has_music: boolean;
    ranking_config?: any;
  };
  steps: any[];
}

// ── Props communes ────────────────────────────────────────────────────────

export interface PurPanelProps {
  config: any;
  onChange: (config: any) => void;
  scenes?: RankingScene[];
  activeScene?: number;
  onSceneChange?: (index: number) => void;
}
