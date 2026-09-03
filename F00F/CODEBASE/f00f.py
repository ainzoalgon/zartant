#!/usr/bin/env python3
"""
F00F — Module Ranking Dev10
============================
Gère la préparation des vidéos de ranking pour dev10.
Deux modes :
  - ranking_full  : la vidéo ranking prend toute la place
  - ranking_split : ranking en haut + élément (image/gif/vidéo) en bas

Usage:
    python3 f00f.py --workflow workflow.json
"""

import argparse
import json
import os
import sys
import logging
from pathlib import Path
from typing import Optional

# ── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="[f00f] %(asctime)s — %(levelname)s — %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("f00f")

# ── Constantes ───────────────────────────────────────────────────────────────

ROOT = Path(__file__).resolve().parents[2]
F00F_OUT = ROOT / "F00F" / "OUT"
F00F_IN = ROOT / "F00F" / "IN"


# ── Classes ──────────────────────────────────────────────────────────────────


class RankingSplitPreparer:
    """Prépare un ranking en mode split : vidéo en haut + élément en bas."""

    def __init__(self, ranking_config: dict):
        self.config = ranking_config
        self.element_type = ranking_config.get("element_type", "image")
        self.element_path = ranking_config.get("element_path", "")
        self.titles = ranking_config.get("titles", [])
        self.labels = ranking_config.get("labels", [])
        self.rank_count = ranking_config.get("rank_count", 0)

    def prepare(self) -> dict:
        """Prépare la config pour le ranking split."""
        log.info("Préparation du ranking en mode SPLIT")

        # Layout : vidéo ranking en haut (70%), élément en bas (30%)
        layout = {
            "type": "split",
            "ranking_video": {
                "position": "top",
                "height_ratio": 0.70,
                "description": "Vidéo de ranking sur les 70% supérieurs",
            },
            "element": {
                "position": "bottom",
                "height_ratio": 0.30,
                "type": self.element_type,
                "path": self.element_path,
                "description": f"Élément {self.element_type} en bas, change avec chaque rank",
            },
        }

        # Générer les scènes pour chaque rang
        scenes = []
        for i in range(self.rank_count):
            title = self.titles[i] if i < len(self.titles) else f"Rank #{i+1}"
            label = self.labels[i] if i < len(self.labels) else f"{i+1}"
            scenes.append({
                "rank": i + 1,
                "title": title,
                "label": label,
                "element_index": i,  # index pour l'élément en bas
                "duration_seconds": 3,  # défaut, ajustable
            })

        return {
            "mode": "ranking_split",
            "layout": layout,
            "scenes": scenes,
            "total_ranks": self.rank_count,
        }


class RankingFullPreparer:
    """Prépare un ranking en mode full : la vidéo ranking prend toute la place."""

    def __init__(self, ranking_config: dict):
        self.config = ranking_config
        self.titles = ranking_config.get("titles", [])
        self.labels = ranking_config.get("labels", [])
        self.rank_count = ranking_config.get("rank_count", 0)

    def prepare(self) -> dict:
        """Prépare la config pour le ranking full."""
        log.info("Préparation du ranking en mode FULL")

        layout = {
            "type": "full",
            "ranking_video": {
                "position": "fullscreen",
                "height_ratio": 1.0,
                "description": "Vidéo de ranking sur tout l'écran",
            },
        }

        scenes = []
        for i in range(self.rank_count):
            title = self.titles[i] if i < len(self.titles) else f"Rank #{i+1}"
            label = self.labels[i] if i < len(self.labels) else f"{i+1}"
            scenes.append({
                "rank": i + 1,
                "title": title,
                "label": label,
                "duration_seconds": 3,
            })

        return {
            "mode": "ranking_full",
            "layout": layout,
            "scenes": scenes,
            "total_ranks": self.rank_count,
        }


class RankingProcessor:
    """Processeur principal du module ranking."""

    def __init__(self, workflow_path: str):
        self.workflow_path = Path(workflow_path)
        self.workflow: dict = {}
        self.ranking_step: Optional[dict] = None

    def load_workflow(self) -> dict:
        """Charge le workflow depuis f00g."""
        log.info(f"Chargement du workflow : {self.workflow_path}")
        with open(self.workflow_path) as f:
            self.workflow = json.load(f)

        # Trouver l'étape f00f
        for step in self.workflow.get("steps", []):
            if step.get("name") == "f00f":
                self.ranking_step = step
                break

        if not self.ranking_step:
            log.error("Étape f00f introuvable dans le workflow")
            return {}

        return self.ranking_step

    def process(self) -> dict:
        """Traite le ranking selon la config."""
        if not self.ranking_step:
            self.load_workflow()

        if not self.ranking_step:
            return {"error": "no_ranking_step"}

        config = self.ranking_step.get("input", {}).get("ranking_config", {})
        split = config.get("split", False)

        if split:
            preparer = RankingSplitPreparer(config)
        else:
            preparer = RankingFullPreparer(config)

        result = preparer.prepare()

        # Sauvegarder le résultat
        output_path = F00F_OUT / "ranking_sources.json"
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)

        log.info(f"Ranking préparé : {output_path}")

        # Mettre à jour le step dans le workflow
        self.ranking_step["status"] = "done"
        self.ranking_step["output_data"] = result

        return result


# ── Point d'entrée ───────────────────────────────────────────────────────────


def main():
    parser = argparse.ArgumentParser(
        description="F00F — Module Ranking Dev10 LACRIMAE"
    )
    parser.add_argument(
        "--workflow",
        required=True,
        help="Chemin vers le workflow.json généré par f00g",
    )
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    processor = RankingProcessor(workflow_path=args.workflow)
    result = processor.process()

    print(json.dumps(result, indent=2, ensure_ascii=False))

    if "error" in result:
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
