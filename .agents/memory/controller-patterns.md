---
name: Controller patterns Express
description: Conventions pour les contrôleurs Express.js du projet api-server
---

## Règle
Les contrôleurs synchrones (stockage mémoire) ne sont pas marqués `async`. Quand la persistance devient asynchrone (MySQL/Drizzle), ajouter `async`/`await` à ce moment-là.

**Why:** `async` sans `await` génère du bruit et laisse croire qu'il y a des I/O en cours.

## Typage req.body
Toujours caster `req.body` avec les DTO exportés du modèle (`CreateTaskDTO`, `UpdateTaskDTO`), jamais avec un type inline anonyme dans le contrôleur.

## Middleware de validation
`validateTask.ts` utilise `validateTextField(value, label, maxLength, required)` + `validateStatutField(value)` pour éliminer la duplication entre création et mise à jour. Le pattern `.filter((e): e is string => e !== null)` collecte les erreurs proprement.
