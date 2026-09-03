/**
 * RankingPanel — Panel de contrôle pour le mode Ranking
 * 
 * Gère les deux sous-modes : Simple et Split
 */

import React from "react";
import type { RankingConfig, RankingScene, RankingSubMode } from "../../utils/purTypes";

interface RankingPanelProps {
  config: RankingConfig;
  onChange: (config: RankingConfig) => void;
  activeScene: number;
  onSceneChange: (index: number) => void;
}

export const RankingPanel: React.FC<RankingPanelProps> = ({
  config,
  onChange,
  activeScene,
  onSceneChange,
}) => {
  const handleSubModeChange = (subMode: RankingSubMode) => {
    onChange({
      ...config,
      mode: subMode,
      layout: {
        ...config.layout,
        type: subMode,
        rankingVideo: {
          ...config.layout.rankingVideo,
          heightRatio: subMode === "split" ? 0.7 : 1.0,
        },
        element: subMode === "split"
          ? {
              position: "bottom",
              heightRatio: 0.3,
              type: "image",
              path: "",
            }
          : undefined,
      },
    });
  };

  const handleSceneUpdate = (index: number, updates: Partial<RankingScene>) => {
    const newScenes = [...config.scenes];
    newScenes[index] = { ...newScenes[index], ...updates };
    onChange({ ...config, scenes: newScenes });
  };

  const addScene = () => {
    const newRank = config.scenes.length + 1;
    const newScene: RankingScene = {
      rank: newRank,
      title: `#${newRank} CHAMPION`,
      label: `${newRank}`,
      durationSeconds: 3,
      titleColor: "#FFFFFF",
      titleScale: 2.0,
      titleX: 50,
      titleY: 50,
      animationEntrance: "fade",
      animationSortie: "fade",
    };
    onChange({
      ...config,
      scenes: [...config.scenes, newScene],
      totalRanks: config.totalRanks + 1,
    });
  };

  const removeScene = (index: number) => {
    if (config.scenes.length <= 1) return;
    const newScenes = config.scenes.filter((_, i) => i !== index);
    onChange({
      ...config,
      scenes: newScenes,
      totalRanks: config.totalRanks - 1,
    });
    if (activeScene >= newScenes.length) {
      onSceneChange(newScenes.length - 1);
    }
  };

  const currentScene = config.scenes[activeScene];

  return (
    <div className="ranking-panel">
      {/* Sélection du sous-mode */}
      <div className="panel-section">
        <h3 className="panel-title">🎬 RANKING CONFIG</h3>
        <div className="control-row">
          <label>Mode :</label>
          <div className="toggle-group">
            <button
              className={`toggle-btn ${config.mode === "simple" ? "active" : ""}`}
              onClick={() => handleSubModeChange("simple")}
            >
              Simple
            </button>
            <button
              className={`toggle-btn ${config.mode === "split" ? "active" : ""}`}
              onClick={() => handleSubModeChange("split")}
            >
              Split
            </button>
          </div>
        </div>

        <div className="control-row">
          <label>Nombre de rangs :</label>
          <input
            type="range"
            min={1}
            max={20}
            value={config.totalRanks}
            onChange={(e) => {
              const count = parseInt(e.target.value);
              const diff = count - config.scenes.length;
              let newScenes = [...config.scenes];
              if (diff > 0) {
                for (let i = 0; i < diff; i++) {
                  newScenes.push({
                    rank: newScenes.length + 1,
                    title: `#${newScenes.length + 1} CHAMPION`,
                    label: `${newScenes.length + 1}`,
                    durationSeconds: 3,
                  });
                }
              } else if (diff < 0) {
                newScenes = newScenes.slice(0, count);
              }
              onChange({ ...config, scenes: newScenes, totalRanks: count });
            }}
          />
          <span className="control-value">{config.totalRanks}</span>
        </div>

        <div className="control-row">
          <label>Durée par rang :</label>
          <input
            type="range"
            min={1}
            max={10}
            step={0.5}
            value={config.scenes[activeScene]?.durationSeconds || 3}
            onChange={(e) =>
              handleSceneUpdate(activeScene, {
                durationSeconds: parseFloat(e.target.value),
              })
            }
          />
          <span className="control-value">
            {config.scenes[activeScene]?.durationSeconds || 3}s
          </span>
        </div>
      </div>

      {/* Layout (Split uniquement) */}
      {config.mode === "split" && (
        <div className="panel-section">
          <h3 className="panel-title">📐 LAYOUT</h3>
          <div className="control-row">
            <label>Position vidéo :</label>
            <input
              type="range"
              min={50}
              max={100}
              value={Math.round(config.layout.rankingVideo.heightRatio * 100)}
              onChange={(e) =>
                onChange({
                  ...config,
                  layout: {
                    ...config.layout,
                    rankingVideo: {
                      ...config.layout.rankingVideo,
                      heightRatio: parseInt(e.target.value) / 100,
                    },
                  },
                })
              }
            />
            <span className="control-value">
              {Math.round(config.layout.rankingVideo.heightRatio * 100)}%
            </span>
          </div>

          <div className="control-row">
            <label>Type élément :</label>
            <select
              value={config.layout.element?.type || "image"}
              onChange={(e) =>
                onChange({
                  ...config,
                  layout: {
                    ...config.layout,
                    element: {
                      ...config.layout.element!,
                      type: e.target.value,
                    },
                  },
                })
              }
            >
              <option value="image">Image</option>
              <option value="gif">GIF</option>
              <option value="video">Vidéo</option>
            </select>
          </div>

          <div className="control-row">
            <label>Fichier élément :</label>
            <input
              type="text"
              value={config.layout.element?.path || ""}
              onChange={(e) =>
                onChange({
                  ...config,
                  layout: {
                    ...config.layout,
                    element: {
                      ...config.layout.element!,
                      path: e.target.value,
                    },
                  },
                })
              }
              placeholder="Chemin du fichier"
            />
          </div>
        </div>
      )}

      {/* Navigation entre scènes */}
      <div className="panel-section">
        <h3 className="panel-title">🎬 SCÈNES</h3>
        <div className="scene-navigation">
          <button
            onClick={() => onSceneChange(Math.max(0, activeScene - 1))}
            disabled={activeScene === 0}
          >
            ←
          </button>
          <span>
            Scène {activeScene + 1} / {config.scenes.length}
          </span>
          <button
            onClick={() =>
              onSceneChange(Math.min(config.scenes.length - 1, activeScene + 1))
            }
            disabled={activeScene === config.scenes.length - 1}
          >
            →
          </button>
        </div>

        {currentScene && (
          <div className="scene-editor">
            <div className="control-row">
              <label>Titre :</label>
              <input
                type="text"
                value={currentScene.title}
                onChange={(e) =>
                  handleSceneUpdate(activeScene, { title: e.target.value })
                }
              />
            </div>

            <div className="control-row">
              <label>Label :</label>
              <input
                type="text"
                value={currentScene.label}
                onChange={(e) =>
                  handleSceneUpdate(activeScene, { label: e.target.value })
                }
              />
            </div>

            <div className="control-row">
              <label>Couleur titre :</label>
              <input
                type="color"
                value={currentScene.titleColor || "#FFFFFF"}
                onChange={(e) =>
                  handleSceneUpdate(activeScene, { titleColor: e.target.value })
                }
              />
            </div>

            <div className="control-row">
              <label>Taille titre :</label>
              <input
                type="range"
                min={0.5}
                max={5}
                step={0.1}
                value={currentScene.titleScale || 2}
                onChange={(e) =>
                  handleSceneUpdate(activeScene, {
                    titleScale: parseFloat(e.target.value),
                  })
                }
              />
              <span className="control-value">
                {currentScene.titleScale || 2}x
              </span>
            </div>

            <div className="control-row">
              <label>Position X :</label>
              <input
                type="range"
                min={0}
                max={100}
                value={currentScene.titleX || 50}
                onChange={(e) =>
                  handleSceneUpdate(activeScene, {
                    titleX: parseInt(e.target.value),
                  })
                }
              />
              <span className="control-value">{currentScene.titleX || 50}%</span>
            </div>

            <div className="control-row">
              <label>Position Y :</label>
              <input
                type="range"
                min={0}
                max={100}
                value={currentScene.titleY || 50}
                onChange={(e) =>
                  handleSceneUpdate(activeScene, {
                    titleY: parseInt(e.target.value),
                  })
                }
              />
              <span className="control-value">{currentScene.titleY || 50}%</span>
            </div>

            <div className="control-row">
              <label>Animation entrée :</label>
              <select
                value={currentScene.animationEntrance || "fade"}
                onChange={(e) =>
                  handleSceneUpdate(activeScene, {
                    animationEntrance: e.target.value,
                  })
                }
              >
                <option value="fade">Fade</option>
                <option value="slide">Slide</option>
                <option value="zoom">Zoom</option>
                <option value="cut">Cut</option>
              </select>
            </div>

            <div className="control-row">
              <label>Animation sortie :</label>
              <select
                value={currentScene.animationSortie || "fade"}
                onChange={(e) =>
                  handleSceneUpdate(activeScene, {
                    animationSortie: e.target.value,
                  })
                }
              >
                <option value="fade">Fade</option>
                <option value="slide">Slide</option>
                <option value="zoom">Zoom</option>
                <option value="cut">Cut</option>
              </select>
            </div>

            <button
              className="btn-delete"
              onClick={() => removeScene(activeScene)}
              disabled={config.scenes.length <= 1}
            >
              Supprimer cette scène
            </button>
          </div>
        )}

        <button className="btn-add" onClick={addScene}>
          + Ajouter une scène
        </button>
      </div>

      {/* Transitions globales */}
      <div className="panel-section">
        <h3 className="panel-title">🎨 EFFETS</h3>
        <div className="control-row">
          <label>Durée transition :</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={config.transitionDuration}
            onChange={(e) =>
              onChange({
                ...config,
                transitionDuration: parseFloat(e.target.value),
              })
            }
          />
          <span className="control-value">{config.transitionDuration}s</span>
        </div>

        <div className="control-row">
          <label>Shake :</label>
          <input
            type="range"
            min={0}
            max={100}
            value={config.shake}
            onChange={(e) =>
              onChange({ ...config, shake: parseInt(e.target.value) })
            }
          />
          <span className="control-value">{config.shake}%</span>
        </div>
      </div>
    </div>
  );
};

export default RankingPanel;
