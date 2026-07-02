/**
 * Contrôleur des tâches.
 * Contient la logique métier pour chaque endpoint de l'API.
 * Sépare la logique de la définition des routes (pattern MVC).
 */

import { type Request, type Response } from "express";
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "../models/task.js";

// ─── GET /api/tasks ───────────────────────────────────────────────────────────

/**
 * Retourne la liste complète des tâches.
 * @returns 200 + tableau de tâches
 */
export async function getTasks(_req: Request, res: Response): Promise<void> {
  const tasks = getAllTasks();
  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks,
  });
}

// ─── GET /api/tasks/:id ───────────────────────────────────────────────────────

/**
 * Retourne une tâche par son identifiant.
 * @returns 200 + tâche | 404 si non trouvée
 */
export async function getTask(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const task = getTaskById(id);

  if (!task) {
    res.status(404).json({
      success: false,
      message: `Tâche avec l'id "${id}" introuvable.`,
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: task,
  });
}

// ─── POST /api/tasks ──────────────────────────────────────────────────────────

/**
 * Crée une nouvelle tâche.
 * @body { titre, description, statut? }
 * @returns 201 + tâche créée
 */
export async function addTask(req: Request, res: Response): Promise<void> {
  const { titre, description, statut } = req.body as {
    titre: string;
    description: string;
    statut?: "À faire" | "En cours" | "Terminée";
  };

  const newTask = createTask({ titre, description, statut });

  res.status(201).json({
    success: true,
    message: "Tâche créée avec succès.",
    data: newTask,
  });
}

// ─── PUT /api/tasks/:id ───────────────────────────────────────────────────────

/**
 * Met à jour une tâche existante (mise à jour partielle supportée).
 * @body { titre?, description?, statut? }
 * @returns 200 + tâche mise à jour | 404 si non trouvée
 */
export async function editTask(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const { titre, description, statut } = req.body as {
    titre?: string;
    description?: string;
    statut?: "À faire" | "En cours" | "Terminée";
  };

  const updated = updateTask(id, { titre, description, statut });

  if (!updated) {
    res.status(404).json({
      success: false,
      message: `Tâche avec l'id "${id}" introuvable.`,
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: "Tâche mise à jour avec succès.",
    data: updated,
  });
}

// ─── DELETE /api/tasks/:id ────────────────────────────────────────────────────

/**
 * Supprime une tâche par son identifiant.
 * @returns 200 + confirmation | 404 si non trouvée
 */
export async function removeTask(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const deleted = deleteTask(id);

  if (!deleted) {
    res.status(404).json({
      success: false,
      message: `Tâche avec l'id "${id}" introuvable.`,
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: `Tâche "${id}" supprimée avec succès.`,
  });
}
