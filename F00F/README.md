# F00F — Module Ranking Dev10

> *Le spécialiste du ranking pour LACRIMAE dev10.*

F00F gère la préparation des vidéos de ranking. Il supporte deux modes :
- **ranking_full** : la vidéo ranking prend toute la place
- **ranking_split** : ranking en haut + élément (image/gif/vidéo) en bas

## Modes de fonctionnement

### Ranking Full

```
┌─────────────────────────┐
│                         │
│   VIDÉO DE RANKING      │
│   (100% de l'écran)     │
│                         │
│   Titre: #1 CHAMPION    │
│   Label: 1              │
│                         │
└─────────────────────────┘
```

La vidéo de ranking occupe tout l'écran. Les titres et labels apparaissent par-dessus.

### Ranking Split

```
┌─────────────────────────┐
│   VIDÉO DE RANKING      │
│   (70% en haut)         │
│   Titre: #1 CHAMPION    │
│   Label: 1              │
├─────────────────────────┤
│   ÉLÉMENT VISUEL        │
│   (30% en bas)          │
│   image/gif/vidéo       │
│   change par rank       │
└─────────────────────────┘
```

Le ranking est en haut (70%), un élément visuel change en bas (30%) selon le numéro de rang.

## Usage

```bash
python3 F00F/CODEBASE/f00f.py --workflow F00G/OUT/workflow.json
```

## Entrées

Le module reçoit le `workflow.json` produit par F00G et lit l'étape `f00f`.

```json
{
  "name": "f00f",
  "input": {
    "ranking_config": {
      "split": true,
      "element_type": "image",
      "element_path": "elements/rank_1.png",
      "rank_count": 10,
      "titles": ["#1 CHAMPION", "#2 FINALIST", ...],
      "labels": ["1", "2", ...]
    }
  }
}
```

## Sorties

```text
F00F/OUT/
└── ranking_sources.json    ← config du ranking pour F03/F04
```

### Structure de ranking_sources.json

```json
{
  "mode": "ranking_split",
  "layout": {
    "type": "split",
    "ranking_video": {
      "position": "top",
      "height_ratio": 0.70
    },
    "element": {
      "position": "bottom",
      "height_ratio": 0.30,
      "type": "image",
      "path": "elements/rank_1.png"
    }
  },
  "scenes": [
    {
      "rank": 1,
      "title": "#1 CHAMPION",
      "label": "1",
      "element_index": 0,
      "duration_seconds": 3
    },
    {
      "rank": 2,
      "title": "#2 FINALIST",
      "label": "2",
      "element_index": 1,
      "duration_seconds": 3
    }
  ],
  "total_ranks": 10
}
```

## Éléments visuels (Split mode)

En mode split, un élément visuel s'affiche en bas de l'écran. Cet élément change selon le numéro de rang :

| Type | Description |
|------|-------------|
| `image` | Image PNG/JPG statique |
| `gif` | Animation GIF |
| `video` | Clip vidéo court |

L'élément est associé au rang via `element_index` : chaque rang a son propre élément.

## Contrat avec F00G et F03/F04

```text
F00G
    │ workflow.json (mode = ranking_*)
    │
    ▼
F00F (ce module)
    │ analyse la config ranking
    │ prépare ranking_sources.json
    │
    ▼
F03 Preview
    │ utilise ranking_sources.json
    │ pour afficher le preview du ranking
    │
    ▼
F04 Render
    │ rend la vidéo finale avec le ranking
    │
    ▼
F05/F06 → short_master.mp4
```

## Notes techniques

- Le mode est détecté par F00G via le champ `split` dans le pack
- `ranking_full` : pas d'élément en bas, la vidéo est fullscreen
- `ranking_split` : layout 70/30 (ranking/élément), configurable
- `element_index` permet de mapper un élément spécifique à chaque rang
- La durée par défaut est de 3 secondes par rang (ajustable dans F03)
- Les titres et labels sont fournis par Perturabo via le pack
