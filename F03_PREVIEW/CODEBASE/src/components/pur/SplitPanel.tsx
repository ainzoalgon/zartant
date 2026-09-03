/**
 * SplitPanel — Panel de contrôle pour le mode Split
 * 
 * Gère le découpage en scènes
 */

import React from "react";
import type { SplitConfig, SplitMode, SplitScene, TransitionType } from "../../utils/purTypes";

interface SplitPanelProps {
  config: SplitConfig;
  onChange: (config: SplitConfig) => void;
  activeScene: number;
  onSceneChange: (index: number) => void;
}

export const SplitPanel: React.FC<SplitPanelProps> = ({
  config,
  onChange,
  activeScene,
  onSceneChange,
}) => {
  const handleModeChange = (mode: SplitMode) => {
    onChange({ ...config, mode });
  };

  const handleSceneCountChange = (count: number) => {
    const scenesPerDuration = config.totalDuration / count;
    const newScenes: SplitScene[] = [];
    
    for (let i = 0; i < count; i++) {
      const existingScene = config.scenes[i];
      newScenes.push({
        id: existingScene?.id || `scene_${i + 1}`,
        startFrame: Math.round(i * scenesPerDuration * 30),
        endFrame: Math.round((i + 1) * scenesPerDuration * 30),
        transition: existingScene?.transition || config.defaultTransition,
      });
    }
    
    onChange({ ...config, scenes: newScenes, sceneCount: count });
  };

  const updateScene = (index: number, updates: Partial<SplitScene>) => {
    const newScenes = [...config.scenes];
    newScenes[index] = { ...newScenes[index], ...updates };
    onChange({ ...config, scenes: newScenes });
  };

  const currentScene = config.scenes[activeScene];

  return (
    <div className="split-panel">
      {/* Configuration principale */}
      <div className="panel-section">
        <h3 className="panel-title">✂️ SPLIT CONFIG</h3>

        <div className="control-row">
          <label>Activé :</label>
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) =>
              onChange({ ...config, enabled: e.target.checked })
            }
          />
        </div>

        <div className="control-row">
          <label>Mode :</label>
          <select
            value={config.mode}
            onChange={(e) => handleModeChange(e.target.value as SplitMode)}
          >
            <option value="automatique">Automatique</option>
            <option value="manuel">Manuel</option>
            <option value="beat_sync">Beat sync</option>
          </select>
        </div>

        <div className="control-row">
          <label>Nombre de scènes :</label>
          <input
            type="range"
            min={2}
            max={10}
            value={config.sceneCount}
            onChange={(e) =>
              handleSceneCountChange(parseInt(e.target.value))
            }
          />
          <span className="control-value">{config.sceneCount}</span>
        </div>

        <div className="control-row">
          <label>Durée totale :</label>
          <input
            type="number"
            min={1}
            max={60}
            value={config.totalDuration}
            onChange={(e) =>
              onChange({
                ...config,
                totalDuration: parseInt(e.target.value),
              })
            }
          />
          <span className="control-value">secondes</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="panel-section">
        <h3 className="panel-title">⏱️ TIMELINE</h3>
        
        <div className="timeline-container">
          <div className="timeline-bar">
            {config.scenes.map((scene, index) => {
              const width = (scene.endFrame - scene.startFrame) / 
                (config.totalDuration * 30) * 100;
              return (
                <div
                  key={scene.id}
                  className={`timeline-segment ${index === activeScene ? "active" : ""}`}
                  style={{ width: `${width}%` }}
                  onClick={() => onSceneChange(index)}
                >
                  <span className="segment-label">{index + 1}</span>
                </div>
              );
            })}
          </div>
          <div className="timeline-labels">
            <span>0s</span>
            <span>{config.totalDuration}s</span>
          </div>
        </div>
      </div>

      {/* Scène active */}
      {currentScene && (
        <div className="panel-section">
          <h3 className="panel-title">🎬 SCÈNE {activeScene + 1}</h3>

          <div className="control-row">
            <label>Début :</label>
            <input
              type="number"
              min={0}
              max={config.totalDuration * 30}
              value={currentScene.startFrame}
              onChange={(e) =>
                updateScene(activeScene, {
                  startFrame: parseInt(e.target.value),
                })
              }
            />
            <span className="control-value">frames</span>
          </div>

          <div className="control-row">
            <label>Fin :</label>
            <input
              type="number"
              min={0}
              max={config.totalDuration * 30}
              value={currentScene.endFrame}
              onChange={(e) =>
                updateScene(activeScene, {
                  endFrame: parseInt(e.target.value),
                })
              }
            />
            <span className="control-value">frames</span>
          </div>

          <div className="control-row">
            <label>Transition :</label>
            <select
              value={currentScene.transition}
              onChange={(e) =>
                updateScene(activeScene, {
                  transition: e.target.value as TransitionType,
                })
              }
            >
              <option value="cut">Cut</option>
              <option value="fade">Fade</option>
              <option value="slide">Slide</option>
              <option value="wipe">Wipe</option>
              <option value="zoom">Zoom</option>
            </select>
          </div>
        </div>
      )}

      {/* Transitions globales */}
      <div className="panel-section">
        <h3 className="panel-title">🎨 TRANSITIONS</h3>

        <div className="control-row">
          <label>Transition par défaut :</label>
          <select
            value={config.defaultTransition}
            onChange={(e) =>
              onChange({
                ...config,
                defaultTransition: e.target.value as TransitionType,
              })
            }
          >
            <option value="cut">Cut</option>
            <option value="fade">Fade</option>
            <option value="slide">Slide</option>
            <option value="wipe">Wipe</option>
            <option value="zoom">Zoom</option>
          </select>
        </div>

        <div className="control-row">
          <label>Durée :</label>
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
      </div>
    </div>
  );
};

export default SplitPanel;
