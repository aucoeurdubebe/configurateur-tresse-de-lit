# Gestion des visuels – Laura

La configuration du site et la gestion des images sont séparées.

## Remplacer une photo
1. Ouvrir le dossier `images/`.
2. Remplacer l'image concernée en gardant le même nom.
3. Ne pas modifier `app.js`.

## Ajouter une couleur ou une matière
Ouvrir `config/visuels.json` et ajouter l'entrée correspondante dans `materials`. Les chemins `choice` servent à la vignette de choix et `texture` à l'aperçu de la tresse.

## Structures 3 et 4 brins
Elles sont définies dans `structures` pour chaque matière. Ne modifier ces chemins que si une nouvelle structure est fournie.

## Important
- Les visuels sont centralisés dans `images/`.
- Les correspondances sont centralisées dans `config/visuels.json`.
- La logique du configurateur est dans `app.js` et n'a normalement pas besoin d'être modifiée pour changer les visuels.
