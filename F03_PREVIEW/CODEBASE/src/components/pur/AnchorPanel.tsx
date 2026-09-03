/**
 * AnchorPanel — Panel de contrôle pour le mode Anchor
 * 
 * Gère le point d'ancrage fixe de la vidéo
 */

import React from "react";
import type { AnchorConfig, AnchorMode } from "../../utils/purTypes";

interface AnchorPanelProps {
  config: AnchorConfig;
  onChange: (config: AnchorConfig) => void;
}

export const AnchorPanel: React.FC<AnchorPanelProps> = ({ config, onChange }) => {
  const handleModeChange = (mode: AnchorMode) => {
    onChange({
      ...config,
      mode,
      speed: mode === "fixe" ? undefined : 50,
      amplitude: mode === "fixe" ? undefined : 50,
    });
  };

  return (
    <div className="anchor-panel">
      {/* Configuration principale */}
      <div className="panel-section">
        <h3 className="panel-title">📌 ANCHOR CONFIG</h3>

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
            onChange={(e) => handleModeChange(e.target.value as AnchorMode)}
          >
            <option value="fixe">Fixe</option>
            <option value="orbital">Orbital</option>
            <option value="spiral">Spiral</option>
          </select>
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

        <div className="control-row">
          <label>Rotation :</label>
          <input
            type="range"
            min={0}
            max={360}
            value={config.rotation}
            onChange={(e) =>
              onChange({ ...config, rotation: parseInt(e.target.value) })
            }
          />
          <span className="control-value">{config.rotation}°</span>
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
      </div>

      {/* Animation (pour orbital et spiral) */}
      {config.mode !== "fixe" && (
        <div className="panel-section">
          <h3 className="panel-title">🎬 ANIMATION</h3>

          <div className="control-row">
            <label>Vitesse :</label>
            <input
              type="range"
              min={0}
              max={100}
              value={config.speed || 50}
              onChange={(e) =>
                onChange({ ...config, speed: parseInt(e.target.value) })
              }
            />
            <span className="control-value">{config.speed || 50}%</span>
          </div>

          <div className="control-row">
            <label>Amplitude :</label>
            <input
              type="range"
              min={0}
              max={100}
              value={config.amplitude || 50}
              onChange={(e) =>
                onChange({ ...config, amplitude: parseInt(e.target.value) })
              }
            />
            <span className="control-value">{config.amplitude || 50}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnchorPanel;
