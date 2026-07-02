# Task Manager

Application web complète de gestion de tâches — API REST Express.js + frontend Vanilla HTML/CSS/TypeScript.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — démarrer l'API REST (port assigné par l'environnement)
- `pnpm --filter @workspace/task-manager run dev` — démarrer le frontend Vite
- `pnpm run typecheck` — vérification TypeScript complète de tous les packages
- `pnpm run build` — typecheck + build de tous les packages
- `pnpm --filter @workspace/api-spec run codegen` — régénérer les hooks React Query et les schemas Zod depuis la spec OpenAPI

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API : Express.js 5 — routes, controllers, models, middleware de validation
- Stockage : en mémoire (prêt pour migration MySQL/PostgreSQL)
- Validation : Zod (`zod/v4`) + middleware Express custom
- Frontend : HTML5, CSS3, TypeScript Vanilla (Vite)
- API codegen : Orval (depuis spec OpenAPI 3.1)

## Where things live

- `artifacts/api-server/src/models/task.ts` — modèle de données + stockage en mémoire (source de vérité)
- `artifacts/api-server/src/controllers/taskController.ts` — logique métier CRUD
- `artifacts/api-server/src/routes/tasks.ts` — définition des endpoints Express
- `artifacts/api-server/src/middleware/validateTask.ts` — validation des données entrantes
- `artifacts/task-manager/src/app.ts` — module principal du frontend (CRUD via fetch)
- `artifacts/task-manager/src/style.css` — styles CSS (design professionnel responsive)
- `artifacts/task-manager/index.html` — structure HTML de l'interface
- `lib/api-spec/openapi.yaml` — contrat API (source de vérité pour la spec)

## Architecture decisions

- Stockage en mémoire : les fonctions du modèle (`getAllTasks`, `createTask`, etc.) correspondent directement à des requêtes SQL commentées — migration vers MySQL/PostgreSQL sans refactoring majeur.
- Separation of concerns : model / controller / route / middleware — chaque couche a une responsabilité unique.
- Validation double : côté frontend (TypeScript) + côté backend (middleware Express) pour une robustesse maximale.
- XSS : toute interpolation HTML dans le frontend passe par `esc()` — protection contre les injections DOM.
- CORS : permissif en développement, restrictif en production via `ALLOWED_ORIGINS`.

## User preferences

- Langue : français pour tous les commentaires, messages et la documentation.
- Auteur : Maodo Ka.
- Stack imposée : Node.js + Express.js (backend), HTML5 + CSS3 + JavaScript Vanilla (frontend).
