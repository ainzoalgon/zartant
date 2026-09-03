/**
 * BlurPanel — Panel de contrôle pour le mode Blur
 * 
 * Gère les effets de flou sur la vidéo
 */

import React from "react";
import type { BlurConfig, BlurType, BlurZone } from "../../utils/purTypes";

interface BlurPanelProps {
  config: BlurConfig;
  onChange: (config: BlurConfig) => void;
}

export const BlurPanel: React.FC<BlurPanelProps> = ({ config, onChange }) => {
  return (
    <div className="blur-panel">
      {/* Configuration principale */}
      <div className="panel-section">
        <h3 className="panel-title">🌀 BLUR CONFIG</h3>

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
          <label>Intensité :</label>
          <input
            type="range"
            min={0}
            max={100}
            value={config.intensity}
            onChange={(e) =>
              onChange({ ...config, intensity: parseInt(e.target.value) })
            }
          />
          <span className="control-value">{config.intensity}%</span>
        </div>

        <div className="control-row">
          <label>Type :</label>
          <select
            value={config.type}
            onChange={(e) =>
              onChange({ ...config, type: e.target.value as BlurType })
            }
          >
            <option value="gaussien">Gaussien</option>
            <option value="radial">Radial</option>
            <option value="motion">Motion</option>
          </select>
        </div>

        <div className="control-row">
          <label>Zone :</label>
          <select
            value={config.zone}
            onChange={(e) =>
              onChange({ ...config, zone: e.target.value as BlurZone })
            }
          >
            <option value="tout">Tout</option>
            <option value="centre">Centre</option>
            <option value="bords">Bords</option>
            <option value="personnalise">Personnalisé</option>
          </select>
        </div>
      </div>

      {/* Zone personnalisée */}
      {config.zone === "personnalise" && (
        <div className="panel-section">
          <h3 className="panel-title">📐 ZONE PERSONNALISÉE</h3>

          <div className="control-row">
            <label>Position X :</label>
            <input
              type="range"
              min={0}
              max={100}
              value={config.centerX}
              onChange={(e) =>
                onChange({ ...config, centerX: parseInt(e.target.value) })
              }
            />
            <span className="control-value">{config.centerX}%</span>
          </div>

          <div className="control-row">
            <label>Position Y :</label>
            <input
              type="range"
              min={0}
              max={100}
              value={config.centerY}
              onChange={(e) =>
                onChange({ ...config, centerY: parseInt(e.target.value) })
              }
            />
            <span className="control-value">{config.centerY}%</span>
          </div>

          <div className="control-row">
            <label>Taille :</label>
            <input
              type="range"
              min={10}
              max={100}
              value={config.size}
              onChange={(e) =>
                onChange({ ...config, size: parseInt(e.target.value) })
              }
            />
            <span className="control-value">{config.size}%</span>
          </div>
        </div>
      )}

      {/* Animation */}
      <div className="panel-section">
        <h3 className="panel-title">🎬 ANIMATION</h3>

        <div className="control-row">
          <label>Animé :</label>
          <input
            type="checkbox"
            checked={config.animated}
            onChange={(e) =>
              onChange({ ...config, animated: e.target.checked })
            }
          />
        </div>

        {config.animated && (
          <>
            <div className="control-row">
              <label>Frame début :</label>
              <input
                type="number"
                value={config.frameStart || 0}
                onChange={(e) =>
                  onChange({
                    ...config,
                    frameStart: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="control-row">
              <label>Frame fin :</label>
              <input
                type="number"
                value={config.frameEnd || 100}
                onChange={(e) =>
                  onChange({
                    ...config,
                    frameEnd: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="control-row">
              <label>Courbe :</label>
              <select
                value={config.easing || "lineaire"}
                onChange={(e) =>
                  onChange({ ...config, easing: e.target.value })
                }
              >
                <option value="lineaire">Linéaire</option>
                <option value="ease-in">Ease-in</option>
                <option value="ease-out">Ease-out</option>
                <option value="bounce">Bounce</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BlurPanel;
