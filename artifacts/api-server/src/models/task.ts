/**
 * Modèle de données pour la ressource "tâche".
 *
 * Stockage en mémoire pour simplifier le développement.
 * Pour migrer vers MySQL : remplacer chaque fonction par son équivalent
 * Drizzle ORM commenté ci-dessous.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type TaskStatus = "À faire" | "En cours" | "Terminée";

export interface Task {
  id: string;
  titre: string;
  description: string;
  statut: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

/** Données requises pour créer une tâche. */
export interface CreateTaskDTO {
  titre: string;
  description: string;
  statut?: TaskStatus;
}

/** Données autorisées lors d'une mise à jour partielle. */
export interface UpdateTaskDTO {
  titre?: string;
  description?: string;
  statut?: TaskStatus;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

/** Valeurs autorisées pour le champ `statut`. */
export const VALID_STATUSES: TaskStatus[] = ["À faire", "En cours", "Terminée"];

// ─── Stockage en mémoire ──────────────────────────────────────────────────────
// MySQL : remplacer par une table `tasks` avec les colonnes ci-dessus.

let tasks: Task[] = [
  {
    id: "1",
    titre: "Configurer l'environnement de développement",
    description: "Installer Node.js, npm et les dépendances du projet",
    statut: "Terminée",
    createdAt: "2026-01-10T09:00:00.000Z",
    updatedAt: "2026-01-10T09:00:00.000Z",
  },
  {
    id: "2",
    titre: "Développer l'API REST",
    description: "Créer les endpoints CRUD pour la gestion des tâches",
    statut: "En cours",
    createdAt: "2026-01-11T10:30:00.000Z",
    updatedAt: "2026-01-11T10:30:00.000Z",
  },
  {
    id: "3",
    titre: "Créer l'interface utilisateur",
    description: "Développer le frontend en HTML, CSS et JavaScript Vanilla",
    statut: "À faire",
    createdAt: "2026-01-12T14:00:00.000Z",
    updatedAt: "2026-01-12T14:00:00.000Z",
  },
];

let nextId = 4;

// ─── Opérations CRUD ──────────────────────────────────────────────────────────

/** MySQL : SELECT * FROM tasks ORDER BY createdAt DESC */
export function getAllTasks(): Task[] {
  return tasks;
}

/** MySQL : SELECT * FROM tasks WHERE id = ? LIMIT 1 */
export function getTaskById(id: string): Task | undefined {
  return tasks.find((task) => task.id === id);
}

/** MySQL : INSERT INTO tasks (titre, description, statut, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?) */
export function createTask(dto: CreateTaskDTO): Task {
  const now = new Date().toISOString();
  const newTask: Task = {
    id: String(nextId++),
    titre: dto.titre.trim(),
    description: dto.description.trim(),
    statut: dto.statut ?? "À faire",
    createdAt: now,
    updatedAt: now,
  };
  tasks.push(newTask);
  return newTask;
}

/** MySQL : UPDATE tasks SET titre = ?, description = ?, statut = ?, updatedAt = ? WHERE id = ? */
export function updateTask(id: string, dto: UpdateTaskDTO): Task | null {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return null;

  tasks[index] = {
    ...tasks[index],
    ...(dto.titre !== undefined && { titre: dto.titre.trim() }),
    ...(dto.description !== undefined && { description: dto.description.trim() }),
    ...(dto.statut !== undefined && { statut: dto.statut }),
    updatedAt: new Date().toISOString(),
  };

  return tasks[index];
}

/** MySQL : DELETE FROM tasks WHERE id = ? */
export function deleteTask(id: string): boolean {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
}
