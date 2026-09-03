# F03 PREVIEW — Dev10 Mode PUR

> *La salle de contrôle interactive pour tous les modes de production.*

F03_PREVIEW est l'interface de visualisation et de configuration pour le pipeline LACRIMAE dev10. Elle supporte le **mode PUR** qui gère tous les sous-modes de production.

## Modes supportés

| Mode | Description | Statut |
|------|-------------|--------|
| **Ranking** | Vidéo de ranking (simple ou split) | ✅ Implémenté |
| **Blur** | Effets de flou | ✅ Implémenté |
| **Reframing** | Recadrage dynamique | ✅ Implémenté |
| **Split** | Découpage en scènes | ✅ Implémenté |
| **Anchor** | Point d'ancrage fixe | ✅ Implémenté |

## Architecture

```
F03_PREVIEW/CODEBASE/src/
├── components/
│   └── pur/
│       ├── PurContainer.tsx      ← Conteneur principal
│       ├── PurModeSelector.tsx    ← Sélecteur de mode
│       ├── RankingPanel.tsx       ← Panel Ranking
│       ├── BlurPanel.tsx          ← Panel Blur
│       ├── ReframingPanel.tsx     ← Panel Reframing
│       ├── SplitPanel.tsx         ← Panel Split
│       ├── AnchorPanel.tsx        ← Panel Anchor
│       ├── pur.css                ← Styles
│       └── index.ts               ← Exportations
├── hooks/
├── utils/
│   └── purTypes.ts                ← Types TypeScript
└── remotion/
```

## Mode Ranking

### Sous-modes

| Sous-mode | Description |
|-----------|-------------|
| **Simple** | Ranking sur 100% de l'écran |
| **Split** | Ranking en haut (70%) + élément en bas (30%) |

### Contrôles

**🎬 RANKING CONFIG**
- Mode : Simple / Split
- Nombre de rangs : 1-20
- Durée par rang : 1-10 secondes

**📐 LAYOUT (Split uniquement)**
- Position vidéo : 50-100%
- Type élément : Image / GIF / Vidéo
- Fichier élément : chemin du fichier

**🎬 SCÈNES**
- Navigation : ← → pour changer de scène
- Titre : texte personnalisé
- Label : numéro ou texte
- Couleur titre : color picker
- Taille titre : 0.5-5x
- Position X/Y : 0-100%
- Animation entrée : Fade / Slide / Zoom / Cut
- Animation sortie : Fade / Slide / Zoom / Cut

**🎨 EFFETS**
- Durée transition : 0-1s
- Shake : 0-100%

## Mode Blur

### Contrôles

**🌀 BLUR CONFIG**
- Activé : checkbox
- Intensité : 0-100%
- Type : Gaussien / Radial / Motion
- Zone : Tout / Centre / Bords / Personnalisé

**📐 ZONE PERSONNALISÉE**
- Position X/Y : 0-100%
- Taille : 10-100%

**🎬 ANIMATION**
- Animé : checkbox
- Frame début/fin : numérique
- Courbe : Linéaire / Ease-in / Ease-out / Bounce

## Mode Reframing

### Contrôles

**📐 REFRAMING CONFIG**
- Activé : checkbox
- Mode : Fixe / Suivi objet / Keyframe
- Zoom : 100-300%
- Position X/Y : 0-100%

**🎯 SUIVI OBJET**
- Objet : Visage / Corps / Personnalisé
- Fluidité : 0-100%
- Marge : 0-50px

**🎬 KEYFRAMES**
- Ajout/suppression de keyframes
- Frame : numérique
- Position X/Y : 0-100%
- Zoom : 100-300%

## Mode Split

### Contrôles

**✂️ SPLIT CONFIG**
- Activé : checkbox
- Mode : Automatique / Manuel / Beat sync
- Nombre de scènes : 2-10
- Durée totale : 1-60 secondes

**⏱️ TIMELINE**
- Visualisation interactive des scènes
- Clic pour sélectionner une scène

**🎬 SCÈNE**
- Début/Fin : frames
- Transition : Cut / Fade / Slide / Wipe / Zoom

**🎨 TRANSITIONS**
- Transition par défaut : type
- Durée : 0-1s

## Mode Anchor

### Contrôles

**📌 ANCHOR CONFIG**
- Activé : checkbox
- Mode : Fixe / Orbital / Spiral
- Position X/Y : 0-100%
- Rotation : 0-360°
- Zoom : 100-300%

**🎬 ANIMATION (Orbital/Spiral)**
- Vitesse : 0-100%
- Amplitude : 0-100%

## Intégration avec F00G

La preview lit le `workflow.json` produit par F00G pour :

1. **Détecter le mode** : le champ `mode` détermine quel onglet afficher
2. **Charger les métadonnées** : titres, labels, nombre de clips
3. **Pré-remplir les contrôles** : valeurs par défaut intelligentes

### Exemple de workflow.json

```json
{
  "mode": "ranking_split",
  "analysis": {
    "ranking_config": {
      "split": true,
      "element_type": "image",
      "rank_count": 10,
      "titles": ["#1 CHAMPION", "#2 FINALIST"],
      "labels": ["1", "2"]
    }
  }
}
```

## Lancement

```bash
cd F03_PREVIEW/CODEBASE
npm ci
npm run dev
```

→ Ouvre `http://localhost:5173`

## Types TypeScript

Tous les types sont définis dans `src/utils/purTypes.ts` :

- `PurMode` : modes principaux
- `RankingConfig` : configuration ranking
- `BlurConfig` : configuration blur
- `ReframingConfig` : configuration reframing
- `SplitConfig` : configuration split
- `AnchorConfig` : configuration anchor
- `WorkflowData` : structure du workflow F00G

## Notes techniques

- **React** : composants fonctionnels avec hooks
- **TypeScript** : typage strict pour la sécurité
- **CSS** : styles modulaires dans `pur.css`
- **Remotion** : composition vidéo (à connecter)
- **State** : géré localement dans PurContainer

## Prochaines étapes

1. Connecter la preview à la composition Remotion
2. Ajouter la prévisualisation vidéo en temps réel
3. Implémenter les contrôles audio (musique, effets sonores)
4. Ajouter l'export des configurations au format JSON
