/**
 * PurModeSelector — Sélecteur de mode PUR
 * 
 * Affiche les onglets pour chaque sous-mode : Ranking, Blur, Reframing, Split, Anchor
 */

import React from "react";
import type { PurMode } from "../../utils/purTypes";

interface PurModeSelectorProps {
  activeMode: PurMode;
  onModeChange: (mode: PurMode) => void;
}

const MODES: { id: PurMode; label: string; icon: string }[] = [
  { id: "ranking", label: "Ranking", icon: "🏆" },
  { id: "blur", label: "Blur", icon: "🌀" },
  { id: "reframing", label: "Reframing", icon: "📐" },
  { id: "split", label: "Split", icon: "✂️" },
  { id: "anchor", label: "Anchor", icon: "📌" },
];

export const PurModeSelector: React.FC<PurModeSelectorProps> = ({
  activeMode,
  onModeChange,
}) => {
  return (
    <div className="pur-mode-selector">
      <div className="pur-mode-tabs">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            className={`pur-mode-tab ${activeMode === mode.id ? "active" : ""}`}
            onClick={() => onModeChange(mode.id)}
          >
            <span className="pur-mode-icon">{mode.icon}</span>
            <span className="pur-mode-label">{mode.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PurModeSelector;
