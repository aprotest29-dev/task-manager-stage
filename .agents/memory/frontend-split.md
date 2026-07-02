---
name: Frontend module split
description: Architecture Vanilla TS — séparation api.ts / app.ts et patterns associés
---

## Règle
La couche HTTP (fetch) est isolée dans `src/api.ts`. `src/app.ts` importe avec `import * as TaskApi from "./api.js"` pour rendre les appels réseau explicites à la lecture.

**Why:** Un seul fichier de 400 lignes mélangeait fetch, DOM, état et rendu — illisible pour un recruteur senior.

**How to apply:** Toute nouvelle ressource (ex. commentaires, utilisateurs) suit le même pattern : un fichier `resourceApi.ts` avec `tryParseJson` + `extractErrorMessage`, importé avec namespace dans le module UI.

## Pattern tryParseJson
`api.ts` utilise `tryParseJson<T>(res)` qui lit `res.text()` puis tente `JSON.parse()` — retourne `null` si vide ou non-JSON (erreur proxy HTML). Évite un crash `SyntaxError` non géré côté utilisateur.

## Cohérence contrat API
Toutes les fonctions (lecture ET écriture) valident `res.ok && json?.success`. `fetchAll` vérifie les deux, pas seulement `res.ok`.
