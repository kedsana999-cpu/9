# Atelier d'écriture

Un atelier personnel pour écrire des nouvelles et des romans, et **garder l'envie d'écrire**.
L'appli fonctionne dans le navigateur, sur ordinateur comme sur téléphone, même sans connexion.
Tes textes restent sur ton appareil.

## Ce qu'il y a dedans

| Partie | À quoi ça sert |
|---|---|
| **Dossiers** | Un dossier = une histoire. Tout est enregistré automatiquement. |
| **Manuscrit** | Les chapitres, avec un compteur de mots, un état (idée, brouillon, relecture, terminé) et un **mode concentration**. L'Atelier retient où se trouvait ton curseur. |
| **📌 Note pour la prochaine fois** | Avant de partir, tu notes où tu t'es arrêté·e. La note t'attend sur l'accueil. |
| **Fil rouge** | Ta trame générale écrite en vrac, puis découpée en **étapes**. Chaque étape devient un chapitre en un clic. Des structures toutes prêtes (schéma narratif, 3 actes, voyage du héros, nouvelle à chute) t'aident à passer d'une trame à une histoire complète. |
| **Personnages** | Fiches complètes : objectif, peur, passé, façon de parler, faits établis… |
| **Idées** | Une boîte à idées avec des #mots-clés, des épingles et un tirage au hasard. |
| **Lexique** | Les mots que tu veux utiliser (l'Atelier repère s'ils sont déjà dans ton texte) et les concepts à explorer. |
| **Univers** | Les faits établis à ne pas contredire : lieux, règles, chronologie, objets. |
| **CHECK** | Orthographe et grammaire (LanguageTool), **concordance des temps**, répétitions, phrases trop longues, adverbes, mots-tics, **typographie française** (corrigeable en un clic) et **noms mal orthographiés** (« Matilde » au lieu de « Mathilde »). |
| **Assistant** | Réécrire un passage, découper ta trame, traquer les incohérences, débloquer la suite, avis de lecteur, analyse de ton style, question libre. |
| **Entraînement** | Une consigne par jour (plus de 60), des mots imposés, un minuteur, un objectif de 300 mots, une série de jours d'affilée et un calendrier. |

## Comment l'ouvrir

### En ligne avec GitHub Pages (conseillé, gratuit)

1. Sur GitHub, ouvre ce dépôt, puis **Settings** → **Pages**.
2. Dans **Build and deployment**, choisis **Deploy from a branch**.
3. Choisis la branche où se trouve l'Atelier et le dossier **/ (root)**, puis **Save**.
4. Après une ou deux minutes, l'adresse apparaît en haut de la page (du type `https://ton-pseudo.github.io/9/`).

Sur téléphone, ouvre cette adresse, puis **Partager → Sur l'écran d'accueil** (iPhone) ou **⋮ → Installer l'application** (Android) : l'Atelier s'ouvre alors comme une vraie appli, même hors connexion.

> ⚠️ Chaque navigateur et chaque appareil a son propre stockage. Ce que tu écris sur ton téléphone n'apparaît pas tout seul sur ton ordinateur : passe d'un appareil à l'autre avec **Réglages → Télécharger une sauvegarde**, puis **Restaurer / importer** sur l'autre appareil.

### En local

Double-clique sur `index.html` : l'Atelier s'ouvre dans ton navigateur. (L'installation sur l'écran d'accueil et le mode hors connexion demandent la version en ligne.)

## L'assistant IA, honnêtement

L'assistant ne « s'entraîne » pas sur tes textes au sens du machine learning. À chaque demande, il reçoit :

- ton **dossier** (fiches personnages, univers, fil rouge, lexique) ;
- ton **profil de style** (généré par « Analyser mon style », puis modifiable dans les Réglages) ;
- des **extraits** des textes que tu as marqués « représente bien mon style ».

Résultat : plus tu marques de textes comme exemples, plus ses propositions te ressemblent.

Deux façons de l'utiliser :

1. **Copier-coller (gratuit)** : l'Atelier prépare une demande complète, tu la colles dans [claude.ai](https://claude.ai) (un compte gratuit suffit), puis tu recolles la réponse dans l'Atelier pour la garder.
2. **Automatique (clé API)** : l'Atelier interroge Claude directement. Il faut une clé API créée sur [console.anthropic.com](https://console.anthropic.com/settings/keys), payée à l'usage. C'est **séparé** d'un abonnement Claude Pro ou Max. Une réécriture coûte généralement quelques centimes, et l'Atelier affiche une estimation avant chaque envoi. La clé reste dans ton navigateur et n'est jamais incluse dans les sauvegardes.

## Tes données

- Tout est stocké **dans ton navigateur** (IndexedDB), sur ton appareil. Rien n'est envoyé ailleurs, sauf :
  - le texte vérifié, quand tu lances le correcteur orthographique (service gratuit LanguageTool) ;
  - la demande, quand tu lances l'assistant en mode automatique (API Claude).
- **Télécharge une sauvegarde régulièrement** (Réglages → Sauvegardes). L'accueil te le rappelle au bout de 7 jours. Range le fichier dans ton cloud (iCloud, Google Drive…).
- Chaque dossier s'exporte aussi en `.md` ou `.txt` (lisible dans Word, Pages ou Google Docs) et en `.json` (réimportable).

## Pour les curieux (structure du code)

Aucune installation ni compilation n'est nécessaire : ce sont de simples fichiers HTML, CSS et JavaScript.

```
index.html                  page unique
css/style.css               apparence (clair / sombre, ordinateur / mobile)
js/store.js                 stockage local et modèle de données
js/prompts.js               consignes d'entraînement, mots imposés, structures de récit
js/check.js                 analyses du CHECK (temps, style, typographie, noms) + LanguageTool
js/ai.js                    demandes à l'assistant (mode copier-coller et API Claude)
js/app.js                   écrans et interactions
vendor/anthropic-sdk-1.3.0.js  bibliothèque officielle Claude (@anthropic-ai/sdk 1.3.0), chargée seulement en mode automatique
sw.js, manifest.webmanifest application installable et fonctionnant hors ligne
```
