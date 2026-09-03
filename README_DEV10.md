# LACRIMAE dev10 — Pipeline Orchestré

> *F00G est le cerveau, le reste suit.*

LACRIMAE dev10 est un pipeline de production de Shorts verticaux avec **orchestration centralisée**. Contrairement à dev8 (révélation compilation), dev10 supporte **plusieurs modes** (ranking, blur, reframing, split_scene, anchor) orchestrés par **F00G**.

## Vue d'ensemble

```text
Pack ID (depuis Perturabo)
        │
        ▼
    F00G — Orchestrateur
    récupère le pack via bridge
    analyse le mode
    coordonne les modules
    produit workflow.json
        │
        ├──► F00E (clips standards)
        ├──► F00F (ranking — split ou full)
        ├──► F00MUSIC (musique optionnelle)
        │
        ▼
    Validation F00G
        │ vérifie que tout est prêt
        │
        ▼
    F03 PREVIEW
    visualisation interactive
        │
        ▼
    F04 SIGNUM
    rendu Remotion → short_final.mp4
        │
        ▼
    F05 CAMOUFLAGE
    H.264 yuv420p, faststart, loudnorm
        │
        ▼
    F06 LUTHER
    nettoyage métadonnées
        │
        ▼
    short_master.mp4 (livrable)
```

## Prérequis

- **Node.js** ≥ 20
- **FFmpeg** (pour F00-E, F05, F06)
- **Python** ≥ 3.8 (pour F00G, F00F, F05, F06)
- **npm** (pour F03 Preview et F04 Render)

## Quickstart

```bash
# 1. Lancer F00G avec un pack local
python3 F00G/CODEBASE/f00g.py --pack-id mon_pack

# 2. Voir le workflow généré
cat F00G/OUT/workflow.json

# 3. Lancer F03 Preview (si mode non-ranking)
cd F03_PREVIEW/CODEBASE
npm ci
npm run dev
```

## Modes supportés

| Mode | Description | Module principal |
|------|-------------|------------------|
| `ranking` | Vidéo de ranking | F00F |
| `ranking_split` | Ranking en haut + élément en bas | F00F |
| `ranking_full` | Ranking sur toute la vidéo | F00F |
| `blur` | Mode blur | F00E |
| `reframing` | Mode reframing | F00E |
| `split_scene` | Scènes découpées | F00E |
| `anchor` | Mode ancrage | F00E |
| `reveal_compilation` | Révélation compilation (dev8) | F00E |

## Frégates dev10

| Étape | Nom | Mission | Sortie |
|-------|-----|---------|--------|
| **F00G** | Orchestrateur | Analyser le pack, coordonner le pipeline | `workflow.json` |
| **F00E** | Clip Prep | Préparer les clips vidéo | `reveal_sources.json` |
| **F00F** | Ranking | Préparer le ranking (split/full) | `ranking_sources.json` |
| **F00-MUSIC** | Audio Analysis | Analyser la musique (optionnel) | `music_timeline.json` |
| **F03** | Preview | Visualisation interactive | `codex.json` validé |
| **F04** | Signum | Rendu Remotion → MP4 | `short_final.mp4` |
| **F05** | Camouflage | Réencodage H.264, faststart, loudnorm | `short_camouflaged.mp4` |
| **F06** | Luther | Nettoyage métadonnées | `short_master.mp4` |

## Workflows GitHub Actions

| Workflow | Fichier | Rôle |
|----------|---------|------|
| F00G | `dev10_f00g.yml` | Orchestrateur (analyse du pack) |
| F00F | `dev10_f00f.yml` | Préparation ranking |
| Pipeline complet | `dev10_full_pipeline.yml` | Exécution complète du pipeline |
| F05+F06 | `f05-f06.yml` | Post-traitement |

## Structure des fichiers

```text
LACRIMAE/
├── README.md                         ← ce fichier
├── README_DEV10.md                   ← documentation dev10
├── F00G/                             ← ORCHESTRATEUR
│   ├── CODEBASE/
│   │   └── f00g.py                   ← script principal
│   ├── IN/                           ← packs locaux (optionnel)
│   ├── OUT/                          ← workflow.json + pack_analysis.json
│   └── README.md
├── F00F/                             ← MODULE RANKING
│   ├── CODEBASE/
│   │   └── f00f.py                   ← script ranking
│   ├── IN/
│   ├── OUT/                          ← ranking_sources.json
│   └── README.md
├── F03_PREVIEW/                      ← Preview interactive
│   ├── CODEBASE/
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   └── README.md
├── F04_SIGNUM/                       ← Rendu Remotion
├── F05_CAMOUFLAGE/                   ← Réencodage + QA
│   ├── CODEBASE/
│   └── README.md
├── F06_LUTHER/                       ← Nettoyage final
│   ├── CODEBASE/
│   └── README.md
└── .github/workflows/
    ├── dev10_f00g.yml                ← F00G Orchestrateur
    ├── dev10_f00f.yml                ← F00F Ranking
    ├── dev10_full_pipeline.yml       ← Pipeline complet
    └── f05-f06.yml                   ← Post-traitement
```

## Flux de travail

### Mode Ranking

```
F00G détecte "ranking" dans le pack
    │
    ├──► F00F prend le relais
    │    │ vérifie split ou full
    │    │ prépare ranking_sources.json
    │    │
    │    ▼
    │    F03 Preview affiche le ranking
    │    (vidéo en haut, élément en bas si split)
    │
    ▼
F04 Render → short_final.mp4
    │
    ▼
F05/F06 → short_master.mp4
```

### Mode Standard (blur, reframing, anchor, etc.)

```
F00G détecte le mode standard
    │
    ├──► F00E prépare les clips
    │    │
    │    ▼
    │    F03 Preview
    │
    ▼
F04 Render → short_final.mp4
    │
    ▼
F05/F06 → short_master.mp4
```

## Format du workflow.json

```json
{
  "dev": "dev10",
  "pack_id": "abc123",
  "mode": "ranking_split",
  "analysis": {
    "mode": "ranking_split",
    "clips_count": 10,
    "titles": ["#1 CHAMPION", "#2 FINALIST"],
    "labels": ["1", "2"],
    "has_music": false,
    "ranking_config": {
      "split": true,
      "element_type": "image",
      "rank_count": 10
    }
  },
  "steps": [
    {
      "name": "f00f",
      "description": "Préparation du ranking",
      "module": "F00F",
      "status": "pending"
    },
    {
      "name": "f00g_validate",
      "description": "Validation du workflow",
      "status": "pending"
    },
    {
      "name": "f03",
      "description": "Preview interactive",
      "status": "pending"
    },
    {
      "name": "f04",
      "description": "Rendu Remotion",
      "status": "pending"
    },
    {
      "name": "f05_f06",
      "description": "Camouflage + Luther",
      "status": "pending"
    }
  ]
}
```

## Bridge Perturabo

F00G utilise un bridge pour récupérer les packs depuis Perturabo.

### Configuration

```bash
# Variable d'environnement
export PERTURABO_BRIDGE_URL=http://localhost:8080

# Ou via le script
python3 F00G/CODEBASE/f00g.py --pack-id abc123 --bridge-url http://localhost:8080
```

### Packs locaux

En développement, placez les packs dans `F00G/IN/` :
- Fichier : `<pack_id>.json`
- F00G les détecte automatiquement

## Notes techniques

- **F00G** ne fait pas de rendu — il orchestre uniquement
- **workflow.json** est le contrat entre tous les modules
- **Validation stricte** : pas de passage à F03 tant que tout n'est pas prêt
- **H.264** requis pour tous les clips (HEVC → timeout Chrome Headless)
- **Timeout** : 120s pour le rendu Remotion (configurable dans package.json)
