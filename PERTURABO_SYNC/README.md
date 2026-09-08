# PERTURABO_SYNC — Transfert du fix F04 vers PERTURABO

Le push automatique vers `kioka8877-ux/PERTURABO` est bloqué (le bot
Freebuff n'a pas d'accès en écriture à ce dépôt). Ce dossier contient
TOUT ce qu'il faut pour appliquer le fix manuellement, toi ou un autre
agent de code.

## Le fix en résumé

**Commit `7d28c4e`** — `fix(F04): prune transcripts + budget contexte`

Le run F04 échouait (HTTP 400 : 1 373 335 tokens vs 1 048 576 max sur
kimi-k3) parce que `ContextBuilder.collect_archivum()` chargeait les
~19,5 MB de transcripts word-level dans le prompt du premium.

Le correctif (un seul fichier : `F04_COPYWRITER/CODEBASE/libs/context_builder.py`) :
1. `_walk()` prune les sous-dossiers `transcripts/` partout (doctrine :
   le premium ne voit que les survivants, jamais le flot brut)
2. `os.walk` itéré lazy (un `sorted()` épuisait le générateur avant la prune)
3. Garde-fou `MAX_ARCHIVUM_CHARS = 200 000` après assemblage

Résultat mesuré : contexte **5,2 MB → 26 856 chars** (~7k tokens).

## Méthode 1 — le patch (rapide, 2 commandes)

```bash
# Récupérer le patch :
curl -L https://github.com/ainzoalgon/zartant/raw/main/PERTURABO_SYNC/fix_f04_context_builder.patch -o fix_f04.patch

# Dans ton clone PERTURABO :
cd PERTURABO
git am fix_f04.patch
git push origin main
```

## Méthode 2 — le bundle (fiable, historique complet)

Le bundle `perturabo_full.bundle` (16 MB) transporte tout l'historique
PERTURABO jusqu'au fix inclus — zéro risque de conflit.

```bash
# Récupérer le bundle :
curl -L https://github.com/ainzoalgon/zartant/raw/main/PERTURABO_SYNC/perturabo_full.bundle -o perturabo_full.bundle

# Dans ton clone PERTURABO :
cd PERTURABO
git fetch ../perturabo_full.bundle main:fix-f04   # crée la branche fix-f04
git log --oneline fix-f04 -1                       # doit afficher 7d28c4e
git merge --ff-only fix-f04                        # avance main sur le fix
git push origin main
```

Si `main` local a divergé, remplace le merge par :
`git rebase main fix-f04 && git checkout main && git merge --ff-only fix-f04`

## Méthode 3 — pour un agent de code (sans git am)

Un agent travaillant dans une copie de PERTURABO peut appliquer le fix
à la main : le diff complet est dans `fix_f04_context_builder.patch`
(144 lignes, un seul fichier concerné). Il peut lire le patch et
reproduire les modifications avec ses outils d'édition habituels, puis
committer avec le message du patch.

## Après le push — déclencher F04

1. Onglet **Actions** de `kioka8877-ux/PERTURABO`
2. Workflow `PERTURABO — F04_COPYWRITER PUR (VOX direct)`
3. **Run workflow** — les défauts sont déjà les bons :
   - VOD : `https://www.twitch.tv/videos/2864600351`
   - plateforme : `youtube_shorts`
   - marché : `us_young_english`

## Vérification attendue

Le run doit passer l'étape `F04 generate (premium direct)` — le log
doit montrer un contexte de ~27 KB et non plus 5181 KB. Si un autre
échec apparaît, c'est un nouveau problème (pas celui-ci).
