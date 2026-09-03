#!/usr/bin/env python3
"""
F00G — Orchestrateur Dev10
===========================
Point d'entrée principal du pipeline LACRIMAE dev10.
Prend un pack_id, récupère le pack via le bridge, analyse le mode,
et coordonne tous les modules en aval.

Usage:
    python3 f00g.py --pack-id <PACK_ID> [--bridge-url <URL>]
"""

import argparse
import json
import os
import sys
import logging
from pathlib import Path
from typing import Any, Optional

# ── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="[f00g] %(asctime)s — %(levelname)s — %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("f00g")

# ── Constantes ───────────────────────────────────────────────────────────────

MODES_VALIDES = [
    "ranking",
    "ranking_split",
    "ranking_full",
    "blur",
    "reframing",
    "split_scene",
    "anchor",
    "reveal_compilation",
]

ROOT = Path(__file__).resolve().parents[2]  # racine du projet LACRIMAE
F00G_OUT = ROOT / "F00G" / "OUT"
F00G_IN = ROOT / "F00G" / "IN"


# ── Classes ──────────────────────────────────────────────────────────────────


class PackAnalyzer:
    """Analyse un pack récupéré depuis Perturabo et détermine le mode."""

    def __init__(self, pack_data: dict):
        self.pack = pack_data
        self.mode: Optional[str] = None
        self.clips_count: int = 0
        self.titles: list[str] = []
        self.labels: list[str] = []
        self.has_music: bool = False
        self.ranking_config: Optional[dict] = None

    def analyze(self) -> dict:
        """Analyse complète du pack, retourne un dict avec les métadonnées."""
        log.info("Analyse du pack en cours…")

        # Détection du mode
        self.mode = self._detect_mode()
        log.info(f"Mode détecté : {self.mode}")

        # Extraction des clips
        self.clips_count = self._count_clips()
        log.info(f"Nombre de clips : {self.clips_count}")

        # Extraction des titres et labels
        self.titles = self._extract_titles()
        self.labels = self._extract_labels()
        log.info(f"Titres : {self.titles}")
        log.info(f"Labels : {self.labels}")

        # Vérification musique
        self.has_music = self._has_music()
        log.info(f"Musique requise : {self.has_music}")

        # Config ranking si applicable
        if "ranking" in self.mode:
            self.ranking_config = self._extract_ranking_config()
            log.info(f"Config ranking : {self.ranking_config}")

        return {
            "mode": self.mode,
            "clips_count": self.clips_count,
            "titles": self.titles,
            "labels": self.labels,
            "has_music": self.has_music,
            "ranking_config": self.ranking_config,
        }

    def _detect_mode(self) -> str:
        """Détecte le mode du pack."""
        mode = self.pack.get("mode", "unknown")
        if mode not in MODES_VALIDES:
            # Essayer de deviner le mode à partir de la structure
            if "ranking" in str(self.pack).lower():
                split = self.pack.get("split", False)
                return "ranking_split" if split else "ranking_full"
            return "unknown"
        return mode

    def _count_clips(self) -> int:
        """Compte le nombre de clips dans le pack."""
        clips = self.pack.get("clips", [])
        return len(clips) if isinstance(clips, list) else 0

    def _extract_titles(self) -> list[str]:
        """Extrait les titres du pack."""
        return self.pack.get("titles", [])

    def _extract_labels(self) -> list[str]:
        """Extrait les labels du pack."""
        return self.pack.get("labels", [])

    def _has_music(self) -> bool:
        """Vérifie si le pack nécessite de la musique."""
        return bool(self.pack.get("music") or self.pack.get("audio"))

    def _extract_ranking_config(self) -> dict:
        """Extrait la configuration spécifique au ranking."""
        return {
            "split": self.pack.get("split", False),
            "element_type": self.pack.get("element_type", "image"),
            "element_path": self.pack.get("element_path", ""),
            "rank_count": self.pack.get("rank_count", self._count_clips()),
            "titles": self.titles,
            "labels": self.labels,
        }


class WorkflowBuilder:
    """Construit le workflow.json qui décrit toutes les étapes du pipeline."""

    def __init__(self, pack_id: str, analysis: dict, bridge_config: dict):
        self.pack_id = pack_id
        self.analysis = analysis
        self.bridge = bridge_config
        self.steps: list[dict] = []

    def build(self) -> dict:
        """Construit le workflow complet."""
        log.info("Construction du workflow…")

        mode = self.analysis["mode"]

        # Étape 1 : f00e — Préparation des clips
        if mode in ("ranking", "ranking_split", "ranking_full"):
            self._add_f00f_step()
        else:
            self._add_f00e_step()

        # Étape 2 : f00music (optionnel)
        if self.analysis["has_music"]:
            self._add_f00music_step()

        # Étape 3 : Validation f00g
        self._add_validation_step()

        # Étape 4 : f03 Preview
        self._add_f03_step()

        # Étape 5 : f04 Render
        self._add_f04_step()

        # Étape 6 : f05/f06 Finalisation
        self._add_f05_f06_step()

        workflow = {
            "dev": "dev10",
            "pack_id": self.pack_id,
            "mode": mode,
            "analysis": self.analysis,
            "bridge": self.bridge,
            "steps": self.steps,
            "created_by": "f00g",
        }

        log.info(f"Workflow construit avec {len(self.steps)} étapes.")
        return workflow

    def _add_f00e_step(self):
        """Ajoute l'étape f00e — Préparation clips standards."""
        self.steps.append({
            "name": "f00e",
            "description": "Préparation des clips vidéo",
            "module": "F00E",
            "action": "prepare_clips",
            "input": {
                "pack_id": self.pack_id,
                "clips_count": self.analysis["clips_count"],
                "titles": self.analysis["titles"],
                "labels": self.analysis["labels"],
            },
            "output": "reveal_sources.json",
            "status": "pending",
        })

    def _add_f00f_step(self):
        """Ajoute l'étape f00f — Ranking."""
        self.steps.append({
            "name": "f00f",
            "description": "Préparation du ranking",
            "module": "F00F",
            "action": "prepare_ranking",
            "input": {
                "pack_id": self.pack_id,
                "ranking_config": self.analysis["ranking_config"],
            },
            "output": "ranking_sources.json",
            "status": "pending",
        })

    def _add_f00music_step(self):
        """Ajoute l'étape f00music — Analyse audio."""
        self.steps.append({
            "name": "f00music",
            "description": "Analyse de la musique",
            "module": "F00_MUSIC",
            "action": "analyze_audio",
            "input": {"pack_id": self.pack_id},
            "output": "music_timeline.json",
            "status": "pending",
        })

    def _add_validation_step(self):
        """Ajoute l'étape de validation f00g."""
        self.steps.append({
            "name": "f00g_validate",
            "description": "Validation du workflow par f00g",
            "module": "F00G",
            "action": "validate",
            "input": {"pack_id": self.pack_id},
            "checks": [
                "all_clips_ready",
                "metadata_valid",
                "music_ready",
                "rankings_ready",
            ],
            "status": "pending",
        })

    def _add_f03_step(self):
        """Ajoute l'étape f03 — Preview."""
        self.steps.append({
            "name": "f03",
            "description": "Preview interactive",
            "module": "F03_PREVIEW",
            "action": "preview",
            "input": {"workflow_file": "workflow.json"},
            "output": "codex.json",
            "status": "pending",
        })

    def _add_f04_step(self):
        """Ajoute l'étape f04 — Render."""
        self.steps.append({
            "name": "f04",
            "description": "Rendu Remotion",
            "module": "F04_SIGNUM",
            "action": "render",
            "input": {"codex": "codex.json"},
            "output": "short_final.mp4",
            "status": "pending",
        })

    def _add_f05_f06_step(self):
        """Ajoute les étapes f05/f06 — Finalisation."""
        self.steps.append({
            "name": "f05_f06",
            "description": "Camouflage + Luther",
            "modules": ["F05_CAMOUFLAGE", "F06_LUTHER"],
            "actions": ["camouflage", "luther"],
            "input": {"video": "short_final.mp4"},
            "output": "short_master.mp4",
            "status": "pending",
        })


class BridgeClient:
    """Client pour récupérer les packs depuis Perturabo via le bridge."""

    def __init__(self, bridge_url: Optional[str] = None):
        self.bridge_url = bridge_url or os.environ.get(
            "PERTURABO_BRIDGE_URL", "http://localhost:8080"
        )

    def fetch_pack(self, pack_id: str) -> dict:
        """
        Récupère un pack depuis Perturabo via le bridge.
        
        En environnement de production, cela fait un appel HTTP au bridge.
        En dev, on peut utiliser un pack local ou mock.
        """
        log.info(f"Récupération du pack {pack_id} via bridge…")

        # Vérifier d'abord s'il y a un pack local
        local_pack = F00G_IN / f"{pack_id}.json"
        if local_pack.exists():
            log.info(f"Pack local trouvé : {local_pack}")
            with open(local_pack) as f:
                return json.load(f)

        # Sinon, tenter le bridge (à implémenter avec requests/httpx)
        try:
            # TODO: Implémenter l'appel HTTP au bridge
            # import requests
            # resp = requests.get(f"{self.bridge_url}/packs/{pack_id}")
            # return resp.json()
            log.warning(
                "Bridge HTTP non implémenté. Utilisez un pack local dans F00G/IN/"
            )
            return {}
        except Exception as e:
            log.error(f"Erreur bridge : {e}")
            return {}


class F00G:
    """Classe principale de l'orchestrateur f00g."""

    def __init__(self, pack_id: str, bridge_url: Optional[str] = None):
        self.pack_id = pack_id
        self.bridge = BridgeClient(bridge_url)
        self.workflow: Optional[dict] = None

    def run(self) -> dict:
        """Exécute le pipeline complet f00g."""
        log.info(f"═══ F00G — Début du pipeline pour pack {self.pack_id} ═══")

        # 1. Récupérer le pack
        pack_data = self.bridge.fetch_pack(self.pack_id)
        if not pack_data:
            log.error("Pack vide ou introuvable. Arrêt.")
            return {"error": "pack_not_found", "pack_id": self.pack_id}

        # 2. Analyser le pack
        analyzer = PackAnalyzer(pack_data)
        analysis = analyzer.analyze()

        if analysis["mode"] == "unknown":
            log.error("Mode inconnu. Arrêt.")
            return {"error": "unknown_mode", "pack_data": pack_data}

        # 3. Construire le workflow
        builder = WorkflowBuilder(
            pack_id=self.pack_id,
            analysis=analysis,
            bridge_config={"url": self.bridge.bridge_url},
        )
        self.workflow = builder.build()

        # 4. Sauvegarder le workflow
        output_path = F00G_OUT / "workflow.json"
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w") as f:
            json.dump(self.workflow, f, indent=2, ensure_ascii=False)
        log.info(f"Workflow sauvegardé : {output_path}")

        # 5. Sauvegarder l'analyse
        analysis_path = F00G_OUT / "pack_analysis.json"
        with open(analysis_path, "w") as f:
            json.dump(analysis, f, indent=2, ensure_ascii=False)
        log.info(f"Analyse sauvegardée : {analysis_path}")

        log.info("═══ F00G — Pipeline terminé avec succès ═══")
        return self.workflow


# ── Point d'entrée ───────────────────────────────────────────────────────────


def main():
    parser = argparse.ArgumentParser(
        description="F00G — Orchestrateur Dev10 LACRIMAE"
    )
    parser.add_argument(
        "--pack-id",
        required=True,
        help="Identifiant du pack à traiter",
    )
    parser.add_argument(
        "--bridge-url",
        default=None,
        help="URL du bridge Perturabo (défaut: variable d'env PERTURABO_BRIDGE_URL)",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Mode verbeux",
    )
    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    orchestrator = F00G(pack_id=args.pack_id, bridge_url=args.bridge_url)
    result = orchestrator.run()

    # Sortie JSON pour les étapes suivantes
    print(json.dumps(result, indent=2, ensure_ascii=False))

    if "error" in result:
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
