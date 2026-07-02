# Task Manager

## Présentation

**Task Manager** est une application web complète de gestion de tâches développée dans le cadre d'un test de recrutement pour un poste de Développeur Full Stack. Elle permet de créer, consulter, modifier et supprimer des tâches via une interface moderne et responsive, connectée à une API REST.

---

## Fonctionnalités

- ✅ **Ajouter une tâche** avec un titre, une description et un statut
- ✏️ **Modifier une tâche** directement depuis la liste
- 🗑️ **Supprimer une tâche** avec confirmation
- 📋 **Afficher toutes les tâches** avec filtrage par statut
- 🔔 **Notifications visuelles** (toast) pour chaque action
- 📱 **Interface responsive** compatible mobile, tablette et desktop

---

## Technologies utilisées

| Couche    | Technologie                   |
|-----------|-------------------------------|
| Backend   | Node.js + Express.js (v5)     |
| Frontend  | HTML5, CSS3, JavaScript Vanilla (TypeScript) |
| Stockage  | En mémoire (prêt MySQL)       |
| Outillage | Vite, pnpm, TypeScript, Git   |
| Tests     | Postman (collection incluse)  |

---

## Installation

### Prérequis

- [Node.js](https://nodejs.org/) v18+ 
- [pnpm](https://pnpm.io/) v9+

### Cloner le dépôt

```bash
git clone https://github.com/MaodoKa/task-manager.git
cd task-manager
```

### Installer les dépendances

```bash
pnpm install
```

---

## Utilisation

### Démarrer le serveur backend (API)

```bash
pnpm --filter @workspace/api-server run dev
```

L'API sera disponible sur : `http://localhost:<PORT>/api`

### Démarrer le frontend

```bash
pnpm --filter @workspace/task-manager run dev
```

L'interface sera disponible sur : `http://localhost:<PORT>/`

> **Note :** Les ports sont configurés automatiquement par l'environnement. En développement local, l'API tourne généralement sur le port **5000** et le frontend sur le port **3000**.

---

## Structure du projet

```
task-manager/
│
├── artifacts/
│   ├── api-server/               # Serveur Express.js (API REST)
│   │   └── src/
│   │       ├── controllers/      # Logique métier (taskController.ts)
│   │       ├── middleware/       # Validation des données entrantes
│   │       ├── models/           # Modèle de données + stockage mémoire
│   │       └── routes/           # Définition des endpoints Express
│   │
│   └── task-manager/             # Frontend (HTML, CSS, JS Vanilla)
│       ├── index.html            # Structure HTML de la page
│       └── src/
│           ├── api.ts            # Couche HTTP — appels fetch vers l'API
│           ├── app.ts            # Logique UI, état, rendu des tâches
│           ├── main.ts           # Point d'entrée Vite
│           └── style.css         # Styles CSS (design professionnel)
│
├── lib/
│   ├── api-spec/                 # Contrat OpenAPI (source de vérité)
│   ├── api-client-react/         # Hooks générés par Orval
│   └── api-zod/                  # Schemas Zod de validation
│
├── postman/
│   └── Task_Manager.postman_collection.json   # Collection Postman (10 tests)
│
└── README.md
```

---

## Documentation API

Base URL : `/api`

### GET /tasks

Retourne la liste de toutes les tâches.

**Réponse 200 :**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "1",
      "titre": "Configurer l'environnement",
      "description": "Installer Node.js et les dépendances",
      "statut": "Terminée",
      "createdAt": "2025-01-01T10:00:00.000Z",
      "updatedAt": "2025-01-01T10:00:00.000Z"
    }
  ]
}
```

---

### GET /tasks/:id

Retourne une tâche par son identifiant.

**Paramètre :** `id` — identifiant de la tâche

**Réponse 200 :**
```json
{
  "success": true,
  "data": { ... }
}
```

**Réponse 404 :**
```json
{
  "success": false,
  "message": "Tâche avec l'id \"99\" introuvable."
}
```

---

### POST /tasks

Crée une nouvelle tâche.

**Corps de la requête :**
```json
{
  "titre": "Nouvelle tâche",
  "description": "Description détaillée de la tâche",
  "statut": "À faire"
}
```

> `statut` est optionnel. Valeurs autorisées : `"À faire"`, `"En cours"`, `"Terminée"`.

**Réponse 201 :**
```json
{
  "success": true,
  "message": "Tâche créée avec succès.",
  "data": { ... }
}
```

**Réponse 400 :**
```json
{
  "success": false,
  "message": "Données invalides.",
  "errors": ["Le champ 'titre' est requis."]
}
```

---

### PUT /tasks/:id

Met à jour une tâche existante (mise à jour partielle supportée).

**Corps de la requête :**
```json
{
  "statut": "En cours"
}
```

**Réponse 200 :**
```json
{
  "success": true,
  "message": "Tâche mise à jour avec succès.",
  "data": { ... }
}
```

---

### DELETE /tasks/:id

Supprime une tâche par son identifiant.

**Réponse 200 :**
```json
{
  "success": true,
  "message": "Tâche \"1\" supprimée avec succès."
}
```

---

## Tests avec Postman

Une collection Postman complète est incluse dans le dépôt : `postman/Task_Manager.postman_collection.json`

### Importer la collection

1. Ouvrir **Postman**
2. Cliquer sur **Import** → sélectionner le fichier `postman/Task_Manager.postman_collection.json`
3. La collection **"Task Manager — API REST"** apparaît dans le panneau de gauche

### Configurer l'URL de base

La collection utilise une variable `{{base_url}}`. La modifier selon l'environnement :

| Environnement | Valeur |
|---------------|--------|
| Local         | `http://localhost:8080` |
| Production    | URL complète du serveur déployé |

> Dans Postman : cliquer sur la collection → onglet **Variables** → modifier `base_url`.

### Cas de test couverts (10 requêtes)

| Méthode | Endpoint           | Cas testé                          |
|---------|--------------------|------------------------------------|
| GET     | `/api/healthz`     | Vérification que le serveur répond |
| GET     | `/api/tasks`       | Liste complète des tâches          |
| GET     | `/api/tasks/:id`   | Tâche existante (200)              |
| GET     | `/api/tasks/999`   | Tâche inexistante (404)            |
| POST    | `/api/tasks`       | Création valide (201)              |
| POST    | `/api/tasks`       | Champs manquants (400)             |
| POST    | `/api/tasks`       | Statut invalide (400)              |
| PUT     | `/api/tasks/:id`   | Mise à jour partielle (200)        |
| PUT     | `/api/tasks/:id`   | Corps vide (400)                   |
| DELETE  | `/api/tasks/:id`   | Suppression (200) puis 404         |

> Les IDs sont transmis automatiquement entre requêtes via les **variables de collection** Postman (`task_id` mis à jour après chaque création).

---

## Choix techniques

### Pourquoi Express.js ?

Express.js est le framework Node.js le plus utilisé en production. Il est minimaliste, très bien documenté et s'intègre facilement avec tous les outils de l'écosystème JavaScript. La version 5 apporte la gestion native des erreurs asynchrones (`async/await`), ce qui simplifie considérablement l'écriture des contrôleurs.

### Pourquoi une architecture REST ?

L'architecture REST est le standard industriel pour les API web. Elle est sans état, facile à tester (via Postman ou curl), et s'adapte parfaitement à une migration future vers GraphQL ou gRPC si les besoins évoluent.

### Pourquoi le stockage en mémoire ?

Pour un projet de démonstration ou un prototype, le stockage en mémoire évite toute configuration de base de données et permet de se concentrer sur la logique métier. Le modèle de données (`models/task.ts`) est conçu pour une migration transparente vers MySQL ou PostgreSQL : chaque fonction (`getAllTasks`, `createTask`, etc.) correspond exactement à une requête SQL (`SELECT *`, `INSERT`, etc.) commentée dans le code.

### Pourquoi Vanilla JS (TypeScript) ?

L'interface est construite sans framework pour démontrer la maîtrise des fondamentaux du web : manipulation DOM, `fetch`, gestion des événements. TypeScript garantit la robustesse du code grâce au typage statique tout en restant compatible avec tout navigateur moderne.

---

## Améliorations possibles

| Amélioration         | Description |
|----------------------|-------------|
| 🗄️ **MySQL**          | Remplacer le stockage mémoire par une base de données relationnelle via Drizzle ORM |
| 🔐 **Authentification** | Ajouter une gestion des utilisateurs avec JWT ou sessions sécurisées |
| 📄 **Pagination**     | Implémenter `GET /tasks?page=1&limit=10` pour les grandes listes |
| 🔍 **Filtrage avancé** | Recherche par titre, filtre par dates, tri par statut |
| 🤖 **Intelligence artificielle** | Génération automatique de tâches ou priorisation intelligente via une API LLM |
| 🔔 **Notifications temps réel** | WebSockets pour synchroniser plusieurs utilisateurs simultanément |
| 📊 **Tableau de bord** | Statistiques visuelles sur l'avancement des tâches |

---

## Auteur

**Maodo Ka**  
Développeur Full Stack

---

## Licence

MIT — libre d'utilisation et de modification.
