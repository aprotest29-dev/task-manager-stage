/**
 * Modèle de données pour une tâche.
 * Le stockage est en mémoire pour simplifier le développement.
 * Pour migrer vers MySQL, il suffit de remplacer le tableau `tasks`
 * par des requêtes Drizzle ORM (voir commentaires ci-dessous).
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

export interface CreateTaskDTO {
  titre: string;
  description: string;
  statut?: TaskStatus;
}

export interface UpdateTaskDTO {
  titre?: string;
  description?: string;
  statut?: TaskStatus;
}

// ─── Statuts valides ──────────────────────────────────────────────────────────

export const VALID_STATUSES: TaskStatus[] = ["À faire", "En cours", "Terminée"];

// ─── Stockage en mémoire ──────────────────────────────────────────────────────
// Pour MySQL : remplacer par une table `tasks` avec Drizzle ORM.

let tasks: Task[] = [
  {
    id: "1",
    titre: "Configurer l'environnement de développement",
    description: "Installer Node.js, npm et les dépendances du projet",
    statut: "Terminée",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    titre: "Développer l'API REST",
    description: "Créer les endpoints CRUD pour la gestion des tâches",
    statut: "En cours",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    titre: "Créer l'interface utilisateur",
    description: "Développer le frontend en HTML, CSS et JavaScript Vanilla",
    statut: "À faire",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let nextId = 4;

// ─── Opérations CRUD ──────────────────────────────────────────────────────────

/** Retourne toutes les tâches. MySQL : SELECT * FROM tasks */
export function getAllTasks(): Task[] {
  return tasks;
}

/** Retourne une tâche par son ID. MySQL : SELECT * FROM tasks WHERE id = ? */
export function getTaskById(id: string): Task | undefined {
  return tasks.find((t) => t.id === id);
}

/** Crée une nouvelle tâche. MySQL : INSERT INTO tasks ... */
export function createTask(dto: CreateTaskDTO): Task {
  const now = new Date().toISOString();
  const task: Task = {
    id: String(nextId++),
    titre: dto.titre.trim(),
    description: dto.description.trim(),
    statut: dto.statut ?? "À faire",
    createdAt: now,
    updatedAt: now,
  };
  tasks.push(task);
  return task;
}

/** Met à jour une tâche. MySQL : UPDATE tasks SET ... WHERE id = ? */
export function updateTask(id: string, dto: UpdateTaskDTO): Task | null {
  const index = tasks.findIndex((t) => t.id === id);
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

/** Supprime une tâche. MySQL : DELETE FROM tasks WHERE id = ? */
export function deleteTask(id: string): boolean {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
}
