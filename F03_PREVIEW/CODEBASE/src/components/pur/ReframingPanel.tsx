/**
 * ReframingPanel — Panel de contrôle pour le mode Reframing
 * 
 * Gère le recadrage dynamique de la vidéo
 */

import React from "react";
import type { ReframingConfig, ReframingMode, ReframingKeyframe } from "../../utils/purTypes";

interface ReframingPanelProps {
  config: ReframingConfig;
  onChange: (config: ReframingConfig) => void;
}

export const ReframingPanel: React.FC<ReframingPanelProps> = ({
  config,
  onChange,
}) => {
  const handleModeChange = (mode: ReframingMode) => {
    onChange({
      ...config,
      mode,
      // Réinitialiser les propriétés spécifiques au mode
      target: mode === "suivi_objet" ? "visage" : undefined,
      smoothness: mode === "suivi_objet" ? 50 : undefined,
      margin: mode === "suivi_objet" ? 20 : undefined,
      keyframes: mode === "keyframe" ? [] : undefined,
    });
  };

  const addKeyframe = () => {
    const newKeyframe: ReframingKeyframe = {
      frame: config.keyframes?.length
        ? config.keyframes[config.keyframes.length - 1].frame + 30
        : 0,
      positionX: config.positionX,
      positionY: config.positionY,
      zoom: config.zoom,
    };
    onChange({
      ...config,
      keyframes: [...(config.keyframes || []), newKeyframe],
    });
  };

  const updateKeyframe = (index: number, updates: Partial<ReframingKeyframe>) => {
    const newKeyframes = [...(config.keyframes || [])];
    newKeyframes[index] = { ...newKeyframes[index], ...updates };
    onChange({ ...config, keyframes: newKeyframes });
  };

  const removeKeyframe = (index: number) => {
    const newKeyframes = (config.keyframes || []).filter((_, i) => i !== index);
    onChange({ ...config, keyframes: newKeyframes });
  };

  return (
    <div className="reframing-panel">
      {/* Configuration principale */}
      <div className="panel-section">
        <h3 className="panel-title">📐 REFRAMING CONFIG</h3>

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
            onChange={(e) => handleModeChange(e.target.value as ReframingMode)}
          >
            <option value="fixe">Fixe</option>
            <option value="suivi_objet">Suivi objet</option>
            <option value="keyframe">Keyframe</option>
          </select>
        </div>

        <div className="control-row">
          <label>Zoom :</label>
          <input
            type="range"
            min={100}
            max={300}
            value={config.zoom}
            onChange={(e) =>
              onChange({ ...config, zoom: parseInt(e.target.value) })
            }
          />
          <span className="control-value">{config.zoom}%</span>
        </div>

        <div className="control-row">
          <label>Position X :</label>
          <input
            type="range"
            min={0}
            max={100}
            value={config.positionX}
            onChange={(e) =>
              onChange({ ...config, positionX: parseInt(e.target.value) })
            }
          />
          <span className="control-value">{config.positionX}%</span>
        </div>

        <div className="control-row">
          <label>Position Y :</label>
          <input
            type="range"
            min={0}
            max={100}
            value={config.positionY}
            onChange={(e) =>
              onChange({ ...config, positionY: parseInt(e.target.value) })
            }
          />
          <span className="control-value">{config.positionY}%</span>
        </div>
      </div>

      {/* Suivi objet */}
      {config.mode === "suivi_objet" && (
        <div className="panel-section">
          <h3 className="panel-title">🎯 SUIVI OBJET</h3>

          <div className="control-row">
            <label>Objet :</label>
            <select
              value={config.target || "visage"}
              onChange={(e) =>
                onChange({ ...config, target: e.target.value })
              }
            >
              <option value="visage">Visage</option>
              <option value="corps">Corps</option>
              <option value="personnalise">Personnalisé</option>
            </select>
          </div>

          <div className="control-row">
            <label>Fluidité :</label>
            <input
              type="range"
              min={0}
              max={100}
              value={config.smoothness || 50}
              onChange={(e) =>
                onChange({ ...config, smoothness: parseInt(e.target.value) })
              }
            />
            <span className="control-value">{config.smoothness || 50}%</span>
          </div>

          <div className="control-row">
            <label>Marge :</label>
            <input
              type="range"
              min={0}
              max={50}
              value={config.margin || 20}
              onChange={(e) =>
                onChange({ ...config, margin: parseInt(e.target.value) })
              }
            />
            <span className="control-value">{config.margin || 20}px</span>
          </div>
        </div>
      )}

      {/* Keyframes */}
      {config.mode === "keyframe" && (
        <div className="panel-section">
          <h3 className="panel-title">🎬 KEYFRAMES</h3>

          <div className="keyframes-list">
            {(config.keyframes || []).map((kf, index) => (
              <div key={index} className="keyframe-item">
                <div className="keyframe-header">
                  <span>Keyframe {index + 1}</span>
                  <button
                    className="btn-remove"
                    onClick={() => removeKeyframe(index)}
                  >
                    ×
                  </button>
                </div>

                <div className="control-row">
                  <label>Frame :</label>
                  <input
                    type="number"
                    value={kf.frame}
                    onChange={(e) =>
                      updateKeyframe(index, {
                        frame: parseInt(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="control-row">
                  <label>Pos X :</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={kf.positionX}
                    onChange={(e) =>
                      updateKeyframe(index, {
                        positionX: parseInt(e.target.value),
                      })
                    }
                  />
                  <span className="control-value">{kf.positionX}%</span>
                </div>

                <div className="control-row">
                  <label>Pos Y :</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={kf.positionY}
                    onChange={(e) =>
                      updateKeyframe(index, {
                        positionY: parseInt(e.target.value),
                      })
                    }
                  />
                  <span className="control-value">{kf.positionY}%</span>
                </div>

                <div className="control-row">
                  <label>Zoom :</label>
                  <input
                    type="range"
                    min={100}
                    max={300}
                    value={kf.zoom}
                    onChange={(e) =>
                      updateKeyframe(index, {
                        zoom: parseInt(e.target.value),
                      })
                    }
                  />
                  <span className="control-value">{kf.zoom}%</span>
                </div>
              </div>
            ))}
          </div>

          <button className="btn-add" onClick={addKeyframe}>
            + Ajouter keyframe
          </button>
        </div>
      )}
    </div>
  );
};

export default ReframingPanel;
