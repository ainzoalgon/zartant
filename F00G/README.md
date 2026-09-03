# F00G — Orchestrateur Dev10

> *Le cerveau du pipeline LACRIMAE dev10.*

F00G est le point d'entrée principal du pipeline dev10. Il récupère un pack via le bridge Perturabo, analyse le mode requis, coordonne tous les modules en aval, et produit un `workflow.json` structuré.

## Architecture

```
Pack ID
    │
    ▼
F00G (ce module)
    │ récupère pack via bridge
    │ analyse le mode
    │ coordonne f00e/f00f/f00music
    │ valide tout
    │ produit workflow.json
    │
    ├──► F00E (clips standards)
    ├──► F00F (ranking)
    ├──► F00MUSIC (musique optionnelle)
    │
    ▼
F03 Preview → F04 Render → F05/F06 Finalisation
```

## Usage

```bash
# Mode local (pack dans F00G/IN/)
python3 F00G/CODEBASE/f00g.py --pack-id mon_pack

# Mode bridge (via Perturabo)
python3 F00G/CODEBASE/f00g.py --pack-id mon_pack --bridge-url http://localhost:8080
```

## Entrées

```text
F00G/IN/
└── <pack_id>.json     ← pack depuis Perturabo (ou copié localement)
```

## Sorties

```text
F00G/OUT/
├── workflow.json      ← workflow complet avec toutes les étapes
└── pack_analysis.json ← analyse détaillée du pack
```

## Modes supportés

| Mode | Description |
|------|-------------|
| `ranking` | Vidéo de ranking (détecte automatiquement split/full) |
| `ranking_split` | Ranking en haut + élément en bas |
| `ranking_full` | Ranking sur toute la vidéo |
| `blur` | Mode blur |
| `reframing` | Mode reframing |
| `split_scene` | Scènes découpées |
| `anchor` | Mode ancrage |
| `reveal_compilation` | Révélation compilation (dev8) |

## Comment ça marche

1. **Récupération du pack** : F00G utilise le bridge pour récupérer le pack depuis Perturabo via le `pack_id`. En dev, on peut placer le pack directement dans `F00G/IN/`.

2. **Analyse du pack** : Le `PackAnalyzer` détecte le mode, compte les clips, extrait les titres/labels, vérifie si la musique est requise, et configure le ranking si nécessaire.

3. **Construction du workflow** : Le `WorkflowBuilder` crée un JSON structuré avec toutes les étapes du pipeline, leurs dépendances, et leurs entrées/sorties.

4. **Coordination** : F00G détermine quelles modules appeler (f00e, f00f, f00music) selon le mode détecté.

5. **Validation** : Avant de passer à F03, F00G vérifie que tout est prêt (clips, métadonnées, musique, rankings).

## Structure du workflow.json

```json
{
  "dev": "dev10",
  "pack_id": "abc123",
  "mode": "ranking_split",
  "analysis": { "..." },
  "bridge": { "url": "http://localhost:8080" },
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

F00G utilise un bridge pour récupérer les packs depuis Perturabo. Le bridge accède à l'export de Perturabo.

### Configuration

- Variable d'environnement : `PERTURABO_BRIDGE_URL`
- Défaut : `http://localhost:8080`

### Packs locaux

En développement, vous pouvez placer les packs directement dans `F00G/IN/` :
- Fichier : `<pack_id>.json`
- Format : même structure que la réponse du bridge

## Prérequis

- Python ≥ 3.8
- Pas de dépendances externes pour la version de base

## Notes techniques

- F00g ne fait pas de rendu vidéo — il orchestre les modules spécialisés
- Le `workflow.json` est le contrat entre tous les modules
- En cas d'erreur, F00g sort un JSON avec un champ `error` et quitte avec le code 1
- La validation est stricte : pas de passage à F03 tant que tout n'est pas prêt
