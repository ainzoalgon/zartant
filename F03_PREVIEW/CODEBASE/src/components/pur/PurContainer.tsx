/**
 * PurContainer — Conteneur principal du mode PUR
 * 
 * Gère la sélection du sous-mode et affiche le panel correspondant
 */

import React, { useState, useEffect } from "react";
import { PurModeSelector } from "./PurModeSelector";
import { RankingPanel } from "./RankingPanel";
import { BlurPanel } from "./BlurPanel";
import { ReframingPanel } from "./ReframingPanel";
import { SplitPanel } from "./SplitPanel";
import { AnchorPanel } from "./AnchorPanel";
import type {
  PurMode,
  RankingConfig,
  BlurConfig,
  ReframingConfig,
  SplitConfig,
  AnchorConfig,
  WorkflowData,
} from "../../utils/purTypes";

interface PurContainerProps {
  workflow?: WorkflowData;
  onConfigChange?: (mode: PurMode, config: any) => void;
}

// Configs par défaut
const defaultRankingConfig: RankingConfig = {
  mode: "simple",
  layout: {
    type: "simple",
    rankingVideo: {
      position: "fullscreen",
      heightRatio: 1.0,
    },
  },
  scenes: [
    {
      rank: 1,
      title: "#1 CHAMPION",
      label: "1",
      durationSeconds: 3,
      titleColor: "#FFFFFF",
      titleScale: 2.0,
      titleX: 50,
      titleY: 50,
      animationEntrance: "fade",
      animationSortie: "fade",
    },
  ],
  totalRanks: 1,
  transitionDuration: 0.5,
  shake: 0,
};

const defaultBlurConfig: BlurConfig = {
  enabled: false,
  intensity: 50,
  type: "gaussien",
  zone: "tout",
  centerX: 50,
  centerY: 50,
  size: 50,
  animated: false,
};

const defaultReframingConfig: ReframingConfig = {
  enabled: false,
  mode: "fixe",
  zoom: 100,
  positionX: 50,
  positionY: 50,
};

const defaultSplitConfig: SplitConfig = {
  enabled: false,
  mode: "automatique",
  sceneCount: 3,
  totalDuration: 10,
  scenes: [],
  defaultTransition: "cut",
  transitionDuration: 0.5,
};

const defaultAnchorConfig: AnchorConfig = {
  enabled: false,
  mode: "fixe",
  positionX: 50,
  positionY: 50,
  rotation: 0,
  zoom: 100,
};

export const PurContainer: React.FC<PurContainerProps> = ({
  workflow,
  onConfigChange,
}) => {
  // Déterminer le mode initial depuis le workflow
  const getInitialMode = (): PurMode => {
    if (!workflow) return "ranking";
    const mode = workflow.mode || "";
    if (mode.includes("ranking")) return "ranking";
    if (mode.includes("blur")) return "blur";
    if (mode.includes("reframing")) return "reframing";
    if (mode.includes("split")) return "split";
    if (mode.includes("anchor")) return "anchor";
    return "ranking";
  };

  const [activeMode, setActiveMode] = useState<PurMode>(getInitialMode);
  const [rankingConfig, setRankingConfig] = useState<RankingConfig>(() => {
    // Initialiser avec les données du workflow si disponibles
    if (workflow?.analysis?.ranking_config) {
      const rc = workflow.analysis.ranking_config;
      return {
        ...defaultRankingConfig,
        mode: rc.split ? "split" : "simple",
        totalRanks: rc.rank_count || 1,
        scenes: rc.titles?.map((title: string, i: number) => ({
          rank: i + 1,
          title,
          label: rc.labels?.[i] || `${i + 1}`,
          durationSeconds: 3,
        })) || defaultRankingConfig.scenes,
      };
    }
    return defaultRankingConfig;
  });
  const [blurConfig, setBlurConfig] = useState<BlurConfig>(defaultBlurConfig);
  const [reframingConfig, setReframingConfig] = useState<ReframingConfig>(defaultReframingConfig);
  const [splitConfig, setSplitConfig] = useState<SplitConfig>(() => {
    // Initialiser avec les scènes du workflow si disponibles
    if (workflow?.analysis?.clips_count) {
      const count = workflow.analysis.clips_count;
      const duration = 10; // défaut
      const scenesPerDuration = duration / count;
      const scenes = Array.from({ length: count }, (_, i) => ({
        id: `scene_${i + 1}`,
        startFrame: Math.round(i * scenesPerDuration * 30),
        endFrame: Math.round((i + 1) * scenesPerDuration * 30),
        transition: "cut" as const,
      }));
      return {
        ...defaultSplitConfig,
        sceneCount: count,
        scenes,
      };
    }
    return defaultSplitConfig;
  });
  const [anchorConfig, setAnchorConfig] = useState<AnchorConfig>(defaultAnchorConfig);
  const [activeScene, setActiveScene] = useState(0);

  // Notifier les changements
  useEffect(() => {
    if (onConfigChange) {
      const configs = {
        ranking: rankingConfig,
        blur: blurConfig,
        reframing: reframingConfig,
        split: splitConfig,
        anchor: anchorConfig,
      };
      onConfigChange(activeMode, configs[activeMode]);
    }
  }, [activeMode, rankingConfig, blurConfig, reframingConfig, splitConfig, anchorConfig]);

  // Rendu du panel actif
  const renderPanel = () => {
    switch (activeMode) {
      case "ranking":
        return (
          <RankingPanel
            config={rankingConfig}
            onChange={setRankingConfig}
            activeScene={activeScene}
            onSceneChange={setActiveScene}
          />
        );
      case "blur":
        return <BlurPanel config={blurConfig} onChange={setBlurConfig} />;
      case "reframing":
        return <ReframingPanel config={reframingConfig} onChange={setReframingConfig} />;
      case "split":
        return (
          <SplitPanel
            config={splitConfig}
            onChange={setSplitConfig}
            activeScene={activeScene}
            onSceneChange={setActiveScene}
          />
        );
      case "anchor":
        return <AnchorPanel config={anchorConfig} onChange={setAnchorConfig} />;
      default:
        return null;
    }
  };

  return (
    <div className="pur-container">
      <PurModeSelector activeMode={activeMode} onModeChange={setActiveMode} />
      <div className="pur-panel-content">
        {renderPanel()}
      </div>
    </div>
  );
};

export default PurContainer;
