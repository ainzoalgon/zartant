import React, { useState, useEffect } from "react";
import { PurContainer } from "./components/pur";
import type { PurMode, WorkflowData } from "./utils/purTypes";
import "./components/pur/pur.css";

function App() {
  const [workflow, setWorkflow] = useState<WorkflowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger le workflow au démarrage
  useEffect(() => {
    const loadWorkflow = async () => {
      try {
        // Essayer de charger depuis le fichier
        const response = await fetch("/workflow.json");
        if (response.ok) {
          const data = await response.json();
          setWorkflow(data);
        } else {
          // Workflow par défaut pour le dev
          setWorkflow({
            dev: "dev10",
            pack_id: "demo",
            mode: "ranking_split",
            analysis: {
              mode: "ranking_split",
              clips_count: 5,
              titles: ["#1 CHAMPION", "#2 FINALIST", "#3 SEMI-FINALIST", "#4 QUART-FINALIST", "#5 PREMIER TOUR"],
              labels: ["1", "2", "3", "4", "5"],
              has_music: false,
              ranking_config: {
                split: true,
                element_type: "image",
                rank_count: 5,
                titles: ["#1 CHAMPION", "#2 FINALIST", "#3 SEMI-FINALIST", "#4 QUART-FINALIST", "#5 PREMIER TOUR"],
                labels: ["1", "2", "3", "4", "5"],
              },
            },
            steps: [],
          });
        }
      } catch (err) {
        console.error("Erreur chargement workflow:", err);
        setError("Impossible de charger le workflow");
      } finally {
        setLoading(false);
      }
    };

    loadWorkflow();
  }, []);

  const handleConfigChange = (mode: PurMode, config: any) => {
    console.log(`Mode ${mode} modifié:`, config);
    // Ici on pourrait sauvegarder la config ou la transmettre à F04
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Chargement de la preview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h2>Erreur</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>F03 Preview — Mode PUR</h1>
        <div className="app-info">
          <span>Pack: {workflow?.pack_id || "N/A"}</span>
          <span>Mode: {workflow?.mode || "N/A"}</span>
        </div>
      </header>
      
      <main className="app-main">
        <PurContainer workflow={workflow || undefined} onConfigChange={handleConfigChange} />
      </main>
    </div>
  );
}

export default App;
